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
