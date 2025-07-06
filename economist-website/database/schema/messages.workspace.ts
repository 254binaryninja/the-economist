import { relations, sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { workspace } from "./workspace";

// Workspace messages table

export const workspaceMessage = p.pgTable("workspace_messages", {
  id: p
    .uuid("id")
    .notNull()
    .unique()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  workspace_id: p
    .uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  role: p.text({ enum: ["user", "assistant"] }).notNull(),
  content: p.text("content").notNull(),
  created_at: p.timestamp("created_at", { withTimezone: true }).defaultNow(),
  metadata: p.jsonb("metadata"),
  is_upvoted: p.boolean("is_upvoted"),
});

//Workspace message relations
export const workspaceMessageRelations = relations(
  workspaceMessage,
  ({ one }) => ({
    workspace: one(workspace, {
      fields: [workspaceMessage.workspace_id],
      references: [workspace.id],
    }),
  }),
);
