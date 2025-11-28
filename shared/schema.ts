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

// SOP Change Requests for approval workflow
export const sopChangeRequests = pgTable("sop_change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sopId: varchar("sop_id").references(() => sops.id).notNull(),
  requestType: text("request_type").notNull(), // 'update', 'revision', 'archive'
  title: text("title").notNull(),
  description: text("description").notNull(),
  justification: text("justification").notNull(), // Business justification for change
  proposedVersion: text("proposed_version"), // Next version number
  newFilePath: text("new_file_path"), // Path to new document version
  newFileName: text("new_file_name"), // New file name
  newFileSize: integer("new_file_size"), // New file size
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected', 'cancelled'
  priority: text("priority").notNull().default('medium'), // 'low', 'medium', 'high', 'urgent'
  requestedBy: text("requested_by").notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  implementedAt: timestamp("implemented_at"),
  rejectedBy: text("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertSopChangeRequestSchema = createInsertSchema(sopChangeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSop = z.infer<typeof insertSopSchema>;
export type Sop = typeof sops.$inferSelect;
export type InsertSopVersion = z.infer<typeof insertSopVersionSchema>;
export type SopVersion = typeof sopVersions.$inferSelect;
export type InsertSopChangeRequest = z.infer<typeof insertSopChangeRequestSchema>;
export type SopChangeRequest = typeof sopChangeRequests.$inferSelect;

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
  materialType: text("material_type").notNull().default("raw_material"), // 'raw_material', 'packaging_material', 'artwork'
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

// BOM Change Requests Schema
export const bomChangeRequests = pgTable("bom_change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: text("bom_id").notNull().references(() => boms.id, { onDelete: "cascade" }),
  requestType: text("request_type").notNull().default("update"), // 'update', 'revision', 'archive'
  title: text("title").notNull(),
  description: text("description").notNull(),
  justification: text("justification").notNull(),
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  proposedVersion: text("proposed_version"),
  requestedBy: text("requested_by").notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: text("rejected_by"),
  rejectionReason: text("rejection_reason"),
  rejectedAt: timestamp("rejected_at"),
  reviewComments: text("review_comments"),
  implementedAt: timestamp("implemented_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBomChangeRequestSchema = createInsertSchema(bomChangeRequests).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
  rejectedAt: true,
  implementedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;
export type InsertBomMaterial = z.infer<typeof insertBomMaterialSchema>;
export type BomMaterial = typeof bomMaterials.$inferSelect;
export type InsertBomSubAssembly = z.infer<typeof insertBomSubAssemblySchema>;
export type BomSubAssembly = typeof bomSubAssemblies.$inferSelect;
export type InsertBomChangeRequest = z.infer<typeof insertBomChangeRequestSchema>;
export type BomChangeRequest = typeof bomChangeRequests.$inferSelect;

export type InsertCapa = z.infer<typeof insertCapaSchema>;
export type Capa = typeof capas.$inferSelect;
export type InsertCapaAction = z.infer<typeof insertCapaActionSchema>;
export type CapaAction = typeof capaActions.$inferSelect;

// Inventory Management Schema
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemCode: text("item_code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Raw Materials, Packaging, etc.
  type: text("type").notNull(), // RM (Raw Material), PM (Packaging Material), etc.
  supplierName: text("supplier_name"),
  warehouseLocation: text("warehouse_location"),
  batchNumber: text("batch_number"),
  currentStock: integer("current_stock").notNull().default(0),
  minimumLevel: integer("minimum_level").notNull().default(0),
  maximumLevel: integer("maximum_level").notNull().default(1000),
  moq: integer("moq").notNull().default(1), // Minimum Order Quantity
  uom: text("uom").notNull().default("KG"), // Unit of Measure
  rate: integer("rate").notNull().default(0), // in paise (1/100th of rupee)
  leadTimeDays: integer("lead_time_days").default(0), // Lead time in days
  specification: text("specification"),
  imageUrl: text("image_url"),
  expiryDate: timestamp("expiry_date"),
  status: text("status").notNull().default("Active"), // Active, Inactive, Discontinued
  qualityStatus: text("quality_status").default("Passed"), // Passed, Failed, Pending
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // IN (Procured), OUT (Issued), TRANSFER, ADJUSTMENT
  quantity: integer("quantity").notNull(),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  referenceNumber: text("reference_number"), // PO ID, Job ID, etc.
  user: text("user").notNull(), // User who performed the movement
  qualityIssue: text("quality_issue"), // Quality issue description if any
  notes: text("notes"),
  movementDate: timestamp("movement_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;

// =============== QUALITY ASSURANCE SYSTEM ===============

// QC Stages for Production Orders
export const qcStages = pgTable("qc_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Raw Material Testing", "In-Process QC", "Final Product QC"
  code: text("code").notNull().unique(), // e.g., "RM-QC", "IP-QC", "FP-QC"
  description: text("description"),
  sequence: integer("sequence").notNull(), // Order of execution (1, 2, 3, etc.)
  isRequired: boolean("is_required").default(true),
  estimatedDuration: integer("estimated_duration").default(24), // hours
  sopReference: text("sop_reference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QC Checkpoints for each Production Order
export const qcCheckpoints = pgTable("qc_checkpoints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id).notNull(),
  qcStageId: varchar("qc_stage_id").references(() => qcStages.id).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'in-progress', 'passed', 'failed', 'on-hold'
  assignedTo: text("assigned_to"), // QC Analyst
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  remarks: text("remarks"),
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'critical'
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QC Test Results for each Checkpoint
export const qcTestResults = pgTable("qc_test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checkpointId: varchar("checkpoint_id").references(() => qcCheckpoints.id).notNull(),
  testConfigId: varchar("test_config_id").references(() => testConfigs.id).notNull(),
  sampleId: text("sample_id"), // Sample identification
  testValue: text("test_value"), // Actual test result
  expectedValue: text("expected_value"), // Expected/target value
  status: text("status").notNull().default("pending"), // 'passed', 'failed', 'pending', 'retest-required'
  deviation: text("deviation"), // Any deviation observed
  testedBy: text("tested_by"), // Analyst performing test
  testedAt: timestamp("tested_at"),
  reviewedBy: text("reviewed_by"), // QC Manager reviewing results
  reviewedAt: timestamp("reviewed_at"),
  retestCount: integer("retest_count").default(0),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QC Approvals and Sign-offs
export const qcApprovals = pgTable("qc_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checkpointId: varchar("checkpoint_id").references(() => qcCheckpoints.id).notNull(),
  approverRole: text("approver_role").notNull(), // 'qc-analyst', 'qc-manager', 'qa-head', 'authorized-person'
  approverName: text("approver_name").notNull(),
  approverSignature: text("approver_signature"), // Digital signature hash or reference
  decision: text("decision").notNull(), // 'approved', 'rejected', 'conditional-approval'
  comments: text("comments"),
  approvedAt: timestamp("approved_at").defaultNow(),
  ipAddress: text("ip_address"), // For audit trail
  userAgent: text("user_agent"), // For audit trail
  createdAt: timestamp("created_at").defaultNow(),
});

// Batch Release Management
export const batchReleases = pgTable("batch_releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id).notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  batchSize: integer("batch_size").notNull(),
  manufacturedDate: timestamp("manufactured_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  releaseStatus: text("release_status").notNull().default("under-testing"), // 'under-testing', 'released', 'rejected', 'on-hold'
  releaseDecision: text("release_decision"), // 'full-release', 'conditional-release', 'rejection'
  releaseDate: timestamp("release_date"),
  releasedBy: text("released_by"), // Authorized Person
  releaseSignature: text("release_signature"), // Digital signature
  qaReview: text("qa_review"), // QA Manager review comments
  qaApprovedBy: text("qa_approved_by"),
  qaApprovedAt: timestamp("qa_approved_at"),
  storageConditions: text("storage_conditions"),
  shelfLife: integer("shelf_life_months"),
  packagingDetails: text("packaging_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch Release Workflow Steps
export const batchWorkflowSteps = pgTable("batch_workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchReleaseId: varchar("batch_release_id").references(() => batchReleases.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  stepCategory: text("step_category").notNull(), // 'Materials Verification', 'Process Controls', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'approved', 'rejected', 'on_hold'
  assignedTo: text("assigned_to").notNull(),
  assignedTeam: text("assigned_team").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  approvalRequired: boolean("approval_required").default(true),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: text("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  findings: text("findings"),
  evidence: text("evidence"), // JSON array of evidence files/links
  deviations: text("deviations"), // JSON array of deviation descriptions
  correctiveActions: text("corrective_actions"), // JSON array of corrective actions
  requiredActions: text("required_actions"), // JSON array of required actions
  completedActions: text("completed_actions"), // JSON array of completed actions
  comments: text("comments"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital Batch Release Certificates/CoA
export const batchCertificates = pgTable("batch_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchReleaseId: varchar("batch_release_id").references(() => batchReleases.id).notNull(),
  certificateNumber: text("certificate_number").notNull().unique(),
  certificateType: text("certificate_type").notNull(), // 'coa', 'batch-release-certificate', 'quality-certificate'
  templateVersion: text("template_version").default("v1.0"),
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: text("generated_by").notNull(),
  digitalSignature: text("digital_signature"), // Digital signature hash
  signedBy: text("signed_by"), // Person who digitally signed
  signedAt: timestamp("signed_at"),
  pdfPath: text("pdf_path"), // Path to generated PDF certificate
  status: text("status").notNull().default("draft"), // 'draft', 'signed', 'issued', 'revoked'
  issuedTo: text("issued_to"), // Customer/Recipient
  validUntil: timestamp("valid_until"),
  revocationReason: text("revocation_reason"),
  revokedAt: timestamp("revoked_at"),
  revokedBy: text("revoked_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Trail for QA Activities
export const qaAuditTrail = pgTable("qa_audit_trail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'qc-checkpoint', 'batch-release', 'certificate', 'test-result'
  entityId: varchar("entity_id").notNull(), // ID of the entity being audited
  action: text("action").notNull(), // 'created', 'updated', 'approved', 'rejected', 'signed', 'released'
  oldValues: text("old_values"), // JSON string of previous values
  newValues: text("new_values"), // JSON string of new values
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  reason: text("reason"), // Reason for the change
  createdAt: timestamp("created_at").defaultNow(),
});

// QC Stage Templates (for reusability across different products)
export const qcStageTemplates = pgTable("qc_stage_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productCategory: text("product_category"), // e.g., "Tablets", "Capsules", "Liquids"
  stages: text("stages").notNull(), // JSON array of stage configurations
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for QA system
export const insertQcStageSchema = createInsertSchema(qcStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQcCheckpointSchema = createInsertSchema(qcCheckpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQcTestResultSchema = createInsertSchema(qcTestResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQcApprovalSchema = createInsertSchema(qcApprovals).omit({
  id: true,
  createdAt: true,
});

export const insertBatchReleaseSchema = createInsertSchema(batchReleases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchWorkflowStepSchema = createInsertSchema(batchWorkflowSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchCertificateSchema = createInsertSchema(batchCertificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQaAuditTrailSchema = createInsertSchema(qaAuditTrail).omit({
  id: true,
  createdAt: true,
});

export const insertQcStageTemplateSchema = createInsertSchema(qcStageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for QA system
export type InsertQcStage = z.infer<typeof insertQcStageSchema>;
export type QcStage = typeof qcStages.$inferSelect;

export type InsertQcCheckpoint = z.infer<typeof insertQcCheckpointSchema>;
export type QcCheckpoint = typeof qcCheckpoints.$inferSelect;

export type InsertQcTestResult = z.infer<typeof insertQcTestResultSchema>;
export type QcTestResult = typeof qcTestResults.$inferSelect;

export type InsertQcApproval = z.infer<typeof insertQcApprovalSchema>;
export type QcApproval = typeof qcApprovals.$inferSelect;

export type InsertBatchRelease = z.infer<typeof insertBatchReleaseSchema>;
export type BatchRelease = typeof batchReleases.$inferSelect;

export type InsertBatchWorkflowStep = z.infer<typeof insertBatchWorkflowStepSchema>;
export type BatchWorkflowStep = typeof batchWorkflowSteps.$inferSelect;

export type InsertBatchCertificate = z.infer<typeof insertBatchCertificateSchema>;
export type BatchCertificate = typeof batchCertificates.$inferSelect;

export type InsertQaAuditTrail = z.infer<typeof insertQaAuditTrailSchema>;
export type QaAuditTrail = typeof qaAuditTrail.$inferSelect;

export type InsertQcStageTemplate = z.infer<typeof insertQcStageTemplateSchema>;
export type QcStageTemplate = typeof qcStageTemplates.$inferSelect;

// AI Chat Assistant Schema
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  model: text("model").notNull().default('gpt-4o'),
  mode: text("mode").notNull().default('ask'), // 'ask', 'agent', 'edit'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  role: text("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  mode: text("mode").notNull().default('ask'), // 'ask', 'agent', 'edit'
  feedback: text("feedback"), // 'like', 'dislike', null
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
