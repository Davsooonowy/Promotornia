"use client"
import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useState, useEffect, useContext, useRef } from "react"
import apiUrl from "@/util/apiUrl"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldOfStudy, Tag, ThesisDetails, ThesisStatus } from "@/util/types"
import { UserRole } from "@/util/enums"
import { Checkbox } from "@/components/ui/checkbox"
import {
  User,
  BookOpen,
  TagIcon,
  GraduationCap,
  AlertCircle,
  Edit,
  Save,
  Settings,
} from "lucide-react"
import EditThesisTextContentDialog from "@/components/features/thesis/EditThesisTextContentsDialog"
import EditThesisTagsDialog from "@/components/features/thesis/EditThesisTagsDialog"
import { toast } from "sonner"
import EditThesisStatusDialog from "@/components/features/thesis/EditThesisStatusDialog"
import EditFieldOfStudyDialog from "@/components/features/thesis/EditFieldOfStudyDialog"
import useDecodeToken from "@/hooks/useDecodeToken"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ThesisStatusChangedContext,
  ThesisStatusChangedContextType,
} from "@/components/context/ThesisStatusChangedContext"
import AssignStudentDialog from "@/components/features/thesis/AssignStudentDialog"

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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const { tokenPayload } = useDecodeToken()

  const thesisStatusChanged = useContext<
    ThesisStatusChangedContextType | undefined
  >(ThesisStatusChangedContext)

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
      if (
        thesis.status !== "Ukryty" &&
        thesis.status !== "Dostępny" &&
        thesis.status !== "Zarezerwowany"
      ) {
        setEditionMode(false)
      }
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
      const response = await fetch(`${apiUrl}/user/fields_of_study/`, {
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
      return data.fields_of_study
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
      if (newStatus === "Dostępny" && !thesis?.fieldOfStudy) {
        throw new Error("Wybierz kierunek studiów.")
      }
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/theses/${numericThesisId}/status/edit/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      )
      if (!response.ok) {
        throw new Error("Nie udało się zmienić statusu pracy.")
      }
    },
    onError: (e) => {
      setMutationError(e.message)
    },
    onSuccess: () => {
      setMutationSuccessMessage("Zmieniono status pracy.")
      thesisFetch.mutate()
      setHasUnsavedChanges(false)
      thesisStatusChanged?.setThesisStatusChanged(true)
    },
  })

  const thesisMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      if (!thesis) throw new Error("Nie znaleziono pracy.")
      const response = await fetch(
        `${apiUrl}/theses/${numericThesisId}/edit/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: thesis.id,
            title: thesis.title,
            fieldOfStudy: thesis.fieldOfStudy,
            description: thesis.description,
            prerequisitesDescription: thesis.prerequisitesDescription,
            tags: thesis.tags.map((tag) => tag.id),
          }),
        },
      )
      if (!response.ok) {
        throw new Error("Nie udało się zapisać zmian.")
      }
    },
    onError: (e) => {
      setMutationError(e.message)
    },
    onSuccess: () => {
      setMutationSuccessMessage("Zapisano zmiany")
      setHasUnsavedChanges(false)
    },
  })

  const deleteThesisMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      if (!thesis) throw new Error("Nie znaleziono pracy.")
      const response = await fetch(`${apiUrl}/theses/${numericThesisId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: thesis.id,
        }),
      })
      if (!response.ok) {
        throw new Error("Nie udało się usunąć pracy.")
      }
    },
    onError: (e) => {
      setMutationError(e.message)
    },
    onSuccess: () => {
      setMutationSuccessMessage("Usunięto pracę")
    },
  })

  const assignStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/theses/${numericThesisId}/assign_student/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            producer_id: studentId,
          }),
        })
      if (!response.ok) {
        throw new Error("Nie udało się przypisać studenta.")
      }
    },
    onError: (e) => setMutationError(e.message),
    onSuccess: () => {
      setMutationSuccessMessage("Przypisano studenta do pracy")
      thesisFetch.mutate()
      setAssignDialogOpen(false)
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

  const canEdit =
    tokenPayload &&
    thesis.supervisorId === tokenPayload.user_id &&
    thesis.status !== "Student zaakceptowany" &&
    thesis.status !== "Zatwierdzony"

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

      {canEdit && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="text-muted-foreground h-5 w-5" />
                <div>
                  <Label className="text-base font-medium">Tryb edycji</Label>
                  <p className="text-muted-foreground text-sm">
                    Włącz aby edytować zawartość pracy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <Label className="font-semibold">
                    Masz niezapisane zamiany!
                  </Label>
                )}
                <Checkbox
                  checked={editionMode}
                  onCheckedChange={toggleEditionMode}
                />
                <Button
                  variant="outline"
                  onClick={() => thesisMutation.mutate()}
                  disabled={!editionMode}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Zapisz zmiany
                </Button>
                <EditThesisStatusDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  changeThesisStatusMutation={changeThesisStatusMutation}
                  newStatus="Hide or publish"
                  userRole={UserRole.supervisor}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Informacje podstawowe
                </div>
                {editionMode && (
                  <Edit className="text-muted-foreground h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Tytuł pracy
                  </Label>
                  <p className="mt-1 text-lg font-medium">{thesis.title}</p>
                </div>
                {editionMode && (
                  <EditThesisTextContentDialog
                    thesis={thesis}
                    setThesis={setThesis}
                    field="title"
                    label="Edytuj tytuł"
                    setHasUnsavedChanges={setHasUnsavedChanges}
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Kierunek studiów
                  </Label>
                  <p className="mt-1">
                    {thesis.fieldOfStudy
                      ? thesis.fieldOfStudy.name
                      : "Należy wybrać kierunek"}
                  </p>
                </div>
                {editionMode &&
                  (thesis.status !== "Ukryty" ? (
                    <Button
                      variant="outline"
                      size="sm"
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
                      setHasUnsavedChanges={setHasUnsavedChanges}
                    />
                  ))}
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Tagi
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {thesis.tags.length > 0 ? (
                      thesis.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="gap-1">
                          <TagIcon className="h-3 w-3" />
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
                {editionMode && (
                  <EditThesisTagsDialog
                    thesis={thesis}
                    setThesis={setThesis}
                    allTags={allTags}
                    allTagsFetch={allTagsFetch}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Opis tematu</span>
                {editionMode && (
                  <EditThesisTextContentDialog
                    thesis={thesis}
                    setThesis={setThesis}
                    field="description"
                    label="Edytuj opis"
                    setHasUnsavedChanges={setHasUnsavedChanges}
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {thesis.description || "Brak opisu"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Wymagania wstępne</span>
                {editionMode && (
                  <EditThesisTextContentDialog
                    thesis={thesis}
                    setThesis={setThesis}
                    field="prerequisitesDescription"
                    label="Edytuj wymagania"
                    setHasUnsavedChanges={setHasUnsavedChanges}
                  />
                )}
              </CardTitle>
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
              <CardTitle>Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {thesis.status === "Zarezerwowany" && editionMode && (
                <EditThesisStatusDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  changeThesisStatusMutation={changeThesisStatusMutation}
                  newStatus="Student zaakceptowany"
                  userRole={UserRole.supervisor}
                />
              )}
              {thesis.status === "Zarezerwowany" && editionMode && (
                <EditThesisStatusDialog
                  thesis={thesis}
                  setThesis={setThesis}
                  changeThesisStatusMutation={changeThesisStatusMutation}
                  newStatus="Dostępny"
                  oldStatus="Zarezerwowany"
                  userRole={UserRole.supervisor}
                />
              )}
              {thesis.status === "Dostępny" && editionMode && (
                <>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <User className="h-4 w-4" />
                    Przypisz studenta
                  </Button>
                  <AssignStudentDialog
                    open={assignDialogOpen}
                    setOpen={setAssignDialogOpen}
                    onAssign={(studentId) => assignStudentMutation.mutate(studentId)}
                  />
                </>
              )}

              {thesis.status === "Ukryty" && (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => {
                    if (confirm("Czy na pewno chcesz usunąć ten temat?")) {
                      deleteThesisMutation.mutate()
                    }
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                  Usuń temat
                </Button>
              )}
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  )
}
