const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const isBrowser = typeof window !== "undefined"

  const token = isBrowser
    ? localStorage.getItem("accessToken")
    : null

  const headers = new Headers(init?.headers)

  // ใส่ Content-Type เฉพาะตอนมี body
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // ต่อ base url เฉพาะตอน input เป็น string
 const url =
  typeof input === "string"
    ? input.startsWith("http")
      ? input
      : `${API_BASE_URL}${input}`
    : input

  const res = await fetch(url, {
    ...init,
    headers,
  })

  // ❌ อย่า redirect ใน api layer
  if (res.status === 401) {
    if (isBrowser) {
      localStorage.removeItem("accessToken")
    }
    throw new Error("Unauthorized")
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "API Error")
  }

  if (!API_BASE_URL && typeof input === "string" && !input.startsWith("http")) {
  throw new Error("API_BASE_URL is not defined")
}

  return res
}