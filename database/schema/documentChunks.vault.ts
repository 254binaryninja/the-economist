import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { randomUUID } from "node:crypto";
import { vaultDocuments } from "./documents.vault";


// vault_document_chunks.ts
export const vaultDocumentChunks = p.pgTable("vault_document_chunks", {
  id: p.uuid("id").primaryKey().$defaultFn(() => randomUUID()), // this will match Pinecone vector ID
  document_id: p.uuid("document_id").notNull().references(() => vaultDocuments.id, { onDelete: "cascade" }),
  user_id: p.text("user_id").notNull(),
  chunk_index: p.integer("chunk_index").notNull(),
  created_at: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Vault Document Chunks Relations
export const vaultDocumentChunksRelations = relations(vaultDocumentChunks, ({ one }) => ({
  document: one(vaultDocuments, {
    fields: [vaultDocumentChunks.document_id],
    references: [vaultDocuments.id],
  }),
}));
