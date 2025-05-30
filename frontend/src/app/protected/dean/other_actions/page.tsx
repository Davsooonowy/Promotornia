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
  name: string
  description: string //TODO: add description field
}

export default function OtherActions() {
  const [action, setAction] = useState<CrudAction | null>(null)
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [shouldFetch, setShouldFetch] = useState(true)
  const [loading, setLoading] = useState(true)

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
        body: JSON.stringify({ name: inputValue, description: "placeholder" }),
      })

      if (!response.ok) throw new Error()
    },
    onError: () => {
      setMutationError("Nie udało się stworzyć nowego kierunku studiów")
    },
    onSuccess: () => {
      readMutation.mutate()
      setInputValue("")
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
      setShouldFetch(true)
    },
    onSuccess: (data: FieldOfStudy[]) => {
      setFieldsOfStudy(data)
      setLoading(false)
    },
  })

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (selectedId === null) throw new Error()
      const response = await fetch(`${apiUrl}/field_of_study/${selectedId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: inputValue, description: "placeholder" }),
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
      const response = await fetch(`${apiUrl}/field_of_study/${selectedId}/`, {
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
    if (action === "read" && shouldFetch) {
      readMutation.mutate()
      setShouldFetch(false)
    }
  }, [action, readMutation, shouldFetch])

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
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {fieldsOfStudy.map((f) => (
                <li key={f.id}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>
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
                    {f.name}
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
                  {f.name}
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
