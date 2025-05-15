# Endpoint: POST /dean/new_users/

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

# Endpoint DELETE /dean/users/

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| usersToDelete     | List[{email: string}]    | Tak      | Lista emaili użytkowników jednego typu (student lub promotor)   |

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
  "Content-Type": "application/json",
}

# Endpoint POST /user/login/

## Ciało

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| email     | string    | Tak      | E-mail   |
| password     | string    | Tak      | Hasło   |

## Odpowiedź

| Nazwa   | Typ    | Wymagany | Opis                     |
|---------|--------|----------|--------------------------|
| access   | string    | Tak      | Token JWT                |
| refresh | string    | Tak      | Token do odśwerzania JWT |

# Endpoint POST /user/login/refresh/

## Ciało
| Nazwa   | Typ    | Wymagany | Opis                                           |
|---------|--------|----------|------------------------------------------------|
| refresh | string    | Tak      | Token do odświerzania otrzymany przy logowaniu |

## Odpowiedź
| Nazwa  | Typ    | Wymagany | Opis                  |
|--------|--------|----------|-----------------------|
| access | string    | Tak      | Odświerzony token JWT |

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

# Endpoint GET /thesis/list?page&fieldOfStudy&tags&available&order&ascending&search

**Opis:**
Zwróć listę dostępnych prac dyplomowych

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
| Nazwa  | Typ    | Wymagany | Opis                       | Default |
|--------|--------|----------|----------------------------|---------|
| page | number | Nie | Numer strony | 1 |
| fieldOfStudy | number | Nie | ID kierunku studiów do filtracji. Nie filtruje jeśli jest `None` | `None` |
| tags | List[number] | Nie | Lista tagów do filtracji. Podawane w formacie `tags=1,2,3` | `None` |
| available | boolean | Nie | Flaga czy dany temat pracy jest zajęty czy nie | `None` |
| order | string | Nie | Wartość po której powinny być porządkowane dane. Na ten moment jedyne dozwolone to `name`, `supervisor`, `date` | `None` |
| ascending | boolean | Nie | Kolejność porządku | `True` |
| search | string | Nie | Fraza do wyszukania (szuka po promotorach i nazwach tematów) | `None` |

## Odpowiedź
`User = {id: number, email: string, first_name: string, last_name: string}`

`FieldOfStudy = {id: number, name: string}`

**Odpowiedzią jest {theses: List[Thesis]}, struktura Thesis opisana jest poniżej**
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| id | number | | Identyfikator pracy |
| name | string | | Nazwa pracy |
| owner | User | | Opiekun pracy |
| fieldOfStudy | FieldOfStudy | | Kierunek studiów (wraz z wydziałem) gdzie realizowana jest praca |
| dateOfCreation | DateTime | | Data utworzenia |
| tags | List[{id: number, name: string}] | | Lista tagów |
| status | string | | Status pracy dyplomowej |


# Endpoint GET /supervisors/list?page&fieldOfStudy&available&order&ascending&search

**Opis:**
Zwróć listę promotorów

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
Dokładnie to samo co w endpoincie powyżej, jedynie `search` wyszukuje tylko po imieniu i nazwisku promotora, `order` może być jednym z `[free_spots, last_name]`

## Odpowiedź

`FieldOfStudy = {id: number, name: string}`

**Odpowiedzią jest {supervisors: List[Supervisor]}. Struktura `Supervisor` poniżej**


| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| id | number | | ID promotora |
| email | string | | |
| firstName | string | | |
| lastName | string | | |
| fieldOfStudy | FieldOfStudy | | Kierunek + wydział |
| freeSpots | number | | Liczba wolnych miejsc |
| totalSpots | number | | Liczba wolnych + zajętych miejsc |

# Endpoint POST /supervisor/tags

**Opis:**
Dodaje nowy tag

headers: {
  Content-Type: "application/json"
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Ciało
| Nazwa  | Typ    | Wymagany | Opis                       | Default |
|--------|--------|----------|----------------------------|---------|
| name | string | tak | Nazwa tagu | - |