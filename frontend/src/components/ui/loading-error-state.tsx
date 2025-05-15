import type React from "react"
import { Loader2 } from "lucide-react"
import { ErrorFallback } from "./error-fallback"
import type { ErrorFallbackProps } from "@/lib/error-handling"

interface LoadingErrorStateProps {
  isLoading: boolean
  isError: boolean
  error: Error | null
  children: React.ReactNode
  loadingText?: string
  context?: string
  resetError: () => void
}

export function LoadingErrorState({
  isLoading,
  isError,
  error,
  children,
  loadingText = "Ładowanie...",
  context = "general",
  resetError,
}: LoadingErrorStateProps) {
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">{loadingText}</p>
        </div>
      </div>
    )
  }

  if (isError && error) {
    const errorProps: ErrorFallbackProps = {
      error,
      resetErrorBoundary: resetError,
      context,
    }

    return <ErrorFallback {...errorProps} />
  }

  return <>{children}</>
}
