"use client"
import apiUrl from "@/util/apiUrl"
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
import { useRouter } from "next/navigation"
import { Tag, ThesisDetails } from "@/util/types"
import { UserRole } from "@/util/enums"
import { ThesisBackend } from "@/util/types"

export interface ThesesListProps {
  basePath: string
  filterBySupervisor?: number
  userRole: UserRole
}

export default function ThesesList({ basePath, userRole }: ThesesListProps) {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [visibleTagsCount, setVisibleTagsCount] = useState(20)
  const [theses, setTheses] = useState<ThesisDetails[] | null>([])
  const [allTags, setAllTags] = useState<Tag[]>([])

  useEffect(() => {
    const fetchTheses = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `${apiUrl}/thesis/list/?page=${currentPage}&search=${searchQuery}&fieldOfStudy=${fieldOfStudy || ""}&tags=${selectedTags.join(",")}&available=${statusFilter || ""}&order=${sortField || ""}&ascending=${sortDirection === "asc"}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok)
          throw new Error("Wyszukiwanie tematów nie powiodło się")
        const data = await response.json()

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
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheses()
  }, [
    currentPage,
    searchQuery,
    fieldOfStudy,
    selectedTags,
    statusFilter,
    sortField,
    sortDirection,
  ])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `${apiUrl}/all_supervisor_interest_tags/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) throw new Error("Nie udało się pobrać tagów")
        const data = await response.json()
        setAllTags(data.tags)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTags()
  }, [])

  const filteredTags = useMemo(() => {
    return allTags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()),
    )
  }, [allTags, tagSearchQuery])

  const itemsPerPage = Number.parseInt(process.env.ITEMS_PER_PAGE || "4", 10)

  const totalPages = Math.ceil((theses?.length || 0) / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleTag = (tag: Tag) => {
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

  useEffect(() => {
    setVisibleTagsCount(20)
  }, [tagSearchQuery])

  if (loading) {
    return <ThesisListSkeleton />
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-3xl font-bold">Lista tematów</h1>
      </div>

      <Card className="bg-card">
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
                <Label className="text-foreground">Kierunek studiów:</Label>
                <Select onValueChange={setFieldOfStudy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz kierunek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Informatyka</SelectItem>
                    <SelectItem value="2">Cyberbezpieczeństwo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label className="text-foreground">Status:</Label>
                <Select onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Dostępny</SelectItem>
                    <SelectItem value="noavailable">Zarezerwowany</SelectItem>
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
                <DropdownMenuContent className="bg-card max-h-[300px] w-56 overflow-auto">
                  <div className="p-2">
                    <Input
                      placeholder="Szukaj tagów..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredTags.slice(0, visibleTagsCount).map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
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
                        htmlFor={`tag-${tag.id}`}
                        className="text-foreground flex-grow cursor-pointer"
                      >
                        {tag.name}
                      </Label>
                    </DropdownMenuItem>
                  ))}
                  {filteredTags.length > visibleTagsCount && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault()
                        setVisibleTagsCount((prev) => prev + 20)
                      }}
                      className="text-primary justify-center font-medium"
                    >
                      Pokaż więcej
                    </DropdownMenuItem>
                  )}
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
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.name} ×
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
        {theses?.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="text-foreground pt-6 text-center">
              <p>Nie znaleziono tematów spełniających kryteria wyszukiwania.</p>
            </CardContent>
          </Card>
        ) : (
          theses?.map((topic) => (
            <Card
              key={topic.id}
              className="bg-card transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground h-5 w-5" />
                        <Link
                          href={`${basePath}/${topic.id}`}
                          className="text-foreground text-lg font-medium hover:underline"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4" />
                        <Link
                          href={`/protected/${userRole.toString()}/supervisors/${topic.supervisorId}`}
                          className="text-foreground text-sm hover:underline"
                        >
                          {topic.supervisor}
                        </Link>
                      </div>
                      <p className="text-foreground text-sm">
                        Katedra: {topic.fieldOfStudy.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Dodano: {topic.createdAt}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={
                          topic.status === "Dostępny"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
                        }
                      >
                        {topic.status}
                      </Badge>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/protected/${userRole.toString()}/theses/${topic.id}`,
                            )
                          }
                        >
                          Szczegóły
                        </Button>
                        {/* {canEdit &&
                          (currentUserId === undefined ||
                            currentUserId === topic.supervisorId) && (
                            <Button
                              size="sm"
                              className="cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/protected/supervisor/theses/${topic.id}`,
                                )
                              }
                            >
                              Edytuj
                            </Button>
                          )} */}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="bg-accent text-accent-foreground"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  {topic.reservedBy && (
                    <div className="text-muted-foreground text-sm">
                      Zarezerwowany przez:{" "}
                      <span className="font-medium">
                        {topic.reservedBy.name + " " + topic.reservedBy.surname}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {theses && theses.length && theses.length > 0 && (
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
        <Skeleton className="h-10 w-48 bg-[var(--skeleton-color)]" />
      </div>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[var(--skeleton-color)]" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-[270px] bg-[var(--skeleton-color)]" />
              <Skeleton className="h-10 w-[270px] bg-[var(--skeleton-color)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-3/4 space-y-2">
                    <Skeleton className="h-6 w-full bg-[var(--skeleton-color)]" />
                    <Skeleton className="h-4 w-1/3 bg-[var(--skeleton-color)]" />
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
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16 bg-[var(--skeleton-color)]" />
                  <Skeleton className="h-5 w-24 bg-[var(--skeleton-color)]" />
                  <Skeleton className="h-5 w-20 bg-[var(--skeleton-color)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
