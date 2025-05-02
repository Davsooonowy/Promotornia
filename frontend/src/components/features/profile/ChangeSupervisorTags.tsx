"use client"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function ChangeSupervisorTags() {
  const [availableTags, setAvailableTags] = useState([
    {
      id: 1,
      name: "Aplikacje webowe",
    },
    {
      id: 2,
      name: "Aplikacje mobilne",
    },
    {
      id: 3,
      name: "Sztuczna inteligencja",
    },
    {
      id: 4,
      name: "Cyberbezpieczeństwo",
    },
    {
      id: 5,
      name: "askabfjkahsjfhlkjaskfaskf",
    },
    {
      id: 6,
      name: "asjfhjoasflkjjaklfasdfliasdklfj",
    },
    {
      id: 7,
      name: "askjlnalksfnkaf",
    },
  ])
  const [yourTags, setYourTags] = useState([
    {
      id: 1,
      name: "Aplikacje webowe",
    },
    {
      id: 2,
      name: "Aplikacje mobilne",
    },
    {
      id: 3,
      name: "Sztuczna inteligencja",
    },
    {
      id: 4,
      name: "Cyberbezpieczeństwo",
    },
  ])
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const { token } = useDecodeToken()

  const addToYourTags = (value: { id: number; name: string }) => {
    if (!yourTags.map((yourTag) => yourTag.name).includes(value.name))
      setYourTags((curTags) => [...curTags, value])
  }

  const removeFromYourTags = (value: { id: number; name: string }) => {
    setYourTags((curTags) => curTags.filter((tag) => tag !== value))
  }

  const availableTagsQuery = useQuery({
    queryKey: ["all_tags"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/all_supervisor_interest_tags`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się załadować dostępnych tagów.")
      }

      const data = await response.json()

      setAvailableTags(data.tags)
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const yourTagsQuery = useQuery({
    queryKey: ["your_tags"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/your_tags`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się załadować Twoich tagów.")
      }

      const data = await response.json()

      setYourTags(data.tags)
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const tagsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/supervisor/edit_tags`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: yourTags.map((tag) => tag.id),
        }),
      })
      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować tagów.")
      }
    },
    onSuccess: () => {
      setIsSuccess(true)
    },
    onError: (e) => {
      setError(e.message)
    },
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Wszystkie tagi:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              className="mr-1 cursor-pointer"
              onClick={() => addToYourTags(tag)}
            >
              {tag.name}
            </Badge>
          ))}
          {availableTagsQuery?.isError && (
            <Label className="text-red-500">
              {availableTagsQuery.error.message}
            </Label>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Twoje tagi:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {yourTags.map((tag) => (
            <Badge
              key={tag.id}
              className="mr-1 cursor-pointer"
              variant="outline"
              onClick={() => removeFromYourTags(tag)}
            >
              {tag.name}
            </Badge>
          ))}
          {yourTagsQuery?.isError && (
            <Label className="text-red-500">
              {yourTagsQuery.error.message}
            </Label>
          )}
        </CardContent>
        <CardContent className="space-y-4">
          {error && <Label className="text-red-500">{error}</Label>}
          {isSuccess && (
            <Label className="text-green-500">Twoje tagi zapisane</Label>
          )}
          <Button
            className="cursor-pointer"
            onClick={() => tagsMutation.mutate()}
          >
            Zapisz
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
