-- Create enum type for user roles
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- Add role column to users table
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Add totalCallDuration column to users table
ALTER TABLE "users" ADD COLUMN "totalCallDuration" INTEGER NOT NULL DEFAULT 0;

-- Create index on role for faster queries
CREATE INDEX "users_role_idx" ON "users"("role");

-- Optional: Create a default admin user
-- UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'admin@flexcalling.com';