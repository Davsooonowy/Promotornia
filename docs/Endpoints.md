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

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| token     | string    | Tak      | Token JWT   |

# Endpoint PUT /user/new_password

**Opis:**
Zmiana hasła

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| oldPassword     | string    | Tak      | Stare hasło do weryfikacji   |
| newPassword     | string    | Tak      | Nowe hasło   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

# Endpoint GET /user/personal_data

**Opis:**
Zwróć obecne dane usera

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| name     | string    | Tak      | Imię   |
| surname     | string    | Tak      | Nazwisko   |

# Endpoint PUT /user/edit_personal_data

**Opis:**
Zmodyfikuj obecne dane usera

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| name     | string    | Tak      | Imię   |
| surname     | string    | Tak      | Nazwisko   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

# Endpoint GET /all_supervisor_interest_tags

**Opis:**
Zwróć **wszystkie dostępne** tagi zainteresowań promotora

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| tags     | List[{id: number, name: string}]    | Tak      | Lista par: (identyfikator tagu, nazwa tagu)   |

# Endpoint GET /your_tags

**Opis:**
Zwróć **wszystkie obecnie wybrane** tagi zainteresowań promotora

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| tags     | List[{id: number, name: string}]    | Tak      | Lista par: (identyfikator tagu, nazwa tagu)   |

# Endpoint PUT /supervisor/edit_tags

**Opis:**
Zmodyfikuj obecne tagi zainteresowań promotora

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| tags     | List[number]    | Tak      | Lista identyfikatorów wybranych tagów   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

# Endpoint GET /user/email

**Opis:**
Zwróć e-mail usera

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| email     | string    | Tak      | Obecny e-mail usera   |