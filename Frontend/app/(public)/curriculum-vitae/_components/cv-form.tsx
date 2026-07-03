'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { cvSubmissionSchema, type CVSubmissionValues } from '@/lib/validations'
import {
  DESTINATIONS,
  GENDERS,
  MARITAL_STATUSES,
  RELIGIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
} from '@/lib/constants'
import { submitCV } from '@/services/candidate.services'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { FileUploadField } from '@/components/file-upload-field'
import { User, Phone, IdCard, GraduationCap, Briefcase, Globe, FileUp, Info } from 'lucide-react'

function SectionHeading({ id, icon: Icon, title }: { id: string; icon: typeof User; title: string }) {
  return (
    <div id={id} className="flex scroll-mt-28 items-center gap-2 pt-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-orange-500/10 text-orange-500">
        <Icon className="size-4" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  )
}

export function CVForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<CVSubmissionValues>({
    resolver: zodResolver(cvSubmissionSchema),
    defaultValues: {
      name: '', fatherName: '', motherName: '', dateOfBirth: '',
      gender: undefined, maritalStatus: undefined, nationality: 'Bangladeshi', religion: undefined,
      phone: '+880', email: '', presentAddress: '', permanentAddress: '',
      passportNumber: '', passportIssueDate: '', passportExpiryDate: '', passportPlaceOfIssue: '',
      highestEducation: '', passingYear: '',
      desiredPosition: '', experienceLevel: '', skillsQualifications: '', previousEmployer: '',
      destination: undefined, expectedSalary: '',
      cvResumeUrl: '', photoUrl: '', passportCopyUrl: '', certificateUrls: [],
      additionalInfo: '', agreedToTerms: false,
    },
  })

  async function onSubmit(values: CVSubmissionValues) {
    setError('')
    try {
      await submitCV(values)
      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <CardContent className="space-y-3 pt-6">
          <div className="text-4xl">✓</div>
          <h2 className="text-xl font-semibold">CV Submitted Successfully!</h2>
          <p className="text-muted-foreground">
            Thank you. Our team will review your application and contact you shortly.
          </p>
          <Button className="cursor-pointer mt-4" onClick={() => setSubmitted(false)}>
            Submit Another CV
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardContent className="pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Information */}
            <SectionHeading id="personal" icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Father&apos;s Name *</FormLabel>
                  <FormControl><Input placeholder="Father's Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="motherName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother&apos;s Name</FormLabel>
                  <FormControl><Input placeholder="Mother's Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value} className="cursor-pointer">{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Status" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARITAL_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="cursor-pointer">{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="nationality" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality *</FormLabel>
                  <FormControl><Input placeholder="Bangladeshi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="religion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Religion" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="cursor-pointer">{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Contact Information */}
            <SectionHeading id="contact" icon={Phone} title="Contact Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number *</FormLabel>
                  <FormControl><Input placeholder="+880" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="presentAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Present Address *</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="permanentAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Permanent Address</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Separator />

            {/* Passport Information */}
            <SectionHeading id="passport" icon={IdCard} title="Passport Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="passportNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Number *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="passportIssueDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="passportExpiryDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="passportPlaceOfIssue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Place of Issue *</FormLabel>
                  <FormControl><Input placeholder="e.g. Dhaka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Educational Qualification */}
            <SectionHeading id="education" icon={GraduationCap} title="Educational Qualification" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="highestEducation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Education *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Education Level" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e} value={e} className="cursor-pointer">{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="passingYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Year</FormLabel>
                  <FormControl><Input placeholder="e.g. 2020" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Work Experience */}
            <SectionHeading id="experience" icon={Briefcase} title="Work Experience" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="desiredPosition" render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Position *</FormLabel>
                  <FormControl><Input placeholder="e.g., Construction Worker, Driver, Chef" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Experience" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((e) => (
                        <SelectItem key={e} value={e} className="cursor-pointer">{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="skillsQualifications" render={({ field }) => (
              <FormItem>
                <FormLabel>Skills &amp; Qualifications</FormLabel>
                <FormControl><Textarea placeholder="List your relevant skills and qualifications" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previousEmployer" render={({ field }) => (
              <FormItem>
                <FormLabel>Previous Employer (If any)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Separator />

            {/* Job Preferences */}
            <SectionHeading id="preferences" icon={Globe} title="Job Preferences" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="destination" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Country *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value} className="cursor-pointer">{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="expectedSalary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Salary (Monthly)</FormLabel>
                  <FormControl><Input placeholder="e.g., 30,000 BDT" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Upload Documents */}
            <SectionHeading id="documents" icon={FileUp} title="Upload Documents" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField control={form.control} name="cvResumeUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload CV/Resume</FormLabel>
                  <FormControl>
                    <FileUploadField
                      endpoint="cvResume"
                      accept=".pdf,.doc,.docx"
                      maxSizeMB={4}
                      hint="Accepted formats: PDF, DOC, DOCX (Max 4MB)"
                      value={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] ?? '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Photo</FormLabel>
                  <FormControl>
                    <FileUploadField
                      endpoint="candidatePhoto"
                      accept="image/*"
                      maxSizeMB={2}
                      hint="Passport size photo (Max 2MB)"
                      value={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] ?? '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField control={form.control} name="passportCopyUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Passport Copy</FormLabel>
                  <FormControl>
                    <FileUploadField
                      endpoint="passportCopy"
                      accept=".pdf,image/*"
                      maxSizeMB={4}
                      hint="PDF or Image (Max 4MB)"
                      value={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] ?? '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="certificateUrls" render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificates (If any)</FormLabel>
                  <FormControl>
                    <FileUploadField
                      endpoint="certificates"
                      accept=".pdf,image/*"
                      maxSizeMB={4}
                      multiple
                      hint="Multiple files allowed (Max 4MB each)"
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Additional Information */}
            <SectionHeading id="additional" icon={Info} title="Additional Information" />
            <FormField control={form.control} name="additionalInfo" render={({ field }) => (
              <FormItem>
                <FormLabel>Any Additional Information</FormLabel>
                <FormControl><Textarea placeholder="Please provide any additional information that might be relevant" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="agreedToTerms" render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    I agree that all the information provided is true and accurate *
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="w-full cursor-pointer" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer sm:w-40"
                onClick={() => form.reset()}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
