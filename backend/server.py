from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
logger = logging.getLogger(__name__)


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ServiceIn(BaseModel):
    name: str
    description: str = ""
    duration: str = ""
    price: float
    active: bool = True


class ProductIn(BaseModel):
    name: str
    category: str  # perfume | vestuario
    price: float
    notes: str = ""
    tag: str = ""
    image: str = ""
    stock: int = 10
    active: bool = True


class BookingIn(BaseModel):
    service_id: str
    date: str
    time: str
    notes: str = ""


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    qty: int


class OrderIn(BaseModel):
    items: List[OrderItem]
    total: float


class StatusIn(BaseModel):
    status: str


class DayHours(BaseModel):
    open: bool
    start: str = "09:00"
    end: str = "19:00"


class HoursIn(BaseModel):
    days: List[DayHours]  # índice 0 = segunda ... 6 = domingo


DEFAULT_HOURS = {
    "days": [
        {"open": False, "start": "09:00", "end": "19:00"},
        {"open": True, "start": "09:00", "end": "19:00"},
        {"open": True, "start": "09:00", "end": "19:00"},
        {"open": True, "start": "09:00", "end": "19:00"},
        {"open": True, "start": "09:00", "end": "19:00"},
        {"open": True, "start": "09:00", "end": "14:00"},
        {"open": False, "start": "09:00", "end": "19:00"},
    ]
}


async def get_hours() -> dict:
    doc = await db.settings.find_one({"key": "business_hours"}, {"_id": 0})
    return doc["value"] if doc else DEFAULT_HOURS


# ---------- Auth helpers ----------
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user


async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")
    return user


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=43200, path="/",
    )


# ---------- Auth routes ----------
@api_router.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    user = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "role": "client",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], email, "client")
    set_auth_cookie(response, token)
    return {"id": user["id"], "name": user["name"], "email": email, "role": "client", "token": token}


@api_router.post("/auth/login")
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    token = create_access_token(user["id"], email, user["role"])
    set_auth_cookie(response, token)
    return {"id": user["id"], "name": user["name"], "email": email, "role": user["role"], "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------- Services (public read, admin write) ----------
@api_router.get("/services")
async def list_services():
    return await db.services.find({"active": True}, {"_id": 0}).to_list(100)


@api_router.get("/admin/services")
async def admin_list_services(admin=Depends(require_admin)):
    return await db.services.find({}, {"_id": 0}).to_list(200)


@api_router.post("/admin/services")
async def create_service(data: ServiceIn, admin=Depends(require_admin)):
    doc = {"id": str(uuid.uuid4()), **data.model_dump(), "created_at": now_iso()}
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/services/{service_id}")
async def update_service(service_id: str, data: ServiceIn, admin=Depends(require_admin)):
    result = await db.services.update_one({"id": service_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return await db.services.find_one({"id": service_id}, {"_id": 0})


@api_router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, admin=Depends(require_admin)):
    await db.services.delete_one({"id": service_id})
    return {"ok": True}


# ---------- Uploads ----------
@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin=Depends(require_admin)):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=400, detail="Formato inválido. Use JPG, PNG ou WebP.")
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (máx. 8 MB).")
    name = f"{uuid.uuid4()}.{ext}"
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(content)
    return {"url": f"/api/uploads/{name}"}


# ---------- Products ----------
@api_router.get("/products")
async def list_products(category: Optional[str] = None):
    query = {"active": True}
    if category:
        query["category"] = category
    return await db.products.find(query, {"_id": 0}).to_list(200)


@api_router.get("/admin/products")
async def admin_list_products(admin=Depends(require_admin)):
    return await db.products.find({}, {"_id": 0}).to_list(300)


@api_router.post("/admin/products")
async def create_product(data: ProductIn, admin=Depends(require_admin)):
    doc = {"id": str(uuid.uuid4()), **data.model_dump(), "created_at": now_iso()}
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, data: ProductIn, admin=Depends(require_admin)):
    result = await db.products.update_one({"id": product_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return await db.products.find_one({"id": product_id}, {"_id": 0})


@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(require_admin)):
    await db.products.delete_one({"id": product_id})
    return {"ok": True}


# ---------- Business hours ----------
@api_router.get("/settings/hours")
async def read_hours():
    return await get_hours()


@api_router.put("/admin/hours")
async def update_hours(data: HoursIn, admin=Depends(require_admin)):
    value = {"days": [d.model_dump() for d in data.days]}
    await db.settings.update_one({"key": "business_hours"}, {"$set": {"key": "business_hours", "value": value}}, upsert=True)
    return value


# ---------- Bookings ----------
@api_router.get("/bookings/slots")
async def booked_slots(date: str):
    bookings = await db.bookings.find(
        {"date": date, "status": {"$in": ["pendente", "confirmado"]}},
        {"_id": 0, "time": 1},
    ).to_list(100)
    return {"taken": [b["time"] for b in bookings]}


@api_router.post("/bookings")
async def create_booking(data: BookingIn, user=Depends(get_current_user)):
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    try:
        weekday = datetime.fromisoformat(data.date).weekday()
    except ValueError:
        raise HTTPException(status_code=400, detail="Data inválida")
    day = (await get_hours())["days"][weekday]
    if not day["open"]:
        raise HTTPException(status_code=400, detail="A barbearia não abre nesse dia. Escolha outra data.")
    if not (day["start"] <= data.time < day["end"]):
        raise HTTPException(status_code=400, detail=f"Nesse dia atendemos das {day['start']} às {day['end']}.")
    conflict = await db.bookings.find_one({
        "date": data.date, "time": data.time,
        "status": {"$in": ["pendente", "confirmado"]},
    })
    if conflict:
        raise HTTPException(status_code=409, detail="Esse horário já está ocupado. Escolha outro.")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "service_id": service["id"],
        "service_name": service["name"],
        "price": service["price"],
        "date": data.date,
        "time": data.time,
        "notes": data.notes,
        "status": "pendente",
        "created_at": now_iso(),
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/bookings/mine")
async def my_bookings(user=Depends(get_current_user)):
    return await db.bookings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.get("/admin/bookings")
async def admin_bookings(admin=Depends(require_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.patch("/admin/bookings/{booking_id}")
async def update_booking_status(booking_id: str, data: StatusIn, admin=Depends(require_admin)):
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return await db.bookings.find_one({"id": booking_id}, {"_id": 0})


# ---------- Orders ----------
@api_router.post("/orders")
async def create_order(data: OrderIn, user=Depends(get_current_user)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Carrinho vazio")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "items": [i.model_dump() for i in data.items],
        "total": data.total,
        "status": "recebido",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.patch("/admin/orders/{order_id}")
async def update_order_status(order_id: str, data: StatusIn, admin=Depends(require_admin)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return await db.orders.find_one({"id": order_id}, {"_id": 0})


@api_router.get("/")
async def root():
    return {"message": "Antonio Barber API"}


# ---------- Seed ----------
SEED_SERVICES = [
    {"name": "Degradê", "price": 45.0, "duration": "40 min",
     "description": "Fade limpo, do baixo ao alto, com acabamento na navalha."},
    {"name": "Corte Social", "price": 40.0, "duration": "40 min",
     "description": "Clássico na tesoura, sempre alinhado e com finalização."},
    {"name": "Degradê Navalhado", "price": 50.0, "duration": "50 min",
     "description": "Fade com risca feita na navalha e contorno preciso."},
]

SEED_PRODUCTS = [
    {"name": "Elixir Dark Petrol 100ml", "category": "perfume", "price": 349.0,
     "notes": "Notas de Couro, Âmbar, Tabaco e Madeira de Cedro", "tag": "Edição Limitada Antonio",
     "image": "", "stock": 12},
    {"name": "Colônia Vintage Gold", "category": "perfume", "price": 289.0,
     "notes": "Citrus Apressado, Bergamota, Pimenta Preta e Vetiver", "tag": "Best Seller",
     "image": "", "stock": 8},
    {"name": "Essência Barber Reserve 50ml", "category": "perfume", "price": 219.0,
     "notes": "Sândalo, Cardamomo e Bálsamo de Resina", "tag": "",
     "image": "", "stock": 15},
    {"name": "Jaqueta de Couro Legítimo Barber Vintage", "category": "vestuario", "price": 890.0,
     "notes": "Couro legítimo envelhecido, forro em sarja premium", "tag": "Edição de Colecionador",
     "image": "", "stock": 4},
    {"name": "Camiseta Heavyweight Cotton Antonio 240g", "category": "vestuario", "price": 189.0,
     "notes": "100% algodão premium, modelagem reta clássica", "tag": "100% Algodão Premium",
     "image": "", "stock": 20},
    {"name": "Avental de Mestre Barbeiro em Couro e Lona", "category": "vestuario", "price": 320.0,
     "notes": "Lona encerada com tiras de couro e fivelas de latão", "tag": "Profissional",
     "image": "", "stock": 7},
]


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "Admin Antonio", "email": email,
            "password_hash": hash_password(password), "role": "admin", "created_at": now_iso(),
        })
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([{**s, "id": str(uuid.uuid4()), "active": True, "created_at": now_iso()} for s in SEED_SERVICES])
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([{**p, "id": str(uuid.uuid4()), "active": True, "created_at": now_iso()} for p in SEED_PRODUCTS])
    logger.info("Antonio Barber API pronta")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
