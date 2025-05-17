import { toast } from "sonner"

export type ApiError = {
  status?: number
  message: string
  details?: string
}

export function handleApiError(
  error: unknown,
  fallbackMessage = "Wystąpił nieoczekiwany błąd",
): ApiError {
  if (typeof error === "object" && error !== null && "message" in error) {
    return error as ApiError
  }

  if (error instanceof Error) {
    return {
      message: error.message || fallbackMessage,
    }
  }

  if (typeof error === "string") {
    return {
      message: error || fallbackMessage,
    }
  }

  return {
    message: fallbackMessage,
  }
}

export function showErrorToast(
  error: unknown,
  fallbackMessage = "Wystąpił nieoczekiwany błąd",
) {
  const apiError = handleApiError(error, fallbackMessage)

  toast.error("Błąd", {
    description: apiError.message,
    duration: 5000,
  })
}

export function getUserFriendlyErrorMessage(
  error: unknown,
  context: string,
): string {
  const apiError = handleApiError(error)

  const contextMessages: Record<string, string> = {
    email: "Nie udało się załadować adresu email. Spróbuj odświeżyć stronę.",
    personalData:
      "Nie udało się załadować danych osobowych. Spróbuj ponownie później.",
    login:
      "Logowanie nie powiodło się. Sprawdź dane logowania i spróbuj ponownie.",
    theses: "Nie udało się załadować listy tematów. Spróbuj odświeżyć stronę.",
    supervisors:
      "Nie udało się załadować listy promotorów. Spróbuj odświeżyć stronę.",
    passwordChange:
      "Zmiana hasła nie powiodła się. Upewnij się, że podane dane są poprawne.",
    dataUpdate:
      "Aktualizacja danych nie powiodła się. Spróbuj ponownie później.",
    network:
      "Wystąpił problem z połączeniem. Sprawdź swoje połączenie internetowe i spróbuj ponownie.",
    server: "Serwer jest obecnie niedostępny. Prosimy spróbować później.",
    permission: "Nie masz uprawnień do wykonania tej operacji.",
    notFound: "Żądany zasób nie został znaleziony.",
  }

  return contextMessages[context] || apiError.message
}

export interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  context?: string
}
