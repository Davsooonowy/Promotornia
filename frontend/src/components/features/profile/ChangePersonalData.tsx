import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function ChangePersonalData() {
  const [editPersonalData, setEditPersonalData] = useState(false)
  const [name, setName] = useState<{ initial: string; current: string }>({
    initial: "Jan",
    current: "Jan",
  })
  const [surname, setSurname] = useState<{ initial: string; current: string }>({
    initial: "Kowalski",
    current: "Kowalski",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [shouldFetch, setShouldFetch] = useState(true)

  const { token } = useDecodeToken()

  const personalDataFetch = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/user/personal_data`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się załadować danych osobowych.")
      }

      return await response.json()
    },
    onError: (e) => {
      setError(e.message)
    },
    onSuccess(data) {
      setName({ initial: data.name, current: data.name })
      setSurname({ initial: data.surname, current: data.surname })
    },
  })

  useEffect(() => {
    if (shouldFetch) {
      personalDataFetch.mutate()
      setShouldFetch(false)
    }
  }, [personalDataFetch, shouldFetch])

  useEffect(() => {
    if (isSuccess) setShouldFetch(true)
  }, [isSuccess, personalDataFetch])

  const personalDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/user/edit_personal_data`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.current,
          surname: surname.current,
        }),
      })

      if (!response.ok) {
        throw new Error("Nie udało się zmienić danych osobowych.")
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
        <Label>Imię:</Label>
        <Input
          disabled={!editPersonalData}
          onInput={(e) => {
            const newName = e.currentTarget.value
            setName((name) => ({ ...name, current: newName }))
          }}
          onChange={(e) => {
            const newName = e.currentTarget.value
            setName((name) => ({ ...name, current: newName }))
          }}
          value={name.current}
        />
        <Label>Nazwisko:</Label>
        <Input
          disabled={!editPersonalData}
          onInput={(e) => {
            const newSurname = e.currentTarget.value
            setSurname((surname) => ({ ...surname, current: newSurname }))
          }}
          onChange={(e) => {
            const newSurname = e.currentTarget.value
            setSurname((surname) => ({ ...surname, current: newSurname }))
          }}
          value={surname.current}
        />
        {error && <Label className="text-red-500">{error}</Label>}
        {isSuccess && (
          <Label className="text-green-500">Dane osobowe zaktualizowane</Label>
        )}
        {editPersonalData ? (
          <div className="flex space-x-3">
            <Button
              className="cursor-pointer"
              onClick={() => {
                personalDataMutation.mutate()
              }}
            >
              Zapisz
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setEditPersonalData(false)
                setName((name) => ({ ...name, current: name.initial }))
                setSurname((surname) => ({
                  ...surname,
                  current: surname.initial,
                }))
              }}
            >
              Anuluj
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setEditPersonalData(true)}
            className="cursor-pointer"
          >
            Edytuj dane osobowe
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
