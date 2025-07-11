ALTER TABLE "vault_messages" RENAME COLUMN "workspace_id" TO "vault_id";--> statement-breakpoint
ALTER TABLE "vault_workflows" RENAME COLUMN "workspace_id" TO "vault_id";--> statement-breakpoint
ALTER TABLE "vault_messages" DROP CONSTRAINT "vault_messages_workspace_id_vault_id_fk";
--> statement-breakpoint
ALTER TABLE "vault_workflows" DROP CONSTRAINT "vault_workflows_workspace_id_vault_id_fk";
--> statement-breakpoint
ALTER TABLE "vault_messages" ADD CONSTRAINT "vault_messages_vault_id_vault_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vault"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_workflows" ADD CONSTRAINT "vault_workflows_vault_id_vault_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vault"("id") ON DELETE cascade ON UPDATE no action;