-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'DEPLOYED');

-- CreateEnum
CREATE TYPE "Destination" AS ENUM ('SAUDI_ARABIA', 'UAE', 'KUWAIT', 'OMAN', 'QATAR', 'BAHRAIN');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "destination" "Destination" NOT NULL,
    "jobType" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "skills" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "availability" TIMESTAMP(3) NOT NULL,
    "cvFileUrl" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);
