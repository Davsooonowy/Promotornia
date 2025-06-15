"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, User, SortAsc, SortDesc } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FieldOfStudy, Supervisor, SupervisorBackend } from "@/util/types"
import apiUrl from "@/util/apiUrl"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserRole } from "@/util/types"
import { useRouter } from "next/navigation"

export interface SupervisorsListProps {
  basePath: string
  canEdit?: boolean
  currentUserId?: number
  userRole: UserRole
}

export default function SupervisorsList({
  basePath,
  canEdit = false,
  currentUserId,
  userRole,
}: SupervisorsListProps) {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [showOnlyWithSlots, setShowOnlyWithSlots] = useState(false)
  const [loading, setLoading] = useState(true)
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [totalPages, setTotalPages] = useState(1)
  const [shouldFetchSupervisor, setShouldFetchSupervisors] = useState(true)
  const [availableFieldsOfStudy, setAvailableFieldsOfStudy] = useState<
    FieldOfStudy[] | null
  >(null)

  const itemsPerPage = Number(process.env.ITEMS_PER_PAGE || "4")

  const supervisorsFetch = useMutation({
    mutationFn: async () => {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${apiUrl}/supervisors/list/?page=${currentPage}&search=${searchQuery}&fieldOfStudy=${fieldOfStudy || ""}&available=${showOnlyWithSlots ? true : ""}&order=${sortField || ""}&ascending=${sortDirection === "asc"}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) throw new Error("Nie udało się pobrać promotorów")
      const data = await response.json()

      const mappedSupervisors = data.results.map(
        (supervisor: SupervisorBackend) => ({
          id: supervisor.id,
          name: `${supervisor.title ? supervisor.title : ""} ${supervisor.first_name} ${supervisor.last_name}`,
          email: supervisor.email,
          departments: supervisor.field_of_study.map((field) => field.name),
          specialization: supervisor.description || "N/A",
          availableSlots: supervisor.free_spots,
          totalSlots: supervisor.total_spots,
        }),
      )

      let fieldsOfStudyRes

      if (userRole !== "dean") {
        fieldsOfStudyRes = await fetch(`${apiUrl}/user/fields_of_study/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      } else {
        fieldsOfStudyRes = await fetch(`${apiUrl}/field_of_study/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!fieldsOfStudyRes.ok) {
        throw new Error("Nie udało się pobrać dostępnych kierunków studiów")
      }
      const fields = await fieldsOfStudyRes.json()

      return {
        mappedSupervisors,
        count: data.count,
        availableFieldsOfStudy:
          userRole !== "dean" ? fields.fields_of_study : fields,
      }
    },
    onError: (e) => {
      toast.error(e.message, {
        description: "Błąd serwera",
      })
      setLoading(false)
    },
    onSuccess: (data) => {
      setSupervisors(data.mappedSupervisors)
      setTotalPages(Math.ceil(data.count / itemsPerPage))
      setAvailableFieldsOfStudy(data.availableFieldsOfStudy)
      setLoading(false)
    },
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSetFieldOfStudy = (value: string) => {
    if (value === "null") {
      setFieldOfStudy(null)
    } else {
      setFieldOfStudy(value)
    }
  }

  useEffect(() => {
    if (shouldFetchSupervisor) {
      setShouldFetchSupervisors(false)
      supervisorsFetch.mutate()
    }
  }, [shouldFetchSupervisor, supervisorsFetch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SupervisorsListSkeleton />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista promotorów</h1>
      </div>

      <Card className="bg-background text-foreground">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder="Szukaj promotora..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Label>Kierunek studiów:</Label>
                <Select
                  value={fieldOfStudy || "null"}
                  onValueChange={handleSetFieldOfStudy}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz kierunek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Dowolny</SelectItem>
                    {availableFieldsOfStudy &&
                      availableFieldsOfStudy.map((field) => (
                        <SelectItem key={field.id} value={String(field.id)}>
                          {field.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available-slots"
                  checked={showOnlyWithSlots}
                  onCheckedChange={(checked) =>
                    setShowOnlyWithSlots(checked === true)
                  }
                />
                <Label htmlFor="available-slots">
                  Wyświetl tylko z dostępnymi miejscami
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("last_name")}
                  className="gap-1"
                >
                  Nazwisko
                  {sortField === "last_name" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("free_spots")}
                  className="gap-1"
                >
                  Miejsca
                  {sortField === "free_spots" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
              </div>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              supervisorsFetch.mutate()
              setCurrentPage(1)
            }}
          >
            <Search /> Szukaj
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {supervisors.length === 0 ? (
          <Card className="bg-background text-foreground">
            <CardContent className="pt-6 text-center">
              <p>
                Nie znaleziono promotorów spełniających kryteria wyszukiwania.
              </p>
            </CardContent>
          </Card>
        ) : (
          supervisors.map((supervisor) => (
            <Card
              key={supervisor.id}
              className="bg-background text-foreground transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground h-5 w-5" />
                      <Link
                        href={`${basePath}/${supervisor.id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {supervisor.name}
                      </Link>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {supervisor.email}
                    </p>
                    <p className="text-sm">
                      Katedry: {supervisor.departments.join(", ")}
                    </p>
                    <p className="text-sm">
                      Specjalizacja: {supervisor.specialization}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">Dostępne miejsca:</span>
                      <span
                        className={`font-medium ${
                          supervisor.availableSlots === 0
                            ? "text-destructive"
                            : "text-success"
                        }`}
                      >
                        {supervisor.availableSlots}/{supervisor.totalSlots}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`${basePath}/${supervisor.id}`)
                        }
                      >
                        Szczegóły
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {supervisors.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1

              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              }

              if (page === 2 || page === totalPages - 1) {
                return <PaginationEllipsis key={`ellipsis-${page}`} />
              }

              return null
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

function SupervisorsListSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 bg-[var(--skeleton-color)]" />
      </div>

      <Card className="bg-background text-foreground">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[var(--skeleton-color)]" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-[270px] bg-[var(--skeleton-color)]" />
              <Skeleton className="h-6 w-[270px] bg-[var(--skeleton-color)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-background text-foreground">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="w-3/4 space-y-2">
                  <Skeleton className="h-6 w-full bg-[var(--skeleton-color)]" />
                  <Skeleton className="h-4 w-1/3 bg-[var(--skeleton-color)]" />
                  <Skeleton className="h-4 w-1/2 bg-[var(--skeleton-color)]" />
                  <Skeleton className="h-4 w-1/2 bg-[var(--skeleton-color)]" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-24 bg-[var(--skeleton-color)]" />
                  <div className="mt-4 flex justify-end gap-2">
                    <Skeleton className="h-9 w-20 bg-[var(--skeleton-color)]" />
                    <Skeleton className="h-9 w-20 bg-[var(--skeleton-color)]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
