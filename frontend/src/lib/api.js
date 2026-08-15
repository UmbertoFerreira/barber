import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

export function formatApiError(detail, fallback = "Algo deu errado. Tente novamente.") {
  if (detail == null) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function brl(value) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

export function imgUrl(src) {
  if (!src) return "";
  return src.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${src}` : src;
}
