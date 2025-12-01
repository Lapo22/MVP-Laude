# Spiegazione Dashboard Manager

## Panoramica

La nuova dashboard manager (`/admin`) è stata completamente riprogettata per rispondere a 4 domande chiave per un direttore d'hotel:

1. **Lo stanno usando?** (c'è movimento o no?)
2. **Dove vanno meglio/peggio i miei reparti?**
3. **Chi del personale spicca (in bene o in male)?**
4. **Ci sono problemi aperti da guardare?**

## Struttura della Dashboard

La dashboard è organizzata in 4 blocchi principali:

1. **Usage & Health** - Uso e stato generale
2. **Team Performance** - Performance dei team
3. **Staff Insights** - Insights sul personale
4. **Issues Overview** - Panoramica segnalazioni

## Gestione del Filtro Periodo

### Come Funziona

Il filtro periodo è implementato tramite query string (`?period=7d|30d|all`) e gestito da un componente client (`PeriodFilter.tsx`).

- **Default**: `Last 30 days` (nessun parametro nella query string)
- **Last 7 days**: `?period=7d`
- **All time**: `?period=all`

### Implementazione Tecnica

1. **Server Component** (`app/admin/page.tsx`):
   - Legge il parametro `period` da `searchParams` (Next.js 15 App Router)
   - Se non presente o non valido, usa `"30d"` come default
   - Calcola `periodStartDate` usando `getPeriodStartDate()`:
     - `"7d"` → `now() - 7 days`
     - `"30d"` → `now() - 30 days`
     - `"all"` → `null` (nessun limite)

2. **Client Component** (`PeriodFilter.tsx`):
   - Usa `useSearchParams()` per leggere il periodo corrente
   - Quando l'utente clicca un pulsante:
     - Aggiorna la query string con `router.push()`
     - Chiama `router.refresh()` per forzare il re-render del server component

3. **Influenza sulle Query**:
   - Tutte le query che usano `periodQuery` applicano il filtro `created_at >= periodStartDate` (se non è `null`)
   - Alcuni dati sono **indipendenti dal filtro**:
     - "Feedback negli ultimi 7 giorni" (sempre ultimi 7 giorni)
     - "Issues negli ultimi 7 giorni" (sempre ultimi 7 giorni)
     - "Issues non lette" (tutte, indipendente dal periodo)

## Query e Dati per Ogni Blocco

### 1. Usage & Health Section

**Query eseguite:**

```typescript
// Totale feedback nel periodo selezionato
periodQuery
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)

// Feedback ultimi 7 giorni (indipendente dal filtro)
supabase.from("votes")
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)
  .gte("created_at", sevenDaysAgoISO)

// Ultimo feedback (per mostrare lastFeedbackAt)
periodQuery
  .select("created_at, team_id")
  .eq("structure_id", structure.id)
  .order("created_at", { ascending: false })
  .limit(1)
```

**Calcoli:**

- **Total feedback in period**: Count diretto dalla query
- **Feedback last 7 days**: Count diretto (sempre ultimi 7 giorni)
- **Active teams**: Conta i `team_id` unici presenti nei voti del periodo
- **Last feedback**: Timestamp del voto più recente nel periodo

**Gestione casi vuoti:**

- Se non ci sono voti: mostra `0` per i count, `"Nessun feedback"` per l'ultimo feedback

### 2. Team Performance Section

**Query eseguite:**

```typescript
// Voti per team nel periodo
periodQuery
  .select("team_id, rating, created_at")
  .eq("structure_id", structure.id)
  .not("team_id", "is", null)
  .order("created_at", { ascending: false })

// Nomi dei team
supabase.from("teams")
  .select("id, name")
  .eq("structure_id", structure.id)
  .in("id", teamIds)

// Issues totali nel periodo
issuesQuery
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)
```

**Calcoli:**

1. **Per ogni team**:
   - Raggruppa i voti per `team_id`
   - Calcola `averageRating`: media aritmetica di tutti i `rating`
   - Conta `feedbackCount`: numero di voti
   - Estrae `lastFeedbackAt`: `created_at` del voto più recente (già ordinato)

2. **Ordinamento**:
   - Ordina per `averageRating` crescente (media più bassa prima)
   - Questo evidenzia i team con problemi

**Gestione casi vuoti:**

- Se un team non ha voti nel periodo: mostra `"–"` per la media, `0` per il count, `"–"` per l'ultimo feedback
- Se non ci sono team con voti: mostra messaggio "Nessun dato disponibile nel periodo selezionato"

### 3. Staff Insights Section

**Query eseguite:**

```typescript
// Voti per dipendenti nel periodo
periodQuery
  .select("employee_id, rating")
  .eq("structure_id", structure.id)
  .not("employee_id", "is", null)

// Dati dipendenti
supabase.from("employees")
  .select("id, name, role, team_id")
  .eq("structure_id", structure.id)
  .in("id", employeeIds)

// Nomi dei team per i dipendenti
supabase.from("teams")
  .select("id, name")
  .in("id", teamIdsForEmployees)
```

**Calcoli:**

1. **Filtro minimo**: Solo dipendenti con almeno `MIN_FEEDBACK_FOR_STAFF_INSIGHTS` (3) feedback
2. **Per ogni dipendente**:
   - Calcola `averageRating`: media aritmetica dei `rating`
   - Conta `feedbackCount`: numero di voti
3. **Top Staff**:
   - Ordina per `averageRating` decrescente
   - In caso di parità, ordina per `feedbackCount` decrescente
   - Prende i primi 5
4. **Staff da monitorare**:
   - Ordina per `averageRating` crescente
   - In caso di parità, ordina per `feedbackCount` decrescente
   - Prende i primi 5

**Gestione casi vuoti:**

- Se non ci sono dipendenti con almeno 3 feedback: mostra "Non ci sono ancora abbastanza dati sui membri dello staff nel periodo selezionato"

### 4. Issues Overview Section

**Query eseguite:**

```typescript
// Issues nel periodo selezionato
issuesQuery
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)

// Issues ultimi 7 giorni (indipendente dal filtro)
supabase.from("issues")
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)
  .gte("created_at", sevenDaysAgoISO)

// Issues non lette (tutte, indipendente dal filtro)
supabase.from("issues")
  .select("*", { count: "exact", head: true })
  .eq("structure_id", structure.id)
  .eq("is_read", false)

// Ultime 5 issues
supabase.from("issues")
  .select("id, message, is_read, created_at")
  .eq("structure_id", structure.id)
  .order("created_at", { ascending: false })
  .limit(5)
```

**Calcoli:**

- **Issues in period**: Count diretto dalla query filtrata per periodo
- **Issues last 7 days**: Count diretto (sempre ultimi 7 giorni)
- **Unread issues**: Count di tutte le issues con `is_read = false`
- **Recent issues**: Ultime 5 issues ordinate per `created_at DESC`

**Gestione casi vuoti:**

- Se non ci sono issues: mostra `0` per i count, "Nessuna segnalazione recente" per la lista

## Gestione Casi con Pochi Dati

La dashboard è progettata per essere utile anche con pochi dati:

1. **Valori zero**: Sempre mostrati come `0` invece di nascondere le card
2. **Messaggi informativi**: Quando non ci sono dati, mostriamo messaggi chiari invece di tabelle vuote
3. **Soglia minima per insights**: I dipendenti devono avere almeno 3 feedback per apparire negli insights (evita statistiche su campioni troppo piccoli)
4. **Fallback graziosi**: 
   - `"–"` per medie non calcolabili
   - `"Nessun feedback"` per date mancanti
   - Messaggi esplicativi per sezioni vuote

## Sicurezza e Autorizzazione

- **Tutte le query** filtrano per `structure_id` derivato da `requireManagerContext()`
- **Nessun dato** viene mai preso dal client
- **Il manager** può vedere solo i dati della sua struttura
- **Le query** sono eseguite server-side, quindi non esposte al client

## Performance

- **Query parallele**: Usa `Promise.all()` dove possibile per eseguire query in parallelo
- **Limit su issues recenti**: Solo le ultime 5 issues vengono caricate
- **Count queries**: Usa `count: "exact", head: true` per evitare di trasferire dati non necessari
- **Filtri efficienti**: Usa indici su `structure_id` e `created_at` (se presenti nel database)

## Testi in Italiano

Tutti i testi della dashboard sono in italiano, coerenti con il resto dell'area manager:
- Titoli delle sezioni
- Etichette delle card
- Messaggi di stato vuoto
- Formattazione date (formato italiano: `dd/mm/yyyy`)

