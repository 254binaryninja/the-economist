import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { randomUUID } from "node:crypto";
import { z } from "zod"
import { vault } from "./vault";


// Vault documents
export const vaultDocuments = p.pgTable('vault_documents',{
    id:p.uuid('id').notNull().unique().primaryKey().$defaultFn(()=>randomUUID()),
    vault_id:p.uuid('vault_id').notNull().references(()=>vault.id,{onDelete:'cascade'}),
    document_name:p.text('document_name').notNull(),
    document_size:p.text('document_size'),
    document_metadata:p.text('document_metadata'),
    document_type:p.text('document_type').notNull(),
    created_at:p.timestamp('created_at',{withTimezone:true}).defaultNow()
})


// Vault Documents Relations
export const vaultDocumentsRelations = relations(vaultDocuments,({one})=>({
    vault:one(vault,{
        fields:[vaultDocuments.vault_id],
        references:[vault.id]
    })
}))

