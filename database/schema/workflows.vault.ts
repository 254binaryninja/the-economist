import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { randomUUID } from "node:crypto";
import { z } from "zod"
import { vault } from "./vault";


// Vault workflows
export const vaultWorkflows = p.pgTable('vault_workflows',{
    id:p.uuid('id').notNull().unique().primaryKey().$defaultFn(()=>randomUUID()),
    vault_id:p.uuid('vault_id').notNull().references(()=>vault.id,{onDelete:'cascade'}),
    role:p.text({ enum: ['user', 'assistant'] }).notNull(),
    content:p.jsonb('content').notNull(),
    feedback:p.text('feedback'),
    created_at:p.timestamp('created_at',{ withTimezone: true }).defaultNow(),
})

// Vault workflows relations
export const vaultWorkflowsRelations = relations(vaultWorkflows,({one})=>({
    vault:one(vault,{
        fields:[vaultWorkflows.vault_id],
        references:[vault.id]
    })
}))