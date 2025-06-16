import { Github } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-border bg-muted border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} DyplomNet - System zarządzania
              pracami dyplomowymi
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="https://skos.agh.edu.pl/jednostka/akademia-gorniczo-hutnicza-im-stanislawa-staszica-w-krakowie/wydzial-zarzadzania-316.html"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Kontakt
            </Link>
            <Link
              href="https://github.com/davsooonowy/Promotornia"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
