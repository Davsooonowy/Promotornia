"use client"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import apiUrl from "@/util/apiUrl"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ThesisDetails } from "@/util/types"
import { User, BookOpen, Tag, GraduationCap, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function Thesis() {
  const { thesisId } = useParams<{ thesisId: string }>()
  const numericThesisId = Number(thesisId)

  const [thesis, setThesis] = useState<ThesisDetails | null>(null)
  const [thesisFetchError, setThesisFetchError] = useState<string | null>(null)
  const [shouldFetchThesis, setShouldFetchThesis] = useState(true)

  const [mutationError, setMutationError] = useState<string | null>(null)
  const [mutationSuccessMessage, setMutationSuccessMessage] = useState<
    string | null
  >(null)

  const thesisFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/thesis/${numericThesisId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie znaleziono pracy.")
      }

      const data = await response.json()

      const thesis: ThesisDetails = {
        id: data.id,
        title: data.name,
        description: data.description,
        prerequisitesDescription: data.prerequisites,
        fieldOfStudy: data.field_of_study,
        tags: data.tags,
        supervisor: data.owner.first_name + " " + data.owner.last_name,
        supervisorId: data.owner.id,
        status: data.status,
        createdAt: data.created_at,
        reservedBy: data.producer
          ? {
              id: data.producer.id,
              name: data.producer.first_name,
              surname: data.producer.last_name,
              email: data.producer.email,
            }
          : null,
      }

      return thesis
    },
    onError: (e) => {
      setThesisFetchError(e.message)
    },
    onSuccess: (thesis) => {
      setThesis(thesis)
    },
  })

  useEffect(() => {
    if (shouldFetchThesis) {
      thesisFetch.mutate()
      setShouldFetchThesis(false)
    }
  }, [thesisFetch, shouldFetchThesis])

  useEffect(() => {
    if (mutationError) {
      toast.error("Nie udało się wykonać akcji", {
        description: mutationError,
      })
      setMutationError(null)
    }
    if (mutationSuccessMessage) {
      toast.success("Akcja wykonana pomyślnie", {
        description: mutationSuccessMessage,
      })
      setMutationSuccessMessage(null)
    }
  }, [mutationError, mutationSuccessMessage])

  if (thesisFetchError) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-destructive/20">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-xl font-semibold">Błąd ładowania</h2>
            <p className="text-muted-foreground">{thesisFetchError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (thesisFetch.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-12 w-3/4 bg-[var(--skeleton-color)]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full bg-[var(--skeleton-color)]" />
            <Skeleton className="h-48 w-full bg-[var(--skeleton-color)]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full bg-[var(--skeleton-color)]" />
            <Skeleton className="h-48 w-full bg-[var(--skeleton-color)]" />
          </div>
        </div>
      </div>
    )
  }

  if (!thesis) return null

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <BookOpen className="text-primary h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold">{thesis.title}</h1>
          <div className="text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{thesis.supervisor}</span>
            </div>
          </div>
        </div>
        <Badge
          variant={thesis.status === "Dostępny" ? "default" : "secondary"}
          className="px-3 py-1 text-sm"
        >
          {thesis.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Informacje podstawowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Kierunek studiów
                </Label>
                <p className="mt-1">
                  {thesis.fieldOfStudy
                    ? thesis.fieldOfStudy.name
                    : "Nie określono kierunku"}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Tagi
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {thesis.tags.length > 0 ? (
                    thesis.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Brak tagów
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opis tematu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {thesis.description || "Brak opisu"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wymagania wstępne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {thesis.prerequisitesDescription || "Brak szczególnych wymagań"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status pracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge
                    variant={
                      thesis.status === "Dostępny" ? "default" : "secondary"
                    }
                  >
                    {thesis.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {thesis.reservedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student realizujący
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Imię i nazwisko
                    </Label>
                    <p className="mt-1">
                      {thesis.reservedBy.name} {thesis.reservedBy.surname}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Email
                    </Label>
                    <p className="mt-1 text-sm">{thesis.reservedBy.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Promotor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Imię i nazwisko
                </Label>
                <p className="mt-1">{thesis.supervisor}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
