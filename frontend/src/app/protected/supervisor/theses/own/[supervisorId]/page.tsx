"use client"
import apiUrl from "@/util/apiUrl"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"
import { Supervisor, ThesisDetails } from "@/util/types"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ThesisBackend } from "@/util/types"

export default function OwnTheses() {
  const { supervisorId } = useParams<{ supervisorId: string }>()
  const numericSupervisorId = Number(supervisorId)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)
  const [theses, setTheses] = useState<ThesisDetails[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = Number.parseInt(process.env.ITEMS_PER_PAGE || "4")

  useEffect(() => {
    const fetchSupervisorAndTheses = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const supervisorResponse = await fetch(
          `${apiUrl}/supervisors/${numericSupervisorId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
        if (!supervisorResponse.ok) {
          throw new Error("Wystąpił błąd podczas pobierania danych promotora.")
        }

        const supervisorData = await supervisorResponse.json()

        const mappedSupervisor: Supervisor = {
          id: supervisorData.id,
          name: `${supervisorData.title} ${supervisorData.first_name} ${supervisorData.last_name}`,
          email: supervisorData.email,
          department: supervisorData.field_of_study.name,
          specialization: supervisorData.description || "N/A",
          availableSlots: supervisorData.free_spots,
          totalSlots: supervisorData.total_spots,
        }

        setSupervisor(mappedSupervisor)

        const thesesResponse = await fetch(
          `${apiUrl}/thesis/supervisor/${numericSupervisorId}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (!thesesResponse.ok) {
          throw new Error("Wystąpił błąd podczas pobierania tematów prac.")
        }

        const data = await thesesResponse.json()

        const mappedTheses = data.theses.map((thesis: ThesisBackend) => ({
          id: thesis.id,
          title: thesis.name,
          description: thesis.description,
          prerequisitesDescription: thesis.prerequisites,
          fieldOfStudy: thesis.field_of_study,
          tags: thesis.tags,
          supervisor: thesis.owner.first_name + " " + thesis.owner.last_name,
          supervisorId: thesis.owner.id,
          status: thesis.status,
          createdAt: new Date(thesis.date_of_creation).toLocaleDateString(),
        }))

        setTheses(mappedTheses)
      } catch {
        throw new Error(
          "Nie udało się pobrać danych promotora lub tematów prac.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSupervisorAndTheses()
  }, [numericSupervisorId])

  const totalPages = Math.ceil(theses.length / itemsPerPage)

  const remainingCapacity = supervisor
    ? supervisor.totalSlots - theses.length
    : 0
  const capacityStatus =
    remainingCapacity <= 0
      ? "error"
      : remainingCapacity <= 2
        ? "warning"
        : "success"

  if (loading) {
    return <SupervisorThesesSkeleton />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moje tematy prac</h1>

        <div className="flex items-center gap-4">
          <Card
            className={`border-${capacityStatus === "error" ? "destructive" : capacityStatus === "warning" ? "orange-500" : "green-500"}`}
          >
            <CardContent className="flex items-center gap-2 py-3">
              <AlertCircle
                className={`text-${capacityStatus === "error" ? "destructive" : capacityStatus === "warning" ? "orange-500" : "green-500"} h-5 w-5`}
              />
              <span>
                Możesz utworzyć jeszcze: <strong>{remainingCapacity}</strong>{" "}
                tematów
              </span>
            </CardContent>
          </Card>

          <Link href="/protected/supervisor/theses/new">
            <Button className="cursor-pointer gap-2">
              <PlusCircle className="h-5 w-5" />
              Dodaj nowy temat
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {theses.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Nie masz jeszcze żadnych tematów prac.</p>
            </CardContent>
          </Card>
        ) : (
          theses
            .filter(
              (item, index) =>
                index >= (currentPage - 1) * 4 && index <= currentPage * 4 - 1,
            )
            .map((thesis) => (
              <Card
                key={thesis.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="text-muted-foreground h-5 w-5" />
                          <Link
                            href={`/protected/supervisor/theses/${thesis.id}`}
                            className="text-lg font-medium hover:underline"
                          >
                            {thesis.title}
                          </Link>
                        </div>
                        <p className="text-sm">
                          Katedra:{" "}
                          {thesis.fieldOfStudy
                            ? thesis.fieldOfStudy.name
                            : "Nie wybrano"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Dodano: {thesis.createdAt}
                        </p>
                      </div>

                      <div className="text-right">
                        <Badge
                          className={
                            thesis.status === "Dostępny"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
                          }
                        >
                          {thesis.status}
                        </Badge>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/protected/supervisor/theses/${thesis.id}`,
                              )
                            }
                          >
                            Szczegóły
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {thesis.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    {/*{thesis.reservedBy && (*/}
                    {/*  <div className="text-muted-foreground text-sm">*/}
                    {/*    Zarezerwowany przez:{" "}*/}
                    {/*    <span className="font-medium">*/}
                    {/*      {thesis.reservedBy.id}*/}
                    {/*    </span>*/}
                    {/*  </div>*/}
                    {/*)}*/}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {theses.length > itemsPerPage && (
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

function SupervisorThesesSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 bg-[var(--skeleton-color)]" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-64 bg-[var(--skeleton-color)]" />
          <Skeleton className="h-10 w-40 bg-[var(--skeleton-color)]" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-40 w-full bg-[var(--skeleton-color)]"
          />
        ))}
      </div>
    </div>
  )
}
