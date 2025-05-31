# Endpoint: POST /dean/new_users/

**Opis:**
Zapisuje w bazie danych użytkowników z podanymi e-mailami i wygenerowanymi hasłami oraz wysyła na te e-maile wygenerowane hasła.

## Ciało

| Nazwa          | Typ                         | Wymagany | Opis                                                          |
| -------------- | --------------------------- | -------- | ------------------------------------------------------------- |
| userType       | string                      | Tak      | Typ użytkownika ("supervisor"/"student")                      |
| newUsers       | List[{email: string}]       | Tak      | Lista emaili użytkowników jednego typu (student lub promotor) |
| expirationDate | Date                        | Tak      | Data ważności kont dodawanych użytkowników                    |
| fieldOfStudy   | {id: number, field: string} | Tak      | Kierunek studiów studenta/promotora                           |

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

## Uwagi

Na razie zakładamy, że nie tylko student, ale i promotor działają tylko na jednym kierunku studiów (chociaż z wymagań wynika, że promotor może działać nawet na dwóch kierunkach)

# Endpoint DELETE /dean/users/

## Ciało

| Nazwa         | Typ                   | Wymagany | Opis                                                          |
| ------------- | --------------------- | -------- | ------------------------------------------------------------- |
| usersToDelete | List[{email: string}] | Tak      | Lista emaili użytkowników jednego typu (student lub promotor) |

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

# Endpoint POST /user/login/

## Ciało

| Nazwa    | Typ    | Wymagany | Opis   |
| -------- | ------ | -------- | ------ |
| email    | string | Tak      | E-mail |
| password | string | Tak      | Hasło  |

## Odpowiedź

| Nazwa   | Typ    | Wymagany | Opis                     |
| ------- | ------ | -------- | ------------------------ |
| access  | string | Tak      | Token JWT                |
| refresh | string | Tak      | Token do odśwerzania JWT |

# Endpoint POST /user/login/refresh/

## Ciało

| Nazwa   | Typ    | Wymagany | Opis                                           |
| ------- | ------ | -------- | ---------------------------------------------- |
| refresh | string | Tak      | Token do odświerzania otrzymany przy logowaniu |

## Odpowiedź

| Nazwa  | Typ    | Wymagany | Opis                  |
| ------ | ------ | -------- | --------------------- |
| access | string | Tak      | Odświerzony token JWT |

# Endpoint PUT /user/new_password

**Opis:**
Zmiana hasła

## Ciało

| Nazwa       | Typ    | Wymagany | Opis                       |
| ----------- | ------ | -------- | -------------------------- |
| oldPassword | string | Tak      | Stare hasło do weryfikacji |
| newPassword | string | Tak      | Nowe hasło                 |

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

| Nazwa   | Typ    | Wymagany | Opis     |
| ------- | ------ | -------- | -------- |
| name    | string | Tak      | Imię     |
| surname | string | Tak      | Nazwisko |
| email   | string | Tak      | Email    |

# Endpoint PUT /user/personal_data

**Opis:**
Zmodyfikuj obecne dane usera

## Ciało

| Nazwa   | Typ    | Wymagany | Opis     |
| ------- | ------ | -------- | -------- |
| name    | string | Tak      | Imię     |
| surname | string | Tak      | Nazwisko |

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

# Endpoint GET /all_theses_tags

**Opis:**
Zwróć **wszystkie dostępne** tagi prac

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

## Odpowiedź

| Nazwa | Typ                              | Wymagany | Opis                                        |
| ----- | -------------------------------- | -------- | ------------------------------------------- |
| tags  | List[{id: number, name: string}] | Tak      | Lista par: (identyfikator tagu, nazwa tagu) |

# Endpoint GET /thesis_tags

**Opis:**
Zwróć **wszystkie obecnie wybrane** tagi pracy

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

## Odpowiedź

| Nazwa | Typ                              | Wymagany | Opis                                        |
| ----- | -------------------------------- | -------- | ------------------------------------------- |
| tags  | List[{id: number, name: string}] | Tak      | Lista par: (identyfikator tagu, nazwa tagu) |

# Endpoint PUT /supervisor/edit_tags

**Opis:**
Zmodyfikuj obecne tagi zainteresowań promotora

## Ciało

| Nazwa | Typ          | Wymagany | Opis                                  |
| ----- | ------------ | -------- | ------------------------------------- |
| tags  | List[number] | Tak      | Lista identyfikatorów wybranych tagów |

headers: {
Authorization: "Bearer TUTAJ_TOKEN",
"Content-Type": "application/json",
}

# Endpoint GET /theses/{thesisId}

**Opis:**
Zwraca szczegóły pracy o danym id

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

## Odpowiedź

Powiązane typy:

```ts
export interface Tag {
  id: number;
  name: string;
}

interface ThesisStudent {
  id: number;
  name: string;
  surname: string;
  email: string;
}

type ThesisStatus =
  | "Ukryty"
  | "Dostępny"
  | "Zarezerwowany"
  | "Student zaakceptowany"
  | "Zatwierdzony";

interface FieldOfStudy {
  id: number;
  field: string;
}

interface ThesisDetails {
  id: number;
  title: string;
  supervisor: string;
  supervisorId: number;
  fieldOfStudy: FieldOfStudy;
  description: string;
  prerequisitesDescription: string;
  status: ThesisStatus;
  tags: Tag[];
  reservedBy: ThesisStudent | null;
}
```

Przykładowy json:

```json
{
  "id": 1,
  "title": "Analiza algorytmów uczenia maszynowego w detekcji cyberataków",
  "supervisor": "dr inż. Katarzyna Kowalska",
  "supervisorId": 1,
  "fieldOfStudy": {
    "id": 1,
    "field": "Informatyka"
  },
  "description": "Lorem ipsum dolor sit amet...",
  "prerequisitesDescription": "Lorem ipsum dolor sit amet...",
  "status": "Zarezerwowany",
  "tags": [
    {
      "id": 1,
      "name": "Algorytmy"
    },
    {
      "id": 2,
      "name": "Cyberbezpieczeństwo"
    },
    {
      "id": 3,
      "name": "AI"
    }
  ],
  "reservedBy": {
    "id": 1,
    "name": "Jan",
    "surname": "Kowalski",
    "email": "jkowalski@student.agh.edu.pl"
  }
}
```

# Endpoint GET /all_theses_tags

**Opis:**
Zwraca wszystkie dostępne tagi pracy

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

## Odpowiedź

Przykładowy json:

```json
{
  "tags": [
    { "id": 1, "name": "Cyberbezpieczeństwo" },
    { "id": 2, "name": "Uczenie maszynowe" },
    { "id": 3, "name": "Algorytmy" }
  ]
}
```

# Endpoint GET /fieldsOfStudy

**Opis:**
Zwraca wszystkie dostępne kierunki studiów

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

Przykładowy json:

```json
{
  "fieldsOfStudy": [
    {
      "id": 1,
      "field": "Informatyka"
    },
    {
      "id": 2,
      "field": "Cyberbezpieczeństwo"
    }
  ]
}
```

# Endpoint POST /fieldsOfStudy

**Opis:**
Tworzy nowy kierunek studiów

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

## Ciało

| Nazwa | Typ    | Wymagany | Opis           |
| ----- | ------ | -------- | -------------- |
| field | string | Tak      | Nazwa kierunku |

# Endpoint PUT /fieldsOfStudy/{id}

**Opis:**
Edytuje obecny kierunek studiów

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

## Ciało

| Nazwa | Typ    | Wymagany | Opis           |
| ----- | ------ | -------- | -------------- |
| field | string | Tak      | Nowa nazwa kierunku |

## Parametry

| Nazwa | Typ    | Wymagany | Opis           |
| ----- | ------ | -------- | -------------- |
| id | string | Tak      | id edytowanego kierunku |


# Endpoint DELETE /fieldsOfStudy/{id}

**Opis:**
Usuwa kierunek studiów o danym id

## Parametry

| Nazwa | Typ    | Wymagany | Opis           |
| ----- | ------ | -------- | -------------- |
| id | string | Tak      | id usuwanego kierunku |

# Endpoint PUT /theses/${thesisId}/status/edit

**Opis:**
Zmienia status rezerwacji pracy

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

Dostępne statusy:

```ts
type ThesisStatus =
  | "Ukryty"
  | "Dostępny"
  | "Zarezerwowany"
  | "Student zaakceptowany"
  | "Zatwierdzony";
```

Status może się zmienić:

- z "Ukryty" na dostępny i na odwrót lub z "Zarezerwowany" na "Ukryty" (1)
- z "Dostępny" na "Zarezerwowany" (2)
- z "Zarezerwowany" na "Student zaakceptowany" (3)
- z "Student zaakceptowany" na "Zatwierdzony" (4)
- z "Student zaakceptowany" lub "Zarezerwowany" na "Dostępny" (5)

(1) dokonuje promotor pracy
(2) dokonuje student, który rezerwuje pracę
(3) dokonuje promotor pracy
(4) dokonuje student, który ostatecznie zatwierdza realizację pracy
(5) dokonuje student, rezygnując z realizacji pracy

(1) gdy status zmieniany jest na ukryty, obecna rezerwacja studenta jest usuwana, pole `reservedBy` od wtedy powinno być zwracane jako null
(2) uzupełniane jest wtedy pole reservedBy
(3) na backendzie po prostu zmieniany jest status, tylko, że od tego statusu w górę już promotor nie może edytować zawartości pracy
(4) tu też chyba po prostu zmieniany jest status na backendzie, promotor nie może edytować zawartości pracy
(5) `reservedBy` jest null, promotor może edytować zawartość pracy

**Odpowiedź:**
Brak specyfikacji

# Endpoint GET /theses/new

**Opis:**
Tworzy w bazie pustą pracę, **z placeholderami** w treści i zwraca id tej pracy

headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json",
}

Przykładowy json:

```json
{
  "id": 100
}
```

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


# Endpoint PUT /theses/{thesisId}/edit

**Opis:**
Edytuje zawartość pracy

## Ciało

Przykładowy json:

```json
{
  "id": 1,
  "title": "Temat: Analiza algorytmów uczenia maszynowego w detekcji cyberataków",
  "fieldOfStudy": {
    "id": 1,
    "field": "Informatyka"
  },
  "description": "Lorem ipsum dolor sit amet...",
  "prerequisitesDescription": "Lorem ipsum dolor sit amet...",
  "tags": [
    {
      "id": 1,
      "name": "Algorytmy"
    },
    {
      "id": 2,
      "name": "Cyberbezpieczeństwo"
    },
    {
      "id": 3,
      "name": "AI"
    }
  ]
}
```

Dla fieldOfStudy i tags zapewne wykorzystywane będzie tylko id, ale name nie szkodzi, a unikam potencjalnie nieczytelnego mapowania na froncie

Warto zweryfikować na backendzie czy status jest "Ukryty", jeśli zmieniony jest kierunek studiów (Uwaga! jeśli jest zmieniony, czyli trzeba porównać z obecnym w bazie), bo założenie jest takie, że kierunek studiów można modyfikować tylko, jeśli status to "Ukryty"
Poza tym nie powinno się dopuścić do sytuacji, w której temat jest modyfikowany, a status jest co najmniej "Student zaakceptowany", czyli jeśli status jest co najmniej "Student zaakceptowany", to ten endpoint nie powinien działać

# Endpoint GET /thesis/supervisor/{supervisorId}/
**Opis:**
Zwraca prace dyplomowe posiadane przez danego promotora.

headers: {
  Content-Type: "application/json"
  Authorization: "Bearer TUTAJ_TOKEN",
}

## Odpowiedź
`User = {id: number, email: string, first_name: string, last_name: string, title: string}`

`FieldOfStudy = {id: number, name: string}`

**Odpowiedzią jest {theses: List[Thesis]}, struktura Thesis opisana jest poniżej**
| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| id | number | | Identyfikator pracy |
| name | string | | Nazwa pracy |
| owner | User | | Opiekun pracy |
| field_of_study | FieldOfStudy | | Kierunek studiów (wraz z wydziałem) gdzie realizowana jest praca |
| date_of_creation | DateTime | | Data utworzenia |
| tags | List[{id: number, name: string}] | | Lista tagów |
| status | string | | Status pracy dyplomowej |

To samo co w endpoincie z listowaniem prac.

# Endpoint GET /supervisors/{supervisorId}/

## Odpowiedź

`FieldOfStudy = {id: number, name: string, description: string}`

| Nazwa  | Typ    | Wymagany | Opis                       |
|--------|--------|----------|----------------------------|
| id | number | | ID promotora |
| email | string | | |
| first_name | string | | |
| last_name | string | | |
| title | string | | Stopień promotora |
| field_of_study | FieldOfStudy | | Kierunek + wydział |
| free_spots | number | | Liczba wolnych miejsc |
| total_spots | number | | Liczba wolnych + zajętych miejsc |
