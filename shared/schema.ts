import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'raw-materials', 'packaging-material', 'in-process', 'final-products', 'artwork', 'instructions-checklists'
  category: text("category").notNull(), // Material category within type
  status: text("status").notNull().default('ready-for-qc'), // 'approved', 'pending', 'failed', 'under-testing', 'ready-for-qc'
  stock: integer("stock").default(0),
  score: integer("score"), // Quality score out of 100
  referenceNumber: text("reference_number").notNull(),
  batchNumber: text("batch_number"),
  jobId: text("job_id"), // For in-process materials tracking
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

// SOP Management Schema
export const sops = pgTable("sops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  sopNumber: text("sop_number").notNull().unique(),
  category: text("category").notNull(), // 'Manufacturing', 'Quality Control', 'Cleaning & Sanitization', etc.
  description: text("description"),
  version: text("version").notNull().default('1.0'),
  status: text("status").notNull().default('draft'), // 'draft', 'under-review', 'approved', 'archived'
  filePath: text("file_path"), // Path to the uploaded document
  fileName: text("file_name"), // Original file name
  fileSize: integer("file_size"), // File size in bytes
  approvedBy: text("approved_by"),
  approvedDate: timestamp("approved_date"),
  effectiveDate: timestamp("effective_date"),
  nextReviewDate: timestamp("next_review_date"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SOP Version History for version control
export const sopVersions = pgTable("sop_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sopId: varchar("sop_id").references(() => sops.id).notNull(),
  version: text("version").notNull(),
  filePath: text("file_path"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  changeLog: text("change_log"), // Description of changes made
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSopSchema = createInsertSchema(sops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSopVersionSchema = createInsertSchema(sopVersions).omit({
  id: true,
  createdAt: true,
});

export type InsertSop = z.infer<typeof insertSopSchema>;
export type Sop = typeof sops.$inferSelect;
export type InsertSopVersion = z.infer<typeof insertSopVersionSchema>;
export type SopVersion = typeof sopVersions.$inferSelect;

// Production Orders Schema
export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  skuProduct: text("sku_product").notNull(),
  customerName: text("customer_name").notNull(),
  jobId: text("job_id").notNull().unique(),
  quantity: integer("quantity").notNull(),
  priority: text("priority").notNull().default('Medium'), // 'Low', 'Medium', 'High', 'Critical'
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default('Pending'), // 'Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CAPA Management Schema
export const capas = pgTable("capas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  capaNumber: text("capa_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'Corrective Action', 'Preventive Action', 'Corrective & Preventive Action'
  priority: text("priority").notNull().default('Medium'), // 'Low', 'Medium', 'High', 'Critical'
  status: text("status").notNull().default('Open'), // 'Open', 'In Progress', 'Under Review', 'Closed', 'Cancelled'
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  relatedSopId: varchar("related_sop_id").references(() => sops.id),
  rootCauseAnalysis: text("root_cause_analysis"),
  correctiveActions: text("corrective_actions"),
  preventiveActions: text("preventive_actions"),
  implementation: text("implementation"),
  verification: text("verification"),
  completionDate: timestamp("completion_date"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CAPA Actions tracking individual action items
export const capaActions = pgTable("capa_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  capaId: varchar("capa_id").references(() => capas.id).notNull(),
  actionDescription: text("action_description").notNull(),
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default('Open'), // 'Open', 'In Progress', 'Completed', 'Overdue'
  completionDate: timestamp("completion_date"),
  evidence: text("evidence"), // Path to uploaded evidence files
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCapaSchema = createInsertSchema(capas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCapaActionSchema = createInsertSchema(capaActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

// BOM Management Schema
export const boms = pgTable("boms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomNumber: text("bom_number").notNull().unique(),
  productName: text("product_name").notNull(),
  version: text("version").notNull().default('1.0'),
  status: text("status").notNull().default('Active'), // 'Active', 'Inactive', 'Draft', 'Approved'
  totalCost: integer("total_cost").notNull().default(0), // in paise (1/100th of rupee)
  shelfLifeDays: integer("shelf_life_days"), // shelf life in days
  approvedBy: text("approved_by"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bomMaterials = pgTable("bom_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: text("bom_id").notNull().references(() => boms.id, { onDelete: "cascade" }),
  materialId: text("material_id").references(() => materials.id),
  materialCode: text("material_code").notNull(),
  materialName: text("material_name").notNull(),
  quantity: integer("quantity").notNull(), // in base units * 1000 for precision
  uom: text("uom").notNull(), // Unit of Measure
  unitCost: integer("unit_cost").notNull().default(0), // in paise (1/100th of rupee)
  scrapPercentage: integer("scrap_percentage").notNull().default(0), // percentage * 100
  totalCost: integer("total_cost").notNull().default(0), // in paise (1/100th of rupee)
  shelfLifeDays: integer("shelf_life_days"), // shelf life in days
  createdAt: timestamp("created_at").defaultNow(),
});

export const bomSubAssemblies = pgTable("bom_sub_assemblies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: text("bom_id").notNull().references(() => boms.id, { onDelete: "cascade" }),
  subAssemblyBomId: text("sub_assembly_bom_id").notNull().references(() => boms.id),
  quantityRequired: integer("quantity_required").notNull(),
  totalCost: integer("total_cost").notNull().default(0), // in paise (1/100th of rupee)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBomSchema = createInsertSchema(boms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBomMaterialSchema = createInsertSchema(bomMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertBomSubAssemblySchema = createInsertSchema(bomSubAssemblies).omit({
  id: true,
  createdAt: true,
});

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;
export type InsertBomMaterial = z.infer<typeof insertBomMaterialSchema>;
export type BomMaterial = typeof bomMaterials.$inferSelect;
export type InsertBomSubAssembly = z.infer<typeof insertBomSubAssemblySchema>;
export type BomSubAssembly = typeof bomSubAssemblies.$inferSelect;

export type InsertCapa = z.infer<typeof insertCapaSchema>;
export type Capa = typeof capas.$inferSelect;
export type InsertCapaAction = z.infer<typeof insertCapaActionSchema>;
export type CapaAction = typeof capaActions.$inferSelect;
