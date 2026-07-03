# Frontend/Backend Split — Phase 1 (Scaffold + Auth + Candidates) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `Backend/` (Express + TypeScript API) and `Frontend/` (Next.js app calling it) as two independent projects under `c:\projects\linking_overseasV1`, with the Candidate domain (CV submission + admin list/detail/status-update) fully ported end-to-end as the proof-of-pattern vertical slice.

**Architecture:** Backend owns Prisma/Postgres and mounts Better Auth as Express middleware. Frontend has zero direct DB access; a `services/` layer calls the Backend over HTTP. Browser calls go through a Next.js rewrite proxy (same-origin, cookies just work); Server Component reads call the Backend directly and manually forward the incoming session cookie.

**Tech Stack:** Backend — Express 5, TypeScript, Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`), Zod v4, Better Auth, `better-auth/node` (`toNodeHandler`, `fromNodeHeaders`). Frontend — existing Next.js 16 / React 19 / shadcn/ui app, unchanged except its data-fetching layer.

## Global Constraints

- Full design reference: `c:\projects\linking_overseasV1\FRONTEND-BACKEND-SPLIT-DESIGN.md` — every task below implements a piece of that design; don't deviate from its architecture without flagging it.
- Neither the old `linking-overseas` app nor `linking_overseasV1` has an automated test framework installed. This plan does **not** introduce one — "test" steps are `tsc --noEmit`, starting the dev server, and `curl`/browser verification with exact expected output, matching how the rest of this project has been verified so far. Do not add Jest/Vitest as part of this plan.
- Business logic (Prisma queries, validation rules) is **ported from the existing single-app repo, not redesigned**. Source of truth for what to port: `c:\projects\linking-overseas\server\actions\candidates.actions.ts`, `c:\projects\linking-overseas\lib\auth.ts`, `c:\projects\linking-overseas\lib\validations.ts`, `c:\projects\linking-overseas\prisma\schema.prisma`.
- Reuse the exact same `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` values already in `c:\projects\linking-overseas\.env` — copy them into the new `Backend/.env`, do not generate new ones.
- Every task's code must compile under `tsc --noEmit` with no errors before being marked done.
- Git: `linking_overseasV1` is not yet a git repository. Task 1 initializes one at the `linking_overseasV1` root (both `Backend/` and `Frontend/` are subfolders of the same repo, not separate repos) so the `git commit` steps in this plan work.

---

### Task 1: Initialize the repo and scaffold the Backend Express project

**Files:**
- Create: `linking_overseasV1/.gitignore`
- Create: `linking_overseasV1/Backend/package.json`
- Create: `linking_overseasV1/Backend/tsconfig.json`
- Create: `linking_overseasV1/Backend/.env` (not committed — copied secrets)
- Create: `linking_overseasV1/Backend/src/app.ts`
- Create: `linking_overseasV1/Backend/src/server.ts`

**Interfaces:**
- Produces: an Express `app` (default export from `src/app.ts`) that later tasks attach routes/middleware to. `server.ts` imports `app` and calls `app.listen(PORT)`.

- [ ] **Step 1: Initialize git at the linking_overseasV1 root**

Run:
```bash
cd c:/projects/linking_overseasV1
git init
```
Expected: `Initialized empty Git repository in c:/projects/linking_overseasV1/.git/`

- [ ] **Step 2: Create the root .gitignore**

```gitignore
node_modules/
.env
.next/
dist/
*.tsbuildinfo
```

- [ ] **Step 3: Scaffold the Backend package.json**

Create `Backend/package.json`:
```json
{
  "name": "linking-overseas-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@better-auth/prisma-adapter": "^1.6.23",
    "@prisma/adapter-pg": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "better-auth": "^1.6.23",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^5.0.1",
    "pg": "^8.22.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^20",
    "@types/pg": "^8.20.0",
    "prisma": "^7.8.0",
    "tsx": "^4.19.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 4: Install dependencies**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm install
```
Expected: installs with no errors.

- [ ] **Step 5: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create .env (copy real values from the old app)**

Create `Backend/.env` — open `c:\projects\linking-overseas\.env` and copy these four values verbatim into the new file:
```env
DATABASE_URL="<copy from linking-overseas/.env>"
BETTER_AUTH_SECRET=<copy from linking-overseas/.env>
BETTER_AUTH_URL=http://localhost:5000
GOOGLE_CLIENT_ID=<copy from linking-overseas/.env>
GOOGLE_CLIENT_SECRET=<copy from linking-overseas/.env>
PORT=5000
FRONTEND_URL=http://localhost:3000
```
Note `BETTER_AUTH_URL` changes to port 5000 (the Backend's own port) — Better Auth needs to know its own base URL, not the Frontend's.

- [ ] **Step 7: Create the Express app skeleton**

Create `Backend/src/app.ts`:
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export default app
```

- [ ] **Step 8: Create the entry point**

Create `Backend/src/server.ts`:
```typescript
import app from './app'

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
```

- [ ] **Step 9: Verify the skeleton runs**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal:
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok"}`. Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 10: Commit**

```bash
cd c:/projects/linking_overseasV1
git add .gitignore Backend/package.json Backend/package-lock.json Backend/tsconfig.json Backend/src
git commit -m "scaffold: Express backend skeleton with health check"
```

---

### Task 2: Add shared error-handling utilities (catchAsync, AppError, sendResponse, globalErrorHandler)

**Files:**
- Create: `Backend/src/app/errorHelpers/AppError.ts`
- Create: `Backend/src/app/shared/catchAsync.ts`
- Create: `Backend/src/app/shared/sendResponse.ts`
- Create: `Backend/src/app/middlewares/globalErrorHandler.ts`
- Modify: `Backend/src/app.ts`

**Interfaces:**
- Consumes: nothing from Task 1 beyond the `app` instance.
- Produces: `AppError` (class, `new AppError(statusCode, message)`), `catchAsync` (wraps an Express `RequestHandler`), `sendResponse<T>(res, { statusCode, success, message, data })`, `globalErrorHandler` (Express error middleware) — every later module's controller/route imports these by these exact names.

- [ ] **Step 1: Create AppError**

Create `Backend/src/app/errorHelpers/AppError.ts`:
```typescript
export class AppError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError
```

- [ ] **Step 2: Create catchAsync**

Create `Backend/src/app/shared/catchAsync.ts`:
```typescript
import { NextFunction, Request, RequestHandler, Response } from 'express'

export const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default catchAsync
```

- [ ] **Step 3: Create sendResponse**

Create `Backend/src/app/shared/sendResponse.ts`:
```typescript
import { Response } from 'express'

interface ISendResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data?: T
}

export const sendResponse = <T>(res: Response, payload: ISendResponse<T>) => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data ?? null,
  })
}

export default sendResponse
```

- [ ] **Step 4: Create globalErrorHandler**

Create `Backend/src/app/middlewares/globalErrorHandler.ts`:
```typescript
import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errorHelpers/AppError'

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[globalErrorHandler]', error)

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message, data: null })
    return
  }

  if (error instanceof Error) {
    res.status(500).json({ success: false, message: error.message, data: null })
    return
  }

  res.status(500).json({ success: false, message: 'Something went wrong.', data: null })
}

export default globalErrorHandler
```

- [ ] **Step 5: Wire the error handler and a test route into app.ts**

Modify `Backend/src/app.ts` — add a temporary route that throws, and mount the error handler last:
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { AppError } from './app/errorHelpers/AppError'
import { catchAsync } from './app/shared/catchAsync'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get(
  '/health/error-check',
  catchAsync(async () => {
    throw new AppError(400, 'This is a deliberate test error.')
  })
)

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 6: Verify the error shape**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal:
```bash
curl -i http://localhost:5000/health/error-check
```
Expected: HTTP status `400`, body `{"success":false,"message":"This is a deliberate test error.","data":null}`. Stop the dev server before continuing.

- [ ] **Step 7: Remove the temporary test route**

Modify `Backend/src/app.ts` — delete the `/health/error-check` route and its now-unused `AppError`/`catchAsync` imports (keep `globalErrorHandler`'s import and its `app.use(globalErrorHandler)` line, which must stay as the last `app.use` after all future routes are added in later tasks):
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 8: Verify tsc is clean**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 9: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/src
git commit -m "feat: add catchAsync, AppError, sendResponse, globalErrorHandler"
```

---

### Task 3: Add Prisma schema and connect to the existing database

**Files:**
- Create: `Backend/prisma/schema.prisma`
- Create: `Backend/src/app/lib/prisma.ts`
- Modify: `Backend/src/app.ts`

**Interfaces:**
- Produces: `prisma` (default export from `src/app/lib/prisma.ts`, a `PrismaClient` instance) — every service in later tasks imports this by this exact name and path (`@/app/lib/prisma`).

- [ ] **Step 1: Copy the existing schema**

Copy the full contents of `c:\projects\linking-overseas\prisma\schema.prisma` into a new file at `Backend/prisma/schema.prisma`. Change only the generator's `output` path — everywhere else (all models, all enums) stays byte-for-byte identical:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```
(Then paste every model and enum from the original file below the `datasource` block, unchanged — `CandidateStatus`, `Destination`, `Gender`, `MaritalStatus`, `Religion`, `Candidate`, `JobStatus`, `Job`, `Employer`, `ApplicationStatus`, `Application`, `MilestoneType`, `MilestoneResult`, `DeploymentStatus`, `Deployment`, `DeploymentMilestone`, `RequirementStatus`, `EmployerRequirement`, `ContactMessage`, `User`, `Session`, `Account`, `Verification`.)

- [ ] **Step 2: Generate the Prisma client (no migration needed — same database, schema already applied)**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npx prisma generate
```
Expected: `✔ Generated Prisma Client (7.8.0) to .\src\generated\prisma`. This does **not** run a migration — the database already has every table from the original app; this only generates the typed client here.

- [ ] **Step 3: Create the Prisma client singleton**

Create `Backend/src/app/lib/prisma.ts`:
```typescript
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

export const prisma = new PrismaClient({ adapter })

export default prisma
```

- [ ] **Step 4: Add a temporary verification route**

Modify `Backend/src/app.ts` — add a route that counts candidates, to prove the connection works:
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import { catchAsync } from './app/shared/catchAsync'
import { prisma } from './app/lib/prisma'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get(
  '/health/db-check',
  catchAsync(async (_req, res) => {
    const count = await prisma.candidate.count()
    res.json({ candidateCount: count })
  })
)

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 5: Verify the database connection**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal:
```bash
curl http://localhost:5000/health/db-check
```
Expected: `{"candidateCount":0}` (0 is correct and expected — the reseeded `linking-overseas` database has no `Candidate` rows yet, only `Job`/`Employer` rows from the seed script). Stop the dev server before continuing.

- [ ] **Step 6: Remove the temporary verification route**

Modify `Backend/src/app.ts` — delete the `/health/db-check` route and its now-unused `prisma`/`catchAsync` imports (both will be reimported by the Candidate module in Task 5, so removing them now is correct — don't leave dead test routes in the final file):
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 7: Verify tsc is clean**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 8: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/prisma Backend/src
git commit -m "feat: connect Backend to the existing Postgres database via Prisma"
```

Note: `Backend/src/generated/` (the generated Prisma client) is machine-generated like `node_modules` — add it to `linking_overseasV1/.gitignore` now:
```gitignore
node_modules/
.env
.next/
dist/
*.tsbuildinfo
Backend/src/generated/
```
Then `git add .gitignore && git commit -m "chore: ignore generated Prisma client"`.

---

### Task 4: Mount Better Auth in the Backend

**Files:**
- Create: `Backend/src/app/modules/auth/auth.ts`
- Create: `Backend/src/app/middlewares/checkAuth.ts`
- Modify: `Backend/src/app.ts`

**Interfaces:**
- Consumes: `prisma` from Task 3 (`@/app/lib/prisma`).
- Produces: `auth` (default export from `auth.ts`, the configured Better Auth instance) and `checkAuth` (Express middleware, default export from `checkAuth.ts`, attaches `req.session`) — later tasks' protected routes use `checkAuth` by this exact name.

- [ ] **Step 1: Port the Better Auth config**

Create `Backend/src/app/modules/auth/auth.ts` — ported from `c:\projects\linking-overseas\lib\auth.ts`, with the Next.js-specific `nextCookies()` plugin removed (it only works inside Next.js Server Actions; a plain Express app doesn't need it — Better Auth's node handler sets cookies via standard `Set-Cookie` headers automatically):
```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { username } from 'better-auth/plugins'
import { prisma } from '../../lib/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'admin',
      },
    },
  },
  plugins: [username()],
})

export default auth
```

- [ ] **Step 2: Create the checkAuth middleware**

Create `Backend/src/app/middlewares/checkAuth.ts`:
```typescript
import { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../modules/auth/auth'
import { AppError } from '../errorHelpers/AppError'

declare global {
  namespace Express {
    interface Request {
      session?: Awaited<ReturnType<typeof auth.api.getSession>>
    }
  }
}

export const checkAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session) {
      throw new AppError(401, 'You must be signed in to do that.')
    }
    req.session = session
    next()
  } catch (error) {
    next(error)
  }
}

export default checkAuth
```

- [ ] **Step 3: Mount the Better Auth handler in app.ts**

Modify `Backend/src/app.ts` — the auth handler must be mounted **before** any `express.json()` body parser (Better Auth needs the raw, unparsed request stream). This app has no global body parser yet, so mount order here is: auth handler first, then a scoped `express.json()` for everything else added later:
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './app/modules/auth/auth'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 4: Verify the auth routes respond**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal, hit Better Auth's session endpoint (no cookie yet, so it should return a null session, not an error):
```bash
curl -i http://localhost:5000/api/auth/get-session
```
Expected: HTTP status `200`, body `null`. Stop the dev server before continuing.

- [ ] **Step 5: Verify tsc is clean**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 6: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/src
git commit -m "feat: mount Better Auth and add checkAuth middleware"
```

---

### Task 5: Port the Candidate module to the Backend

**Files:**
- Create: `Backend/src/app/modules/candidate/candidate.interface.ts`
- Create: `Backend/src/app/modules/candidate/candidate.validation.ts`
- Create: `Backend/src/app/modules/candidate/candidate.service.ts`
- Create: `Backend/src/app/modules/candidate/candidate.controller.ts`
- Create: `Backend/src/app/modules/candidate/candidate.route.ts`
- Create: `Backend/src/routes/index.ts`
- Modify: `Backend/src/app.ts`

**Interfaces:**
- Consumes: `prisma` (`@/app/lib/prisma`), `catchAsync`, `sendResponse`, `AppError`, `checkAuth`.
- Produces: `CandidateRoutes` (default export from `candidate.route.ts`), mounted at `/candidates` — this is the pattern every later domain module (Job, Employer, Application, Deployment, ...) repeats.

- [ ] **Step 1: Port the validation schema**

Create `Backend/src/app/modules/candidate/candidate.validation.ts` — ported from `cvSubmissionSchema` in `c:\projects\linking-overseas\lib\validations.ts` (identical field list and rules):
```typescript
import { z } from 'zod'

export const createCandidateZodSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Select a gender' }),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], {
    message: 'Select a marital status',
  }),
  nationality: z.string().min(2, 'Nationality is required'),
  religion: z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER'], {
    message: 'Select a religion',
  }),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  presentAddress: z.string().min(5, 'Enter your present address'),
  permanentAddress: z.string().optional(),
  passportNumber: z.string().min(3, 'Passport number is required'),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().min(1, 'Passport expiry date is required'),
  passportPlaceOfIssue: z.string().min(2, 'Place of issue is required'),
  highestEducation: z.string().min(1, 'Select your highest education level'),
  passingYear: z.string().optional(),
  desiredPosition: z.string().min(2, 'Desired position is required'),
  experienceLevel: z.string().min(1, 'Select your years of experience'),
  skillsQualifications: z.string().optional(),
  previousEmployer: z.string().optional(),
  destination: z.enum(['SAUDI_ARABIA', 'UAE', 'KUWAIT', 'OMAN', 'QATAR', 'BAHRAIN'], {
    message: 'Select a preferred country',
  }),
  expectedSalary: z.string().optional(),
  cvResumeUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  passportCopyUrl: z.string().optional(),
  certificateUrls: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: 'You must confirm that the information provided is true and accurate',
  }),
})

export const updateCandidateStatusZodSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'DEPLOYED']),
  notes: z.string().optional(),
})
```

- [ ] **Step 2: Create request/query interfaces**

Create `Backend/src/app/modules/candidate/candidate.interface.ts`:
```typescript
export interface IGetCandidatesQuery {
  search?: string
  status?: string
  page?: string
  pageSize?: string
}
```

- [ ] **Step 3: Port the service layer**

Create `Backend/src/app/modules/candidate/candidate.service.ts` — ported from `c:\projects\linking-overseas\server\actions\candidates.actions.ts`, with `revalidatePath` removed (that's a Next.js-only concept; the Frontend now gets fresh data by simply re-fetching after a mutation, no server-side cache to invalidate) and errors thrown as `AppError` instead of a plain `Error`:
```typescript
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../errorHelpers/AppError'
import { Destination, Gender, MaritalStatus, Religion, CandidateStatus } from '../../../generated/prisma/client'
import { createCandidateZodSchema } from './candidate.validation'
import { IGetCandidatesQuery } from './candidate.interface'

type CreateCandidateInput = z.infer<typeof createCandidateZodSchema>

export const createCandidate = async (payload: CreateCandidateInput) => {
  const {
    dateOfBirth,
    passportIssueDate,
    passportExpiryDate,
    passingYear,
    destination,
    gender,
    maritalStatus,
    religion,
    ...rest
  } = payload

  return prisma.candidate.create({
    data: {
      ...rest,
      destination: destination as Destination,
      gender: gender as Gender,
      maritalStatus: maritalStatus as MaritalStatus,
      religion: religion as Religion,
      dateOfBirth: new Date(dateOfBirth),
      passportIssueDate: passportIssueDate ? new Date(passportIssueDate) : null,
      passportExpiryDate: new Date(passportExpiryDate),
      passingYear: passingYear ? parseInt(passingYear, 10) : null,
    },
  })
}

export const getCandidates = async (query: IGetCandidatesQuery) => {
  const page = query.page ? Number(query.page) : 1
  const pageSize = query.pageSize ? Number(query.pageSize) : 20

  const where = {
    ...(query.status ? { status: query.status as CandidateStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { phone: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.candidate.count({ where }),
  ])

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export const getCandidateById = async (id: string) => {
  const candidate = await prisma.candidate.findUnique({ where: { id } })
  if (!candidate) throw new AppError(404, 'Candidate not found.')
  return candidate
}

export const updateCandidateStatus = async (id: string, status: CandidateStatus, notes?: string) => {
  return prisma.candidate.update({ where: { id }, data: { status, notes } })
}
```

- [ ] **Step 4: Create the controller**

Create `Backend/src/app/modules/candidate/candidate.controller.ts`:
```typescript
import { catchAsync } from '../../shared/catchAsync'
import { sendResponse } from '../../shared/sendResponse'
import { createCandidateZodSchema, updateCandidateStatusZodSchema } from './candidate.validation'
import * as candidateService from './candidate.service'
import { AppError } from '../../errorHelpers/AppError'

export const createCandidate = catchAsync(async (req, res) => {
  const parsed = createCandidateZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid form data. Please check all fields.')

  const candidate = await candidateService.createCandidate(parsed.data)
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'CV submitted successfully.',
    data: candidate,
  })
})

export const getCandidates = catchAsync(async (req, res) => {
  const result = await candidateService.getCandidates(req.query)
  sendResponse(res, { statusCode: 200, success: true, message: 'Candidates retrieved.', data: result })
})

export const getCandidateById = catchAsync(async (req, res) => {
  const candidate = await candidateService.getCandidateById(req.params.id)
  sendResponse(res, { statusCode: 200, success: true, message: 'Candidate retrieved.', data: candidate })
})

export const updateCandidateStatus = catchAsync(async (req, res) => {
  const parsed = updateCandidateStatusZodSchema.safeParse(req.body)
  if (!parsed.success) throw new AppError(400, 'Invalid status update.')

  const candidate = await candidateService.updateCandidateStatus(
    req.params.id,
    parsed.data.status,
    parsed.data.notes
  )
  sendResponse(res, { statusCode: 200, success: true, message: 'Status updated.', data: candidate })
})
```

- [ ] **Step 5: Create the route**

Create `Backend/src/app/modules/candidate/candidate.route.ts` — public CV submission, admin-only reads/updates:
```typescript
import { Router } from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import * as candidateController from './candidate.controller'

const router = Router()

router.post('/', candidateController.createCandidate)
router.get('/', checkAuth, candidateController.getCandidates)
router.get('/:id', checkAuth, candidateController.getCandidateById)
router.patch('/:id/status', checkAuth, candidateController.updateCandidateStatus)

export const CandidateRoutes = router
export default CandidateRoutes
```

- [ ] **Step 6: Create the central route index**

Create `Backend/src/routes/index.ts`:
```typescript
import { Router } from 'express'
import { CandidateRoutes } from '../app/modules/candidate/candidate.route'

const router = Router()

router.use('/candidates', CandidateRoutes)

export default router
```

- [ ] **Step 7: Mount the routes in app.ts**

Modify `Backend/src/app.ts`:
```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './app/modules/auth/auth'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import routes from './routes'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/', routes)

app.use(globalErrorHandler)

export default app
```

- [ ] **Step 8: Verify with curl — create, list, get, update**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
In a second terminal, submit a CV (unauthenticated — this route is public):
```bash
curl -s -X POST http://localhost:5000/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Candidate", "fatherName": "Test Father", "dateOfBirth": "1995-01-01",
    "gender": "MALE", "maritalStatus": "SINGLE", "nationality": "Bangladeshi", "religion": "ISLAM",
    "phone": "+8801700000000", "email": "test@example.com", "presentAddress": "Dhaka, Bangladesh",
    "passportNumber": "BD1234567", "passportExpiryDate": "2030-01-01", "passportPlaceOfIssue": "Dhaka",
    "highestEducation": "SSC / Secondary", "desiredPosition": "Construction Worker",
    "experienceLevel": "1-3 years", "destination": "SAUDI_ARABIA", "agreedToTerms": true
  }'
```
Expected: `{"success":true,"message":"CV submitted successfully.","data":{"id":"...", "name":"Test Candidate", ...}}`.

Then attempt to list without auth (should 401, since `checkAuth` guards this route):
```bash
curl -i http://localhost:5000/candidates
```
Expected: HTTP `401`, `{"success":false,"message":"You must be signed in to do that.","data":null}`.

Full authenticated list/detail/status-update verification happens in Task 8, once the Frontend can actually log in and send a real session cookie — curl alone can't drive the Google/username login flow. Stop the dev server before continuing.

- [ ] **Step 9: Verify tsc is clean**

Run:
```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
```
Expected: no output, exit code 0.

- [ ] **Step 10: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Backend/src
git commit -m "feat: port Candidate module (create, list, get, update status)"
```

---

### Task 6: Scaffold the Frontend project and the proxy/services plumbing

**Files:**
- Copy: entire `c:\projects\linking-overseas` directory → `linking_overseasV1/Frontend`
- Modify: `Frontend/next.config.ts`
- Create: `Frontend/.env.local`
- Create: `Frontend/services/api-client.ts`
- Create: `Frontend/services/api-server.ts`
- Delete: `Frontend/server/actions/candidates.actions.ts` (ported to Backend in Task 5; recreated as `services/candidate.services.ts` + `services/candidate.server-services.ts` in Task 7)

**Interfaces:**
- Produces: `apiClient(path, options)` (default export, `services/api-client.ts` — client-safe, relative URLs) and `apiServer(path, options)` (default export, `services/api-server.ts` — server-only, forwards cookies) — every domain services file in later tasks uses one of these two, never `fetch` directly.

- [ ] **Step 1: Copy the existing app**

Copy the entire contents of `c:\projects\linking-overseas` (excluding `node_modules`, `.next`, and `lib/generated`) into `c:\projects\linking_overseasV1\Frontend`. This preserves every page, component, and the `app/`, `lib/`, `components/` folders exactly as they exist today — nothing in the UI changes in this task.

- [ ] **Step 2: Install dependencies in the new location**

Run:
```bash
cd c:/projects/linking_overseasV1/Frontend
npm install
```
Expected: installs with no errors (same `package.json` as the original app, just running from the new path).

- [ ] **Step 3: Create the Frontend env file**

Create `Frontend/.env.local`:
```env
# Used by Server Components (direct server-to-server calls to the Backend)
BACKEND_INTERNAL_URL=http://localhost:5000

# Used by the rewrite proxy (next.config.ts) that the browser calls through
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Remove the old `Frontend/.env` file's `DATABASE_URL`, `BETTER_AUTH_SECRET`, `UPLOADTHING_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` entries — the Frontend no longer needs any of them, since it has no direct database or auth-provider access anymore (those live only in the Backend now).

- [ ] **Step 4: Add the rewrite proxy**

Modify `Frontend/next.config.ts` to add a `rewrites()` function. Read the existing file first to keep any config already there, then add:
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL}/:path*`,
      },
    ]
  },
}

export default nextConfig
```

- [ ] **Step 5: Create the client-side fetch wrapper**

Create `Frontend/services/api-client.ts` — for use only inside `'use client'` components/forms. Calls go through the rewrite proxy (relative path, same-origin from the browser's perspective, so cookies attach automatically):
```typescript
export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/backend${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'Something went wrong.')
  }

  return body.data as T
}

export default apiClient
```

- [ ] **Step 6: Create the server-side fetch wrapper**

Create `Frontend/services/api-server.ts` — for use only inside Server Components (async page/layout files, never `'use client'` files). Calls the Backend's real URL directly and manually forwards the incoming request's cookie so Better Auth on the Backend can validate the session:
```typescript
import 'server-only'
import { headers } from 'next/headers'

export async function apiServer<T>(path: string, options: RequestInit = {}): Promise<T> {
  const incomingHeaders = await headers()
  const cookie = incomingHeaders.get('cookie') ?? ''

  const res = await fetch(`${process.env.BACKEND_INTERNAL_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      cookie,
      ...options.headers,
    },
    cache: 'no-store',
  })

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'Something went wrong.')
  }

  return body.data as T
}

export default apiServer
```

Note the `import 'server-only'` at the top — this is a real package (already a transitive dependency of Next.js) that makes the build **fail loudly** if a Client Component ever accidentally imports this file, instead of silently breaking at runtime. Install it explicitly:
```bash
cd c:/projects/linking_overseasV1/Frontend
npm install server-only
```

- [ ] **Step 7: Remove the ported server action**

Delete `Frontend/server/actions/candidates.actions.ts` — its logic now lives in `Backend/src/app/modules/candidate/candidate.service.ts` (Task 5). The pages/components that imported it will be updated in Task 7 to use the new services layer instead; until then, `tsc` will show missing-import errors for that one file's former consumers, which is expected and resolved in the next task.

- [ ] **Step 8: Verify the Frontend starts**

Run:
```bash
cd c:/projects/linking_overseasV1/Frontend
npm run dev
```
Expected: dev server starts on port 3000. Note: pages that imported the now-deleted `candidates.actions.ts` will error when visited (expected, fixed in Task 7) — verify only that the server process itself starts without a fatal config error, then stop it (Ctrl+C).

- [ ] **Step 9: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend
git commit -m "scaffold: copy Next.js app into Frontend/, add rewrite proxy and services plumbing"
```

---

### Task 7: Build candidate services and rewire the Frontend's candidate pages/forms

**Files:**
- Create: `Frontend/services/candidate.services.ts`
- Create: `Frontend/services/candidate.server-services.ts`
- Modify: `Frontend/app/(public)/curriculum-vitae/_components/cv-form.tsx`
- Modify: `Frontend/app/admin/candidates/page.tsx`
- Modify: `Frontend/app/admin/candidates/[id]/page.tsx`
- Modify: `Frontend/app/admin/candidates/[id]/_components/status-update-form.tsx`

**Interfaces:**
- Consumes: `apiClient` (`@/services/api-client`), `apiServer` (`@/services/api-server`).
- Produces: `submitCV(values)`, `updateCandidateStatus(id, status, notes)` (client-safe, from `candidate.services.ts`); `getCandidates(options)`, `getCandidateById(id)` (server-only, from `candidate.server-services.ts`) — same function names and signatures the pages already call today, so the only edit needed in each page/form is the import path.

- [ ] **Step 1: Create the client-safe candidate services**

Create `Frontend/services/candidate.services.ts`:
```typescript
'use client'

import { apiClient } from './api-client'
import type { CVSubmissionValues } from '@/lib/validations'
import type { Candidate } from '@/lib/generated/prisma/client'

export async function submitCV(values: CVSubmissionValues) {
  return apiClient<Candidate>('/candidates', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export async function updateCandidateStatus(id: string, status: Candidate['status'], notes?: string) {
  return apiClient<Candidate>(`/candidates/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  })
}
```

- [ ] **Step 2: Create the server-only candidate services**

Create `Frontend/services/candidate.server-services.ts`:
```typescript
import 'server-only'
import { apiServer } from './api-server'
import type { Candidate } from '@/lib/generated/prisma/client'

interface GetCandidatesResult {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getCandidates(options?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (options?.search) params.set('search', options.search)
  if (options?.status) params.set('status', options.status)
  if (options?.page) params.set('page', String(options.page))
  if (options?.pageSize) params.set('pageSize', String(options.pageSize))

  const qs = params.toString()
  return apiServer<GetCandidatesResult>(`/candidates${qs ? `?${qs}` : ''}`)
}

export async function getCandidateById(id: string) {
  return apiServer<Candidate>(`/candidates/${id}`)
}
```

- [ ] **Step 3: Rewire the CV submission form**

Modify `Frontend/app/(public)/curriculum-vitae/_components/cv-form.tsx` — change only the import line, nothing else in the file:
```typescript
// Before:
// import { submitCV } from '@/server/actions/candidates.actions'

// After:
import { submitCV } from '@/services/candidate.services'
```

- [ ] **Step 4: Rewire the admin candidates list page**

Modify `Frontend/app/admin/candidates/page.tsx` — change only the import line:
```typescript
// Before:
// import { getCandidates } from '@/server/actions/candidates.actions'

// After:
import { getCandidates } from '@/services/candidate.server-services'
```

- [ ] **Step 5: Rewire the admin candidate detail page**

Modify `Frontend/app/admin/candidates/[id]/page.tsx` — change only the import line (this file also imports `getJobs`, which stays as-is for now — that server action is ported in a later Jobs-module plan, not this one, so leave that import untouched and expect it to keep working since `Frontend/server/actions/jobs.actions.ts` still exists):
```typescript
// Before:
// import { getCandidateById } from '@/server/actions/candidates.actions'

// After:
import { getCandidateById } from '@/services/candidate.server-services'
```

- [ ] **Step 6: Rewire the status-update form**

Modify `Frontend/app/admin/candidates/[id]/_components/status-update-form.tsx` — change only the import line:
```typescript
// Before:
// import { updateCandidateStatus } from '@/server/actions/candidates.actions'

// After:
import { updateCandidateStatus } from '@/services/candidate.services'
```

- [ ] **Step 7: Verify tsc is clean**

Run:
```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
```
Expected: no output, exit code 0. If `status-update-form.tsx` or `apply-to-job-form.tsx` shows a type error on the `status` argument, check that `Candidate['status']` still lines up with the enum values in `Backend/prisma/schema.prisma` (they must, since it's the same schema copied in Task 3).

- [ ] **Step 8: Commit**

```bash
cd c:/projects/linking_overseasV1
git add Frontend/services Frontend/app
git commit -m "feat: rewire candidate pages/forms to call the Backend via services layer"
```

---

### Task 8: End-to-end verification of the full vertical slice

**Files:** none (verification only)

- [ ] **Step 1: Start both servers**

Terminal 1:
```bash
cd c:/projects/linking_overseasV1/Backend
npm run dev
```
Terminal 2:
```bash
cd c:/projects/linking_overseasV1/Frontend
npm run dev
```
Expected: Backend on `http://localhost:5000`, Frontend on `http://localhost:3000`, both with no startup errors.

- [ ] **Step 2: Submit a CV as an anonymous visitor**

In a browser, go to `http://localhost:3000/curriculum-vitae`, fill out and submit the form.
Expected: the success screen appears ("CV Submitted Successfully!"). This confirms the browser → rewrite proxy → Backend → Postgres path works for an unauthenticated write.

- [ ] **Step 3: Log in as staff**

Go to `http://localhost:3000/login`, sign in with the existing staff username/password (or "Continue with Google").
Expected: redirected to `/admin/candidates` on success. This confirms Better Auth's login flow works when mounted on the separate Backend and reached through the rewrite proxy.

- [ ] **Step 4: Verify the admin candidates list shows the new submission**

On `/admin/candidates`, confirm the CV submitted in Step 2 appears in the table.
Expected: the row is present with the correct name/destination/status. This confirms the Server Component → `apiServer` → Backend (with forwarded session cookie) read path works.

- [ ] **Step 5: Update the candidate's status**

Open the candidate's detail page, change its status via the status-update form, submit.
Expected: the page reflects the new status badge after the update (via `router.refresh()`, same as before the split). This confirms the Client Component → `apiClient` → Backend authenticated write path works.

- [ ] **Step 6: Confirm both projects build cleanly**

```bash
cd c:/projects/linking_overseasV1/Backend
npx tsc --noEmit
npm run build
```
```bash
cd c:/projects/linking_overseasV1/Frontend
npx tsc --noEmit
npx next build
```
Expected: all four commands succeed with no errors.

- [ ] **Step 7: Commit the verified state**

```bash
cd c:/projects/linking_overseasV1
git add -A
git commit -m "chore: verify Phase 1 vertical slice (auth + candidates) end-to-end"
```

---

## What's Next (separate plans, not part of this one)

Once this phase is reviewed and confirmed working, the remaining domains follow the exact same five-file pattern established in Task 5 (interface → validation → service → controller → route) and the exact same Frontend rewiring pattern established in Task 7 (client services + server services + import-line swaps):

- **Jobs + Employers** — `server/actions/jobs.actions.ts`, `server/actions/employers.actions.ts`, plus the admin Job CRUD pages
- **Applications** — `server/actions/applications.actions.ts`, plus the admin Applications UI
- **Deployments** — `server/actions/deployments.actions.ts` (the milestone-ordering logic needs the most care of any module — port `MILESTONE_PREREQUISITES` and the transaction in `logMilestone` exactly as written)
- **Employer Requirements, Contact Messages, Dashboard** — the remaining three simple modules
- **File uploads** — moves Uploadthing to the Backend via its Express adapter; the Frontend's uploader points at the Backend through the same rewrite proxy

Each of those should get its own plan file in `docs/superpowers/plans/`, written the same way this one was, once Phase 1 is confirmed solid.
