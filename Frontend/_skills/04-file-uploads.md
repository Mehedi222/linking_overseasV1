# Skill: File Uploads

## Stack
Uploadthing (CV uploads, compliance report exports)

## Rules
- Allowed types: **PDF and DOCX only**
- Max size: **5MB**
- Validate on **both** client (Zod) AND server (Uploadthing config) — never trust one alone
- Store only the file URL in the database — never store the file in Postgres
- CV files must be deleted from Uploadthing after 12 months if candidate has not been deployed

## 1. Uploadthing Router (`server/uploadthing.ts`)
```ts
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  cvUploader: f({
    pdf: { maxFileSize: '5MB', maxFileCount: 1 },
    // DOCX is treated as blob
    blob: { maxFileSize: '5MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      // add auth check here if needed
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

## 2. Client-Side Zod Validation (before upload)
```ts
// in lib/validations.ts
import { z } from 'zod'

export const cvFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
    'Only PDF or DOCX files are allowed'
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File must be 5MB or less'
  )
```

## 3. Upload Component
```tsx
'use client'

import { UploadButton } from '@/lib/uploadthing'

export function CVUpload({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <UploadButton
      endpoint="cvUploader"
      onClientUploadComplete={(res) => {
        if (res?.[0]?.url) onUpload(res[0].url)
      }}
      onUploadError={(error) => {
        console.error('[CVUpload]', error)
      }}
    />
  )
}
```

## 4. Saving the URL in a Server Action
```ts
export async function submitCandidateCV(data: CandidateFormValues & { cvUrl: string }) {
  try {
    await prisma.candidate.create({
      data: {
        ...data,
        cvFileUrl: data.cvUrl,  // store URL, not the file
      },
    })
    revalidatePath('/admin/candidates')
    return { success: true }
  } catch (error) {
    console.error('[submitCandidateCV]', error)
    throw new Error('Failed to submit CV. Please try again.')
  }
}
```

## Never Do
- Never store the actual file binary in PostgreSQL
- Never skip client-side type/size check (Zod validates before upload even starts)
- Never allow file types other than PDF/DOCX
