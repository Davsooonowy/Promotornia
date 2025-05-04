"use client"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, FileText, User, SortAsc, SortDesc, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"
import { mockTheses, getTagsFromTheses } from "@/util/mockData"

export interface ThesesListProps {
  basePath: string
  supervisorsPath: string
  canEdit?: boolean
  canReserve?: boolean
  currentUserId?: number
}

export default function ThesesList({
  basePath,
  supervisorsPath,
  canEdit = false,
  canReserve = false,
  currentUserId,
}: ThesesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => getTagsFromTheses(mockTheses), [])
  const itemsPerPage = Number.parseInt(process.env.ITEMS_PER_PAGE || "4", 10)

  const filteredTopics = useMemo(() => {
    let result = mockTheses.filter((topic) => {
      const matchesSearch =
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.promoter.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesField =
        !fieldOfStudy || topic.department.includes(fieldOfStudy)
      const matchesStatus = !statusFilter || topic.status === statusFilter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => topic.tags.includes(tag))

      return matchesSearch && matchesField && matchesStatus && matchesTags
    })

    if (sortField) {
      result = [...result].sort((a, b) => {
        let valueA, valueB

        switch (sortField) {
          case "title":
            valueA = a.title
            valueB = b.title
            break
          case "promoter":
            valueA = a.promoter
            valueB = b.promoter
            break
          case "date":
            valueA = new Date(a.createdAt)
            valueB = new Date(b.createdAt)
            break
          default:
            return 0
        }

        if (valueA instanceof Date && valueB instanceof Date) {
          return sortDirection === "asc"
            ? valueA.getTime() - valueB.getTime()
            : valueB.getTime() - valueA.getTime()
        } else if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        } else {
          return 0
        }
      })
    }

    return result
  }, [
    searchQuery,
    fieldOfStudy,
    statusFilter,
    sortField,
    sortDirection,
    selectedTags,
  ])

  const paginatedTopics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTopics.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTopics, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage)

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
  }, [searchQuery, fieldOfStudy, statusFilter, selectedTags])

  if (loading) {
    return <ThesisListSkeleton />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista tematów</h1>
      </div>

      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder="Szukaj tematu lub promotora..."
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
                <Label>Status:</Label>
                <Select onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dostępny">Dostępny</SelectItem>
                    <SelectItem value="Zarezerwowany">Zarezerwowany</SelectItem>
                  </SelectContent>
                </Select>
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
                  onClick={() => handleSort("title")}
                  className="gap-1"
                >
                  Tytuł
                  {sortField === "title" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("promoter")}
                  className="gap-1"
                >
                  Promotor
                  {sortField === "promoter" &&
                    (sortDirection === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    ))}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="gap-1"
                >
                  Data
                  {sortField === "date" &&
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
        {paginatedTopics.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <p>Nie znaleziono tematów spełniających kryteria wyszukiwania.</p>
            </CardContent>
          </Card>
        ) : (
          paginatedTopics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-slate-50 transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-600" />
                        <Link
                          href={`${basePath}/${topic.id}`}
                          className="text-lg font-medium hover:underline"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <Link
                          href={`${supervisorsPath}/${topic.promoterId}`}
                          className="text-sm hover:underline"
                        >
                          {topic.promoter}
                        </Link>
                      </div>
                      <p className="text-sm">Katedra: {topic.department}</p>
                      <p className="text-muted-foreground text-sm">
                        Dodano: {topic.createdAt}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={
                          topic.status === "Dostępny"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {topic.status}
                      </Badge>
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
                            currentUserId === topic.promoterId) && (
                            <Button size="sm" className="cursor-pointer">
                              Edytuj
                            </Button>
                          )}
                        {canReserve && topic.status === "Dostępny" && (
                          <Button size="sm" className="cursor-pointer">
                            Zarezerwuj
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-slate-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {topic.reservedBy && (
                    <div className="text-muted-foreground text-sm">
                      Zarezerwowany przez:{" "}
                      <span className="font-medium">{topic.reservedBy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredTopics.length > 0 && (
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

function ThesisListSkeleton() {
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
              <Skeleton className="h-10 w-[270px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-3/4 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/3" />
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
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
