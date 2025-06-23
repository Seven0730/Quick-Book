-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "acceptedById" INTEGER;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
