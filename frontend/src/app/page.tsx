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
import { GraduationCap, AlertCircle } from "lucide-react"
import apiUrl from "@/util/apiUrl"
import { ErrorBoundary } from "@/components/ui/error-boundary"

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
      setError(null)

      const result = LoginFormDataSchema.safeParse(formData)

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        setFormErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        })
        return null
      }
      setFormErrors({})

      try {
        const response = await fetch(`${apiUrl}/user/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Błąd logowania")
        }

        const data = await response.json()
        return data
      } catch (error) {
        throw error
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Wystąpił nieznany błąd podczas logowania")
      }
    },
    onSuccess: (data) => {
      if (!data) return

      const token = data.access
      localStorage.setItem("token", token)

      try {
        const tokenPayload = jwtDecode<JwtPayload>(token)

        switch (tokenPayload.role) {
          case "dean":
            router.push("/protected/dean/profile")
            break
          case "supervisor":
            router.push("/protected/supervisor/profile")
            break
          case "student":
            router.push("/protected/student/profile")
            break
          default:
            setError("Nieznana rola użytkownika")
        }
      } catch {
        setError("Nieprawidłowy token")
        localStorage.removeItem("token")
      }

      setRender(true)
    },
  })

  useEffect(() => {
    if (tokenPayload) {
      switch (tokenPayload.role) {
        case "dean":
          router.push("/protected/dean/profile")
          break
        case "supervisor":
          router.push("/protected/supervisor/profile")
          break
        case "student":
          router.push("/protected/student/profile")
          break
        default:
          setError("Nieznana rola użytkownika")
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
    <ErrorBoundary context="login">
      {render && (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
          <div className="w-full max-w-md px-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-2 text-center">
                <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <GraduationCap className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">DyplomNet</CardTitle>
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
                  <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-2 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
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
    </ErrorBoundary>
  )
}
