"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"
import type { ErrorFallbackProps } from "@/lib/error-handling"

export function ErrorFallback({ error, resetErrorBoundary, context = "general" }: ErrorFallbackProps) {
  const contextMessages: Record<string, { title: string; message: string }> = {
    general: {
      title: "Wystąpił błąd",
      message: "Przepraszamy, coś poszło nie tak. Spróbuj ponownie później.",
    },
    email: {
      title: "Błąd ładowania email",
      message: "Nie udało się załadować adresu email. Spróbuj odświeżyć stronę.",
    },
    personalData: {
      title: "Błąd ładowania danych",
      message: "Nie udało się załadować danych osobowych. Spróbuj ponownie później.",
    },
    theses: {
      title: "Błąd ładowania tematów",
      message: "Nie udało się załadować listy tematów. Spróbuj odświeżyć stronę.",
    },
    supervisors: {
      title: "Błąd ładowania promotorów",
      message: "Nie udało się załadować listy promotorów. Spróbuj odświeżyć stronę.",
    },
  }

  const errorInfo = contextMessages[context] || contextMessages.general

  return (
    <Card className="w-full border-destructive/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {errorInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{errorInfo.message}</p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-md bg-destructive/10 p-4">
            <p className="font-mono text-xs text-destructive">{error.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={resetErrorBoundary} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Spróbuj ponownie
        </Button>
      </CardFooter>
    </Card>
  )
}
