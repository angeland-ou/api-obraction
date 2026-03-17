-- DropIndex
DROP INDEX "idx_clients_tenant";

-- DropIndex
DROP INDEX "idx_documents_tenant";

-- DropIndex
DROP INDEX "idx_movements_tenant";

-- DropIndex
DROP INDEX "idx_phones_tenant";

-- DropIndex
DROP INDEX "idx_projects_tenant";

-- DropIndex
DROP INDEX "idx_tasks_tenant";

-- DropIndex
DROP INDEX "idx_tenants_slug";

-- DropIndex
DROP INDEX "idx_users_tenant";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
