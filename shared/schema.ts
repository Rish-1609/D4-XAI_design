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
  correctiveAction: text("corrective_action"),
  preventiveAction: text("preventive_action"),
  implementationDate: timestamp("implementation_date"),
  verificationDate: timestamp("verification_date"),
  verificationStatus: text("verification_status"), // 'pending', 'effective', 'not-effective'
  closedBy: text("closed_by"),
  closedDate: timestamp("closed_date"),
  remarks: text("remarks"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCapaSchema = createInsertSchema(capas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;
export type InsertCapa = z.infer<typeof insertCapaSchema>;
export type Capa = typeof capas.$inferSelect;

// Suppliers Master Schema
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierCode: text("supplier_code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Packaging Material', 'Raw Material', 'API', 'Excipient'
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  country: text("country").default("India"),
  rating: decimal("rating").default("0"), // 0-5 star rating
  onTimeDelivery: decimal("on_time_delivery").default("0"), // percentage 0-100
  qualityScore: decimal("quality_score").default("0"), // percentage 0-100
  totalOrders: integer("total_orders").default(0),
  totalValue: decimal("total_value").default("0"), // in USD
  status: text("status").notNull().default("active"), // 'active', 'blocked', 'inactive'
  blockedReason: text("blocked_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Bill of Materials Schema
export const billOfMaterials = pgTable("bill_of_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomNumber: text("bom_number").notNull().unique(), // BOM0000001
  name: text("name").notNull(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  version: text("version").notNull().default('1.0'),
  status: text("status").notNull().default('draft'), // 'draft', 'active', 'archived'
  batchSize: integer("batch_size").notNull(),
  batchSizeUom: text("batch_size_uom").notNull().default('units'),
  description: text("description"),
  totalCost: decimal("total_cost").default("0"), // cached total cost of all items
  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),
  approvedBy: text("approved_by"),
  approvedDate: timestamp("approved_date"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BOM Items/Lines Schema
export const bomItems = pgTable("bom_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").references(() => billOfMaterials.id).notNull(),
  materialId: varchar("material_id").references(() => materials.id),
  materialCode: text("material_code").notNull(),
  materialName: text("material_name").notNull(),
  materialType: text("material_type").default("RM"), // 'RM' raw material, 'PM' packaging, 'FG' finished good
  labelClaim: text("label_claim"), // label claim / specification
  quantity: decimal("quantity").notNull(),
  uom: text("uom").notNull(), // 'kg', 'g', 'ml', 'l', 'pcs', 'strips'
  isActive: boolean("is_active").default(true),
  isCritical: boolean("is_critical").default(false),
  scrapPercentage: decimal("scrap_percentage").default('0'), // scrap/wastage %
  overagePercent: decimal("overage_percent").default('0'), // overage/excess tolerance %
  unitCost: decimal("unit_cost").default("0"), // cost per unit in INR
  totalCost: decimal("total_cost").default("0"), // quantity * unitCost with scrap
  supplierCode: text("supplier_code"), // linked supplier
  notes: text("notes"),
  sequenceNumber: integer("sequence_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBomSchema = createInsertSchema(billOfMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBomItemSchema = createInsertSchema(bomItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof billOfMaterials.$inferSelect;
export type InsertBomItem = z.infer<typeof insertBomItemSchema>;
export type BomItem = typeof bomItems.$inferSelect;

// Inventory Management Schema
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  materialId: varchar("material_id").references(() => materials.id),
  batchNumber: text("batch_number").notNull(),
  lotNumber: text("lot_number"),
  locationCode: text("location_code").notNull(),
  locationName: text("location_name").notNull(),
  warehouseId: text("warehouse_id").notNull(),
  quantity: integer("quantity").notNull(),
  reservedQuantity: integer("reserved_quantity").default(0),
  uom: text("uom").notNull(),
  status: text("status").notNull().default('available'), // 'available', 'reserved', 'quarantine', 'expired', 'damaged'
  manufacturingDate: timestamp("manufacturing_date"),
  expiryDate: timestamp("expiry_date"),
  receivedDate: timestamp("received_date").defaultNow(),
  supplierId: text("supplier_id"),
  supplierName: text("supplier_name"),
  purchaseOrderNumber: text("purchase_order_number"),
  unitCost: decimal("unit_cost"),
  totalValue: decimal("total_value"),
  qcStatus: text("qc_status").default('pending'), // 'pending', 'approved', 'rejected', 'retest'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Transactions Schema
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionNumber: text("transaction_number").notNull().unique(),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  materialId: varchar("material_id").references(() => materials.id),
  transactionType: text("transaction_type").notNull(), // 'receipt', 'issue', 'transfer', 'adjustment', 'return', 'scrap'
  quantity: integer("quantity").notNull(),
  uom: text("uom").notNull(),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  referenceType: text("reference_type"), // 'production-order', 'purchase-order', 'sales-order', 'adjustment'
  referenceNumber: text("reference_number"),
  batchNumber: text("batch_number"),
  reason: text("reason"),
  cost: decimal("cost"),
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

// Warehouses and Locations Schema
export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'raw-material', 'finished-goods', 'wip', 'quarantine', 'cold-storage'
  address: text("address"),
  capacity: integer("capacity"),
  capacityUom: text("capacity_uom").default('units'),
  temperature: text("temperature"), // Storage temperature requirements
  humidity: text("humidity"), // Humidity requirements
  isActive: boolean("is_active").default(true),
  managerId: text("manager_id"),
  managerName: text("manager_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storageLocations = pgTable("storage_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: varchar("warehouse_id").references(() => warehouses.id).notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rack', 'bin', 'shelf', 'pallet', 'cold-room'
  zone: text("zone"), // A, B, C, etc.
  aisle: text("aisle"),
  rack: text("rack"),
  level: text("level"),
  position: text("position"),
  capacity: integer("capacity"),
  capacityUom: text("capacity_uom"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorageLocationSchema = createInsertSchema(storageLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertStorageLocation = z.infer<typeof insertStorageLocationSchema>;
export type StorageLocation = typeof storageLocations.$inferSelect;

// ==================== PRODUCTION MANAGEMENT ====================

// Production Batches - Main batch tracking
export const productionBatches = pgTable("production_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: text("batch_number").notNull().unique(),
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  bomId: varchar("bom_id").references(() => billOfMaterials.id),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  targetQuantity: integer("target_quantity").notNull(),
  actualQuantity: integer("actual_quantity"),
  uom: text("uom").notNull().default('units'),
  status: text("status").notNull().default('planned'), // 'planned', 'in-progress', 'completed', 'on-hold', 'cancelled', 'rejected'
  priority: text("priority").notNull().default('medium'),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  yieldPercentage: decimal("yield_percentage"),
  qualityScore: integer("quality_score"),
  reviewStatus: text("review_status").default('pending'), // 'pending', 'approved', 'rejected'
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch Stages - Stages within a batch
export const batchStages = pgTable("batch_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  stageName: text("stage_name").notNull(),
  stageNumber: integer("stage_number").notNull(),
  description: text("description"),
  status: text("status").notNull().default('pending'), // 'pending', 'in-progress', 'completed', 'skipped', 'failed'
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  assignedTo: text("assigned_to"),
  completedBy: text("completed_by"),
  inputQuantity: integer("input_quantity"),
  outputQuantity: integer("output_quantity"),
  yieldPercentage: decimal("yield_percentage"),
  equipmentUsed: text("equipment_used"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch Execution Records - Detailed execution data
export const batchExecutions = pgTable("batch_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  stageId: varchar("stage_id").references(() => batchStages.id),
  executionType: text("execution_type").notNull(), // 'parameter', 'material-usage', 'equipment-log', 'qc-check', 'deviation'
  parameterName: text("parameter_name"),
  targetValue: text("target_value"),
  actualValue: text("actual_value"),
  uom: text("uom"),
  isWithinSpec: boolean("is_within_spec"),
  materialId: varchar("material_id").references(() => materials.id),
  quantityUsed: decimal("quantity_used"),
  equipmentId: text("equipment_id"),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Work - External processing tracking
export const jobWorks = pgTable("job_works", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobWorkNumber: text("job_work_number").notNull().unique(),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  vendorName: text("vendor_name").notNull(),
  vendorCode: text("vendor_code"),
  processType: text("process_type").notNull(), // 'coating', 'blister-packing', 'testing', 'sterilization'
  materialSent: text("material_sent").notNull(),
  quantitySent: integer("quantity_sent").notNull(),
  quantityReceived: integer("quantity_received"),
  uom: text("uom").notNull(),
  sentDate: timestamp("sent_date").notNull(),
  expectedReturnDate: timestamp("expected_return_date"),
  actualReturnDate: timestamp("actual_return_date"),
  status: text("status").notNull().default('sent'), // 'sent', 'in-process', 'completed', 'partial-received', 'rejected'
  cost: decimal("cost"),
  invoiceNumber: text("invoice_number"),
  qcStatus: text("qc_status").default('pending'),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch Reviews - Approval workflow
export const batchReviews = pgTable("batch_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  reviewType: text("review_type").notNull(), // 'in-process', 'final', 'release'
  reviewerRole: text("reviewer_role").notNull(), // 'production-supervisor', 'qa-manager', 'qc-head'
  reviewerName: text("reviewer_name").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected', 'conditional'
  comments: text("comments"),
  conditions: text("conditions"), // For conditional approvals
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductionBatchSchema = createInsertSchema(productionBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchStageSchema = createInsertSchema(batchStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchExecutionSchema = createInsertSchema(batchExecutions).omit({
  id: true,
  createdAt: true,
});

export const insertJobWorkSchema = createInsertSchema(jobWorks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchReviewSchema = createInsertSchema(batchReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for production management
export type InsertProductionBatch = z.infer<typeof insertProductionBatchSchema>;
export type ProductionBatch = typeof productionBatches.$inferSelect;

export type InsertBatchStage = z.infer<typeof insertBatchStageSchema>;
export type BatchStage = typeof batchStages.$inferSelect;

export type InsertBatchExecution = z.infer<typeof insertBatchExecutionSchema>;
export type BatchExecution = typeof batchExecutions.$inferSelect;

export type InsertJobWork = z.infer<typeof insertJobWorkSchema>;
export type JobWork = typeof jobWorks.$inferSelect;

export type InsertBatchReview = z.infer<typeof insertBatchReviewSchema>;
export type BatchReview = typeof batchReviews.$inferSelect;

// ==================== EQUIPMENT & JOB SCHEDULING ====================

// Equipment - Production equipment for job scheduling
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'mixer', 'granulator', 'tablet-press', 'coating-machine', 'packaging-line', 'reactor'
  capacity: integer("capacity"), // Production capacity per hour
  capacityUom: text("capacity_uom").default('units/hr'),
  location: text("location").notNull().default('Main Plant'),
  status: text("status").notNull().default('available'), // 'available', 'in-use', 'maintenance', 'offline'
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production Jobs - Job scheduling for Gantt chart
export const productionJobs = pgTable("production_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobNumber: text("job_number").notNull().unique(),
  orderNumber: text("order_number"), // Reference to production order
  productionOrderId: varchar("production_order_id").references(() => productionOrders.id),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  productName: text("product_name").notNull(),
  productCode: text("product_code"),
  equipmentId: varchar("equipment_id").references(() => equipment.id),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  durationMinutes: integer("duration_minutes").notNull(),
  quantity: integer("quantity").notNull(),
  uom: text("uom").default('units'),
  status: text("status").notNull().default('scheduled'), // 'scheduled', 'in-progress', 'completed', 'on-hold', 'cancelled'
  priority: text("priority").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job Cards - Task cards for production workspace
export const jobCards = pgTable("job_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardNumber: text("card_number").notNull(),
  jobId: varchar("job_id").references(() => productionJobs.id),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  stageId: varchar("stage_id").references(() => batchStages.id),
  title: text("title").notNull(),
  description: text("description"),
  cardType: text("card_type").notNull().default('task'), // 'task', 'checklist', 'inspection', 'documentation', 'material-check', 'qc-checkpoint'
  stepNumber: integer("step_number").default(1),
  status: text("status").notNull().default('pending'), // 'pending', 'in-progress', 'completed', 'blocked', 'skipped'
  priority: text("priority").notNull().default('medium'),
  assignedTo: text("assigned_to"),
  assignedOperator: text("assigned_operator"),
  equipmentRequired: text("equipment_required"),
  materialsRequired: text("materials_required"), // JSON array of material requirements
  plannedStart: timestamp("planned_start"),
  plannedEnd: timestamp("planned_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  actualDuration: integer("actual_duration"), // in minutes
  inputQuantity: integer("input_quantity"),
  outputQuantity: integer("output_quantity"),
  yieldPercentage: decimal("yield_percentage"),
  checklist: text("checklist"), // JSON array of checklist items with status
  formData: text("form_data"), // JSON object for custom form fields
  qcRequired: boolean("qc_required").default(false),
  qcStatus: text("qc_status"), // 'pending', 'passed', 'failed'
  qcNotes: text("qc_notes"),
  deviationLogged: boolean("deviation_logged").default(false),
  deviationDetails: text("deviation_details"),
  notes: text("notes"),
  attachments: text("attachments"), // JSON array of attachment paths
  uploadedFile: text("uploaded_file"), // Path to uploaded file
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for equipment and job scheduling
export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductionJobSchema = createInsertSchema(productionJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobCardSchema = createInsertSchema(jobCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for equipment and job scheduling
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

export type InsertProductionJob = z.infer<typeof insertProductionJobSchema>;
export type ProductionJob = typeof productionJobs.$inferSelect;

export type InsertJobCard = z.infer<typeof insertJobCardSchema>;
export type JobCard = typeof jobCards.$inferSelect;

// ==================== FINANCE MODULE ====================

// ==================== FINANCIAL SETUP ====================

// Chart of Accounts - Hierarchical account structure
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountCode: text("account_code").notNull().unique(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // 'asset', 'liability', 'equity', 'revenue', 'expense'
  accountSubType: text("account_sub_type"), // 'current-asset', 'fixed-asset', 'current-liability', 'long-term-liability', etc.
  parentAccountId: varchar("parent_account_id"), // Self-referential - parent account for hierarchy
  level: integer("level").notNull().default(1), // 1, 2, 3 for hierarchy depth
  normalBalance: text("normal_balance").notNull().default('debit'), // 'debit' or 'credit'
  isActive: boolean("is_active").default(true),
  isPostable: boolean("is_postable").default(true), // Can transactions be posted to this account?
  isBankAccount: boolean("is_bank_account").default(false),
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  currency: text("currency").default('INR'),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost Centers - Department/location based cost tracking
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'plant', 'production-line', 'qc', 'warehouse', 'admin', 'r&d'
  parentCostCenterId: varchar("parent_cost_center_id"), // Self-referential - parent cost center for hierarchy
  managerId: text("manager_id"),
  managerName: text("manager_name"),
  isActive: boolean("is_active").default(true),
  budgetAmount: decimal("budget_amount"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profit Centers - Revenue/profit tracking centers
export const profitCenters = pgTable("profit_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'product-line', 'business-unit', 'region', 'customer-segment'
  parentProfitCenterId: varchar("parent_profit_center_id"), // Self-referential - parent profit center for hierarchy
  managerId: text("manager_id"),
  managerName: text("manager_name"),
  isActive: boolean("is_active").default(true),
  targetRevenue: decimal("target_revenue"),
  targetMargin: decimal("target_margin"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax Codes - GST/VAT configuration
export const taxCodes = pgTable("tax_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  taxType: text("tax_type").notNull(), // 'gst', 'igst', 'cgst', 'sgst', 'vat', 'service-tax', 'customs'
  rate: decimal("rate").notNull(), // Tax rate as percentage
  isCompound: boolean("is_compound").default(false), // Compound tax calculation
  jurisdiction: text("jurisdiction"), // 'central', 'state', 'local'
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  accountId: varchar("account_id").references(() => chartOfAccounts.id), // Tax liability account
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Terms - Credit terms configuration
export const paymentTerms = pgTable("payment_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  dueDays: integer("due_days").notNull(), // Days until payment due
  discountDays: integer("discount_days"), // Days for early payment discount
  discountPercent: decimal("discount_percent"), // Early payment discount percentage
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fiscal Calendar - Financial year and period configuration
export const fiscalYears = pgTable("fiscal_years", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "FY 2024-25"
  code: text("code").notNull().unique(), // e.g., "FY2425"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('open'), // 'open', 'closed', 'locked'
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fiscal Periods - Monthly/quarterly periods
export const fiscalPeriods = pgTable("fiscal_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalYearId: varchar("fiscal_year_id").references(() => fiscalYears.id).notNull(),
  periodNumber: integer("period_number").notNull(), // 1-12 for monthly, 1-4 for quarterly
  periodName: text("period_name").notNull(), // e.g., "April 2024", "Q1"
  periodType: text("period_type").notNull().default('monthly'), // 'monthly', 'quarterly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('open'), // 'open', 'closed', 'locked'
  closedBy: text("closed_by"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== TRANSACTIONS (AP/AR UNIFIED) ====================

// Parties - Unified vendor/customer master
export const parties = pgTable("parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  partyType: text("party_type").notNull(), // 'vendor', 'customer', 'job-work-vendor', 'employee'
  legalName: text("legal_name"),
  taxId: text("tax_id"), // GST number, PAN, etc.
  taxType: text("tax_type"), // 'registered', 'unregistered', 'composition'
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default('India'),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  contactPerson: text("contact_person"),
  paymentTermsId: varchar("payment_terms_id").references(() => paymentTerms.id),
  creditLimit: decimal("credit_limit"),
  currentBalance: decimal("current_balance").default('0'),
  defaultAccountId: varchar("default_account_id").references(() => chartOfAccounts.id),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  bankIfsc: text("bank_ifsc"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Documents - Unified invoice/credit note structure
export const financialDocuments = pgTable("financial_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentNumber: text("document_number").notNull().unique(),
  documentType: text("document_type").notNull(), // 'vendor-invoice', 'customer-invoice', 'credit-note', 'debit-note', 'expense', 'job-work-bill'
  partyId: varchar("party_id").references(() => parties.id).notNull(),
  documentDate: timestamp("document_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  referenceNumber: text("reference_number"), // External reference (vendor invoice number, etc.)
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  profitCenterId: varchar("profit_center_id").references(() => profitCenters.id),
  subtotal: decimal("subtotal").notNull().default('0'),
  taxAmount: decimal("tax_amount").notNull().default('0'),
  discountAmount: decimal("discount_amount").default('0'),
  totalAmount: decimal("total_amount").notNull().default('0'),
  paidAmount: decimal("paid_amount").default('0'),
  balanceAmount: decimal("balance_amount").default('0'),
  currency: text("currency").default('INR'),
  exchangeRate: decimal("exchange_rate").default('1'),
  status: text("status").notNull().default('draft'), // 'draft', 'pending', 'approved', 'posted', 'partial-paid', 'paid', 'cancelled'
  paymentStatus: text("payment_status").default('unpaid'), // 'unpaid', 'partial', 'paid', 'overdue'
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  postedBy: text("posted_by"),
  postedAt: timestamp("posted_at"),
  glJournalId: varchar("gl_journal_id"), // Reference to GL posting
  notes: text("notes"),
  attachmentPath: text("attachment_path"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Lines - Line items for financial documents
export const documentLines = pgTable("document_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => financialDocuments.id).notNull(),
  lineNumber: integer("line_number").notNull(),
  description: text("description").notNull(),
  accountId: varchar("account_id").references(() => chartOfAccounts.id).notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  profitCenterId: varchar("profit_center_id").references(() => profitCenters.id),
  materialId: varchar("material_id").references(() => materials.id),
  quantity: decimal("quantity"),
  unitPrice: decimal("unit_price"),
  amount: decimal("amount").notNull(),
  taxCodeId: varchar("tax_code_id").references(() => taxCodes.id),
  taxAmount: decimal("tax_amount").default('0'),
  totalAmount: decimal("total_amount").notNull(),
  productionBatchId: varchar("production_batch_id").references(() => productionBatches.id),
  jobWorkId: varchar("job_work_id").references(() => jobWorks.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments - Receipt and payment transactions
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentNumber: text("payment_number").notNull().unique(),
  paymentType: text("payment_type").notNull(), // 'receipt', 'payment', 'advance-receipt', 'advance-payment'
  partyId: varchar("party_id").references(() => parties.id).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'bank-transfer', 'cheque', 'upi', 'card'
  bankAccountId: varchar("bank_account_id").references(() => chartOfAccounts.id),
  amount: decimal("amount").notNull(),
  referenceNumber: text("reference_number"), // Cheque number, transaction ID, etc.
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id),
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'cancelled', 'bounced'
  glJournalId: varchar("gl_journal_id"),
  notes: text("notes"),
  processedBy: text("processed_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Allocations - Link payments to documents
export const paymentAllocations = pgTable("payment_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").references(() => payments.id).notNull(),
  documentId: varchar("document_id").references(() => financialDocuments.id).notNull(),
  allocatedAmount: decimal("allocated_amount").notNull(),
  allocationDate: timestamp("allocation_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== MANUFACTURING FINANCE ====================

// Cost Pools - Grouping of costs for allocation
export const costPools = pgTable("cost_pools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  poolType: text("pool_type").notNull(), // 'labor', 'machine', 'overhead', 'qc', 'utilities', 'depreciation'
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  accountId: varchar("account_id").references(() => chartOfAccounts.id),
  allocationBasis: text("allocation_basis").notNull(), // 'direct-labor-hours', 'machine-hours', 'units-produced', 'material-cost'
  standardRate: decimal("standard_rate"),
  rateUom: text("rate_uom"), // 'per-hour', 'per-unit', 'percentage'
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BOM Cost Versions - Costed BOMs for products
export const bomCostVersions = pgTable("bom_cost_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").references(() => billOfMaterials.id).notNull(),
  versionNumber: text("version_number").notNull(),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  materialCost: decimal("material_cost").notNull().default('0'),
  laborCost: decimal("labor_cost").notNull().default('0'),
  machineCost: decimal("machine_cost").notNull().default('0'),
  overheadCost: decimal("overhead_cost").notNull().default('0'),
  qcCost: decimal("qc_cost").notNull().default('0'),
  totalCost: decimal("total_cost").notNull().default('0'),
  costPerUnit: decimal("cost_per_unit").notNull().default('0'),
  status: text("status").notNull().default('draft'), // 'draft', 'approved', 'archived'
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production Cost Runs - Actual costs for production batches
export const productionCostRuns = pgTable("production_cost_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runNumber: text("run_number").notNull().unique(),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  bomCostVersionId: varchar("bom_cost_version_id").references(() => bomCostVersions.id),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id),
  runDate: timestamp("run_date").notNull(),
  quantityProduced: integer("quantity_produced").notNull(),
  materialCostActual: decimal("material_cost_actual").notNull().default('0'),
  materialCostStandard: decimal("material_cost_standard").notNull().default('0'),
  laborCostActual: decimal("labor_cost_actual").notNull().default('0'),
  laborCostStandard: decimal("labor_cost_standard").notNull().default('0'),
  machineCostActual: decimal("machine_cost_actual").notNull().default('0'),
  machineCostStandard: decimal("machine_cost_standard").notNull().default('0'),
  overheadCostActual: decimal("overhead_cost_actual").notNull().default('0'),
  overheadCostStandard: decimal("overhead_cost_standard").notNull().default('0'),
  qcCostActual: decimal("qc_cost_actual").notNull().default('0'),
  qcCostStandard: decimal("qc_cost_standard").notNull().default('0'),
  scrapCost: decimal("scrap_cost").default('0'),
  reworkCost: decimal("rework_cost").default('0'),
  yieldLossCost: decimal("yield_loss_cost").default('0'),
  totalActualCost: decimal("total_actual_cost").notNull().default('0'),
  totalStandardCost: decimal("total_standard_cost").notNull().default('0'),
  varianceAmount: decimal("variance_amount").default('0'),
  variancePercent: decimal("variance_percent"),
  costPerUnitActual: decimal("cost_per_unit_actual"),
  costPerUnitStandard: decimal("cost_per_unit_standard"),
  status: text("status").notNull().default('draft'), // 'draft', 'calculated', 'posted'
  glJournalId: varchar("gl_journal_id"),
  notes: text("notes"),
  calculatedBy: text("calculated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Labor and Machine Logs - Time tracking for cost calculation
export const laborMachineLogs = pgTable("labor_machine_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  stageId: varchar("stage_id").references(() => batchStages.id),
  logType: text("log_type").notNull(), // 'labor', 'machine'
  costPoolId: varchar("cost_pool_id").references(() => costPools.id),
  equipmentId: varchar("equipment_id").references(() => equipment.id),
  operatorName: text("operator_name"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  hoursWorked: decimal("hours_worked"),
  hourlyRate: decimal("hourly_rate"),
  totalCost: decimal("total_cost"),
  activityType: text("activity_type"), // 'setup', 'production', 'idle', 'maintenance', 'cleaning'
  notes: text("notes"),
  recordedBy: text("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// QC Test Costs - Cost tracking for quality testing
export const qcTestCosts = pgTable("qc_test_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  testResultId: varchar("test_result_id").references(() => testResults.id),
  testConfigId: varchar("test_config_id").references(() => testConfigs.id),
  costPoolId: varchar("cost_pool_id").references(() => costPools.id),
  laborHours: decimal("labor_hours"),
  laborCost: decimal("labor_cost"),
  consumablesCost: decimal("consumables_cost"),
  equipmentCost: decimal("equipment_cost"),
  externalTestingCost: decimal("external_testing_cost"),
  totalCost: decimal("total_cost").notNull(),
  testDate: timestamp("test_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Overhead Allocations - Period-based overhead allocation
export const overheadAllocations = pgTable("overhead_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  costPoolId: varchar("cost_pool_id").references(() => costPools.id).notNull(),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  allocationBasis: text("allocation_basis").notNull(),
  basisQuantity: decimal("basis_quantity").notNull(), // Hours, units, etc.
  allocationRate: decimal("allocation_rate").notNull(),
  allocatedAmount: decimal("allocated_amount").notNull(),
  allocationDate: timestamp("allocation_date").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory Valuation Snapshots - Period-end inventory values
export const inventoryValuationSnapshots = pgTable("inventory_valuation_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  snapshotDate: timestamp("snapshot_date").notNull(),
  inventoryType: text("inventory_type").notNull(), // 'raw-material', 'wip', 'finished-goods'
  warehouseId: varchar("warehouse_id").references(() => warehouses.id),
  materialId: varchar("material_id").references(() => materials.id),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost").notNull(),
  totalValue: decimal("total_value").notNull(),
  valuationMethod: text("valuation_method").notNull(), // 'fifo', 'weighted-average', 'standard-cost'
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scrap and Rework Records
export const scrapRecords = pgTable("scrap_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recordNumber: text("record_number").notNull().unique(),
  batchId: varchar("batch_id").references(() => productionBatches.id).notNull(),
  stageId: varchar("stage_id").references(() => batchStages.id),
  recordType: text("record_type").notNull(), // 'scrap', 'rework', 'yield-loss'
  materialId: varchar("material_id").references(() => materials.id),
  quantity: integer("quantity").notNull(),
  uom: text("uom").notNull(),
  reason: text("reason").notNull(),
  reasonCategory: text("reason_category"), // 'machine-failure', 'operator-error', 'material-defect', 'process-deviation'
  unitCost: decimal("unit_cost"),
  totalCost: decimal("total_cost"),
  recoveryValue: decimal("recovery_value").default('0'),
  netLoss: decimal("net_loss"),
  capaId: varchar("capa_id").references(() => capas.id),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  glJournalId: varchar("gl_journal_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// COGS Postings - Cost of Goods Sold tracking
export const cogsPostings = pgTable("cogs_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postingNumber: text("posting_number").notNull().unique(),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  batchId: varchar("batch_id").references(() => productionBatches.id),
  documentId: varchar("document_id").references(() => financialDocuments.id), // Customer invoice
  postingDate: timestamp("posting_date").notNull(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  unitCost: decimal("unit_cost").notNull(),
  totalCogs: decimal("total_cogs").notNull(),
  revenueAmount: decimal("revenue_amount"),
  grossMargin: decimal("gross_margin"),
  marginPercent: decimal("margin_percent"),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  profitCenterId: varchar("profit_center_id").references(() => profitCenters.id),
  glJournalId: varchar("gl_journal_id"),
  notes: text("notes"),
  postedBy: text("posted_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== LEDGER, CLOSE & INSIGHTS ====================

// General Ledger Journals
export const glJournals = pgTable("gl_journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalNumber: text("journal_number").notNull().unique(),
  journalType: text("journal_type").notNull(), // 'auto', 'manual', 'adjustment', 'closing', 'reversing'
  journalDate: timestamp("journal_date").notNull(),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  referenceType: text("reference_type"), // 'invoice', 'payment', 'production-cost', 'inventory', 'manual'
  referenceId: text("reference_id"),
  referenceNumber: text("reference_number"),
  description: text("description").notNull(),
  totalDebit: decimal("total_debit").notNull().default('0'),
  totalCredit: decimal("total_credit").notNull().default('0'),
  status: text("status").notNull().default('draft'), // 'draft', 'posted', 'reversed'
  postedBy: text("posted_by"),
  postedAt: timestamp("posted_at"),
  reversedBy: text("reversed_by"),
  reversedAt: timestamp("reversed_at"),
  reversalJournalId: varchar("reversal_journal_id"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GL Journal Lines - Double-entry lines
export const glJournalLines = pgTable("gl_journal_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalId: varchar("journal_id").references(() => glJournals.id).notNull(),
  lineNumber: integer("line_number").notNull(),
  accountId: varchar("account_id").references(() => chartOfAccounts.id).notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  profitCenterId: varchar("profit_center_id").references(() => profitCenters.id),
  description: text("description"),
  debitAmount: decimal("debit_amount").default('0'),
  creditAmount: decimal("credit_amount").default('0'),
  partyId: varchar("party_id").references(() => parties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Auto Posting Rules - Automated journal creation rules
export const autoPostingRules = pgTable("auto_posting_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  triggerEvent: text("trigger_event").notNull(), // 'invoice-approval', 'payment-completion', 'production-completion', 'inventory-receipt'
  documentType: text("document_type"), // Specific document type to trigger on
  debitAccountId: varchar("debit_account_id").references(() => chartOfAccounts.id).notNull(),
  creditAccountId: varchar("credit_account_id").references(() => chartOfAccounts.id).notNull(),
  amountSource: text("amount_source").notNull(), // 'document-total', 'tax-amount', 'line-amount', 'calculated'
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accrual Templates
export const accrualTemplates = pgTable("accrual_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  accrualType: text("accrual_type").notNull(), // 'expense', 'revenue', 'provision'
  frequency: text("frequency").notNull(), // 'monthly', 'quarterly', 'annually'
  debitAccountId: varchar("debit_account_id").references(() => chartOfAccounts.id).notNull(),
  creditAccountId: varchar("credit_account_id").references(() => chartOfAccounts.id).notNull(),
  estimatedAmount: decimal("estimated_amount"),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  isActive: boolean("is_active").default(true),
  autoReverse: boolean("auto_reverse").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Period Close Tasks
export const periodCloseTasks = pgTable("period_close_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  taskNumber: integer("task_number").notNull(),
  taskName: text("task_name").notNull(),
  taskCategory: text("task_category").notNull(), // 'inventory', 'costing', 'accruals', 'reconciliation', 'reporting'
  description: text("description"),
  status: text("status").notNull().default('pending'), // 'pending', 'in-progress', 'completed', 'blocked'
  dueDate: timestamp("due_date"),
  assignedTo: text("assigned_to"),
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  blockerReason: text("blocker_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Versions
export const budgetVersions = pgTable("budget_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalYearId: varchar("fiscal_year_id").references(() => fiscalYears.id).notNull(),
  versionName: text("version_name").notNull(), // 'Original', 'Revised Q1', etc.
  versionNumber: integer("version_number").notNull(),
  status: text("status").notNull().default('draft'), // 'draft', 'submitted', 'approved', 'active'
  totalBudget: decimal("total_budget").default('0'),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Lines
export const budgetLines = pgTable("budget_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  budgetVersionId: varchar("budget_version_id").references(() => budgetVersions.id).notNull(),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  accountId: varchar("account_id").references(() => chartOfAccounts.id).notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  profitCenterId: varchar("profit_center_id").references(() => profitCenters.id),
  budgetAmount: decimal("budget_amount").notNull(),
  actualAmount: decimal("actual_amount").default('0'),
  varianceAmount: decimal("variance_amount"),
  variancePercent: decimal("variance_percent"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cash Flow Projections
export const cashFlowProjections = pgTable("cash_flow_projections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalPeriodId: varchar("fiscal_period_id").references(() => fiscalPeriods.id).notNull(),
  projectionDate: timestamp("projection_date").notNull(),
  flowType: text("flow_type").notNull(), // 'operating', 'investing', 'financing'
  category: text("category").notNull(), // 'receivables', 'payables', 'payroll', 'capex', 'loans', 'dividends'
  projectedInflow: decimal("projected_inflow").default('0'),
  actualInflow: decimal("actual_inflow").default('0'),
  projectedOutflow: decimal("projected_outflow").default('0'),
  actualOutflow: decimal("actual_outflow").default('0'),
  netCashFlow: decimal("net_cash_flow"),
  runningBalance: decimal("running_balance"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs - Financial audit trail
export const financeAuditLogs = pgTable("finance_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'journal', 'invoice', 'payment', 'budget', 'period-close'
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'approve', 'reject', 'post', 'reverse'
  previousValue: text("previous_value"), // JSON of previous state
  newValue: text("new_value"), // JSON of new state
  changedFields: text("changed_fields"), // JSON array of changed field names
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: text("ip_address"),
  notes: text("notes"),
});

// ==================== INVENTORY TRACEABILITY SYSTEM ====================

// Handling Units - physical containers (pallets, cartons, items, totes)
export const handlingUnits = pgTable("handling_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  huCode: text("hu_code").notNull().unique(), // e.g. PALT-00045, CART-00123
  huType: text("hu_type").notNull(), // 'pallet', 'carton', 'item', 'tote'
  parentHuId: varchar("parent_hu_id"), // self-reference for nesting
  materialCode: text("material_code"),
  materialName: text("material_name"),
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
  serialNumber: text("serial_number"),
  quantity: decimal("quantity").default('0'),
  uom: text("uom").default('units'),
  currentLocationCode: text("current_location_code"),
  currentLocationName: text("current_location_name"),
  status: text("status").notNull().default('available'), // 'available','in-transit','dispatched','scrapped','on-hold','qc-hold'
  barcodeValue: text("barcode_value").unique(),
  rfidEpc: text("rfid_epc"),
  supplierName: text("supplier_name"),
  receivedDate: timestamp("received_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Barcodes - registry of all generated barcodes
export const barcodes = pgTable("barcodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barcodeValue: text("barcode_value").notNull().unique(),
  barcodeType: text("barcode_type").notNull(), // 'HU', 'material', 'location', 'batch'
  linkedHuId: varchar("linked_hu_id").references(() => handlingUnits.id),
  linkedHuCode: text("linked_hu_code"),
  materialCode: text("material_code"),
  batchNumber: text("batch_number"),
  status: text("status").notNull().default('active'), // 'active', 'inactive', 'reprinted'
  printedAt: timestamp("printed_at"),
  printedBy: text("printed_by"),
  labelType: text("label_type"), // 'pallet', 'carton', 'item', 'location'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scan Exceptions - invalid or unresolved scan events
export const scanExceptions = pgTable("scan_exceptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exceptionNumber: text("exception_number").notNull().unique(),
  exceptionType: text("exception_type").notNull(), // 'unknown_tag','wrong_location','wrong_batch','duplicate_scan','no_shipment','hold_violation','inactive_tag','quantity_mismatch'
  scanType: text("scan_type").notNull().default('rfid'), // 'barcode', 'rfid', 'manual'
  scannedValue: text("scanned_value"), // the barcode value or RFID EPC that triggered this
  readerId: varchar("reader_id"),
  locationCode: text("location_code"),
  locationName: text("location_name"),
  materialCode: text("material_code"),
  batchNumber: text("batch_number"),
  description: text("description").notNull(),
  resolvedStatus: text("resolved_status").notNull().default('open'), // 'open', 'resolved', 'ignored'
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  scannedAt: timestamp("scanned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Movement Ledger - full audit trail of every stock movement
export const movementLedger = pgTable("movement_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  movementNumber: text("movement_number").notNull().unique(), // MVT-000001
  movementType: text("movement_type").notNull(), // stock_in, putaway, internal_transfer, issue_to_production, production_receipt, stock_out, QC_hold, cycle_count
  huId: varchar("hu_id"),
  huCode: text("hu_code"),
  huType: text("hu_type"),
  materialCode: text("material_code"),
  materialName: text("material_name"),
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
  quantity: decimal("quantity").default('0'),
  uom: text("uom"),
  fromLocationCode: text("from_location_code"),
  fromLocationName: text("from_location_name"),
  toLocationCode: text("to_location_code"),
  toLocationName: text("to_location_name"),
  sourceDocType: text("source_doc_type"), // 'PO','ASN','production_order','shipment','QC_transaction','transfer_order','cycle_count'
  sourceDocNumber: text("source_doc_number"), // e.g. PO-2024-001
  scanMethod: text("scan_method").notNull().default('manual'), // 'barcode','rfid','manual','api'
  performedBy: text("performed_by"),
  statusBefore: text("status_before"),
  statusAfter: text("status_after"),
  notes: text("notes"),
  movedAt: timestamp("moved_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHandlingUnitSchema = createInsertSchema(handlingUnits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBarcodeSchema = createInsertSchema(barcodes).omit({ id: true, createdAt: true });
export const insertScanExceptionSchema = createInsertSchema(scanExceptions).omit({ id: true, createdAt: true });
export const insertMovementLedgerSchema = createInsertSchema(movementLedger).omit({ id: true, createdAt: true });

export type InsertHandlingUnit = z.infer<typeof insertHandlingUnitSchema>;
export type HandlingUnit = typeof handlingUnits.$inferSelect;
export type InsertBarcode = z.infer<typeof insertBarcodeSchema>;
export type Barcode = typeof barcodes.$inferSelect;
export type InsertScanException = z.infer<typeof insertScanExceptionSchema>;
export type ScanException = typeof scanExceptions.$inferSelect;
export type InsertMovementLedger = z.infer<typeof insertMovementLedgerSchema>;
export type MovementLedgerEntry = typeof movementLedger.$inferSelect;

// ==================== RFID INVENTORY TRACKING ====================

// RFID Zones - Areas monitored by RFID scanners
export const rfidZones = pgTable("rfid_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zoneCode: text("zone_code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rack', 'room', 'door', 'conveyor', 'cold-storage', 'quarantine'
  warehouseId: text("warehouse_id"),
  locationCode: text("location_code"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RFID Readers/Scanners - Physical scanner devices
export const rfidReaders = pgTable("rfid_readers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  readerCode: text("reader_code").notNull().unique(),
  name: text("name").notNull(),
  model: text("model").notNull(), // e.g., 'Zebra FX9600', 'Impinj R700', 'Alien ALR-9900+'
  vendor: text("vendor").notNull(), // 'Zebra', 'Impinj', 'Alien', 'Honeywell', 'Feig', 'Nordic ID'
  zoneId: varchar("zone_id").references(() => rfidZones.id),
  ipAddress: text("ip_address"),
  port: integer("port").default(5084),
  antennaCount: integer("antenna_count").default(4),
  status: text("status").notNull().default('offline'), // 'online', 'offline', 'error', 'maintenance'
  firmwareVersion: text("firmware_version"),
  lastHeartbeat: timestamp("last_heartbeat"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  installedDate: timestamp("installed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RFID Tags - Tags attached to materials/items
export const rfidTags = pgTable("rfid_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tagEpc: text("tag_epc").notNull().unique(), // Electronic Product Code
  tagType: text("tag_type").notNull().default('UHF'), // 'UHF', 'HF', 'LF'
  materialId: varchar("material_id").references(() => materials.id),
  materialType: text("material_type"), // 'raw-material', 'packaging', 'artwork', 'finished-product', 'instructions'
  batchNumber: text("batch_number"),
  lotNumber: text("lot_number"),
  status: text("status").notNull().default('active'), // 'active', 'decommissioned', 'lost', 'damaged'
  lastSeenAt: timestamp("last_seen_at"),
  lastZoneId: varchar("last_zone_id").references(() => rfidZones.id),
  lastReaderId: varchar("last_reader_id").references(() => rfidReaders.id),
  lastRssi: integer("last_rssi"), // Signal strength in dBm
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RFID Events - Scan events and movement records
export const rfidEvents = pgTable("rfid_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventNumber: text("event_number").notNull().unique(),
  tagEpc: text("tag_epc").notNull(),
  tagId: varchar("tag_id").references(() => rfidTags.id),
  readerId: varchar("reader_id").references(() => rfidReaders.id),
  zoneId: varchar("zone_id").references(() => rfidZones.id),
  eventType: text("event_type").notNull(), // 'inbound', 'outbound', 'detected', 'zone-transfer'
  direction: text("direction"), // 'in', 'out'
  rssi: integer("rssi"), // Signal strength in dBm
  antennaPort: integer("antenna_port"),
  materialId: varchar("material_id").references(() => materials.id),
  materialType: text("material_type"),
  batchNumber: text("batch_number"),
  fromZoneId: varchar("from_zone_id").references(() => rfidZones.id),
  toZoneId: varchar("to_zone_id").references(() => rfidZones.id),
  quantity: integer("quantity").default(1),
  performedBy: text("performed_by"),
  notes: text("notes"),
  scannedAt: timestamp("scanned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRfidZoneSchema = createInsertSchema(rfidZones).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRfidReaderSchema = createInsertSchema(rfidReaders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRfidTagSchema = createInsertSchema(rfidTags).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRfidEventSchema = createInsertSchema(rfidEvents).omit({ id: true, createdAt: true });

export type InsertRfidZone = z.infer<typeof insertRfidZoneSchema>;
export type RfidZone = typeof rfidZones.$inferSelect;
export type InsertRfidReader = z.infer<typeof insertRfidReaderSchema>;
export type RfidReader = typeof rfidReaders.$inferSelect;
export type InsertRfidTag = z.infer<typeof insertRfidTagSchema>;
export type RfidTag = typeof rfidTags.$inferSelect;
export type InsertRfidEvent = z.infer<typeof insertRfidEventSchema>;
export type RfidEvent = typeof rfidEvents.$inferSelect;

// ==================== INSERT SCHEMAS AND TYPES ====================

// Financial Setup
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCostCenterSchema = createInsertSchema(costCenters).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfitCenterSchema = createInsertSchema(profitCenters).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaxCodeSchema = createInsertSchema(taxCodes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentTermsSchema = createInsertSchema(paymentTerms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFiscalYearSchema = createInsertSchema(fiscalYears).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFiscalPeriodSchema = createInsertSchema(fiscalPeriods).omit({ id: true, createdAt: true, updatedAt: true });

// Transactions
export const insertPartySchema = createInsertSchema(parties).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinancialDocumentSchema = createInsertSchema(financialDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentLineSchema = createInsertSchema(documentLines).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentAllocationSchema = createInsertSchema(paymentAllocations).omit({ id: true, createdAt: true });

// Manufacturing Finance
export const insertCostPoolSchema = createInsertSchema(costPools).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBomCostVersionSchema = createInsertSchema(bomCostVersions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductionCostRunSchema = createInsertSchema(productionCostRuns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLaborMachineLogSchema = createInsertSchema(laborMachineLogs).omit({ id: true, createdAt: true });
export const insertQcTestCostSchema = createInsertSchema(qcTestCosts).omit({ id: true, createdAt: true });
export const insertOverheadAllocationSchema = createInsertSchema(overheadAllocations).omit({ id: true, createdAt: true });
export const insertInventoryValuationSnapshotSchema = createInsertSchema(inventoryValuationSnapshots).omit({ id: true, createdAt: true });
export const insertScrapRecordSchema = createInsertSchema(scrapRecords).omit({ id: true, createdAt: true });
export const insertCogsPostingSchema = createInsertSchema(cogsPostings).omit({ id: true, createdAt: true });

// Ledger
export const insertGlJournalSchema = createInsertSchema(glJournals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGlJournalLineSchema = createInsertSchema(glJournalLines).omit({ id: true, createdAt: true });
export const insertAutoPostingRuleSchema = createInsertSchema(autoPostingRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAccrualTemplateSchema = createInsertSchema(accrualTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPeriodCloseTaskSchema = createInsertSchema(periodCloseTasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetVersionSchema = createInsertSchema(budgetVersions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetLineSchema = createInsertSchema(budgetLines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCashFlowProjectionSchema = createInsertSchema(cashFlowProjections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinanceAuditLogSchema = createInsertSchema(financeAuditLogs).omit({ id: true });

// Type exports - Financial Setup
export type InsertChartOfAccounts = z.infer<typeof insertChartOfAccountsSchema>;
export type ChartOfAccounts = typeof chartOfAccounts.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;
export type CostCenter = typeof costCenters.$inferSelect;
export type InsertProfitCenter = z.infer<typeof insertProfitCenterSchema>;
export type ProfitCenter = typeof profitCenters.$inferSelect;
export type InsertTaxCode = z.infer<typeof insertTaxCodeSchema>;
export type TaxCode = typeof taxCodes.$inferSelect;
export type InsertPaymentTerms = z.infer<typeof insertPaymentTermsSchema>;
export type PaymentTerms = typeof paymentTerms.$inferSelect;
export type InsertFiscalYear = z.infer<typeof insertFiscalYearSchema>;
export type FiscalYear = typeof fiscalYears.$inferSelect;
export type InsertFiscalPeriod = z.infer<typeof insertFiscalPeriodSchema>;
export type FiscalPeriod = typeof fiscalPeriods.$inferSelect;

// Type exports - Transactions
export type InsertParty = z.infer<typeof insertPartySchema>;
export type Party = typeof parties.$inferSelect;
export type InsertFinancialDocument = z.infer<typeof insertFinancialDocumentSchema>;
export type FinancialDocument = typeof financialDocuments.$inferSelect;
export type InsertDocumentLine = z.infer<typeof insertDocumentLineSchema>;
export type DocumentLine = typeof documentLines.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPaymentAllocation = z.infer<typeof insertPaymentAllocationSchema>;
export type PaymentAllocation = typeof paymentAllocations.$inferSelect;

// Type exports - Manufacturing Finance
export type InsertCostPool = z.infer<typeof insertCostPoolSchema>;
export type CostPool = typeof costPools.$inferSelect;
export type InsertBomCostVersion = z.infer<typeof insertBomCostVersionSchema>;
export type BomCostVersion = typeof bomCostVersions.$inferSelect;
export type InsertProductionCostRun = z.infer<typeof insertProductionCostRunSchema>;
export type ProductionCostRun = typeof productionCostRuns.$inferSelect;
export type InsertLaborMachineLog = z.infer<typeof insertLaborMachineLogSchema>;
export type LaborMachineLog = typeof laborMachineLogs.$inferSelect;
export type InsertQcTestCost = z.infer<typeof insertQcTestCostSchema>;
export type QcTestCost = typeof qcTestCosts.$inferSelect;
export type InsertOverheadAllocation = z.infer<typeof insertOverheadAllocationSchema>;
export type OverheadAllocation = typeof overheadAllocations.$inferSelect;
export type InsertInventoryValuationSnapshot = z.infer<typeof insertInventoryValuationSnapshotSchema>;
export type InventoryValuationSnapshot = typeof inventoryValuationSnapshots.$inferSelect;
export type InsertScrapRecord = z.infer<typeof insertScrapRecordSchema>;
export type ScrapRecord = typeof scrapRecords.$inferSelect;
export type InsertCogsPosting = z.infer<typeof insertCogsPostingSchema>;
export type CogsPosting = typeof cogsPostings.$inferSelect;

// Type exports - Ledger
export type InsertGlJournal = z.infer<typeof insertGlJournalSchema>;
export type GlJournal = typeof glJournals.$inferSelect;
export type InsertGlJournalLine = z.infer<typeof insertGlJournalLineSchema>;
export type GlJournalLine = typeof glJournalLines.$inferSelect;
export type InsertAutoPostingRule = z.infer<typeof insertAutoPostingRuleSchema>;
export type AutoPostingRule = typeof autoPostingRules.$inferSelect;
export type InsertAccrualTemplate = z.infer<typeof insertAccrualTemplateSchema>;
export type AccrualTemplate = typeof accrualTemplates.$inferSelect;
export type InsertPeriodCloseTask = z.infer<typeof insertPeriodCloseTaskSchema>;
export type PeriodCloseTask = typeof periodCloseTasks.$inferSelect;
export type InsertBudgetVersion = z.infer<typeof insertBudgetVersionSchema>;
export type BudgetVersion = typeof budgetVersions.$inferSelect;
export type InsertBudgetLine = z.infer<typeof insertBudgetLineSchema>;
export type BudgetLine = typeof budgetLines.$inferSelect;
export type InsertCashFlowProjection = z.infer<typeof insertCashFlowProjectionSchema>;
export type CashFlowProjection = typeof cashFlowProjections.$inferSelect;
export type InsertFinanceAuditLog = z.infer<typeof insertFinanceAuditLogSchema>;
export type FinanceAuditLog = typeof financeAuditLogs.$inferSelect;
