import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { FieldOfStudy } from "@/util/types"
import { useMutation, UseMutationResult } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import apiUrl from "@/util/apiUrl"
import useDecodeToken from "@/hooks/useDecodeToken"
import { mockFieldsOfStudy } from "@/util/mockData"

export default function ActionDialog(props: {
  actionToLabel: Map<string, string>
  userType: string | null
  setAction: (value: string) => void
  action: string | null
  expirationDate: Date
  setExpirationDate: (date: Date) => void
  setFieldOfStudy: (field: FieldOfStudy) => void
  fieldOfStudy: FieldOfStudy | null
  actionMutation: UseMutationResult<void, Error, void, unknown>
}) {
  const [fieldsOfStudy, setFieldsOfStudy] = useState(mockFieldsOfStudy)
  const [fieldsOfStudyFetchError, setFieldsOfStudyFetchError] = useState<
    string | null
  >(null)
  const [shouldFetchFieldsOfStudy, setShouldFetchFieldsOfStudy] = useState(true)

  const { token } = useDecodeToken()

  const allFieldsOfStudyFetch = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${apiUrl}/fieldsOfStudy`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Nie udało się załadować dostępnych kierunków studiów.")
      }

      const data = await response.json()

      const allFieldsOfStudy = data.fieldsOfStudy
      return allFieldsOfStudy
    },
    onError: (e) => {
      setFieldsOfStudyFetchError(e.message)
    },
    onSuccess: (allFieldsOfStudy) => {
      setFieldsOfStudy(allFieldsOfStudy)
    },
  })

  useEffect(() => {
    if (shouldFetchFieldsOfStudy) {
      allFieldsOfStudyFetch.mutate()
      setShouldFetchFieldsOfStudy(false)
    }
  }, [shouldFetchFieldsOfStudy, allFieldsOfStudyFetch])

  const getDialogContent = () => {
    switch (props.action) {
      case "addUsers":
        return (
          <div className="space-y-4">
            <Label>
              Data wygaśnięcia kont: {props.expirationDate.toLocaleDateString()}
            </Label>
            <Calendar
              mode="single"
              selected={props.expirationDate}
              onSelect={(date) => {
                if (date) props.setExpirationDate(date)
              }}
              className="rounded-md border"
            />

            <Label>Kierunek studiów: </Label>
            <Select
              onValueChange={(value) =>
                props.setFieldOfStudy(JSON.parse(value))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    props.fieldOfStudy
                      ? props.fieldOfStudy.field
                      : "Wybierz kierunek"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {fieldsOfStudy.map((fieldOfStudy) => (
                  <SelectItem
                    key={fieldOfStudy.id}
                    value={JSON.stringify({
                      id: fieldOfStudy.id,
                      field: fieldOfStudy.field,
                    })}
                  >
                    {fieldOfStudy.field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldsOfStudyFetchError && (
              <Label className="text-red-500">{fieldsOfStudyFetchError}</Label>
            )}
            <div className="flex w-full justify-end">
              <Button
                className="cursor-pointer"
                onClick={() => props.actionMutation.mutate()}
              >
                Zatwierdź
              </Button>
            </div>
          </div>
        )
      case "deleteUsers":
        return (
          <div className="flex w-full justify-end">
            <Button
              className="cursor-pointer"
              onClick={() => props.actionMutation.mutate()}
            >
              Zatwierdź
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer self-start">Przejdź dalej</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Akcja wobec{" "}
            {props.userType === "supervisor" ? "promotorów" : "studentów"}
          </DialogTitle>
        </DialogHeader>
        <Label>Rodzaj akcji</Label>
        <Select onValueChange={(value) => props.setAction(value)}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                props.action
                  ? props.actionToLabel.get(props.action)
                  : "Wybierz akcję"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="addUsers">
              {props.actionToLabel.get("addUsers")}
            </SelectItem>
            <SelectItem value="deleteUsers">
              {props.actionToLabel.get("deleteUsers")}
            </SelectItem>
            <SelectItem value="sendEmail">
              {props.actionToLabel.get("sendEmail")}
            </SelectItem>
          </SelectContent>
        </Select>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  )
}
