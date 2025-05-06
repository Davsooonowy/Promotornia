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

# Endpoint GET /thesis/list?page=\<page\>&fieldOfStudy=\<fieldID\>&owner=\<ownerID\>

**Opis:**
Zwróć listę dostępnych prac dyplomowych

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
| Nazwa  | Typ    | Wymagany | Opis                       | Default |
|--------|--------|----------|----------------------------|---------|
| page | number | Nie | Numer strony | 1 |
| fieldID | number | Nie | ID kierunku studiów do filtracji. Nie filtruje jeśli jest `None` | `None` |
| ownerID | number | Nie | ID promotora, tak jak wyżej | `None` |

## Odpowiedź
User = {id: number, email: string, first_name: string, last_name: string}
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| theses     | List[{id: number, name: string, description: string, producer_limit: number, owner: User, producers: List[User], tags: List[{id: number, name: string}]}]    | Tak      | Lista prac dyplomowych   |

# Endpoint GET /supervisors/list?page=\<page\>&fieldOfStudy=\<fieldID\>

**Opis:**
Zwróć listę promotorów

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
| Nazwa  | Typ    | Wymagany | Opis                       | Default |
|--------|--------|----------|----------------------------|---------|
| page | number | Nie | Numer strony | 1 |
| fieldID | number | Nie | ID kierunku studiów do filtracji. Nie filtruje jeśli jest `None` | `None` |

## Odpowiedź
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| supervisors | List[{id: number, email: string, first_name: string, last_name: string}] | Tak | Lista promotorów |

# Endpoint GET /thesis/\<int:thesisID\>

**Opis:**
Uzyskuje informacje o danej pracy dyplomowej

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| thesisID | number | Tak | ID pracy dyplomowej |

## Odpowiedź
User = {id: number, email: string, first_name: string, last_name: string}
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| id | number | Tak | Identyfikator |
| name | string | Tak | Nazwa pracy dyplomowej |
| description | string | Tak | Opis pracy dyplomowej |
| producer_limit | number | Tak | Maksymalna liczba studentów realizujących pracę |
| owner | User | Tak | Promotor odpowiedzialny za daną pracę |
| producers | List[User] | Tak | Studenci realizujący pracę |
| tags | List[{id: number, name: string}] | Tak | Lista tagów |

# Endpoint DELETE /thesis/\<id:thesisID\>

**Opis:**
Usuwa pracę dyplomową z systemu

headers: {
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Parametry
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| thesisID | number | Tak | ID pracy dyplomowej |

# Endpoint POST /thesis/

**Opis:**
Tworzy nową pracę dyplomową

## Ciało
| Nazwa  | Typ    | Wymagany | Opis                       | Default |
|--------|--------|----------|----------------------------|---------|
| name | string | Tak | Nazwa pracy dyplomowej | - |
| description | string | Tak | Opis pracy dyplomowej | - |
| producer_limit | number | Nie | Maksymalna liczba studentów realizujących pracę (max 2 na razie) | 1 |
| producers | List[{email: string}] | Nie | Studenci realizujący pracę | [] |
| tags | List[number] | Nie | Lista tagów | [] |
