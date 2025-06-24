import { relations, sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { users } from "./users";
import { workspaceMessage } from "./messages.workspace";

// Workspace table

export const workspace = p.pgTable("workspaces", {
  id: p
    .uuid("id")
    .notNull()
    .unique()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  user_id: p.text("user_id").notNull(),
  title: p.text("title").notNull(),
  created_at: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Workspace Relations
export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  user: one(users, {
    fields: [workspace.user_id],
    references: [users.user_id],
  }),
  workspaceMessage: many(workspaceMessage),
}));
