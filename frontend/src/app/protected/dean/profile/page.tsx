"use client"
import ChangePassword from "@/components/features/profile/ChangePassword"
import LabelWithEmail from "@/components/features/profile/LabelWithEmail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield } from "lucide-react"

export default function Profile() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-4">
          <Shield className="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Profil Dziekana</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoim kontem i ustawieniami
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacje o koncie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LabelWithEmail />
            <div className="mt-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Dziekanat
              </Badge>
            </div>
          </CardContent>
        </Card>

        <ChangePassword />
      </div>
    </div>
  )
}
