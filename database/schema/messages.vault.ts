import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { randomUUID } from "node:crypto";
import { z } from "zod"
import { vault } from "./vault";


// Vault AI messages 
export const vaultMessages = p.pgTable('vault_messages',{
    id:p.uuid('id').notNull().unique().primaryKey().$defaultFn(()=>randomUUID()),
    vault_id:p.uuid('vault_id').notNull().references(()=>vault.id,{onDelete:'cascade'}),
    role:p.text({ enum: ['user', 'assistant'] }).notNull(),
    content:p.text('content').notNull(),
    created_at:p.timestamp('created_at',{ withTimezone: true }).defaultNow(),
})

// Vault Messages relations
export const vaultMessagesRelations = relations(vaultMessages,({one})=>({
    vault:one(vault,{
        fields:[vaultMessages.vault_id],
        references:[vault.id]
    })
}))