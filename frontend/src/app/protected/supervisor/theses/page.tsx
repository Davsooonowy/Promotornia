"use client"
import { useState, useEffect } from "react"
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
import { Search, FileText, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import useDecodeToken from "@/hooks/useDecodeToken"

const mockTopics = [
  {
    id: 1,
    title: "Analiza algorytmów uczenia maszynowego w detekcji cyberataków",
    promoter: "dr inż. Katarzyna Kowalska",
    promoterId: 1,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: true,
    tags: ["AI", "Cyberbezpieczeństwo", "ML"],
    reservedBy: null,
  },
  {
    id: 2,
    title:
      "Implementacja i analiza wydajności algorytmów kryptograficznych w systemach IoT",
    promoter: "prof. dr hab. Jan Nowak",
    promoterId: 2,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Zarezerwowany",
    isPublic: true,
    tags: ["IoT", "Kryptografia", "Bezpieczeństwo"],
    reservedBy: "Anna Kowalczyk",
  },
  {
    id: 3,
    title:
      "Projektowanie responsywnych interfejsów użytkownika z wykorzystaniem React i TailwindCSS",
    promoter: "dr Tomasz Wiśniewski",
    promoterId: 3,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: false,
    tags: ["Frontend", "React", "UI/UX"],
    reservedBy: null,
  },
]

export default function ThesisList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { tokenPayload } = useDecodeToken()

  const filteredTopics = mockTopics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.promoter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesField =
      !fieldOfStudy || topic.department.includes(fieldOfStudy)
    const matchesStatus = !statusFilter || topic.status === statusFilter

    return matchesSearch && matchesField && matchesStatus
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <p>Nie znaleziono tematów spełniających kryteria wyszukiwania.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTopics.map((topic) => (
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
                          href={`/protected/supervisor/theses/${topic.id}`}
                          className="text-lg font-medium hover:underline"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <Link
                          href={`/protected/supervisor/supervisors/${topic.promoterId}`}
                          className="text-sm hover:underline"
                        >
                          {topic.promoter}
                        </Link>
                      </div>
                      <p className="text-sm">Katedra: {topic.department}</p>
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
                        {tokenPayload &&
                          tokenPayload.userId === topic.promoterId && (
                            <Button size="sm" className="cursor-pointer">
                              Edytuj
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
