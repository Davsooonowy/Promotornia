import { JwtPayload } from "@/util/types"
import { jwtDecode } from "jwt-decode"
import { useState, useEffect } from "react"

export default function useDecodeToken() {
  const [tokenPayload, setTokenPayload] = useState<JwtPayload | null>(null)
  const [isTokenError, setIsTokenError] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token)
      if (decoded) {
        setTokenPayload(decoded)
        setToken(token)
      } else setIsTokenError(true)
    } else setIsTokenError(true)
  }, [])

  return { token, tokenPayload, isTokenError }
}
