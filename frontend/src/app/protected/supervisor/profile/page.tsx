"use client"
import ChangePersonalData from "@/components/features/profile/ChangePersonalData"
import ChangePassword from "@/components/features/profile/ChangePassword"
import LabelWithEmail from "@/components/features/profile/LabelWithEmail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, BookOpen, Users } from "lucide-react"
import Link from "next/link"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function Profile() {
  const { tokenPayload } = useDecodeToken()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-4">
          <GraduationCap className="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Profil Promotora</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoim kontem i tematami prac
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacje osobowe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LabelWithEmail />
            <div className="mt-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Promotor
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Szybkie akcje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/protected/supervisor/theses/new" className="w-full">
              <Button className="w-full justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Dodaj nowy temat
              </Button>
            </Link>
            <Link
              href={`/protected/supervisor/theses/own/${tokenPayload?.user_id}`}
              className="w-full"
            >
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Moje tematy
              </Button>
            </Link>
          </CardContent>
        </Card>

        <ChangePersonalData />

        <ChangePassword />
      </div>
    </div>
  )
}
