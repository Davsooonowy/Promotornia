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
import { Search, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const mockPromoters = [
  {
    id: 1,
    name: "dr inż. Katarzyna Kowalska",
    email: "k.kowalska@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Sztuczna inteligencja",
    availableSlots: 5,
    totalSlots: 10,
  },
  {
    id: 2,
    name: "prof. dr hab. Jan Nowak",
    email: "j.nowak@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Analiza danych",
    availableSlots: 2,
    totalSlots: 8,
  },
  {
    id: 3,
    name: "dr Tomasz Wiśniewski",
    email: "t.wisniewski@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Bezpieczeństwo sieci",
    availableSlots: 0,
    totalSlots: 6,
  },
]

export default function SupervisorsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null)
  const [showOnlyWithSlots, setShowOnlyWithSlots] = useState(false)
  const [loading, setLoading] = useState(true)

  const filteredPromoters = mockPromoters.filter((promoter) => {
    const matchesSearch =
      promoter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promoter.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesField =
      !fieldOfStudy || promoter.department.includes(fieldOfStudy)
    const matchesSlots = !showOnlyWithSlots || promoter.availableSlots > 0

    return matchesSearch && matchesField && matchesSlots
  })

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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredPromoters.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <p>
                Nie znaleziono promotorów spełniających kryteria wyszukiwania.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPromoters.map((promoter) => (
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
                        href={`/protected/student/supervisors/${promoter.id}`}
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
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
