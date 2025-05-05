import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { PasswordFormDataSchema } from "@/util/types"

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

  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleUpdateNewPassword = (value: string) => {
    setPasswordFormData((passwordFormData) => ({
      ...passwordFormData,
      newPassword: value,
    }))
  }

  const handleUpdateRepeatedNewPassword = (value: string) => {
    setPasswordFormData((passwordFormData) => ({
      ...passwordFormData,
      repeatedNewPassword: value,
    }))
  }

  const changePasswordQuery = useMutation({
    mutationFn: async () => {
      setError(null)
      setIsSuccess(null)

      const validationResult =
        PasswordFormDataSchema.safeParse(passwordFormData)

      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors
        throw new Error(fieldErrors.repeatedNewPassword?.[0] as string)
      }

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
        throw new Error("Nie udało się zmienić hasła.")
      }
    },
    onError: (e) => {
      setError(e.message)
    },
    onSuccess: () => {
      setIsSuccess(true)
    },
  })

  return (
    <Card className="w-full">
      <CardContent className="space-y-3">
        <Label>Stare hasło: </Label>
        <Input
          onInput={(e) => setOldPassword(e.currentTarget.value)}
          onChange={(e) => setOldPassword(e.currentTarget.value)}
        />
        <Label>Nowe hasło: </Label>
        <Input
          onInput={(e) => handleUpdateNewPassword(e.currentTarget.value)}
          onChange={(e) => handleUpdateNewPassword(e.currentTarget.value)}
        />
        <Label>Powtórz nowe hasło: </Label>
        <Input
          onInput={(e) =>
            handleUpdateRepeatedNewPassword(e.currentTarget.value)
          }
          onChange={(e) =>
            handleUpdateRepeatedNewPassword(e.currentTarget.value)
          }
        />
        {error && <Label className="text-red-500">{error}</Label>}
        {isSuccess && <Label className="text-green-500">Hasło zmienione</Label>}
        <Button
          onClick={() => changePasswordQuery.mutate()}
          className="cursor-pointer"
        >
          Zmień hasło
        </Button>
      </CardContent>
    </Card>
  )
}
