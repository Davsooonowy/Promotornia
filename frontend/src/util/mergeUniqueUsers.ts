import { NewUser } from "@/util/types"

export function mergeUniqueUsers(
  existingUsers: NewUser[],
  importedUsers: NewUser[],
) {
  const seen = new Set<string>()
  const result: NewUser[] = []

  for (const user of [...existingUsers, ...importedUsers]) {
    const email = user.email.trim().toLowerCase()
    if (!seen.has(email)) {
      seen.add(email)
      result.push({ ...user, email }) // opcjonalnie poprawiona wersja e-maila
    }
  }

  const duplicates = existingUsers.length + importedUsers.length - result.length

  return { users: result, duplicates }
}
