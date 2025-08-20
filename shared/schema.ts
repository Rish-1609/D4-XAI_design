import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'raw-materials', 'packaging-material', 'final-products', 'artwork', 'instructions-checklists'
  category: text("category").notNull(), // Material category within type
  status: text("status").notNull().default('ready-for-qc'), // 'approved', 'pending', 'failed', 'under-testing', 'ready-for-qc'
  stock: integer("stock").default(0),
  score: integer("score"), // Quality score out of 100
  referenceNumber: text("reference_number").notNull(),
  batchNumber: text("batch_number"),
  supplierName: text("supplier_name"),
  receiptDate: timestamp("receipt_date"),
  expiryDate: timestamp("expiry_date"),
  storageConditions: text("storage_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test Configuration Schema for pharma manufacturing
export const testConfigs = pgTable("test_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Assay", "pH Test", "Dissolution", "Content Uniformity"
  code: text("code").notNull().unique(), // e.g., "TC-001", "TC-pH-002"
  category: text("category").notNull(), // e.g., "Physical", "Chemical", "Microbiological"
  testMethod: text("test_method"), // e.g., "HPLC", "UV-Vis", "Titration"
  expectedRange: text("expected_range"), // e.g., "95.0 - 105.0%", "6.8 - 7.2"
  units: text("units"), // e.g., "%", "pH", "mg/ml"
  isMandatory: boolean("is_mandatory").default(true),
  acceptanceCriteria: text("acceptance_criteria"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test Results Schema
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  materialId: varchar("material_id").references(() => materials.id),
  testConfigId: varchar("test_config_id").references(() => testConfigs.id),
  resultValue: text("result_value"), // Actual test result
  status: text("status").notNull().default('pending'), // 'passed', 'failed', 'pending', 'retest'
  testedBy: text("tested_by"), // Analyst name
  testedDate: timestamp("tested_date"),
  remarks: text("remarks"),
  retestCount: integer("retest_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instructions and Checklists for Testing
export const testInstructions = pgTable("test_instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  materialType: text("material_type").notNull(), // Which material types this applies to
  testConfigId: varchar("test_config_id").references(() => testConfigs.id),
  instructions: text("instructions").notNull(),
  samplingProcedure: text("sampling_procedure"),
  equipmentRequired: text("equipment_required"),
  safetyPrecautions: text("safety_precautions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMaterialSchema = insertMaterialSchema.partial();

export const insertTestConfigSchema = createInsertSchema(testConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestInstructionSchema = createInsertSchema(testInstructions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertTestConfig = z.infer<typeof insertTestConfigSchema>;
export type TestConfig = typeof testConfigs.$inferSelect;

export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;

export type InsertTestInstruction = z.infer<typeof insertTestInstructionSchema>;
export type TestInstruction = typeof testInstructions.$inferSelect;
