"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

const EmailSchema = z.object({
  email: z.string().email({ message: "Niepoprawny adres email" }),
})

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    const result = EmailSchema.safeParse({ email })

    if (!result.success) {
      setError(
        result.error.flatten().fieldErrors.email?.[0] ||
          "Niepoprawny adres email",
      )
      return
    }

    setError(null)
    //TODO: podlacz tu bekend
    // Symulujemy sukces
    setIsSubmitted(true)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <GraduationCap className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Resetowanie hasła</CardTitle>
            <CardDescription>
              {!isSubmitted
                ? "Podaj swój adres email, a wyślemy Ci link do resetowania hasła"
                : "Sprawdź swoją skrzynkę email"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {!isSubmitted ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="twoj.email@uczelnia.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
                <Button
                  type="button"
                  className="w-full cursor-pointer"
                  onClick={handleSubmit}
                >
                  Wyślij link resetujący
                </Button>
              </>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Jeśli podany adres email istnieje w naszej bazie, wysłaliśmy
                  na niego instrukcje resetowania hasła.
                </p>
                <p className="text-muted-foreground text-sm">
                  Sprawdź swoją skrzynkę odbiorczą oraz folder spam.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Link
              href="/"
              className="text-primary flex items-center text-sm hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Powrót do strony logowania
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
