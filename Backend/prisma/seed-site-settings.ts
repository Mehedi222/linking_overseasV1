import 'dotenv/config'
import { prisma } from '../src/app/lib/prisma'

async function main() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) {
    console.log('SiteSettings already seeded:', existing.id)
    return
  }

  const settings = await prisma.siteSettings.create({
    data: {
      companyName: 'Linking Overseas Ltd',
      shortName: 'Linking Overseas',
      since: '2019',
      license: 'BMET RL-2081',
      description:
        'BMET RL-2081 licensed overseas recruitment agency in Bangladesh. We support skilled manpower recruitment, housemaid recruitment, visa processing and BMET clearance with ethical, transparent and dependable service.',
      phone: '+880 1XXX-XXXXXX',
      phoneAlt: '+880 2XXX-XXXXXX',
      whatsapp: '+880 1XXX-XXXXXX',
      email: 'info@linkingoverseas.com',
      address: '31/C/1, Sample Complex, 7th Floor, Topkhana Road, Dhaka-1000, Bangladesh',
    },
  })

  console.log('Seeded SiteSettings:', settings.id)
}

main()
  .catch((error) => {
    console.error('[seed-site-settings]', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
