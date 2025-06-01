"use client"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import apiUrl from "@/util/apiUrl"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThesisDetails } from "@/util/types"
import { User } from "lucide-react"
import { toast } from "sonner"

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

  if (thesisFetchError) return <h1>{thesisFetchError}</h1>

  if (thesis)
    return (
      <div className="w-full">
        <div className="flex w-full border-y-2 px-4 py-4">
          <div className="box-border w-3/5 space-y-3 rounded-none border-none">
            <CardHeader className="flex flex-col items-start space-y-2 text-2xl">
              <CardTitle>Temat: {thesis.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex w-2/3 flex-col items-start space-y-6">
              <Label>
                Kierunek:{" "}
                {thesis.fieldOfStudy
                  ? thesis.fieldOfStudy.name
                  : "Coś poszło nie tak. Promotor nie ustawił kierunku studiów związanego z pracą."}
              </Label>
              <div className="space-x-2">
                {thesis?.tags.length > 0
                  ? thesis.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))
                  : "Brak tagów"}
              </div>
              <Label>Promotor: {thesis.supervisor}</Label>
              <Label>Opis tematu:</Label>
              <p>{thesis.description}</p>
              <Label>Wymagania wstępne:</Label>
              <p>{thesis.prerequisitesDescription}</p>
            </CardContent>
          </div>
          <div className="box-border flex w-2/5 flex-col space-y-3 rounded-none border-none">
            <CardHeader className="space-y-2 text-2xl">
              <div className="flex justify-between">
                <CardTitle className="mt-1">
                  Status tematu: {thesis.status}
                </CardTitle>
              </div>
            </CardHeader>
            {thesis.reservedBy && (
              <CardContent className="space-y-3">
                <Label>Student realizujący temat:</Label>
                <div className="space-y-2 border-2 p-2">
                  <Label>
                    <User />
                    {thesis.reservedBy.name} {thesis.reservedBy.surname}
                  </Label>
                  <Label>{thesis.reservedBy.email}</Label>
                </div>
              </CardContent>
            )}
          </div>
        </div>
      </div>
    )
}
