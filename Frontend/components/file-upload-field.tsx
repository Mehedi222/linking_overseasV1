'use client'

import { useRef, useState } from 'react'
import { UploadCloud, FileCheck2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadFiles } from '@/lib/uploadthing'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

interface FileUploadFieldProps {
  endpoint: keyof OurFileRouter
  accept: string
  maxSizeMB: number
  hint?: string
  multiple?: boolean
  value: string[]
  onChange: (urls: string[]) => void
}

export function FileUploadField({
  endpoint,
  accept,
  maxSizeMB,
  hint,
  multiple = false,
  value,
  onChange,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds the ${maxSizeMB}MB limit.`)
        return
      }
    }

    setError('')
    setUploading(true)
    try {
      const results = await uploadFiles(endpoint, { files })
      const urls = results.map((r) => r.serverData.url)
      onChange(multiple ? [...value, ...urls] : urls)
    } catch (err) {
      console.error('[FileUploadField]', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeFile(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <UploadCloud /> Choose File{multiple ? 's' : ''}
          </>
        )}
      </Button>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((url) => (
            <li key={url} className="flex items-center gap-2 text-sm">
              <FileCheck2 className="size-4 shrink-0 text-green-600" />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-primary underline-offset-4 hover:underline cursor-pointer"
              >
                {url.split('/').pop()}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="cursor-pointer"
                onClick={() => removeFile(url)}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
