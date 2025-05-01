import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatedNewPassword, setRepeatedNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleUpdateOldPassword = (value: string) => {
    setOldPassword(value)
  }

  const handleUpdateNewPassword = (value: string) => {
    setNewPassword(value)
  }

  const handleUpdateRepeatedNewPassword = (value: string) => {
    setRepeatedNewPassword(value)
  }

  const changePasswordQuery = useMutation({
    mutationFn: async () => {
      setError(null)
      setIsSuccess(null)

      if (newPassword !== repeatedNewPassword) {
        setError("Hasła nie są takie same.")
        return
      }
      try {
        const response = await fetch(`${apiUrl}/dean/new_password`, {
          method: "POST",
          headers: {
            Authorization: "Bearer TUTAJ_TOKEN",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        })

        if (!response.ok) {
          setError("Nie udało się zmienić hasła. Błąd serwera.")
          return
        }

        setIsSuccess(true)
      } catch (err) {
        setError("Nie udało się zmienić hasła. Błąd serwera.")
      }
    },
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profil, email: </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label>Stare hasło: </Label>
        <Input
          onInput={(e) => handleUpdateOldPassword(e.currentTarget.value)}
          onChange={(e) => handleUpdateOldPassword(e.currentTarget.value)}
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
        <Button onClick={() => changePasswordQuery.mutate()}>
          Zmień hasło
        </Button>
      </CardContent>
    </Card>
  )
}
