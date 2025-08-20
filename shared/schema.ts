import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'raw-materials', 'packaging-material', 'final-products', 'artwork', 'instructions-checklists'
  category: text("category").notNull(), // Material category within type
  status: text("status").notNull().default('pending'), // 'approved', 'pending', 'failed'
  stock: integer("stock").default(0),
  score: integer("score"), // Quality score out of 100
  referenceNumber: text("reference_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMaterialSchema = insertMaterialSchema.partial();

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;
export type Material = typeof materials.$inferSelect;
