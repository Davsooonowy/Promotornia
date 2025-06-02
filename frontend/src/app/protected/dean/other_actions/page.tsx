"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface FieldOfStudy {
  id: number
  name: string
  description: string
}

export default function OtherActions() {
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([])
  const [newFieldInputValue, setNewFieldInputValue] = useState("")
  const [editedId, setEditedId] = useState<number | null>(null)
  const [editedNewValue, setEditedNewValue] = useState<string>("")
  const [editedOldValue, setEditedOldValue] = useState<string>("")
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [shouldFetch, setShouldFetch] = useState(true)
  const [mutationSuccess, setMutationSuccess] = useState(false)

  const { token } = useDecodeToken()

  // CREATE
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/field_of_study/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFieldInputValue,
          description: "placeholder",
        }),
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się stworzyć nowego kierunku studiów")
    },
    onSuccess: () => {
      readMutation.mutate()
      setMutationSuccess(true)
    },
  })

  // READ
  const readMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/field_of_study/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error()

      const data = await response.json()

      if (!data) throw new Error()

      return data
    },
    onError: () => {
      setMutationError("Nie udało się załadować kierunków studiów")
    },
    onSuccess: (data: FieldOfStudy[]) => {
      setFieldsOfStudy(data)
    },
  })

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (editedId === null) throw new Error()
      const response = await fetch(`${apiUrl}/field_of_study/${editedId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedNewValue,
          description: "placeholder",
        }),
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się edytować kierunku studiów")
      setEditedId(null)
      setEditedNewValue("")
      setEditedOldValue("")
    },
    onSuccess: () => {
      readMutation.mutate()
      setMutationSuccess(true)
      setEditedId(null)
      setEditedNewValue("")
      setEditedOldValue("")
    },
  })

  useEffect(() => {
    if (shouldFetch && token) {
      readMutation.mutate()
      setShouldFetch(false)
    }
  }, [readMutation, shouldFetch, token])

  useEffect(() => {
    if (mutationError) {
      toast.error("Nie udało się wykonać akcji", {
        description: mutationError,
      })
      setMutationError(null)
    }
    if (mutationSuccess) {
      toast.success("Akcja wykonana pomyślnie.", {
        description: "Zapisano zmiany.",
      })
      setMutationSuccess(false)
    }
  }, [mutationError, mutationSuccess])

  if (!token) return null

  if (!fieldsOfStudy) {
    toast.error("Nie udało się pobrać kierunków studiów.", {
      description: "Odśwież stronę",
    })
    return <h1>Błąd</h1> // poprawić
  }

  return (
    <div className="space-y-4">
      <Label className="text-3xl">Zarządzaj kierunkami studiów</Label>
      <div className="flex">
        <Label className="mr-4">Dodaj kierunek: </Label>
        <Input
          className="w-48"
          onInput={(e) => setNewFieldInputValue(e.currentTarget.value)}
          onChange={(e) => setNewFieldInputValue(e.currentTarget.value)}
        />
        <Button
          onClick={() => {
            createMutation.mutate()
          }}
        >
          Dodaj
        </Button>
      </div>
      {fieldsOfStudy.map((fieldOfStudy) => {
        if (fieldOfStudy.id === editedId) {
          return (
            <div className="flex" key={fieldOfStudy.id}>
              <Input
                className="w-48"
                onInput={(e) => setEditedNewValue(e.currentTarget.value)}
                onChange={(e) => setEditedNewValue(e.currentTarget.value)}
                value={editedId ? editedNewValue : fieldOfStudy.name}
              />
              <Button
                onClick={() => {
                  updateMutation.mutate()
                }}
                variant="outline"
              >
                Zapisz
              </Button>
              <Button
                onClick={() => {
                  setEditedId(null)
                  setFieldsOfStudy((curFields) =>
                    curFields.map((curField) =>
                      curField.id === editedId
                        ? { ...curField, name: editedOldValue }
                        : curField,
                    ),
                  )
                  setEditedNewValue("")
                  setEditedOldValue("")
                }}
                variant="secondary"
              >
                Anuluj
              </Button>
            </div>
          )
        } else {
          return (
            <div className="flex" key={fieldOfStudy.id}>
              <Label className="mr-4 font-semibold">{fieldOfStudy.name}</Label>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditedId(fieldOfStudy.id)
                  setEditedNewValue(fieldOfStudy.name)
                  setEditedOldValue(fieldOfStudy.name)
                }}
              >
                <ArrowLeft />
                Edytuj nazwę
              </Button>
            </div>
          )
        }
      })}
    </div>
  )
}
