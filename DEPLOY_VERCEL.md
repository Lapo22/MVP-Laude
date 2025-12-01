# 🚀 Guida al Deployment su Vercel

Questa guida ti accompagna passo-passo nel deployment dell'applicazione Namely su Vercel.

## 📋 Prerequisiti

1. **Account Vercel** - Crea un account su [vercel.com](https://vercel.com) (gratuito)
2. **Account Supabase** - Assicurati di avere le credenziali Supabase
3. **Account Resend** - Per le email (opzionale ma consigliato)
4. **Repository Git** - Il progetto deve essere su GitHub, GitLab o Bitbucket

## 🔧 Step 1: Preparazione del Codice

### 1.1 Verifica che tutto sia committato

```bash
git status
git add .
git commit -m "Preparazione per deployment Vercel"
```

### 1.2 Push su GitHub/GitLab/Bitbucket

Se non hai ancora un repository remoto:

```bash
# Crea un nuovo repository su GitHub, poi:
git remote add origin https://github.com/TUO_USERNAME/TUO_REPO.git
git push -u origin main
```

## 🌐 Step 2: Deploy su Vercel

### 2.1 Importa il Progetto

1. Vai su [vercel.com](https://vercel.com) e fai login
2. Clicca su **"Add New..."** → **"Project"**
3. Importa il repository GitHub/GitLab/Bitbucket
4. Vercel rileverà automaticamente Next.js

### 2.2 Configurazione del Progetto

Vercel dovrebbe rilevare automaticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automatico)
- **Output Directory**: `.next` (automatico)
- **Install Command**: `npm install` (automatico)

**Non modificare queste impostazioni** a meno che non ci siano problemi.

## 🔐 Step 3: Configurazione Variabili d'Ambiente

### 3.1 Variabili Obbligatorie

Nella sezione **"Environment Variables"** del progetto Vercel, aggiungi:

#### Supabase (OBBLIGATORIE)
```
NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dove trovarle:**
- Vai su [supabase.com](https://supabase.com) → Il tuo progetto
- **Settings** → **API**
- Copia **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copia **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.2 Variabili Opzionali (Consigliate)

#### Resend (per le email)
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Segnalazioni Hotel <onboarding@resend.dev>
EMAIL_SUBJECT_ISSUE=Nuova segnalazione da un ospite
```

**Dove trovarle:**
- Vai su [resend.com](https://resend.com) → **API Keys**
- Crea una nuova API key se non ce l'hai
- Per `EMAIL_FROM`, usa `onboarding@resend.dev` per test (o verifica un dominio tuo)

#### URL del Sito (per reset password)
```
NEXT_PUBLIC_SITE_URL=https://tuo-progetto.vercel.app
```

**Nota:** Dopo il primo deploy, Vercel ti darà un URL tipo `tuo-progetto.vercel.app`. Aggiorna questa variabile con l'URL finale.

### 3.3 Come Aggiungere le Variabili su Vercel

1. Nel progetto Vercel, vai su **Settings** → **Environment Variables**
2. Clicca **"Add New"**
3. Inserisci:
   - **Key**: Il nome della variabile (es. `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Il valore
   - **Environment**: Seleziona tutte e tre (Production, Preview, Development)
4. Clicca **"Save"**
5. Ripeti per tutte le variabili

## 🗄️ Step 4: Configurazione Supabase

### 4.1 Verifica le Tabelle

Assicurati che tutte le tabelle siano create nel database Supabase:

- `structures`
- `managers`
- `teams`
- `employees`
- `votes`
- `issues`
- `notification_emails`

**Se non le hai ancora create:**
1. Vai su Supabase → **SQL Editor**
2. Esegui lo script in `supabase/schema.sql`

### 4.2 Configura RLS (Row Level Security)

Assicurati che le policy RLS siano configurate correttamente per:
- Proteggere i dati delle strutture
- Permettere lettura pubblica per la pagina QR (`/s/[slug]`)
- Proteggere le API admin

### 4.3 URL di Redirect

In Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://tuo-progetto.vercel.app`
- **Redirect URLs**: Aggiungi `https://tuo-progetto.vercel.app/**`

## 🚀 Step 5: Deploy

### 5.1 Deploy Iniziale

1. Dopo aver configurato tutte le variabili d'ambiente, clicca **"Deploy"**
2. Vercel inizierà il build
3. Attendi il completamento (2-5 minuti)

### 5.2 Verifica il Deploy

1. Vercel ti darà un URL tipo: `tuo-progetto.vercel.app`
2. Apri l'URL nel browser
3. Verifica che:
   - La pagina principale carichi
   - Il login funzioni
   - L'area admin sia accessibile
   - La pagina QR (`/s/[slug]`) funzioni

## 🔄 Step 6: Deploy Automatici (Git Integration)

Se hai collegato un repository Git:

- **Ogni push su `main`** → Deploy automatico in Production
- **Ogni pull request** → Deploy automatico in Preview
- **Ogni branch** → Deploy automatico in Preview

## 🐛 Troubleshooting

### Errore: "Supabase environment variables are missing"

**Soluzione:**
- Verifica che `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` siano configurate
- Assicurati che siano selezionate per **Production, Preview, Development**
- Dopo aver aggiunto/modificato variabili, fai un nuovo deploy

### Errore: "Failed to save vote" o errori API

**Soluzione:**
- Verifica le policy RLS su Supabase
- Controlla i log di Vercel: **Deployments** → **Functions** → **Logs**
- Verifica che le tabelle esistano nel database

### Email non vengono inviate

**Soluzione:**
- Verifica che `RESEND_API_KEY` sia configurata
- Controlla i log di Resend sul dashboard
- Se usi `onboarding@resend.dev`, funziona solo per test
- Per produzione, verifica un dominio su Resend

### Build Fallisce

**Soluzione:**
1. Controlla i log di build su Vercel
2. Verifica che tutte le dipendenze siano in `package.json`
3. Assicurati che non ci siano errori TypeScript: `npm run build` in locale

### Pagina 404 su `/admin`

**Soluzione:**
- Verifica che il manager esista in Supabase
- Controlla che la sessione di autenticazione funzioni
- Verifica i log di Vercel per errori di autenticazione

## 📝 Checklist Pre-Deploy

Prima di fare il deploy, verifica:

- [ ] Tutte le variabili d'ambiente sono configurate su Vercel
- [ ] Il database Supabase ha tutte le tabelle necessarie
- [ ] Le policy RLS sono configurate correttamente
- [ ] Il codice è committato e pushato su Git
- [ ] Il build funziona in locale: `npm run build`
- [ ] Il progetto è collegato a un repository Git (per deploy automatici)

## 🔗 Link Utili

- [Documentazione Vercel](https://vercel.com/docs)
- [Documentazione Next.js](https://nextjs.org/docs)
- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione Resend](https://resend.com/docs)

## 📧 Supporto

Se hai problemi durante il deployment:
1. Controlla i log su Vercel
2. Verifica le variabili d'ambiente
3. Controlla i log di Supabase
4. Verifica che il build funzioni in locale

---

**Buon deploy! 🚀**

