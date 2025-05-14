"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { toast } from "sonner"

type CrudAction = "create" | "read" | "update" | "delete"

interface FieldOfStudy {
  id: number
  field: string
}

export default function OtherActions() {
  const [action, setAction] = useState<CrudAction | null>(null)
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { token } = useDecodeToken()

  // CREATE
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/fieldsOfStudy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field: inputValue }),
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się stworzyć nowego kierunku studiów")
    },
    onSuccess: () => {
      readMutation.mutate() // odśwież listę po dodaniu
      setInputValue("")
    },
  })

  // READ
  const readMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/fieldsOfStudy`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error()

      const data = await response.json()

      if (!data) throw new Error()

      return data.fieldsOfStudy
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
      if (selectedId === null) throw new Error()
      const response = await fetch(`${apiUrl}/fieldsOfStudy/${selectedId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field: inputValue }),
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się edytować kierunku studiów")
    },
    onSuccess: () => {
      readMutation.mutate()
      setInputValue("")
      setSelectedId(null)
    },
  })

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (selectedId === null) throw new Error()
      const response = await fetch(`${apiUrl}/fieldsOfStudy/${selectedId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się usunąć kierunku studiów")
    },
    onSuccess: () => {
      readMutation.mutate()
      setSelectedId(null)
    },
  })

  useEffect(() => {
    if (action === "read") {
      readMutation.mutate()
    }
  }, [action, readMutation])

  useEffect(() => {
    if (mutationError) {
      toast.error("Nie udało się wykonać akcji", {
        description: mutationError,
      })
    }
  }, [mutationError])

  return (
    <div className="space-y-4">
      <Label className="text-3xl">Zarządzaj kierunkami studiów</Label>
      <Select onValueChange={(value) => setAction(value as CrudAction)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Wybierz akcję" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="read">Zobacz kierunki</SelectItem>
          <SelectItem value="create">Dodaj kierunek</SelectItem>
          <SelectItem value="update">Zmień nazwę kierunku</SelectItem>
          <SelectItem value="delete">Usuń kierunek</SelectItem>
        </SelectContent>
      </Select>

      {action === "read" && (
        <ul>
          {fieldsOfStudy.map((f) => (
            <li key={f.id}>{f.field}</li>
          ))}
        </ul>
      )}

      {(action === "create" || action === "update") && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (action === "create") createMutation.mutate()
            else updateMutation.mutate()
          }}
          className="space-y-2"
        >
          {action === "update" && (
            <Select onValueChange={(val) => setSelectedId(Number(val))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Wybierz kierunek" />
              </SelectTrigger>
              <SelectContent>
                {fieldsOfStudy.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nazwa kierunku"
          />
          <Button type="submit">
            {action === "create" ? "Dodaj" : "Aktualizuj"}
          </Button>
        </form>
      )}

      {action === "delete" && (
        <div className="space-y-2">
          <Select onValueChange={(val) => setSelectedId(Number(val))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz kierunek do usunięcia" />
            </SelectTrigger>
            <SelectContent>
              {fieldsOfStudy.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => deleteMutation.mutate()}
            disabled={selectedId === null}
          >
            Usuń
          </Button>
        </div>
      )}
    </div>
  )
}
