'use client'

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Candidate } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'

const styles = StyleSheet.create({
  page:       { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#111' },
  header:     { marginBottom: 24, borderBottom: '2px solid #1a56db', paddingBottom: 12 },
  agency:     { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a56db' },
  license:    { fontSize: 9, color: '#666', marginTop: 2 },
  title:      { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 16, color: '#111' },
  section:    { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1a56db', marginBottom: 6, textTransform: 'uppercase' },
  row:        { flexDirection: 'row', marginBottom: 5 },
  label:      { width: '35%', color: '#555', fontSize: 10 },
  value:      { width: '65%', fontSize: 10 },
  footer:     { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1px solid #ddd', paddingTop: 8, fontSize: 9, color: '#888', flexDirection: 'row', justifyContent: 'space-between' },
})

interface Props {
  candidate: Candidate
  destinationLabel: string
}

function CandidateDocument({ candidate, destinationLabel }: Props) {
  const fmt = (d: Date | string | null) => (d ? new Date(d).toLocaleDateString('en-GB') : '—')

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>
          <Text style={styles.agency}>Linking Overseas Ltd</Text>
          <Text style={styles.license}>BMET Licensed Recruitment Agency — License No: RL-2081</Text>
        </View>

        <Text style={styles.title}>Candidate Profile</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}><Text style={styles.label}>Full Name</Text><Text style={styles.value}>{candidate.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Father&apos;s Name</Text><Text style={styles.value}>{candidate.fatherName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Mother&apos;s Name</Text><Text style={styles.value}>{candidate.motherName || '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date of Birth</Text><Text style={styles.value}>{fmt(candidate.dateOfBirth)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Gender</Text><Text style={styles.value}>{candidate.gender}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Marital Status</Text><Text style={styles.value}>{candidate.maritalStatus}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nationality</Text><Text style={styles.value}>{candidate.nationality}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Religion</Text><Text style={styles.value}>{candidate.religion}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{candidate.phone}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{candidate.email}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Present Address</Text><Text style={styles.value}>{candidate.presentAddress}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Permanent Address</Text><Text style={styles.value}>{candidate.permanentAddress || '—'}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passport Information</Text>
          <View style={styles.row}><Text style={styles.label}>Passport Number</Text><Text style={styles.value}>{candidate.passportNumber}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Issue Date</Text><Text style={styles.value}>{fmt(candidate.passportIssueDate)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Expiry Date</Text><Text style={styles.value}>{fmt(candidate.passportExpiryDate)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Place of Issue</Text><Text style={styles.value}>{candidate.passportPlaceOfIssue}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Employment</Text>
          <View style={styles.row}><Text style={styles.label}>Highest Education</Text><Text style={styles.value}>{candidate.highestEducation}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Desired Position</Text><Text style={styles.value}>{candidate.desiredPosition}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Preferred Destination</Text><Text style={styles.value}>{destinationLabel}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Experience</Text><Text style={styles.value}>{candidate.experienceLevel}</Text></View>
        </View>

        {candidate.skillsQualifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Qualifications</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{candidate.skillsQualifications}</Text>
          </View>
        )}

        {candidate.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{candidate.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Linking Overseas Ltd — BMET RL-2081</Text>
          <Text>Submitted: {fmt(candidate.createdAt)}</Text>
        </View>

      </Page>
    </Document>
  )
}

export function CandidatePDFDownload({ candidate, destinationLabel }: Props) {
  const filename = `candidate-${candidate.name.replace(/\s+/g, '-').toLowerCase()}.pdf`

  return (
    <PDFDownloadLink
      document={<CandidateDocument candidate={candidate} destinationLabel={destinationLabel} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button className="cursor-pointer" disabled={loading}>
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
