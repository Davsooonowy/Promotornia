"use client"
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, AlertCircle, FileText } from "lucide-react"
import Link from "next/link"
import { mockSupervisors, mockTheses } from "@/util/mockData"
import { Supervisor } from "@/util/types"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function OwnTheses() {
  const { supervisorId } = useParams<{ supervisorId: string }>()
  const numericSupervisorId = Number(supervisorId)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = Number.parseInt(process.env.ITEMS_PER_PAGE || "4", 10)

  // tutaj fetchowanie naszego superwajzora to jest TODO dla bekendowców, teraz bierzemy z mocków
  useEffect(() => {
    const fetchSupervisor = async () => {
      const foundSupervisor = mockSupervisors.find(
        (s) => s.id === numericSupervisorId,
      )

      setTimeout(() => {
        setSupervisor(foundSupervisor || null)
        setLoading(false)
      }, 600)
    }

    fetchSupervisor()
  }, [numericSupervisorId])

  const supervisorTheses = useMemo(() => {
    return mockTheses.filter(
      (thesis) => thesis.promoterId === numericSupervisorId,
    )
  }, [numericSupervisorId])

  const currentTheses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return supervisorTheses.slice(startIndex, startIndex + itemsPerPage)
  }, [supervisorTheses, currentPage, itemsPerPage])

  const totalPages = Math.ceil(supervisorTheses.length / itemsPerPage)

  const remainingCapacity = supervisor
    ? supervisor.totalSlots - supervisorTheses.length
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
        {currentTheses.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p>Nie masz jeszcze żadnych tematów prac.</p>
            </CardContent>
          </Card>
        ) : (
          currentTheses.map((thesis) => (
            <Card key={thesis.id} className="transition-shadow hover:shadow-md">
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
                      <p className="text-sm">Katedra: {thesis.department}</p>
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
                        <Button size="sm" className="cursor-pointer">
                          Edytuj
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {thesis.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {thesis.reservedBy && (
                    <div className="text-muted-foreground text-sm">
                      Zarezerwowany przez:{" "}
                      <span className="font-medium">{thesis.reservedBy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {supervisorTheses.length > itemsPerPage && (
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
