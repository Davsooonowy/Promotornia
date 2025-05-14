"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { PasswordFormDataSchema } from "@/util/types"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { showErrorToast } from "@/lib/error-handling"
import { toast } from "sonner"

export default function ChangePassword() {
  const { token } = useDecodeToken()

  const [oldPassword, setOldPassword] = useState("")
  const [passwordFormData, setPasswordFormData] = useState<{
    newPassword: string
    repeatedNewPassword: string
  }>({
    newPassword: "",
    repeatedNewPassword: "",
  })

  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleUpdateNewPassword = (value: string) => {
    setPasswordFormData((passwordFormData) => ({
      ...passwordFormData,
      newPassword: value,
    }))
    setValidationError(null)
  }

  const handleUpdateRepeatedNewPassword = (value: string) => {
    setPasswordFormData((passwordFormData) => ({
      ...passwordFormData,
      repeatedNewPassword: value,
    }))
    setValidationError(null)
  }

  const changePasswordMutation = useMutation({
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
        const response = await fetch(`${apiUrl}/user/new_password`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword,
            newPassword: passwordFormData.newPassword,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message ||
              `Błąd ${response.status}: ${response.statusText}`,
          )
        }

        return await response.json()
      } catch (error) {
        console.error("Error changing password:", error)
        throw error
      }
    },
    onError: (error) => {
      showErrorToast(error, "Nie udało się zmienić hasła")
    },
    onSuccess: (data) => {
      if (data) {
        setIsSuccess(true)
        toast.success("Sukces", {
          description: "Hasło zostało zmienione",
        })

        // Reset form
        setOldPassword("")
        setPasswordFormData({
          newPassword: "",
          repeatedNewPassword: "",
        })

        // Clear success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000)
      }
    },
  })

  return (
    <ErrorBoundary context="passwordChange">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <Label>Stare hasło: </Label>
          <Input
            value={oldPassword}
            onInput={(e) => setOldPassword(e.currentTarget.value)}
            onChange={(e) => setOldPassword(e.currentTarget.value)}
            type="password"
          />
          <Label>Nowe hasło: </Label>
          <Input
            value={passwordFormData.newPassword}
            onInput={(e) => handleUpdateNewPassword(e.currentTarget.value)}
            onChange={(e) => handleUpdateNewPassword(e.currentTarget.value)}
            type="password"
          />
          <Label>Powtórz nowe hasło: </Label>
          <Input
            value={passwordFormData.repeatedNewPassword}
            onInput={(e) =>
              handleUpdateRepeatedNewPassword(e.currentTarget.value)
            }
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

          {changePasswordMutation.isError && (
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Nie udało się zmienić hasła</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Hasło zmienione</span>
            </div>
          )}

          <Button
            onClick={() => changePasswordMutation.mutate()}
            className="cursor-pointer"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? "Zmienianie hasła..."
              : "Zmień hasło"}
          </Button>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
