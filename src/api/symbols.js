import axios from "axios"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8020"

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, "ws")

export const API_KEY_STORAGE_KEY = "charu.market.apiKey"

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_API_KEY || ""
}

export function setStoredApiKey(apiKey) {
  const value = String(apiKey || "").trim()
  if (value) {
    localStorage.setItem(API_KEY_STORAGE_KEY, value)
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})

client.interceptors.request.use((config) => {
  const apiKey = getStoredApiKey()
  if (apiKey) {
    config.headers["X-API-Key"] = apiKey
  }
  return config
})

export async function getSymbols() {
  const { data } = await client.get("/symbols/list")
  return data
}

export async function addSymbol(payload) {
  const { data } = await client.post("/symbols/add", payload)
  return data
}

export async function removeSymbol(payload) {
  const { data } = await client.post("/symbols/remove", payload)
  return data
}

export async function getRuntimeMetrics() {
  const { data } = await client.get("/metrics/runtime")
  return data
}

export function buildLiveWebSocketUrl({ group = "production_nse" } = {}) {
  const apiKey = encodeURIComponent(getStoredApiKey())
  const params = new URLSearchParams()
  if (apiKey) params.set("api_key", apiKey)
  if (group) params.set("group", group)
  return `${WS_BASE_URL}/ws/live?${params.toString()}`
}

export function toUserMessage(error) {
  if (error?.code === "ECONNABORTED") return "Backend timeout. FastAPI did not respond in time."
  if (!error?.response) return "API unavailable. Confirm FastAPI is running and reachable."
  const detail = error.response.data?.detail
  if (typeof detail === "string") return detail
  if (detail?.error) return detail.error
  if (error.response.status === 401) return "Missing or invalid API key."
  if (error.response.status === 400) return "Invalid symbol request. Check token and required fields."
  if (error.response.status === 404) return "Symbol was not found in the active registry."
  return `Request failed with status ${error.response.status}.`
}
