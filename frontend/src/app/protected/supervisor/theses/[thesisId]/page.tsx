"use client"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import apiUrl from "@/util/apiUrl"
import { Label } from "@/components/ui/label"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FieldOfStudy, Tag, ThesisDetails, ThesisStatus } from "@/util/types"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import EditThesisTextContentDialog from "@/components/features/thesis/EditThesisTextContentsDialog"
import EditThesisTagsDialog from "@/components/features/thesis/EditThesisTagsDialog"
import { toast } from "sonner"
import EditThesisStatusDialog from "@/components/features/thesis/EditThesisStatusDialog"
import EditFieldOfStudyDialog from "@/components/features/thesis/EditFieldOfStudyDialog"

export default function Thesis() {
  const { thesisId } = useParams<{ thesisId: string }>()
  const numericThesisId = Number(thesisId)

  const [editionMode, setEditionMode] = useState(false)

  const [thesis, setThesis] = useState<ThesisDetails | null>(null)
  const [thesisFetchError, setThesisFetchError] = useState<string | null>(null)
  const [shouldFetchThesis, setShouldFetchThesis] = useState(true)

  const [allTags, setAllTags] = useState<Tag[] | null>(null)
  const [allTagsFetchError, setAllTagsFetchError] = useState<string | null>(
    null,
  )
  const [shouldFetchAllTags, setShouldFetchAllTags] = useState(true)

  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[] | null>(
    null,
  )
  const [fieldsOfStudyFetchError, setFieldsOfStudyFetchError] = useState<
    string | null
  >(null)
  const [shouldFetchFieldsOfStudy, setShouldFetchFieldsOfStudy] = useState(true)

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

  const allTagsFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/all_supervisor_interest_tags/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się pobrać tagów.")
      }

      const data = await response.json()
      return data.tags
    },
    onError: (e) => {
      setAllTagsFetchError(e.message)
    },
    onSuccess(tags) {
      setAllTags(tags)
    },
  })

  const allFieldsOfStudyFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/field_of_study/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error("Nie udało się załadować dostępnych kierunków studiów.")
      }

      const data = await response.json()
      return data
    },
    onError: (e) => {
      setFieldsOfStudyFetchError(e.message)
    },
    onSuccess: (allFieldsOfStudy) => {
      setFieldsOfStudy(allFieldsOfStudy)
    },
  })

  const changeThesisStatusMutation = useMutation({
    mutationFn: async (newStatus: ThesisStatus) => {
      // const response = await fetch(
      //   `${apiUrl}/theses/${numericThesisId}/status/edit`,
      //   {
      //     method: "PUT",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       newStatus,
      //     }),
      //   },
      // )
      // if (!response.ok) {
      //   throw new Error("Nie udało się zmienić statusu pracy.")
      // }
      // const data = await response.json()

      return newStatus
    },
    onError: (e) => {
      setMutationError(e.message)
    },
    onSuccess: (newStatus) => {
      setMutationSuccessMessage("Zmieniono status pracy.")
      setThesis((theThesis) =>
        theThesis
          ? {
              ...theThesis,
              status: newStatus,
              reservedBy: newStatus === "Ukryty" ? null : theThesis?.reservedBy,
            }
          : theThesis,
      )
      if (
        newStatus !== "Ukryty" &&
        newStatus !== "Dostępny" &&
        newStatus !== "Zarezerwowany"
      )
        setEditionMode(false)
    },
  })

  const thesisMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/thesis/${numericThesisId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: thesis.id,
          name: thesis.title,
          field_of_study: thesis.fieldOfStudy,
          description: thesis.description,
          prerequisites: thesis.prerequisitesDescription,
          tags: thesis.tags.map((tag) => tag.id),
        }),
      })
      if (!response.ok) {
        throw new Error("Nie udało się zapisać zmian.")
      }
      const data = await response.json()

      if (!data) throw new Error("Nie udało się zapisać zmian.")
    },
    onError: (e) => {
      setMutationError(e.message)
    },
    onSuccess: () => {
      setMutationSuccessMessage("Zapisano zmiany")
    },
  })

  useEffect(() => {
    if (shouldFetchThesis) {
      thesisFetch.mutate()
      setShouldFetchThesis(false)
    }
    if (shouldFetchAllTags) {
      allTagsFetch.mutate()
      setShouldFetchAllTags(false)
    }
    if (shouldFetchFieldsOfStudy) {
      allFieldsOfStudyFetch.mutate()
      setShouldFetchFieldsOfStudy(false)
    }
  }, [
    thesisFetch,
    allTagsFetch,
    allFieldsOfStudyFetch,
    shouldFetchThesis,
    shouldFetchAllTags,
    shouldFetchFieldsOfStudy,
  ])

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

  const toggleEditionMode = () => {
    setEditionMode((prev) => !prev)
  }

  useEffect(() => {
    if (allTagsFetchError)
      toast.error("Wystąpiły błędy serwera", {
        description: allTagsFetchError,
      })
    if (fieldsOfStudyFetchError)
      toast.error("Wystąpiły błędy serwera", {
        description: fieldsOfStudyFetchError,
      })
  }, [allTagsFetchError, fieldsOfStudyFetchError])

  if (thesisFetchError) return <h1>{thesisFetchError}</h1>

  if (thesis)
    return (
      <div className="w-full">
        <div className="flex w-full border-y-2 px-4 py-4">
          <div className="box-border w-3/5 space-y-3 rounded-none border-none">
            <CardHeader className="flex flex-col items-start space-y-2 text-2xl">
              <CardTitle>Temat: {thesis.title}</CardTitle>
              {editionMode && (
                <EditThesisTextContentDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  field="title"
                  label="Edytuj temat"
                />
              )}
            </CardHeader>
            <CardContent className="flex w-2/3 flex-col items-start space-y-6">
              <Label>Kierunek: {thesis.fieldOfStudy.name}</Label>
              {editionMode &&
                (thesis.status !== "Ukryty" ? (
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      toast.error("Nie można wykonać akcji", {
                        description: "Praca jest publicznie dostępna",
                      })
                    }
                  >
                    Edytuj kierunek
                  </Button>
                ) : (
                  <EditFieldOfStudyDialog
                    thesis={thesis}
                    setThesis={setThesis}
                    fieldsOfStudy={fieldsOfStudy}
                  />
                ))}
              <div className="space-x-2">
                {thesis.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {editionMode && (
                <EditThesisTagsDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  allTags={allTags}
                />
              )}
              <Label>Promotor: {thesis.supervisor}</Label>
              <Label>Opis tematu:</Label>
              <p>{thesis.description}</p>
              {editionMode && (
                <EditThesisTextContentDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  field="description"
                  label="Edytuj opis"
                />
              )}
              <Label>Wymagania wstępne:</Label>
              <p>{thesis.prerequisitesDescription}</p>
              {editionMode && (
                <EditThesisTextContentDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  field="prerequisitesDescription"
                  label="Edytuj wymagania wstępne"
                />
              )}
            </CardContent>
          </div>
          <div className="box-border w-2/5 space-y-3 rounded-none border-none">
            <CardHeader className="space-y-2 text-2xl">
              {
                //thesis.supervisorId === tokenPayload?.user_id &&
                thesis.status !== "Student zaakceptowany" &&
                  thesis.status !== "Zatwierdzony" && (
                    <CardTitle className="border-y-2 py-3">
                      <div className="flex w-full items-center justify-end space-x-3">
                        <Label>Tryb edycji</Label>{" "}
                        <Checkbox
                          checked={editionMode}
                          onCheckedChange={toggleEditionMode}
                        />
                        <Button
                          className="cursor-pointer"
                          variant="ghost"
                          onClick={() => thesisMutation.mutate()}
                        >
                          Zapisz zmiany
                        </Button>
                        <EditThesisStatusDialog
                          thesis={thesis}
                          setThesis={setThesis}
                          changeThesisStatusMutation={
                            changeThesisStatusMutation
                          }
                          newStatus="Hide or publish"
                        />
                      </div>
                    </CardTitle>
                  )
              }
              <CardTitle>Status tematu: {thesis.status}</CardTitle>
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
            <CardContent>
              {thesis.status === "Zarezerwowany" && editionMode && (
                <EditThesisStatusDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  changeThesisStatusMutation={changeThesisStatusMutation}
                  newStatus="Student zaakceptowany"
                />
              )}
            </CardContent>
          </div>
        </div>
      </div>
    )
}
