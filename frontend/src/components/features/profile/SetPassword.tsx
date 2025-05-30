"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import { PasswordFormDataSchema } from "@/util/types"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-handling"
import { toast } from "sonner"

export default function SetPassword() {
  const [token, setToken] = useState<string>("")
  const [passwordFormData, setPasswordFormData] = useState<{
    newPassword: string
    repeatedNewPassword: string
  }>({
    newPassword: "",
    repeatedNewPassword: "",
  })

  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
  }, [])

  const handleUpdateNewPassword = (value: string) => {
    setPasswordFormData((prev) => ({
      ...prev,
      newPassword: value,
    }))
    setValidationError(null)
  }

  const handleUpdateRepeatedNewPassword = (value: string) => {
    setPasswordFormData((prev) => ({
      ...prev,
      repeatedNewPassword: value,
    }))
    setValidationError(null)
  }

  const setPasswordMutation = useMutation({
    mutationFn: async () => {
      setValidationError(null)
      setIsSuccess(false)

      const validationResult =
        PasswordFormDataSchema.safeParse(passwordFormData)

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors
        if (fieldErrors.newPassword?.[0]) {
          setValidationError(fieldErrors.newPassword?.[0])
          return null
        }
        if (fieldErrors.repeatedNewPassword?.[0]) {
          setValidationError(fieldErrors.repeatedNewPassword?.[0])
          return null
        }
      }

      try {
        const response = await fetch(`${apiUrl}/set_password/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: passwordFormData.newPassword,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message ||
              `Błąd ${response.status}: ${response.statusText}`
          )
        }

        return await response.json()
      } catch (error) {
        throw error
      }
    },
    onError: (error) => {
      showErrorToast(error, "Nie udało się ustawić hasła")
    },
    onSuccess: () => {
      setIsSuccess(true)
      toast.success("Sukces", {
        description: "Hasło zostało ustawione",
      })

      setPasswordFormData({
        newPassword: "",
        repeatedNewPassword: "",
      })

      setTimeout(() => setIsSuccess(false), 3000)
    },
  })

  return (
    <ErrorBoundary context="setPassword">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <Label>Nowe hasło:</Label>
          <Input
            value={passwordFormData.newPassword}
            onChange={(e) => handleUpdateNewPassword(e.currentTarget.value)}
            type="password"
          />
          <Label>Powtórz nowe hasło:</Label>
          <Input
            value={passwordFormData.repeatedNewPassword}
            onChange={(e) =>
              handleUpdateRepeatedNewPassword(e.currentTarget.value)
            }
            type="password"
          />

          {validationError && (
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{validationError}</span>
            </div>
          )}

          {setPasswordMutation.isError && (
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Nie udało się ustawić hasła</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Hasło ustawione</span>
            </div>
          )}

          <Button
            onClick={() => setPasswordMutation.mutate()}
            className="cursor-pointer"
            disabled={setPasswordMutation.isPending}
          >
            {setPasswordMutation.isPending
              ? "Ustawianie hasła..."
              : "Ustaw hasło"}
          </Button>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
