import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FaRegUser } from "react-icons/fa"
import { X } from "lucide-react"
import { NewUser } from "@/util/types"

export default function NewUserCard(props: {
  newUser: NewUser
  handleRemoveUser: (key: number) => void
  handleUpdateEmail: (key: number, newEmail: string) => void
  error: string | null
}) {
  return (
    <Card key={props.newUser.key} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground absolute top-2 right-2 h-6 w-6 cursor-pointer p-0 hover:text-red-500"
        onClick={() => props.handleRemoveUser(props.newUser.key)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <CardTitle className="px-8">
          <FaRegUser size={24} />
        </CardTitle>
        <CardContent className="flex space-x-3">
          <Label>Email: </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email..."
            value={props.newUser.email}
            onChange={(e) =>
              props.handleUpdateEmail(props.newUser.key, e.currentTarget.value)
            }
            onInput={(e) =>
              props.handleUpdateEmail(props.newUser.key, e.currentTarget.value)
            }
          />
        </CardContent>
        <CardContent>
          {props.error && <Label className="text-red-500">{props.error}</Label>}
        </CardContent>
      </CardHeader>
    </Card>
  )
}
