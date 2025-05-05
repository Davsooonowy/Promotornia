"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import {
  type LoginFormData,
  type JwtPayload,
  LoginFormDataSchema,
} from "@/util/types"
import { useRouter } from "next/navigation"
import useDecodeToken from "@/hooks/useDecodeToken"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const { tokenPayload, isTokenError } = useDecodeToken()
  const [render, setRender] = useState(false)

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: async () => {
      const result = LoginFormDataSchema.safeParse(formData)

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        setFormErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        })
        return
      }
      setFormErrors({})

      if (
        (formData.email !== "dean@example.com" ||
          formData.password !== "dean") &&
        (formData.email !== "supervisor@example.com" ||
          formData.password !== "supervisor") &&
        (formData.email !== "student@example.com" ||
          formData.password !== "student")
      ) {
        setError("Nie znaleziono użytkownika")
        return
      }
      let token
      if (formData.email === "dean@example.com")
        token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJkZWFuIn0.O5k7CaZmg82JkAB2fgNIJCy_MH-BWeKUiJGxF3y91RI"
      else if (formData.email === "supervisor@example.com")
        token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJzdXBlcnZpc29yIn0.EkoIC4WPT0TTkG6Od-ikWAz170O0EkQl0diLsOA2V2Y"
      else
        token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJzdHVkZW50In0.nMzbxVQdMTBoSTzxFwny53abtiIQeEQw2CE4rqug0vM"
      // const response = await fetch(`${apiUrl}/user/login`, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // })
      localStorage.setItem("token", token)
      const decoded = jwtDecode<JwtPayload>(token)
      if (decoded && decoded.role && decoded.userId) {
        switch (decoded.role) {
          case "dean":
            router.push("/protected/dean/profile")
          case "supervisor":
            router.push("/protected/supervisor/profile")
          case "student":
            router.push("/protected/student/profile")
        }
      }
    },
  })

  useEffect(() => {
    if (tokenPayload) {
      switch (tokenPayload.role) {
        case "dean":
          router.push("/protected/dean/profile")
        case "supervisor":
          router.push("/protected/supervisor/profile")
        case "student":
          router.push("/protected/student/profile")
      }
    }
    if (isTokenError) {
      setRender(true)
    }
  }, [tokenPayload, isTokenError, router])

  const updateEmail = (email: string) =>
    setFormData((formState) => ({ ...formState, email: email }))

  const updatePassword = (password: string) =>
    setFormData((formState) => ({ ...formState, password: password }))

  return (
    <>
      {render && (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
          <div className="w-full max-w-md px-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-2 text-center">
                <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <GraduationCap className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Promotornia</CardTitle>
                <CardDescription>
                  System zarządzania pracami dyplomowymi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@student.agh.edu.pl"
                    value={formData.email}
                    onChange={(e) => updateEmail(e.currentTarget.value)}
                    className={formErrors?.email ? "border-red-500" : ""}
                  />
                  {formErrors?.email && (
                    <p className="text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Hasło</Label>
                    <Link
                      href="/forgot-password"
                      className="text-primary text-xs hover:underline"
                    >
                      Zapomniałem hasła
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updatePassword(e.currentTarget.value)}
                    className={formErrors?.password ? "border-red-500" : ""}
                  />
                  {formErrors?.password && (
                    <p className="text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}
                <Button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={() => loginMutation.mutate()}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logowanie..." : "Zaloguj się"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
