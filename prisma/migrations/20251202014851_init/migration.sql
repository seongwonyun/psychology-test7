-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "answers" JSONB NOT NULL,
    "code" TEXT,
    "nickname" TEXT,
    "comment" TEXT,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "dear" TEXT,
    "letter" TEXT,
    "concept" TEXT,
    "movie" TEXT,
    "challengeConcept" TEXT,
    "challengeKeyword" TEXT,
    "challengeActivity" TEXT,
    "maintainConcept" TEXT,
    "maintainKeyword" TEXT,
    "maintainActivity" TEXT,
    "reconcileConcept" TEXT,
    "reconcileKeyword" TEXT,
    "reconcileActivity" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_code_key" ON "Prescription"("code");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_code_fkey" FOREIGN KEY ("code") REFERENCES "Prescription"("code") ON DELETE SET NULL ON UPDATE CASCADE;
