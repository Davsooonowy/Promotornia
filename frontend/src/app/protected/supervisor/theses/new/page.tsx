"use client"

import { useMutation } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function New() {
  const router = useRouter()
  const { token } = useDecodeToken()
  const [shouldMutate, setShouldMutate] = useState(true)
  const [pageContentText, setPageContentText] = useState("Tworzę nową pracę")

  const newThesisMutation = useMutation({
    mutationFn: async () => {
      // const response = await fetch(`${apiUrl}/theses/new`, {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // })

      // if (!response.ok) {
      //   throw new Error()
      // }

      // const data = await response.json()

      // const thesisId = data.id

      // if (!thesisId) throw new Error()

      // return thesisId
      return 1
    },
    onError: () => {
      setPageContentText("Błąd. Przekierowuję do profilu.")
      setTimeout(() => router.push("/protected/supervisor/profile"), 3000)
    },
    onSuccess: (thesisId) => {
      router.push(`/protected/supervisor/theses/${thesisId}`)
    },
  })

  useEffect(() => {
    if (shouldMutate) {
      newThesisMutation.mutate()
      setShouldMutate(false)
    }
  }, [newThesisMutation, shouldMutate])

  return <h1 className="text-3xl">{pageContentText}</h1>
}
