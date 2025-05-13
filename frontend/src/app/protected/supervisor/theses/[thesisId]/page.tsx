"use client"
import { useParams } from "next/navigation"
import { mockThesesDetails } from "@/util/mockData"
import { useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
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
import { mockFieldsOfStudy } from "@/util/mockData"
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
    mockFieldsOfStudy,
  )
  const [fieldsOfStudyFetchError, setFieldsOfStudyFetchError] = useState<
    string | null
  >(null)
  const [shouldFetchFieldsOfStudy, setShouldFetchFieldsOfStudy] = useState(true)

  const [mutationError, setMutationError] = useState<string | null>(null)
  const [mutationSuccessMessage, setMutationSuccessMessage] = useState<
    string | null
  >(null)

  const [valueBeforeEdition, setValueBeforeEdition] =
    useState<FieldOfStudy | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { token, tokenPayload } = useDecodeToken()

  const thesisFetch = useMutation({
    mutationFn: async () => {
      // const response = await fetch(`${apiUrl}/theses/${numericThesisId}`, {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // })

      // if (!response.ok) {
      //   throw new Error("Nie znaleziono pracy.")
      // }

      // const data = await response.json()

      // const theThesis = data.thesis

      const theThesis = mockThesesDetails.find(
        (mockThesis) => mockThesis.id === numericThesisId,
      )
      if (!theThesis) {
        throw new Error("Nie znaleziono pracy.")
      }
      return theThesis
    },
    onError: (e) => {
      setThesisFetchError(e.message)
    },
    onSuccess: (theThesis) => {
      setThesis(theThesis)
    },
  })

  const allTagsFetch = useMutation({
    mutationFn: async () => {
      // const response = await fetch(`${apiUrl}/all_theses_tags`, {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // })

      // if (!response.ok) {
      //   throw new Error("Nie udało się pobrać tagów.")
      // }

      // const data = await response.json()

      // const tags = data.tags

      const tags: Tag[] = [
        { id: 1, name: "Cyberbezpieczeństwo" },
        { id: 2, name: "Uczenie maszynowe" },
        { id: 3, name: "Algorytmy" },
      ]

      return tags
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
      const response = await fetch(`${apiUrl}/fieldsOfStudy`, {
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

      const allFieldsOfStudy = data.fieldsOfStudy
      return allFieldsOfStudy
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

  useEffect(() => {
    if (shouldFetchThesis) {
      thesisFetch.mutate()
      setShouldFetchThesis(false)
    }
    if (shouldFetchAllTags) {
      allTagsFetch.mutate()
      setShouldFetchAllTags(false)
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
      toast("Nie udało się wykonać akcji", {
        description: mutationError,
      })
      setMutationError(null)
    }
    if (mutationSuccessMessage) {
      toast("Akcja wykonana pomyślnie", {
        description: mutationSuccessMessage,
      })
      setMutationSuccessMessage(null)
    }
  }, [mutationError, mutationSuccessMessage])

  const toggleEditionMode = () => {
    setEditionMode((prev) => !prev)
  }

  const showToast = (title: string, desc: string) => {
    toast(title, {
      description: desc,
    })
  }

  if (thesisFetchError) return <h1>{thesisFetchError}</h1>

  if (thesis)
    return (
      <div className="w-full">
        <div className="flex w-full border-y-2 px-4 py-4">
          <div className="box-border w-2/3 space-y-3 rounded-none border-none">
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
              <Label>Kierunek: {thesis.fieldOfStudy.field}</Label>
              {editionMode &&
                (thesis.status !== "Ukryty" ? (
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      showToast(
                        "Nie można wykonać akcji",
                        "Praca jest publicznie dostępna",
                      )
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
          <div className="box-border w-1/3 space-y-3 rounded-none border-none">
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
