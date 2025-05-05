"use client"
import { useState, useEffect, useMemo } from "react"
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
import { Search, User, SortAsc, SortDesc, Filter } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { mockSupervisors, getTagsFromSupervisors } from "@/util/mockData"

export interface SupervisorsListProps {
  basePath: string
  canEdit?: boolean
  currentUserId?: number
}

export default function SupervisorsList({
  basePath,
  canEdit = false,
  currentUserId,
}: SupervisorsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [showOnlyWithSlots, setShowOnlyWithSlots] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => getTagsFromSupervisors(mockSupervisors), [])
  const itemsPerPage = Number.parseInt(process.env.ITEMS_PER_PAGE || "4", 10)

  const filteredPromoters = useMemo(() => {
    let result = mockSupervisors.filter((promoter) => {
      const matchesSearch =
        promoter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promoter.specialization
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      const matchesField =
        !fieldOfStudy || promoter.department.includes(fieldOfStudy)
      const matchesSlots = !showOnlyWithSlots || promoter.availableSlots > 0
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => promoter.tags.includes(tag))

      return matchesSearch && matchesField && matchesSlots && matchesTags
    })

    if (sortField) {
      result = [...result].sort((a, b) => {
        let valueA, valueB

        switch (sortField) {
          case "name":
            valueA = a.name
            valueB = b.name
            break
          case "availableSlots":
            valueA = a.availableSlots
            valueB = b.availableSlots
            break
          case "department":
            valueA = a.department
            valueB = b.department
            break
          default:
            return 0
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        } else {
          return sortDirection === "asc"
            ? (valueA as number) - (valueB as number)
            : (valueB as number) - (valueA as number)
        }
      })
    }

    return result
  }, [
    searchQuery,
    fieldOfStudy,
    showOnlyWithSlots,
    sortField,
    sortDirection,
    selectedTags,
  ])

  const paginatedPromoters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPromoters.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPromoters, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredPromoters.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
    setCurrentPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, fieldOfStudy, showOnlyWithSlots, selectedTags])

  if (loading) {
    return <SupervisorsListSkeleton />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista promotorów</h1>
      </div>

      <Card className="bg-slate-50">
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
                <Select onValueChange={setFieldOfStudy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz kierunek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informatyka">Informatyka</SelectItem>
                    <SelectItem value="Cyberbezpieczeństwo">
                      Cyberbezpieczeństwo
                    </SelectItem>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Tagi
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] w-56 overflow-auto">
                  {allTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={(e) => {
                        e.preventDefault()
                        toggleTag(tag)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                        id={`tag-${tag}`}
                      />
                      <Label
                        htmlFor={`tag-${tag}`}
                        className="flex-grow cursor-pointer"
                      >
                        {tag}
                      </Label>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="gap-1"
                >
                  Nazwisko
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("availableSlots")}
                  className="gap-1"
                >
                  Miejsca
                  {sortField === "availableSlots" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-6 text-xs"
                >
                  Wyczyść wszystkie
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {paginatedPromoters.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <p>
                Nie znaleziono promotorów spełniających kryteria wyszukiwania.
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedPromoters.map((promoter) => (
            <Card
              key={promoter.id}
              className="bg-slate-50 transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-600" />
                      <Link
                        href={`${basePath}/${promoter.id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {promoter.name}
                      </Link>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {promoter.email}
                    </p>
                    <p className="text-sm">Katedra: {promoter.department}</p>
                    <p className="text-sm">
                      Specjalizacja: {promoter.specialization}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {promoter.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">Dostępne miejsca:</span>
                      <span
                        className={`font-medium ${promoter.availableSlots === 0 ? "text-red-500" : "text-green-600"}`}
                      >
                        {promoter.availableSlots}/{promoter.totalSlots}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        Szczegóły
                      </Button>
                      {canEdit &&
                        (currentUserId === undefined ||
                          currentUserId === promoter.id) && (
                          <Button size="sm" className="cursor-pointer">
                            Edytuj
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredPromoters.length > 0 && (
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
        <Skeleton className="h-10 w-48" />
      </div>

      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-[270px]" />
              <Skeleton className="h-6 w-[270px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="w-3/4 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-24" />
                  <div className="mt-4 flex justify-end gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
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
