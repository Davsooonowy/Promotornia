"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { LoginFormData, JwtPayload } from "@/util/types"
import { useRouter } from "next/navigation"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function Home() {
  const router = useRouter()
  const { tokenPayload, isTokenError } = useDecodeToken()

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: async () => {
      console.log("test")
      if (formData.email !== "dean" || formData.password !== "dean") {
        setError("Nieprawiłowe hasło lub email")
        return
      }
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJkZWFuIn0.O5k7CaZmg82JkAB2fgNIJCy_MH-BWeKUiJGxF3y91RI"
      localStorage.setItem("token", token)
      const decoded = jwtDecode<JwtPayload>(token)
      console.log(decoded)
      if (decoded && decoded.role && decoded.userId) {
        console.log(decoded.userId)
        switch (decoded.role) {
          case "dean":
            router.push("/protected/dean/profile")
        }
      }
    },
  })

  const updateEmail = (email: string) =>
    setFormData((formState) => ({ ...formState, email: email }))

  const updatePassword = (password: string) =>
    setFormData((formState) => ({ ...formState, password: password }))

  useEffect(() => {
    if (tokenPayload) {
      switch (tokenPayload.role) {
        case "dean":
          router.push("/protected/dean/profile")
      }
    }
  }, [tokenPayload, isTokenError, router])

  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Logowanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex w-full space-x-3">
            <Label htmlFor="email" className="py-1">
              Email:
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              onInput={(e) => updateEmail(e.currentTarget.value)}
              onChange={(e) => updateEmail(e.currentTarget.value)}
            />
          </div>
          <div className="flex w-full space-x-3">
            <Label htmlFor="password" className="py-1">
              Hasło:
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              onInput={(e) => updatePassword(e.currentTarget.value)}
              onChange={(e) => updatePassword(e.currentTarget.value)}
            />
          </div>
          {error && <Label className="text-red-400">{error}</Label>}
          <div className="flex w-full justify-between">
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => loginMutation.mutate()}
            >
              Zaloguj
            </Button>
            <Label className="py-1">Forgot password?</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
