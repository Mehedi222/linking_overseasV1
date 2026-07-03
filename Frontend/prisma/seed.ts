import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { Destination, JobStatus } from '../lib/generated/prisma/client'

const EMPLOYERS: Array<{
  key: string
  companyName: string
  contactName: string
  phone: string
  email: string
  country: string
  city: string
  businessType: string
}> = [
  {
    key: 'saudi-general-contracting',
    companyName: 'Al Faisal General Contracting Co.',
    contactName: 'Yousef Al Faisal',
    phone: '+966 50 123 4567',
    email: 'hr@alfaisalcontracting.example.com',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    businessType: 'Construction & Facilities',
  },
  {
    key: 'qatar-hospitality-group',
    companyName: 'Doha Hospitality Group',
    contactName: 'Fatima Al Kuwari',
    phone: '+974 5012 3456',
    email: 'careers@dohahospitality.example.com',
    country: 'Qatar',
    city: 'Doha',
    businessType: 'Hospitality & Food Service',
  },
  {
    key: 'uae-construction',
    companyName: 'Emirates Build & Develop LLC',
    contactName: 'Ahmed Al Suwaidi',
    phone: '+971 50 123 4567',
    email: 'recruitment@emiratesbuild.example.com',
    country: 'UAE',
    city: 'Dubai',
    businessType: 'Construction',
  },
  {
    key: 'kuwait-logistics',
    companyName: 'Gulf Logistics & Transport Co.',
    contactName: 'Mohammed Al Sabah',
    phone: '+965 5012 3456',
    email: 'hr@gulflogistics.example.com',
    country: 'Kuwait',
    city: 'Kuwait City',
    businessType: 'Logistics & Transport',
  },
  {
    key: 'oman-facilities',
    companyName: 'Muscat Facilities Management',
    contactName: 'Salim Al Habsi',
    phone: '+968 9012 3456',
    email: 'jobs@muscatfm.example.com',
    country: 'Oman',
    city: 'Muscat',
    businessType: 'Facilities Management',
  },
  {
    key: 'bahrain-security',
    companyName: 'Bahrain Shield Security Services',
    contactName: 'Khalid Al Khalifa',
    phone: '+973 3612 3456',
    email: 'hr@bahrainshield.example.com',
    country: 'Bahrain',
    city: 'Manama',
    businessType: 'Security Services',
  },
]

const JOBS: Array<{
  title: string
  jobType: string
  destination: Destination
  salaryText: string
  contractYears: number
  positions: number
  ageMin: number
  ageMax: number
  requirements: string
  slug: string
  employerKey: string
}> = [
  {
    title: 'Free Visa — General Worker',
    jobType: 'Factory Worker',
    destination: Destination.SAUDI_ARABIA,
    salaryText: 'SAR 1,400/month',
    contractYears: 2,
    positions: 100,
    ageMin: 20,
    ageMax: 45,
    requirements: 'Age 20-45 years\n2+ years experience\nPhysically fit and healthy',
    slug: 'free-visa-general-worker-saudi-arabia',
    employerKey: 'saudi-general-contracting',
  },
  {
    title: 'Restaurant Worker',
    jobType: 'Cook / Chef',
    destination: Destination.QATAR,
    salaryText: 'QAR 1,500-1,800/month',
    contractYears: 2,
    positions: 25,
    ageMin: 21,
    ageMax: 40,
    requirements: 'Age 21-40 years\nExperience in restaurant/hospitality\nBasic English preferred',
    slug: 'restaurant-worker-qatar',
    employerKey: 'qatar-hospitality-group',
  },
  {
    title: 'Housemaid',
    jobType: 'Housemaid',
    destination: Destination.SAUDI_ARABIA,
    salaryText: 'SAR 1,400-1,600/month',
    contractYears: 2,
    positions: 100,
    ageMin: 22,
    ageMax: 45,
    requirements: 'Age 22-45 years\nExperience in household work preferred\nPhysically fit and healthy',
    slug: 'housemaid-saudi-arabia',
    employerKey: 'saudi-general-contracting',
  },
  {
    title: 'Construction Worker',
    jobType: 'Mason',
    destination: Destination.UAE,
    salaryText: 'AED 1,400-1,600/month',
    contractYears: 2,
    positions: 50,
    ageMin: 20,
    ageMax: 45,
    requirements: 'Age 20-45 years\n2+ years experience in construction\nPhysically fit and healthy',
    slug: 'construction-worker-uae',
    employerKey: 'uae-construction',
  },
  {
    title: 'Heavy Vehicle Driver',
    jobType: 'Driver',
    destination: Destination.KUWAIT,
    salaryText: 'KWD 180-220/month',
    contractYears: 2,
    positions: 15,
    ageMin: 25,
    ageMax: 45,
    requirements: 'Valid heavy vehicle license\n3+ years driving experience\nClean driving record',
    slug: 'heavy-vehicle-driver-kuwait',
    employerKey: 'kuwait-logistics',
  },
  {
    title: 'Office & Facility Cleaner',
    jobType: 'Cleaner',
    destination: Destination.OMAN,
    salaryText: 'OMR 120-150/month',
    contractYears: 2,
    positions: 30,
    ageMin: 20,
    ageMax: 45,
    requirements: 'Age 20-45 years\nPrior cleaning experience preferred\nPhysically fit',
    slug: 'office-facility-cleaner-oman',
    employerKey: 'oman-facilities',
  },
  {
    title: 'Security Guard',
    jobType: 'Security Guard',
    destination: Destination.BAHRAIN,
    salaryText: 'BHD 130-160/month',
    contractYears: 2,
    positions: 20,
    ageMin: 22,
    ageMax: 45,
    requirements: 'Age 22-45 years\nPrior security experience preferred\nGood physical fitness',
    slug: 'security-guard-bahrain',
    employerKey: 'bahrain-security',
  },
  {
    title: 'Electrician',
    jobType: 'Electrician',
    destination: Destination.QATAR,
    salaryText: 'QAR 1,800-2,200/month',
    contractYears: 2,
    positions: 12,
    ageMin: 22,
    ageMax: 45,
    requirements: 'Trade certificate preferred\n3+ years experience\nPhysically fit and healthy',
    slug: 'electrician-qatar',
    employerKey: 'qatar-hospitality-group',
  },
]

async function main() {
  const employerIdByKey = new Map<string, string>()

  for (const employer of EMPLOYERS) {
    const { key, ...data } = employer
    // Employer has no natural unique key besides id, so find-or-create by companyName for idempotent reseeding.
    const existing = await prisma.employer.findFirst({ where: { companyName: data.companyName } })
    const record = existing
      ? await prisma.employer.update({ where: { id: existing.id }, data })
      : await prisma.employer.create({ data })
    employerIdByKey.set(key, record.id)
  }

  for (const job of JOBS) {
    const { employerKey, ...jobData } = job
    const employerId = employerIdByKey.get(employerKey)
    if (!employerId) throw new Error(`No seeded employer found for key "${employerKey}"`)

    await prisma.job.upsert({
      where: { slug: job.slug },
      update: { ...jobData, employerId, status: JobStatus.PUBLISHED },
      create: { ...jobData, employerId, status: JobStatus.PUBLISHED },
    })
  }
  console.log(`Seeded ${EMPLOYERS.length} employers and ${JOBS.length} jobs.`)
}

main()
  .catch((error) => {
    console.error('[seed]', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
