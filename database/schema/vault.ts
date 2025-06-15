import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"
import { randomUUID } from "node:crypto";
import { z } from "zod"
import { users } from "./users";
import { vaultMessages } from "./messages.vault";
import { vaultDocuments } from "./documents.vault";
import { vaultWorkflows } from "./workflows.vault";


// Vault Table
export const vault = p.pgTable('vault',{
    id:p.uuid('id').notNull().unique().primaryKey().$defaultFn(()=> randomUUID()),
    title:p.text('title').notNull(),
    user_id:p.text('user_id').notNull(),
    is_public:p.boolean('is_public'),
    created_at:p.timestamp('created_at',{withTimezone:true}).defaultNow(),
})

// Vault relations
export const vaultRelations =  relations(vault,({one,many})=>({
    user:one(users,{
        fields:[vault.user_id],
        references:[users.user_id]
    }),
    vaultMessages:many(vaultMessages),
    vaultDocuments:many(vaultDocuments),
    vaultWorkflows:many(vaultWorkflows),
}))

