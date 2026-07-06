/*
  Warnings:

  - You are about to drop the column `address` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `cvFileUrl` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Candidate` table. All the data in the column will be lost.
  - Added the required column `desiredPosition` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceLevel` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highestEducation` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportExpiryDate` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportNumber` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportPlaceOfIssue` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentAddress` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER');

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "address",
DROP COLUMN "availability",
DROP COLUMN "cvFileUrl",
DROP COLUMN "experience",
DROP COLUMN "jobType",
DROP COLUMN "skills",
ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "certificateUrls" TEXT[],
ADD COLUMN     "cvResumeUrl" TEXT,
ADD COLUMN     "desiredPosition" TEXT NOT NULL,
ADD COLUMN     "expectedSalary" TEXT,
ADD COLUMN     "experienceLevel" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "highestEducation" TEXT NOT NULL,
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'Bangladeshi',
ADD COLUMN     "passingYear" INTEGER,
ADD COLUMN     "passportCopyUrl" TEXT,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passportIssueDate" TIMESTAMP(3),
ADD COLUMN     "passportNumber" TEXT NOT NULL,
ADD COLUMN     "passportPlaceOfIssue" TEXT NOT NULL,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "presentAddress" TEXT NOT NULL,
ADD COLUMN     "previousEmployer" TEXT,
ADD COLUMN     "religion" "Religion" NOT NULL,
ADD COLUMN     "skillsQualifications" TEXT;
