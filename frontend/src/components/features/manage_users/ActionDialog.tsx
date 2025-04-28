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
import { UseMutationResult } from "@tanstack/react-query"

const fieldsOfStudy: FieldOfStudy[] = [
  {
    id: 1,
    field: "Informatyka",
  },
  {
    id: 2,
    field: "Cyberbezpieczeństwo",
  },
]

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
