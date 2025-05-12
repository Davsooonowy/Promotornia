"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useDecodeToken from "@/hooks/useDecodeToken"
import { GraduationCap, Home, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()
  const { tokenPayload } = useDecodeToken()
  const userRole = tokenPayload?.role || "student"
  const rolePath = `/protected/${userRole}/theses`

  return (
    <div className="dark:bg-background flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <GraduationCap className="text-primary h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">
              404 - Strona nie znaleziona
            </CardTitle>
            <CardDescription className="text-base">
              Przepraszamy, nie mogliśmy znaleźć strony, której szukasz.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="dark:bg-muted rounded-lg bg-slate-100 p-4">
              <h3 className="mb-2 font-medium">Możliwe przyczyny:</h3>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                <li>Adres URL mógł zostać wpisany niepoprawnie</li>
                <li>Strona mogła zostać przeniesiona lub usunięta</li>
                <li>Możesz nie mieć uprawnień do wyświetlenia tej strony</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Przejdź do:</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Strona główna
                  </Button>
                </Link>
                <Link href={rolePath} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Lista tematów
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do poprzedniej strony
            </Button>
          </CardFooter>
        </Card>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          <p>
            Potrzebujesz pomocy? Skontaktuj się z{" "}
            <a
              href="mailto:maciaszczyk@student.agh.edu.pl"
              className="text-primary hover:underline"
            >
              działem wsparcia
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
