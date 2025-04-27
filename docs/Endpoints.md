# Endpoint: POST /dean/new_users

**Opis:**
Zapisuje w bazie danych użytkowników z podanymi e-mailami i wygenerowanymi hasłami oraz wysyła na te e-maile wygenerowane hasła.

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| userType     | string    | Tak      | Typ użytkownika ("supervisor"/"student")   |
| newUsers     | List[{email: string}]    | Tak      | Lista emaili użytkowników jednego typu (student lub promotor)   |
| expirationDate     | Date    | Tak      | Data ważności kont dodawanych użytkowników   |
| fieldOfStudy     | {id: number, field: string}    | Tak      | Kierunek studiów studenta/promotora   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

## Uwagi

Na razie zakładamy, że nie tylko student, ale i promotor działają tylko na jednym kierunku studiów (chociaż z wymagań wynika, że promotor może działać nawet na dwóch kierunkach)

# Endpoint DELETE /dean/users

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| usersToDelete     | List[{email: string}]    | Tak      | Lista emaili użytkowników jednego typu (student lub promotor)   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

# Endpoint POST /user/login

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| email     | string    | Tak      | E-mail   |
| password     | string    | Tak      | Hasło   |

