from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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


# ---------- Bookings ----------
@api_router.post("/bookings")
async def create_booking(data: BookingIn, user=Depends(get_current_user)):
    service = await db.services.find_one({"id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
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
    {"name": "Corte Executivo Antonio", "price": 85.0, "duration": "45 min",
     "description": "Corte sob medida com lavagem especial, finalização com pomada artesanal e toalha quente."},
    {"name": "Barba Imperial com Navalha", "price": 65.0, "duration": "40 min",
     "description": "Alinhamento com lâmina tradicional, vapor de ozônio, balm hidratante e toalha aquecida."},
    {"name": "Combo Senhor Antonio (Corte + Barba)", "price": 135.0, "duration": "1h 15min",
     "description": "O ritual completo. Corte de cabelo, tratamento de barba, alinhamento de sobrancelha e drink premium."},
    {"name": "Tratamento Capilar & Camuflagem de Grisalhos", "price": 95.0, "duration": "50 min",
     "description": "Revitalização do couro cabeludo e tonalização natural imperceptível."},
]

SEED_PRODUCTS = [
    {"name": "Elixir Dark Petrol 100ml", "category": "perfume", "price": 349.0,
     "notes": "Notas de Couro, Âmbar, Tabaco e Madeira de Cedro", "tag": "Edição Limitada Antonio",
     "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHxfHxwZXJmdW1lJTIwYm90dGxlJTIwcHJvZHVjdHxlbnwwfHx8fDE3ODY4Mjc2NjR8MA&ixlib=rb-4.1.0&q=85", "stock": 12},
    {"name": "Colônia Vintage Gold 1984", "category": "perfume", "price": 289.0,
     "notes": "Citrus Apressado, Bergamota, Pimenta Preta e Vetiver", "tag": "Best Seller",
     "image": "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaH3fHxwZXJmdW1lJTIwYm90dGxlJTIwcHJvZHVjdHxlbnwwfHx8fDE3ODY4Mjc2NjR8MA&ixlib=rb-4.1.0&q=85", "stock": 8},
    {"name": "Essência Barber Reserve 50ml", "category": "perfume", "price": 219.0,
     "notes": "Sândalo, Cardamomo e Bálsamo de Resina", "tag": "",
     "image": "https://images.unsplash.com/photo-1543422655-ac1c6ca993ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxwZXJmdW1lJTIwYm90dGxlJTIwcHJvZHVjdHxlbnwwfHx8fDE3ODY4Mjc2NjR8MA&ixlib=rb-4.1.0&q=85", "stock": 15},
    {"name": "Jaqueta de Couro Legítimo Barber Vintage", "category": "vestuario", "price": 890.0,
     "notes": "Couro legítimo envelhecido, forro em sarja premium", "tag": "Edição de Colecionador",
     "image": "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHxfHxtZW4lMjBzdHJlZXR3ZWFyJTIwdmludGFnZSUyMGphY2tldCUyMGxlYXRoZXIlMjBjbG90aGluZyUyMGZhc2hpb24lMjBtb2RlbHxlbnwwfHx8fDE3ODY4Mjc2NjB8MA&ixlib=rb-4.1.0&q=85", "stock": 4},
    {"name": "Camiseta Heavyweight Cotton Antonio 240g", "category": "vestuario", "price": 189.0,
     "notes": "100% algodão premium, modelagem reta clássica", "tag": "100% Algodão Premium",
     "image": "https://images.unsplash.com/photo-1532332248682-206cc786359f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxtZW4lMjBzdHJlZXR3ZWFyJTIwdmludGFnZSUyMGphY2tldCUyMGxlYXRoZXIlMjBjbG90aGluZyUyMGZhc2hpb24lMjBtb2RlbHxlbnwwfHx8fDE3ODY4Mjc2NjB8MA&ixlib=rb-4.1.0&q=85", "stock": 20},
    {"name": "Avental de Mestre Barbeiro em Couro e Lona", "category": "vestuario", "price": 320.0,
     "notes": "Lona encerada com tiras de couro e fivelas de latão", "tag": "Profissional",
     "image": "https://images.unsplash.com/photo-1578198576866-7e0ba6078128?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxtZW4lMjBzdHJlZXR3ZWFyJTIwdmludGFnZSUyMGphY2tldCUyMGxlYXRoZXIlMjBjbG90aGluZyUyMGZhc2hpb24lMjBtb2RlbHxlbnwwfHx8fDE3ODY4Mjc2NjB8MA&ixlib=rb-4.1.0&q=85", "stock": 7},
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
