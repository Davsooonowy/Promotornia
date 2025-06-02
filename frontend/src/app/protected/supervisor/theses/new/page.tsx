"use client"

import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

export default function New() {
  const router = useRouter()
  const [shouldMutate, setShouldMutate] = useState(true)
  const [thesisId, setThesisId] = useState(null)

  const newThesisMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/thesis/new/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się utworzyć nowej pracy.")
      }

      const data = await response.json()

      const thesisId = data.id

      if (!thesisId) throw new Error()

      return thesisId
    },
    onError: () => {
      toast.error("Nie udało się stworzyć pracy.", {
        description: "Przekierowuję do profilu.",
      })
      setTimeout(() => router.push("/protected/supervisor/profile"), 3000)
    },
    onSuccess: (thesisId) => {
      setThesisId(thesisId)
    },
  })

  useEffect(() => {
    if (shouldMutate) {
      setShouldMutate(false)
      newThesisMutation.mutate()
    }
  }, [shouldMutate, newThesisMutation])

  return (
    <>
      {newThesisMutation.isPending ? (
        <h1 className="text-3xl">Tworzę nową pracę...</h1>
      ) : (
        thesisId && (
          <>
            <Label className="mb-3">Utworzono pracę</Label>
            <Link href={`/protected/supervisor/theses/${thesisId}`}>
              <Button>Przejdź do pracy</Button>
            </Link>
          </>
        )
      )}
    </>
  )
}
