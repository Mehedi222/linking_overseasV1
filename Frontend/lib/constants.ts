export const DESTINATIONS = [
  { value: 'SAUDI_ARABIA', label: 'Saudi Arabia' },
  { value: 'UAE',          label: 'UAE' },
  { value: 'KUWAIT',       label: 'Kuwait' },
  { value: 'OMAN',         label: 'Oman' },
  { value: 'QATAR',        label: 'Qatar' },
  { value: 'BAHRAIN',      label: 'Bahrain' },
] as const

export const JOB_TYPES = [
  'Construction Worker',
  'Driver',
  'Housemaid',
  'Nurse / Healthcare',
  'Security Guard',
  'Factory Worker',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Welder',
  'Mason',
  'Painter',
  'Cook / Chef',
  'Cleaner',
  'Gardener',
  'Office Staff',
  'Other',
] as const

export const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  PENDING:     'Pending',
  REVIEWING:   'Reviewing',
  SHORTLISTED: 'Shortlisted',
  REJECTED:    'Rejected',
  DEPLOYED:    'Deployed',
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT:     'Draft',
  PUBLISHED: 'Published',
  CLOSED:    'Closed',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED:     'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWED: 'Interviewed',
  SELECTED:    'Selected',
  REJECTED:    'Rejected',
}

export const MILESTONE_LABELS: Record<string, string> = {
  MEDICAL_EXAM_SCHEDULED:    'Medical Exam Scheduled',
  MEDICAL_EXAM_COMPLETED:    'Medical Exam Completed',
  POLICE_CLEARANCE_SUBMITTED: 'Police Clearance Submitted',
  POLICE_CLEARANCE_VERIFIED: 'Police Clearance Verified',
  BMET_CLEARANCE_SUBMITTED:  'BMET Clearance Submitted',
  BMET_CLEARANCE_APPROVED:   'BMET Clearance Approved',
  VISA_SUBMITTED:            'Visa Submitted',
  VISA_APPROVED:             'Visa Approved',
  VISA_STAMPED:              'Visa Stamped',
  FLIGHT_BOOKED:             'Flight Booked',
  DEPARTURE_CONFIRMED:       'Departure Confirmed',
}

// Prerequisite map for the Deployment Milestone Tracker. Each milestone either has no
// prerequisite (null) or a list of milestones that must already be logged first —
// optionally requiring a specific result (e.g. BMET submission needs medical + police
// clearance to have both PASSED, not merely been attempted).
export const MILESTONE_PREREQUISITES: Record<string, Array<{ type: string; requiresResult?: 'PASSED' }> | null> = {
  MEDICAL_EXAM_SCHEDULED: null,
  MEDICAL_EXAM_COMPLETED: [{ type: 'MEDICAL_EXAM_SCHEDULED' }],
  POLICE_CLEARANCE_SUBMITTED: null,
  POLICE_CLEARANCE_VERIFIED: [{ type: 'POLICE_CLEARANCE_SUBMITTED' }],
  BMET_CLEARANCE_SUBMITTED: [
    { type: 'MEDICAL_EXAM_COMPLETED', requiresResult: 'PASSED' },
    { type: 'POLICE_CLEARANCE_VERIFIED', requiresResult: 'PASSED' },
  ],
  BMET_CLEARANCE_APPROVED: [{ type: 'BMET_CLEARANCE_SUBMITTED' }],
  VISA_SUBMITTED: [{ type: 'BMET_CLEARANCE_APPROVED' }],
  VISA_APPROVED: [{ type: 'VISA_SUBMITTED' }],
  VISA_STAMPED: [{ type: 'VISA_APPROVED' }],
  FLIGHT_BOOKED: [{ type: 'VISA_STAMPED' }],
  DEPARTURE_CONFIRMED: [{ type: 'FLIGHT_BOOKED' }],
}

// Milestones that require a PASSED/FAILED result to be recorded alongside them.
export const MILESTONES_REQUIRING_RESULT = ['MEDICAL_EXAM_COMPLETED', 'POLICE_CLEARANCE_VERIFIED']

// Generic status -> Badge variant map, covering every status enum in the app. Unknown
// values default to 'secondary'. Extend this map (don't create a new one) when new
// statuses are added, e.g. for Deployment.status.
export const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  // Candidate
  PENDING:     'secondary',
  REVIEWING:   'default',
  SHORTLISTED: 'default',
  REJECTED:    'destructive',
  DEPLOYED:    'outline',
  // EmployerRequirement
  NEW:         'secondary',
  CONTACTED:   'default',
  CLOSED:      'outline',
  // Job
  DRAFT:       'secondary',
  PUBLISHED:   'default',
  // Application
  APPLIED:     'secondary',
  INTERVIEWED: 'default',
  SELECTED:    'outline',
  // Deployment
  IN_PROGRESS: 'default',
  COMPLETED:   'outline',
  CANCELLED:   'destructive',
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  return STATUS_BADGE_VARIANTS[status] ?? 'secondary'
}

export const COMPANY = {
  name: 'Linking Overseas Ltd',
  shortName: 'Linking Overseas',
  since: '2019',
  license: 'BMET RL-2081',
  phone: '+880 1XXX-XXXXXX',
  phoneAlt: '+880 2XXX-XXXXXX',
  whatsapp: '+880 1XXX-XXXXXX',
  email: 'info@linkingoverseas.com',
  address: '31/C/1, Sample Complex, 7th Floor, Topkhana Road, Dhaka-1000, Bangladesh',
} as const

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/current-overseas-jobs', label: 'Current Jobs' },
  { href: '/hire-workers-from-bangladesh', label: 'Hire Workers' },
  { href: '/curriculum-vitae', label: 'Submit CV' },
  { href: '/our-team', label: 'Our Team' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
] as const

export const SERVICES = [
  {
    title: 'Manpower Recruitment',
    description: 'Overseas recruitment agency support for skilled, semi-skilled and general workers with transparent screening and deployment across multiple sectors.',
    icon: 'Users',
  },
  {
    title: 'Manpower Training',
    description: 'Practical job-skills training and orientation to prepare workers for overseas employment requirements before deployment.',
    icon: 'GraduationCap',
  },
  {
    title: 'Housemaid Recruitment',
    description: 'Housemaid and domestic worker recruitment support with compliant processing and transparent employer coordination.',
    icon: 'Home',
  },
  {
    title: 'Visa Processing',
    description: 'Work visa application, processing and documentation support to ensure smooth and hassle-free international transitions.',
    icon: 'FileCheck',
  },
  {
    title: 'BMET Clearance',
    description: 'Efficient BMET clearance services ensuring all legal requirements and documentation are properly handled before departure.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Air Ticket',
    description: 'Flight booking and travel coordination aligned with visa confirmation, insurance and final compliance processing.',
    icon: 'Plane',
  },
] as const

export const RECRUITMENT_STEPS = [
  { step: '01', title: 'Requirement Analysis', description: 'Understanding client needs and job details', icon: 'ClipboardCheck' },
  { step: '02', title: 'Candidate Sourcing & Screening', description: 'Identifying and evaluating potential candidates', icon: 'Search' },
  { step: '03', title: 'Interview & Final Selection', description: 'Conducting interviews and making selections', icon: 'Users' },
  { step: '04', title: 'Documentation & Visa Processing', description: 'Handling documentation and legal formalities', icon: 'FileText' },
  { step: '05', title: 'Training, Deployment & Follow-Up', description: 'Preparing candidates for deployment and integration', icon: 'Plane' },
] as const

export const TRUST_POINTS = [
  { title: 'BMET Licensed', description: 'Government approved manpower recruiting licence (RL-2081) for compliant overseas recruitment.', icon: 'ShieldCheck' },
  { title: 'BAIRA Listing', description: 'Verify our agency information via the official BAIRA directory for added credibility and trust.', icon: 'BadgeCheck' },
  { title: 'Dhaka Coordination Office', description: 'Direct employer communication, documentation coordination and transparent recruitment updates.', icon: 'Building2' },
  { title: 'Screening & Training', description: 'Shortlisting, skills verification and job-ready preparation aligned with destination standards.', icon: 'UserCheck' },
  { title: 'Documentation & Visa', description: 'Structured paperwork and visa guidance to keep deployments legal and smooth.', icon: 'FileCheck' },
  { title: 'BMET Support', description: 'Coordination support for BMET clearance requirements and ethical recruitment compliance.', icon: 'ShieldCheck' },
  { title: 'Hire Workers', description: 'Send your manpower requirement for skilled, semi-skilled or domestic worker hiring from Bangladesh.', icon: 'Users' },
  { title: 'WhatsApp Employer Desk', description: 'Fast coordination for hiring demand, worker categories and deployment timelines.', icon: 'MessageCircle' },
  { title: 'Call Employer Desk', description: 'Direct call support for employer inquiries.', icon: 'Phone' },
  { title: 'Company Profile', description: 'Review our background, licensing, recruitment strengths and company information.', icon: 'FileText' },
] as const

export const TOP_COUNTRIES = [
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'UAE', flag: '🇦🇪' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Lebanon', flag: '🇱🇧' },
  { name: 'Bahrain', flag: '🇧🇭' },
] as const

export const DESTINATION_LABELS: Record<string, string> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.value, d.label])
)

export const SERVICE_TYPES = [
  'Manpower Recruitment',
  'Manpower Training',
  'Housemaid Recruitment',
  'Visa Processing',
  'BMET Clearance',
  'Air Ticket',
] as const

export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
] as const

export const MARITAL_STATUSES = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
] as const

export const RELIGIONS = [
  { value: 'ISLAM', label: 'Islam' },
  { value: 'HINDUISM', label: 'Hinduism' },
  { value: 'CHRISTIANITY', label: 'Christianity' },
  { value: 'BUDDHISM', label: 'Buddhism' },
  { value: 'OTHER', label: 'Other' },
] as const

export const EDUCATION_LEVELS = [
  'Below SSC',
  'SSC / Secondary',
  'HSC / Higher Secondary',
  "Bachelor's Degree",
  "Master's Degree",
  'Vocational / Technical',
  'Other',
] as const

export const EXPERIENCE_LEVELS = [
  'No Experience',
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
] as const

export const TEAM_ROLES = [
  { title: 'Chairman', description: 'Sets the company’s overall direction and governance.' },
  { title: 'Managing Director', description: 'Oversees company operations and strategic direction.' },
  { title: 'Director', description: 'Leads employer relations and destination-country coordination.' },
  { title: 'CEO', description: 'Responsible for day-to-day management and business growth.' },
  { title: 'General Manager', description: 'Coordinates recruitment, training and deployment teams.' },
  { title: 'Accounts Manager', description: 'Manages agency finances, invoicing and payroll.' },
  { title: 'Embassy Representative', description: 'Liaises with embassies for visa and documentation matters.' },
  { title: 'IT Officer', description: 'Maintains the agency’s systems, records and online platforms.' },
  { title: 'Reservation Officer', description: 'Handles flight bookings and travel arrangements for candidates.' },
  { title: 'Communicator', description: 'Coordinates communication between candidates and employers.' },
] as const

export const CV_FORM_SECTIONS = [
  { id: 'personal', label: 'Personal' },
  { id: 'contact', label: 'Contact' },
  { id: 'passport', label: 'Passport' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'documents', label: 'Documents' },
  { id: 'additional', label: 'Additional' },
] as const

export const TESTIMONIALS = [
  {
    name: 'Rahim',
    destination: 'Deployed to Saudi Arabia',
    quote:
      'Linking Overseas kept me updated at every step — medical, BMET clearance, visa. I always knew what was happening with my application.',
  },
  {
    name: 'Karim',
    destination: 'Deployed to UAE',
    quote:
      'The process felt safe and transparent from the start. No hidden surprises, and the team answered every question I had.',
  },
  {
    name: 'Salma',
    destination: 'Deployed to Qatar',
    quote:
      'I was nervous about going abroad for the first time, but the coordination team explained everything clearly before I left.',
  },
  {
    name: 'Jamal',
    destination: 'Deployed to Kuwait',
    quote:
      'From CV submission to departure, everything was handled professionally. I would recommend Linking Overseas to anyone.',
  },
] as const

export const EMPLOYER_LOGOS = [
  { name: 'Al Faisal General Contracting Co.', logoUrl: '' },
  { name: 'Doha Hospitality Group', logoUrl: '' },
  { name: 'Emirates Build & Develop LLC', logoUrl: '' },
  { name: 'Gulf Logistics & Transport Co.', logoUrl: '' },
  { name: 'Muscat Facilities Management', logoUrl: '' },
  { name: 'Bahrain Shield Security Services', logoUrl: '' },
] as const

export const FAQS = [
  {
    question: 'Can overseas employers hire workers from Bangladesh through Linking Overseas Ltd?',
    answer: 'Yes. We are a BMET RL-2081 licensed recruiting agency supporting overseas employers with skilled, semi-skilled, and domestic worker recruitment from Bangladesh.',
  },
  {
    question: 'What categories of workers do you supply?',
    answer: 'We supply skilled manpower, semi-skilled and general workers, and domestic/housemaid workers across construction, manufacturing, hospitality, healthcare, and household services.',
  },
  {
    question: 'Do you support Middle East recruitment?',
    answer: 'Yes. We actively recruit and deploy workers to Saudi Arabia, UAE, Qatar, Kuwait, Oman, Bahrain and other GCC destinations.',
  },
  {
    question: 'What is the demand letter process?',
    answer: 'Share your workforce requirement (quantity, job category, salary, duty details, destination) via our Hire Workers form. Our team reviews the demand, prepares sourcing, shortlists candidates and coordinates next steps.',
  },
  {
    question: 'Do you support visa processing and BMET clearance after recruitment?',
    answer: 'Yes, we manage the entire deployment workflow — from candidate screening through visa processing, BMET clearance, and travel readiness.',
  },
] as const
