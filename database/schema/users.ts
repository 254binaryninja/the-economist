import { relations, sql } from "drizzle-orm"
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod"
import { vault } from "./vault";
import { workspace } from "./workspace";


// Users Table
export const users = p.pgTable("users",{
    id:p.uuid('id').notNull().unique().primaryKey().$defaultFn(()=> randomUUID()),
    user_id:p.text('user_id').notNull().unique().default(sql`auth.jwt()->>'sub'`),
    name:p.text('name').notNull(),
    email:p.text('email').notNull().unique(),
    occupation:p.text('occupation').notNull(),
    verbosity:p.text('verbosity'),
    style:p.text('style'),
    student:p.boolean('student'),
    created_at:p.timestamp('created_at',{withTimezone:true}).defaultNow()
})


// Users Relations
export const usersRelations = relations(users,({many})=>({
    vault:many(vault),
    workspace:many(workspace)
}))

// const userInsertSchema = createInsertSchema(users)


// export type UserSchema = z.infer<typeof userInsertSchema>






