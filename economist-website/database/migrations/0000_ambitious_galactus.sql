CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT auth.jwt()->>'sub' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"occupation" text NOT NULL,
	"verbosity" text,
	"style" text,
	"student" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vault" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"user_id" text NOT NULL,
	"is_public" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vault_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "vault_documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"vault_id" uuid NOT NULL,
	"document_name" text NOT NULL,
	"document_size" text,
	"document_metadata" text,
	"document_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vault_documents_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "vault_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vault_messages_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "vault_workflows" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" jsonb NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "vault_workflows_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "workspaces_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "workspace_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "workspace_messages_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "vault_documents" ADD CONSTRAINT "vault_documents_vault_id_vault_id_fk" FOREIGN KEY ("vault_id") REFERENCES "public"."vault"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_messages" ADD CONSTRAINT "vault_messages_workspace_id_vault_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."vault"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vault_workflows" ADD CONSTRAINT "vault_workflows_workspace_id_vault_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."vault"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_messages" ADD CONSTRAINT "workspace_messages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;