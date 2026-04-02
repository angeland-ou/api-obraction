-- Add extension uuid-ossp if not exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'standard_user');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('pending', 'in_progress', 'blocked', 'done');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'done');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('income', 'expense');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "nif" VARCHAR(50),
    "email" VARCHAR(254),
    "address" VARCHAR(500),
    "website" VARCHAR(500),
    "phone1" VARCHAR(30),
    "phone2" VARCHAR(30),
    "logo_path" VARCHAR(500),
    "primary_color" CHAR(7),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

COMMENT ON COLUMN "tenants"."description" IS 'Company description';

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'standard_user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "nif" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "activation_token" VARCHAR(100),
    "activation_sent_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255),
    "email" VARCHAR(254),
    "nif" VARCHAR(50),
    "notes" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProjectStatus" NOT NULL DEFAULT 'pending',
    "name" VARCHAR(255),
    "address" VARCHAR(500),
    "lat" DECIMAL(10,7),
    "long" DECIMAL(10,7),
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" VARCHAR(100),
    "number" VARCHAR(25),
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "due_date" DATE,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "project_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movement_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "amount" DECIMAL(15,2) NOT NULL,
    "iva" DECIMAL(5,2) NOT NULL,
    "iva_amount" DECIMAL(15,2) GENERATED ALWAYS AS (amount * iva / 100) STORED,
    "total" DECIMAL(15,2) GENERATED ALWAYS AS (amount + (amount * iva / 100)) STORED,
    "type" "MovementType" NOT NULL,
    "concept" VARCHAR(500),
    "notes" TEXT,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "check_movements_amount" CHECK (amount > 0),
    CONSTRAINT "chk_movements_iva" CHECK (iva >= 0 AND iva <= 100)
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "project_id" UUID,
    "movement_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mime_type" VARCHAR(100) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_documents_single_parent" CHECK (
        (project_id IS NOT NULL AND movement_id IS NULL) OR
        (project_id IS NULL AND movement_id IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_nif_key" ON "tenants"("nif");
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_tenant_id_nif_key" ON "users"("tenant_id", "nif");
CREATE UNIQUE INDEX "clients_tenant_id_email_key" ON "clients"("tenant_id", "email");
CREATE UNIQUE INDEX "clients_tenant_id_nif_key" ON "clients"("tenant_id", "nif");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "phones" ADD CONSTRAINT "phones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "phones" ADD CONSTRAINT "phones_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "phones" ADD CONSTRAINT "phones_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movements" ADD CONSTRAINT "movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movements" ADD CONSTRAINT "movements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "movements" ADD CONSTRAINT "movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Performance indexes
CREATE INDEX idx_users_tenant     ON "users"("tenant_id");
CREATE INDEX idx_projects_tenant  ON "projects"("tenant_id");
CREATE INDEX idx_tasks_tenant     ON "tasks"("tenant_id");
CREATE INDEX idx_movements_tenant ON "movements"("tenant_id");
CREATE INDEX idx_documents_tenant ON "documents"("tenant_id");
CREATE INDEX idx_clients_tenant   ON "clients"("tenant_id");
CREATE INDEX idx_phones_tenant    ON "phones"("tenant_id");
CREATE INDEX idx_tenants_slug     ON "tenants"("slug");

-- Row Level Security
ALTER TABLE "tenants"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "phones"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security
ALTER TABLE "tenants"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "users"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "clients"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "projects"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "phones"    FORCE ROW LEVEL SECURITY;
ALTER TABLE "tasks"     FORCE ROW LEVEL SECURITY;
ALTER TABLE "movements" FORCE ROW LEVEL SECURITY;
ALTER TABLE "documents" FORCE ROW LEVEL SECURITY;

-- Policies tenant isolation
CREATE POLICY tenant_isolation ON "tenants"   USING (id = current_setting('app.tenant_id')::UUID) WITH CHECK (id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "users"     USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "clients"   USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "projects"  USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "phones"    USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "tasks"     USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "movements" USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);
CREATE POLICY tenant_isolation ON "documents" USING (tenant_id = current_setting('app.tenant_id')::UUID) WITH CHECK (tenant_id = current_setting('app.tenant_id')::UUID);

-- Policies soft delete
CREATE POLICY soft_delete_filter ON "tenants"   USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "users"     USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "clients"   USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "projects"  USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "phones"    USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "tasks"     USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "movements" USING (deleted_at IS NULL);
CREATE POLICY soft_delete_filter ON "documents" USING (deleted_at IS NULL);

-- Views finance tenant
-- Ingresos del tenant
CREATE VIEW v_tenant_income WITH (security_invoker = true) AS
SELECT
    tenant_id,
    COUNT(*)        AS total_operations,
    SUM(amount)     AS total_amount,
    SUM(iva_amount) AS total_iva,
    SUM(total)      AS total_with_iva
FROM movements
WHERE type = 'income'
  AND deleted_at IS NULL
GROUP BY tenant_id;

-- Gastos del tenant
CREATE VIEW v_tenant_expenses WITH (security_invoker = true) AS
SELECT
    tenant_id,
    COUNT(*)        AS total_operations,
    SUM(amount)     AS total_amount,
    SUM(iva_amount) AS total_iva,
    SUM(total)      AS total_with_iva
FROM movements
WHERE type = 'expense'
  AND deleted_at IS NULL
GROUP BY tenant_id;

-- Balance general del tenant
CREATE VIEW v_tenant_balance WITH (security_invoker = true) AS
SELECT
    tenant_id,
    SUM(CASE WHEN type = 'income'  THEN total ELSE 0 END)      AS total_income,
    SUM(CASE WHEN type = 'expense' THEN total ELSE 0 END)      AS total_expenses,
    SUM(CASE WHEN type = 'income'  THEN total ELSE -total END) AS balance
FROM movements
WHERE deleted_at IS NULL
GROUP BY tenant_id;

-- Views finance project
-- Ingresos por proyecto
CREATE VIEW v_project_income WITH (security_invoker = true) AS
SELECT
    tenant_id,
    project_id,
    COUNT(*)        AS total_operations,
    SUM(amount)     AS total_amount,
    SUM(iva_amount) AS total_iva,
    SUM(total)      AS total_with_iva
FROM movements
WHERE type = 'income'
  AND project_id IS NOT NULL
  AND deleted_at IS NULL
GROUP BY tenant_id, project_id;

-- Gastos por proyecto
CREATE VIEW v_project_expenses WITH (security_invoker = true) AS
SELECT
    tenant_id,
    project_id,
    COUNT(*)        AS total_operations,
    SUM(amount)     AS total_amount,
    SUM(iva_amount) AS total_iva,
    SUM(total)      AS total_with_iva
FROM movements
WHERE type = 'expense'
  AND project_id IS NOT NULL
  AND deleted_at IS NULL
GROUP BY tenant_id, project_id;

-- Balance por proyecto
CREATE VIEW v_project_balance WITH (security_invoker = true) AS
SELECT
    tenant_id,
    project_id,
    SUM(CASE WHEN type = 'income'  THEN total ELSE 0 END)      AS total_income,
    SUM(CASE WHEN type = 'expense' THEN total ELSE 0 END)      AS total_expenses,
    SUM(CASE WHEN type = 'income'  THEN total ELSE -total END) AS balance
FROM movements
WHERE project_id IS NOT NULL
  AND deleted_at IS NULL
GROUP BY tenant_id, project_id;

-- NOTA: security_invoker = true requiere PostgreSQL 15+