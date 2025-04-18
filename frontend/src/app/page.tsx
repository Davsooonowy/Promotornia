import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Logowanie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex w-full space-x-3">
            <Label htmlFor="email" className="py-1">
              Email:
            </Label>
            <Input id="email" type="email" placeholder="Email" />
          </div>
          <div className="flex w-full space-x-3">
            <Label htmlFor="password" className="py-1">
              Hasło:
            </Label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
