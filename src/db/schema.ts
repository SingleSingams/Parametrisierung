import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";

/** Projekt / Mandats-Stub für POC-Persistenz. */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  pageCount: integer("page_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Versionierte Extraktion (JSON gemäß Zod-Schema, serialisiert). */
export const extractions = pgTable("extractions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => documents.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").notNull().default(1),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** DSGVO-relevanter Audit-Stub. */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: text("action").notNull(),
  actorLabel: text("actor_label"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
