import { z } from 'zod'

export const cvSubmissionSchema = z.object({
  // Personal Information
  name:          z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName:    z.string().min(2, "Father's name is required"),
  motherName:    z.string().optional(),
  dateOfBirth:   z.string().min(1, 'Date of birth is required'),
  gender:        z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Select a gender' }),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], { message: 'Select a marital status' }),
  nationality:   z.string().min(2, 'Nationality is required'),
  religion:      z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER'], { message: 'Select a religion' }),

  // Contact Information
  phone:            z.string().min(10, 'Enter a valid phone number'),
  email:            z.string().email('Enter a valid email address'),
  presentAddress:   z.string().min(5, 'Enter your present address'),
  permanentAddress: z.string().optional(),

  // Passport Information
  passportNumber:       z.string().min(3, 'Passport number is required'),
  passportIssueDate:    z.string().optional(),
  passportExpiryDate:   z.string().min(1, 'Passport expiry date is required'),
  passportPlaceOfIssue: z.string().min(2, 'Place of issue is required'),

  // Educational Qualification
  highestEducation: z.string().min(1, 'Select your highest education level'),
  passingYear:      z.string().optional(),

  // Work Experience
  desiredPosition:      z.string().min(2, 'Desired position is required'),
  experienceLevel:      z.string().min(1, 'Select your years of experience'),
  skillsQualifications: z.string().optional(),
  previousEmployer:     z.string().optional(),

  // Job Preferences
  destination: z.enum(['SAUDI_ARABIA', 'UAE', 'KUWAIT', 'OMAN', 'QATAR', 'BAHRAIN'], {
    message: 'Select a preferred country',
  }),
  expectedSalary: z.string().optional(),

  // Upload Documents
  cvResumeUrl:     z.string().optional(),
  photoUrl:        z.string().optional(),
  passportCopyUrl: z.string().optional(),
  certificateUrls: z.array(z.string()).optional(),

  // Additional Information
  additionalInfo: z.string().optional(),
  agreedToTerms:  z.boolean().refine((v) => v === true, {
    message: 'You must confirm that the information provided is true and accurate',
  }),
})

export type CVSubmissionValues = z.infer<typeof cvSubmissionSchema>

export const employerRequirementSchema = z.object({
  fullName:       z.string().min(2, 'Full name must be at least 2 characters'),
  phone:          z.string().min(10, 'Enter a valid phone number'),
  email:          z.string().email('Enter a valid email address'),
  companyName:    z.string().min(2, 'Company / business name is required'),
  country:        z.string().min(2, 'Country is required'),
  city:           z.string().min(2, 'City is required'),
  businessType:   z.string().min(2, 'Business type is required'),
  serviceType:    z.string().min(1, 'Select a service type'),
  workerType:     z.string().min(2, 'Type of workers needed is required'),
  quantity:       z.string().min(1, 'Required quantity is required'),
  hiringTimeline: z.string().min(2, 'Expected hiring timeline is required'),
  description:    z.string().optional(),
})

export type EmployerRequirementValues = z.infer<typeof employerRequirementSchema>

export const employerSchema = z.object({
  companyName:  z.string().min(2, 'Company name is required'),
  contactName:  z.string().min(2, 'Contact name is required'),
  phone:        z.string().min(6, 'Enter a valid phone number'),
  email:        z.string().email('Enter a valid email address'),
  country:      z.string().min(2, 'Country is required'),
  city:         z.string().min(2, 'City is required'),
  businessType: z.string().min(2, 'Business type is required'),
  notes:        z.string().optional(),
})

export type EmployerValues = z.infer<typeof employerSchema>

export const jobSchema = z.object({
  title:         z.string().min(2, 'Title is required'),
  jobType:       z.string().min(1, 'Job type is required'),
  destination:   z.enum(['SAUDI_ARABIA', 'UAE', 'KUWAIT', 'OMAN', 'QATAR', 'BAHRAIN'], {
    message: 'Select a destination',
  }),
  salaryText:    z.string().min(1, 'Salary is required'),
  contractYears: z.string().min(1, 'Contract years is required'),
  positions:     z.string().min(1, 'Positions is required'),
  ageMin:        z.string().min(1, 'Minimum age is required'),
  ageMax:        z.string().min(1, 'Maximum age is required'),
  requirements:  z.string().min(1, 'Requirements are required'),
  employerId:    z.string().min(1, 'Select an employer'),
})

export type JobValues = z.infer<typeof jobSchema>

export const contactMessageSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Enter a valid email address'),
  phone:   z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactMessageValues = z.infer<typeof contactMessageSchema>
