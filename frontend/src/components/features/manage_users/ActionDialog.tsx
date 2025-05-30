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
  const [fieldsOfStudy, setFieldsOfStudy] = useState<FieldOfStudy[] | null>(
    null,
  )
  const [fieldsOfStudyFetchError, setFieldsOfStudyFetchError] = useState<
    string | null
  >(null)
  const [shouldFetchFieldsOfStudy, setShouldFetchFieldsOfStudy] = useState(true)

  const allFieldsOfStudyFetch = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/field_of_study/`, {
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

      const allFieldsOfStudy = data
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
    if (shouldFetchFieldsOfStudy && props.action === "addUsers") {
      allFieldsOfStudyFetch.mutate()
      setShouldFetchFieldsOfStudy(false)
    }
  }, [shouldFetchFieldsOfStudy, allFieldsOfStudyFetch, props.action])

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
        {props.action === "addUsers" && (
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
            {fieldsOfStudy ? (
              <Select
                key={fieldsOfStudy?.length}
                onValueChange={(value) =>
                  props.setFieldOfStudy(JSON.parse(value))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      props.fieldOfStudy
                        ? props.fieldOfStudy.name
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
                        name: fieldOfStudy.name,
                      })}
                    >
                      {fieldOfStudy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              "Wczytywanie..."
            )}
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
        )}

        {props.action === "deleteUsers" && (
          <div className="flex w-full justify-end">
            <Button
              className="cursor-pointer"
              onClick={() => props.actionMutation.mutate()}
            >
              Zatwierdź
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
