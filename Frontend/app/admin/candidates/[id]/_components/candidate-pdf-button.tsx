'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import type { Candidate } from '@/lib/generated/prisma/client'

const CandidatePDFDownload = dynamic(
  () => import('./candidate-pdf-document').then((m) => m.CandidatePDFDownload),
  { ssr: false, loading: () => <Button disabled className="cursor-pointer">Loading PDF...</Button> }
)

interface Props {
  candidate: Candidate
  destinationLabel: string
}

export function CandidatePDFButton({ candidate, destinationLabel }: Props) {
  return <CandidatePDFDownload candidate={candidate} destinationLabel={destinationLabel} />
}
