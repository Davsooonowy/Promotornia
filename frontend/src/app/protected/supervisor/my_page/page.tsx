"use client"

import ChangeDescription from "@/components/features/profile/ChangeDescription"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import apiUrl from "@/util/apiUrl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import useDecodeToken from "@/hooks/useDecodeToken"
import {
  User,
  Mail,
  Settings,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react"

type FieldOfStudy = {
  id: number
  name: string
  description: string
}

type SupervisorDetails = {
  id: number
  email: string
  first_name: string
  last_name: string
  title?: string
  description?: string
  field_of_study: FieldOfStudy[]
  total_spots: number
  free_spots: number
}

export default function Supervisor() {
  const [supervisor, setSupervisor] = useState<SupervisorDetails | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const { tokenPayload } = useDecodeToken()
  const canEdit = tokenPayload

  const supervisorFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/user/supervisor/my_page/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie znaleziono promotora.")
      }

      const data = await response.json()

      return {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        title: data.title,
        description: data.description,
        total_spots: data.total_spots,
        free_spots: data.free_spots,
        field_of_study: data.field_of_study,
      }
    },
    onError: (e) => setFetchError(e.message),
    onSuccess: (data) => setSupervisor(data),
  })

  useEffect(() => {
    supervisorFetch.mutate()
  }, [])

  useEffect(() => {
    if (fetchError) {
      toast.error("Błąd", { description: fetchError })
    }
  }, [fetchError])

  if (fetchError) return <h1>{fetchError}</h1>
  if (!supervisor) return <p>Ładowanie...</p>

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <User className="text-primary h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold">
            {supervisor.title && `${supervisor.title} `}
            {supervisor.first_name} {supervisor.last_name}
          </h1>
          <div className="text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{supervisor.email}</span>
            </div>
          </div>
        </div>
        <Badge className="px-3 py-1 text-sm" variant="secondary">
          Dostępne miejsca: {supervisor.free_spots}/{supervisor.total_spots}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Kierunki studiów
              </CardTitle>
            </CardHeader>
            <CardContent>
              {supervisor.field_of_study.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {supervisor.field_of_study.map((field) => (
                    <Badge key={field.id} variant="outline">
                      {field.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Brak przypisanych kierunków</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Opis specjalizacji:
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <div className="mt-4">
                  <ChangeDescription />
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {supervisor.description || "Brak opisu"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dostępność
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Łączna liczba miejsc:</span>
                <span>{supervisor.total_spots}</span>
              </div>
              <div className="flex justify-between">
                <span>Dostępne miejsca:</span>
                <span>{supervisor.free_spots}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
