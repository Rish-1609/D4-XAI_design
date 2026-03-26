import { type Material, type InsertMaterial, type UpdateMaterial, type TestConfig, type InsertTestConfig, type TestResult, type InsertTestResult, type TestInstruction, type InsertTestInstruction, type Sop, type InsertSop, type SopVersion, type InsertSopVersion, type SopChangeRequest, type InsertSopChangeRequest, type Capa, type InsertCapa, type ProductionOrder, type InsertProductionOrder, type Bom, type InsertBom, type BomItem, type InsertBomItem, type InventoryItem, type InsertInventoryItem, type InventoryTransaction, type InsertInventoryTransaction, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type ProductionBatch, type InsertProductionBatch, type BatchStage, type InsertBatchStage, type BatchExecution, type InsertBatchExecution, type JobWork, type InsertJobWork, type BatchReview, type InsertBatchReview, type Equipment, type InsertEquipment, type ProductionJob, type InsertProductionJob, type JobCard, type InsertJobCard, type ChartOfAccounts, type InsertChartOfAccounts, type CostCenter, type InsertCostCenter, type ProfitCenter, type InsertProfitCenter, type TaxCode, type InsertTaxCode, type PaymentTerms, type InsertPaymentTerms, type FiscalYear, type InsertFiscalYear, type FiscalPeriod, type InsertFiscalPeriod, type Party, type InsertParty, type FinancialDocument, type InsertFinancialDocument, type DocumentLine, type InsertDocumentLine, type Payment, type InsertPayment, type GlJournal, type InsertGlJournal, type GlJournalLine, type InsertGlJournalLine, type RfidZone, type InsertRfidZone, type RfidReader, type InsertRfidReader, type RfidTag, type InsertRfidTag, type RfidEvent, type InsertRfidEvent, type HandlingUnit, type InsertHandlingUnit, type Barcode, type InsertBarcode, type ScanException, type InsertScanException, type MovementLedgerEntry, type InsertMovementLedger, type Supplier, type InsertSupplier } from "@shared/schema";

// Legacy type aliases for compatibility
type CapaAction = any;
type InsertCapaAction = any;
type BomMaterial = BomItem;
type InsertBomMaterial = InsertBomItem;
type BomSubAssembly = any;
type InsertBomSubAssembly = any;
type BomChangeRequest = any;
type InsertBomChangeRequest = any;
type StockMovement = InventoryTransaction;
type InsertStockMovement = InsertInventoryTransaction;
type QcStage = any;
type InsertQcStage = any;
type QcCheckpoint = any;
type InsertQcCheckpoint = any;
type QcTestResult = any;
type InsertQcTestResult = any;
type QcApproval = any;
type InsertQcApproval = any;
type BatchRelease = any;
type InsertBatchRelease = any;
type BatchWorkflowStep = any;
type InsertBatchWorkflowStep = any;
type BatchCertificate = any;
type InsertBatchCertificate = any;
type QaAuditTrail = any;
type InsertQaAuditTrail = any;
type QcStageTemplate = any;
type InsertQcStageTemplate = any;
import { randomUUID } from "crypto";

export interface IStorage {
  // Material operations
  getMaterials(): Promise<Material[]>;
  getMaterialsByType(type: string): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: string, material: UpdateMaterial): Promise<Material | undefined>;
  deleteMaterial(id: string): Promise<boolean>;
  getQualityStats(): Promise<{
    approved: number;
    pending: number;
    failed: number;
    underTesting: number;
    averageScore: number;
  }>;

  // Test Configuration operations
  getTestConfigs(): Promise<TestConfig[]>;
  createTestConfig(testConfig: InsertTestConfig): Promise<TestConfig>;
  
  // Test Results operations
  getTestResults(): Promise<TestResult[]>;
  getTestResultsByMaterial(materialId: string): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  updateTestResult(id: string, updateData: Partial<InsertTestResult>): Promise<TestResult | undefined>;

  // Test Instructions operations
  getTestInstructions(): Promise<TestInstruction[]>;
  getTestInstructionsByMaterialType(materialType: string): Promise<TestInstruction[]>;
  createTestInstruction(testInstruction: InsertTestInstruction): Promise<TestInstruction>;

  // SOP operations
  getSops(): Promise<Sop[]>;
  getSopsByCategory(category: string): Promise<Sop[]>;
  getSop(id: string): Promise<Sop | undefined>;
  createSop(sop: InsertSop): Promise<Sop>;
  updateSop(id: string, sop: Partial<InsertSop>): Promise<Sop | undefined>;
  deleteSop(id: string): Promise<boolean>;
  getSopVersions(sopId: string): Promise<SopVersion[]>;
  createSopVersion(sopVersion: InsertSopVersion): Promise<SopVersion>;

  // SOP Change Request operations
  getSopChangeRequests(): Promise<SopChangeRequest[]>;
  getSopChangeRequestsBySop(sopId: string): Promise<SopChangeRequest[]>;
  getSopChangeRequest(id: string): Promise<SopChangeRequest | undefined>;
  createSopChangeRequest(changeRequest: InsertSopChangeRequest): Promise<SopChangeRequest>;
  updateSopChangeRequest(id: string, changeRequest: Partial<InsertSopChangeRequest>): Promise<SopChangeRequest | undefined>;
  approveSopChangeRequest(id: string, approvalData: { approvedBy: string; reviewComments?: string; }): Promise<SopChangeRequest | undefined>;
  rejectSopChangeRequest(id: string, rejectionData: { rejectedBy: string; rejectionReason: string; }): Promise<SopChangeRequest | undefined>;

  // Production Order operations
  getProductionOrders(): Promise<ProductionOrder[]>;
  getProductionOrder(id: string): Promise<ProductionOrder | undefined>;
  createProductionOrder(order: InsertProductionOrder): Promise<ProductionOrder>;
  updateProductionOrder(id: string, order: Partial<InsertProductionOrder>): Promise<ProductionOrder | undefined>;
  deleteProductionOrder(id: string): Promise<boolean>;

  // BOM operations
  getBoms(): Promise<Bom[]>;
  getBom(id: string): Promise<Bom | undefined>;
  createBom(bom: InsertBom): Promise<Bom>;
  updateBom(id: string, bom: Partial<InsertBom>): Promise<Bom | undefined>;
  deleteBom(id: string): Promise<boolean>;
  getBomMaterials(bomId: string): Promise<BomMaterial[]>;
  createBomMaterial(bomMaterial: InsertBomMaterial): Promise<BomMaterial>;
  getBomSubAssemblies(bomId: string): Promise<BomSubAssembly[]>;
  createBomSubAssembly(bomSubAssembly: InsertBomSubAssembly): Promise<BomSubAssembly>;
  getBomStats(): Promise<{
    totalBoms: number;
    rawMaterials: number;
    liveStockItems: number;
    totalBomValue: number;
  }>;

  // BOM Change Request operations
  getBomChangeRequests(): Promise<BomChangeRequest[]>;
  getBomChangeRequestsByBom(bomId: string): Promise<BomChangeRequest[]>;
  getBomChangeRequest(id: string): Promise<BomChangeRequest | undefined>;
  createBomChangeRequest(changeRequest: InsertBomChangeRequest): Promise<BomChangeRequest>;
  updateBomChangeRequest(id: string, changeRequest: Partial<InsertBomChangeRequest>): Promise<BomChangeRequest | undefined>;
  approveBomChangeRequest(id: string, approvalData: { approvedBy: string; reviewComments?: string; }): Promise<BomChangeRequest | undefined>;
  rejectBomChangeRequest(id: string, rejectionData: { rejectedBy: string; rejectionReason: string; }): Promise<BomChangeRequest | undefined>;

  // CAPA operations
  getCapas(): Promise<Capa[]>;
  getCapa(id: string): Promise<Capa | undefined>;
  createCapa(capa: InsertCapa): Promise<Capa>;
  updateCapa(id: string, capa: Partial<InsertCapa>): Promise<Capa | undefined>;
  deleteCapa(id: string): Promise<boolean>;
  getCapaActions(capaId: string): Promise<CapaAction[]>;
  createCapaAction(capaAction: InsertCapaAction): Promise<CapaAction>;

  // Inventory operations
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  getInventoryStats(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }>;
  
  // Stock Movement operations
  getStockMovements(): Promise<StockMovement[]>;
  getStockMovementsByItem(itemId: string): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // QA/QC Stage operations
  getQcStages(): Promise<QcStage[]>;
  getQcStagesByOrder(productionOrderId: string): Promise<QcStage[]>;
  getQcStage(id: string): Promise<QcStage | undefined>;
  createQcStage(insertQcStage: InsertQcStage): Promise<QcStage>;
  updateQcStage(id: string, updateData: Partial<InsertQcStage>): Promise<QcStage | undefined>;
  deleteQcStage(id: string): Promise<boolean>;

  // QC Checkpoint operations
  getQcCheckpoints(): Promise<QcCheckpoint[]>;
  getQcCheckpointsByStage(stageId: string): Promise<QcCheckpoint[]>;
  getQcCheckpoint(id: string): Promise<QcCheckpoint | undefined>;
  createQcCheckpoint(insertQcCheckpoint: InsertQcCheckpoint): Promise<QcCheckpoint>;
  updateQcCheckpoint(id: string, updateData: Partial<InsertQcCheckpoint>): Promise<QcCheckpoint | undefined>;
  deleteQcCheckpoint(id: string): Promise<boolean>;

  // QC Test Result operations
  getQcTestResults(): Promise<QcTestResult[]>;
  getQcTestResultsByCheckpoint(checkpointId: string): Promise<QcTestResult[]>;
  getQcTestResult(id: string): Promise<QcTestResult | undefined>;
  createQcTestResult(insertQcTestResult: InsertQcTestResult): Promise<QcTestResult>;
  updateQcTestResult(id: string, updateData: Partial<InsertQcTestResult>): Promise<QcTestResult | undefined>;
  deleteQcTestResult(id: string): Promise<boolean>;

  // QC Approval operations
  getQcApprovals(): Promise<QcApproval[]>;
  getQcApprovalsByStage(stageId: string): Promise<QcApproval[]>;
  getQcApproval(id: string): Promise<QcApproval | undefined>;
  createQcApproval(insertQcApproval: InsertQcApproval): Promise<QcApproval>;
  updateQcApproval(id: string, updateData: Partial<InsertQcApproval>): Promise<QcApproval | undefined>;
  deleteQcApproval(id: string): Promise<boolean>;

  // Batch Release operations
  getBatchReleases(): Promise<BatchRelease[]>;
  getBatchReleasesByOrder(productionOrderId: string): Promise<BatchRelease[]>;
  getBatchRelease(id: string): Promise<BatchRelease | undefined>;
  createBatchRelease(insertBatchRelease: InsertBatchRelease): Promise<BatchRelease>;
  updateBatchRelease(id: string, updateData: Partial<InsertBatchRelease>): Promise<BatchRelease | undefined>;
  deleteBatchRelease(id: string): Promise<boolean>;

  // Batch Workflow Step operations
  getBatchWorkflowSteps(): Promise<BatchWorkflowStep[]>;
  getBatchWorkflowStepsByBatch(batchReleaseId: string): Promise<BatchWorkflowStep[]>;
  getBatchWorkflowStep(id: string): Promise<BatchWorkflowStep | undefined>;
  createBatchWorkflowStep(insertBatchWorkflowStep: InsertBatchWorkflowStep): Promise<BatchWorkflowStep>;
  updateBatchWorkflowStep(id: string, updateData: Partial<InsertBatchWorkflowStep>): Promise<BatchWorkflowStep | undefined>;
  deleteBatchWorkflowStep(id: string): Promise<boolean>;

  // Batch Certificate operations
  getBatchCertificates(): Promise<BatchCertificate[]>;
  getBatchCertificateByBatchRelease(batchReleaseId: string): Promise<BatchCertificate | undefined>;
  getBatchCertificate(id: string): Promise<BatchCertificate | undefined>;
  createBatchCertificate(insertBatchCertificate: InsertBatchCertificate): Promise<BatchCertificate>;
  updateBatchCertificate(id: string, updateData: Partial<InsertBatchCertificate>): Promise<BatchCertificate | undefined>;
  deleteBatchCertificate(id: string): Promise<boolean>;

  // QA Audit Trail operations
  getQaAuditTrails(): Promise<QaAuditTrail[]>;
  getQaAuditTrailsByEntity(entityType: string, entityId: string): Promise<QaAuditTrail[]>;
  getQaAuditTrail(id: string): Promise<QaAuditTrail | undefined>;
  createQaAuditTrail(insertQaAuditTrail: InsertQaAuditTrail): Promise<QaAuditTrail>;

  // QC Stage Template operations
  getQcStageTemplates(): Promise<QcStageTemplate[]>;
  getQcStageTemplate(id: string): Promise<QcStageTemplate | undefined>;
  createQcStageTemplate(insertQcStageTemplate: InsertQcStageTemplate): Promise<QcStageTemplate>;
  updateQcStageTemplate(id: string, updateData: Partial<InsertQcStageTemplate>): Promise<QcStageTemplate | undefined>;
  deleteQcStageTemplate(id: string): Promise<boolean>;

  // Production Management operations
  getProductionBatches(): Promise<ProductionBatch[]>;
  getProductionBatch(id: string): Promise<ProductionBatch | undefined>;
  createProductionBatch(batch: InsertProductionBatch): Promise<ProductionBatch>;
  updateProductionBatch(id: string, data: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined>;
  deleteProductionBatch(id: string): Promise<boolean>;

  // Batch Stage operations
  getBatchStages(batchId: string): Promise<BatchStage[]>;
  createBatchStage(stage: InsertBatchStage): Promise<BatchStage>;
  updateBatchStage(id: string, data: Partial<InsertBatchStage>): Promise<BatchStage | undefined>;

  // Batch Execution operations
  getBatchExecutions(batchId: string): Promise<BatchExecution[]>;
  createBatchExecution(execution: InsertBatchExecution): Promise<BatchExecution>;

  // Job Work operations
  getJobWorks(): Promise<JobWork[]>;
  getJobWork(id: string): Promise<JobWork | undefined>;
  createJobWork(jobWork: InsertJobWork): Promise<JobWork>;
  updateJobWork(id: string, data: Partial<InsertJobWork>): Promise<JobWork | undefined>;

  // Batch Review operations
  getBatchReviews(): Promise<BatchReview[]>;
  getBatchReview(id: string): Promise<BatchReview | undefined>;
  getBatchReviewByBatchId(batchId: string): Promise<BatchReview | undefined>;
  createBatchReview(review: InsertBatchReview): Promise<BatchReview>;
  updateBatchReview(id: string, data: Partial<InsertBatchReview>): Promise<BatchReview | undefined>;

  // Equipment operations
  getEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: string): Promise<Equipment | undefined>;
  getEquipmentByStatus(status: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, data: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: string): Promise<boolean>;

  // Production Job operations
  getProductionJobs(): Promise<ProductionJob[]>;
  getProductionJob(id: string): Promise<ProductionJob | undefined>;
  getProductionJobsByDateRange(startDate: Date, endDate: Date): Promise<ProductionJob[]>;
  getProductionJobsByEquipment(equipmentId: string): Promise<ProductionJob[]>;
  createProductionJob(job: InsertProductionJob): Promise<ProductionJob>;
  updateProductionJob(id: string, data: Partial<InsertProductionJob>): Promise<ProductionJob | undefined>;
  deleteProductionJob(id: string): Promise<boolean>;

  // Job Card operations
  getJobCards(): Promise<JobCard[]>;
  getJobCard(id: string): Promise<JobCard | undefined>;
  getJobCardsByJob(jobId: string): Promise<JobCard[]>;
  getJobCardsByBatch(batchId: string): Promise<JobCard[]>;
  createJobCard(card: InsertJobCard): Promise<JobCard>;
  updateJobCard(id: string, data: Partial<InsertJobCard>): Promise<JobCard | undefined>;
  deleteJobCard(id: string): Promise<boolean>;

  // ========== FINANCE MODULE ==========
  
  // Chart of Accounts operations
  getChartOfAccounts(): Promise<ChartOfAccounts[]>;
  getChartOfAccountsByType(accountType: string): Promise<ChartOfAccounts[]>;
  getChartOfAccount(id: string): Promise<ChartOfAccounts | undefined>;
  createChartOfAccount(account: InsertChartOfAccounts): Promise<ChartOfAccounts>;
  updateChartOfAccount(id: string, data: Partial<InsertChartOfAccounts>): Promise<ChartOfAccounts | undefined>;
  deleteChartOfAccount(id: string): Promise<boolean>;

  // Cost Center operations
  getCostCenters(): Promise<CostCenter[]>;
  getCostCenter(id: string): Promise<CostCenter | undefined>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, data: Partial<InsertCostCenter>): Promise<CostCenter | undefined>;
  deleteCostCenter(id: string): Promise<boolean>;

  // Profit Center operations
  getProfitCenters(): Promise<ProfitCenter[]>;
  getProfitCenter(id: string): Promise<ProfitCenter | undefined>;
  createProfitCenter(profitCenter: InsertProfitCenter): Promise<ProfitCenter>;
  updateProfitCenter(id: string, data: Partial<InsertProfitCenter>): Promise<ProfitCenter | undefined>;
  deleteProfitCenter(id: string): Promise<boolean>;

  // Tax Code operations
  getTaxCodes(): Promise<TaxCode[]>;
  getTaxCode(id: string): Promise<TaxCode | undefined>;
  createTaxCode(taxCode: InsertTaxCode): Promise<TaxCode>;
  updateTaxCode(id: string, data: Partial<InsertTaxCode>): Promise<TaxCode | undefined>;
  deleteTaxCode(id: string): Promise<boolean>;

  // Payment Terms operations
  getPaymentTerms(): Promise<PaymentTerms[]>;
  getPaymentTerm(id: string): Promise<PaymentTerms | undefined>;
  createPaymentTerms(terms: InsertPaymentTerms): Promise<PaymentTerms>;
  updatePaymentTerms(id: string, data: Partial<InsertPaymentTerms>): Promise<PaymentTerms | undefined>;
  deletePaymentTerms(id: string): Promise<boolean>;

  // Fiscal Year operations
  getFiscalYears(): Promise<FiscalYear[]>;
  getFiscalYear(id: string): Promise<FiscalYear | undefined>;
  getActiveFiscalYear(): Promise<FiscalYear | undefined>;
  createFiscalYear(year: InsertFiscalYear): Promise<FiscalYear>;
  updateFiscalYear(id: string, data: Partial<InsertFiscalYear>): Promise<FiscalYear | undefined>;
  deleteFiscalYear(id: string): Promise<boolean>;

  // Fiscal Period operations
  getFiscalPeriods(fiscalYearId: string): Promise<FiscalPeriod[]>;
  getFiscalPeriod(id: string): Promise<FiscalPeriod | undefined>;
  getOpenFiscalPeriods(): Promise<FiscalPeriod[]>;
  createFiscalPeriod(period: InsertFiscalPeriod): Promise<FiscalPeriod>;
  updateFiscalPeriod(id: string, data: Partial<InsertFiscalPeriod>): Promise<FiscalPeriod | undefined>;
  deleteFiscalPeriod(id: string): Promise<boolean>;

  // Party (Vendors & Customers) operations
  getParties(): Promise<Party[]>;
  getPartiesByType(partyType: string): Promise<Party[]>;
  getParty(id: string): Promise<Party | undefined>;
  createParty(party: InsertParty): Promise<Party>;
  updateParty(id: string, data: Partial<InsertParty>): Promise<Party | undefined>;
  deleteParty(id: string): Promise<boolean>;

  // Financial Document operations (Invoices, Credit Notes, etc.)
  getFinancialDocuments(): Promise<FinancialDocument[]>;
  getFinancialDocumentsByType(docType: string): Promise<FinancialDocument[]>;
  getFinancialDocumentsByParty(partyId: string): Promise<FinancialDocument[]>;
  getFinancialDocument(id: string): Promise<FinancialDocument | undefined>;
  createFinancialDocument(doc: InsertFinancialDocument): Promise<FinancialDocument>;
  updateFinancialDocument(id: string, data: Partial<InsertFinancialDocument>): Promise<FinancialDocument | undefined>;
  deleteFinancialDocument(id: string): Promise<boolean>;

  // Document Line operations
  getDocumentLines(documentId: string): Promise<DocumentLine[]>;
  createDocumentLine(line: InsertDocumentLine): Promise<DocumentLine>;
  updateDocumentLine(id: string, data: Partial<InsertDocumentLine>): Promise<DocumentLine | undefined>;
  deleteDocumentLine(id: string): Promise<boolean>;

  // Payment operations
  getPayments(): Promise<Payment[]>;
  getPaymentsByParty(partyId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;

  // GL Journal operations
  getGlJournals(): Promise<GlJournal[]>;
  getGlJournalsByPeriod(fiscalPeriodId: string): Promise<GlJournal[]>;
  getGlJournal(id: string): Promise<GlJournal | undefined>;
  createGlJournal(journal: InsertGlJournal): Promise<GlJournal>;
  updateGlJournal(id: string, data: Partial<InsertGlJournal>): Promise<GlJournal | undefined>;
  deleteGlJournal(id: string): Promise<boolean>;

  // GL Journal Line operations
  getGlJournalLines(journalId: string): Promise<GlJournalLine[]>;
  createGlJournalLine(line: InsertGlJournalLine): Promise<GlJournalLine>;
  updateGlJournalLine(id: string, data: Partial<InsertGlJournalLine>): Promise<GlJournalLine | undefined>;
  deleteGlJournalLine(id: string): Promise<boolean>;

  // Finance Analytics
  getAccountBalance(accountId: string): Promise<{ debit: number; credit: number; balance: number }>;
  getTrialBalance(fiscalPeriodId: string): Promise<Array<{ accountId: string; accountName: string; accountCode: string; debit: number; credit: number; }>>;
  getAgingReport(partyType: string): Promise<Array<{ partyId: string; partyName: string; current: number; days30: number; days60: number; days90: number; over90: number; total: number; }>>;

  // RFID Zone operations
  getRfidZones(): Promise<RfidZone[]>;
  getRfidZone(id: string): Promise<RfidZone | undefined>;
  createRfidZone(zone: InsertRfidZone): Promise<RfidZone>;
  updateRfidZone(id: string, data: Partial<InsertRfidZone>): Promise<RfidZone | undefined>;
  deleteRfidZone(id: string): Promise<boolean>;

  // RFID Reader operations
  getRfidReaders(): Promise<RfidReader[]>;
  getRfidReader(id: string): Promise<RfidReader | undefined>;
  createRfidReader(reader: InsertRfidReader): Promise<RfidReader>;
  updateRfidReader(id: string, data: Partial<InsertRfidReader>): Promise<RfidReader | undefined>;
  deleteRfidReader(id: string): Promise<boolean>;

  // RFID Tag operations
  getRfidTags(): Promise<RfidTag[]>;
  getRfidTag(id: string): Promise<RfidTag | undefined>;
  getRfidTagByEpc(epc: string): Promise<RfidTag | undefined>;
  createRfidTag(tag: InsertRfidTag): Promise<RfidTag>;
  updateRfidTag(id: string, data: Partial<InsertRfidTag>): Promise<RfidTag | undefined>;
  deleteRfidTag(id: string): Promise<boolean>;

  // RFID Event operations
  getRfidEvents(): Promise<RfidEvent[]>;
  getRfidEventsByTag(tagId: string): Promise<RfidEvent[]>;
  getRfidEventsByZone(zoneId: string): Promise<RfidEvent[]>;
  createRfidEvent(event: InsertRfidEvent): Promise<RfidEvent>;
  getRfidStats(): Promise<{ totalReaders: number; onlineReaders: number; activeTags: number; todayEvents: number; inboundToday: number; outboundToday: number; }>;

  // Handling Unit operations
  getHandlingUnits(): Promise<HandlingUnit[]>;
  getHandlingUnit(id: string): Promise<HandlingUnit | undefined>;
  getHandlingUnitByCode(huCode: string): Promise<HandlingUnit | undefined>;
  createHandlingUnit(hu: InsertHandlingUnit): Promise<HandlingUnit>;
  updateHandlingUnit(id: string, data: Partial<InsertHandlingUnit>): Promise<HandlingUnit | undefined>;
  deleteHandlingUnit(id: string): Promise<boolean>;

  // Barcode operations
  getBarcodes(): Promise<Barcode[]>;
  getBarcode(id: string): Promise<Barcode | undefined>;
  getBarcodeByValue(value: string): Promise<Barcode | undefined>;
  createBarcode(barcode: InsertBarcode): Promise<Barcode>;
  updateBarcode(id: string, data: Partial<InsertBarcode>): Promise<Barcode | undefined>;

  // Scan Exception operations
  getScanExceptions(): Promise<ScanException[]>;
  getScanException(id: string): Promise<ScanException | undefined>;
  createScanException(exception: InsertScanException): Promise<ScanException>;
  resolveScanException(id: string, resolvedBy: string, notes?: string): Promise<ScanException | undefined>;
  getTraceabilityStats(): Promise<{ totalHUs: number; activeBarcodes: number; openExceptions: number; totalMovements: number; }>;

  // Movement Ledger operations
  getMovementLedger(): Promise<MovementLedgerEntry[]>;
  getMovementsByHuCode(huCode: string): Promise<MovementLedgerEntry[]>;
  getMovementsByBatch(batchNumber: string): Promise<MovementLedgerEntry[]>;
  getMovementsBySourceDoc(docNumber: string): Promise<MovementLedgerEntry[]>;
  createMovementEntry(entry: InsertMovementLedger): Promise<MovementLedgerEntry>;
  searchTraceability(query: string): Promise<{ handlingUnits: HandlingUnit[]; barcodes: Barcode[]; movements: MovementLedgerEntry[]; }>;

  // Supplier Master operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, data: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  getSupplierStats(): Promise<{ total: number; active: number; blocked: number; avgRating: number; }>;
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;
  private testConfigs: Map<string, TestConfig>;
  private testResults: Map<string, TestResult>;
  private testInstructions: Map<string, TestInstruction>;
  private sops: Map<string, Sop>;
  private sopVersions: Map<string, SopVersion[]>;
  private sopChangeRequests: Map<string, SopChangeRequest>;
  private productionOrders: Map<string, ProductionOrder>;
  private boms: Map<string, Bom>;
  private bomMaterials: Map<string, BomMaterial[]>;
  private bomSubAssemblies: Map<string, BomSubAssembly[]>;
  private bomChangeRequests: Map<string, BomChangeRequest>;
  private capas: Map<string, Capa>;
  private capaActions: Map<string, CapaAction[]>;
  private inventoryItems: Map<string, InventoryItem>;
  private stockMovements: Map<string, StockMovement[]>;
  // QA-related data stores
  private qcStages: Map<string, QcStage>;
  private qcStagesByOrder: Map<string, QcStage[]>;
  private qcCheckpoints: Map<string, QcCheckpoint>;
  private qcCheckpointsByStage: Map<string, QcCheckpoint[]>;
  private qcTestResults: Map<string, QcTestResult>;
  private qcTestResultsByCheckpoint: Map<string, QcTestResult[]>;
  private qcApprovals: Map<string, QcApproval>;
  private qcApprovalsByStage: Map<string, QcApproval[]>;
  private batchReleases: Map<string, BatchRelease>;
  private batchReleasesByOrder: Map<string, BatchRelease[]>;
  private batchWorkflowSteps: Map<string, BatchWorkflowStep>;
  private batchWorkflowStepsByBatch: Map<string, BatchWorkflowStep[]>;
  private batchCertificates: Map<string, BatchCertificate>;
  private batchCertificatesByBatchRelease: Map<string, BatchCertificate>;
  private qaAuditTrails: Map<string, QaAuditTrail>;
  private qaAuditTrailsByEntity: Map<string, QaAuditTrail[]>;
  private qcStageTemplates: Map<string, QcStageTemplate>;
  // Production Management data stores
  private productionBatches: Map<string, ProductionBatch>;
  private batchStagesMap: Map<string, BatchStage>;
  private batchStagesByBatch: Map<string, BatchStage[]>;
  private batchExecutionsMap: Map<string, BatchExecution>;
  private batchExecutionsByBatch: Map<string, BatchExecution[]>;
  private jobWorksMap: Map<string, JobWork>;
  private batchReviewsMap: Map<string, BatchReview>;
  private batchReviewsByBatch: Map<string, BatchReview>;
  // Equipment and Job Scheduling data stores
  private equipmentMap: Map<string, Equipment>;
  private productionJobsMap: Map<string, ProductionJob>;
  private jobCardsMap: Map<string, JobCard>;
  
  // Finance Module data stores
  private chartOfAccountsMap: Map<string, ChartOfAccounts>;
  private costCentersMap: Map<string, CostCenter>;
  private profitCentersMap: Map<string, ProfitCenter>;
  private taxCodesMap: Map<string, TaxCode>;
  private paymentTermsMap: Map<string, PaymentTerms>;
  private fiscalYearsMap: Map<string, FiscalYear>;
  private fiscalPeriodsMap: Map<string, FiscalPeriod>;
  private partiesMap: Map<string, Party>;
  private financialDocumentsMap: Map<string, FinancialDocument>;
  private documentLinesMap: Map<string, DocumentLine>;
  private paymentsMap: Map<string, Payment>;
  private glJournalsMap: Map<string, GlJournal>;
  private glJournalLinesMap: Map<string, GlJournalLine>;

  // RFID Module data stores
  private rfidZonesMap: Map<string, RfidZone>;
  private rfidReadersMap: Map<string, RfidReader>;
  private rfidTagsMap: Map<string, RfidTag>;
  private rfidEventsMap: Map<string, RfidEvent>;

  // Traceability data stores
  private handlingUnitsMap: Map<string, HandlingUnit>;
  private barcodesMap: Map<string, Barcode>;
  private scanExceptionsMap: Map<string, ScanException>;
  private movementLedgerMap: Map<string, MovementLedgerEntry>;
  private suppliersMap: Map<string, Supplier>;
  private movementCounter: number;

  constructor() {
    this.materials = new Map();
    this.testConfigs = new Map();
    this.testResults = new Map();
    this.testInstructions = new Map();
    this.sops = new Map();
    this.sopVersions = new Map();
    this.sopChangeRequests = new Map();
    this.productionOrders = new Map();
    this.boms = new Map();
    this.bomMaterials = new Map();
    this.bomSubAssemblies = new Map();
    this.bomChangeRequests = new Map();
    this.capas = new Map();
    this.capaActions = new Map();
    this.inventoryItems = new Map();
    this.stockMovements = new Map();
    // Initialize QA-related data stores
    this.qcStages = new Map();
    this.qcStagesByOrder = new Map();
    this.qcCheckpoints = new Map();
    this.qcCheckpointsByStage = new Map();
    this.qcTestResults = new Map();
    this.qcTestResultsByCheckpoint = new Map();
    this.qcApprovals = new Map();
    this.qcApprovalsByStage = new Map();
    this.batchReleases = new Map();
    this.batchReleasesByOrder = new Map();
    this.batchWorkflowSteps = new Map();
    this.batchWorkflowStepsByBatch = new Map();
    this.batchCertificates = new Map();
    this.batchCertificatesByBatchRelease = new Map();
    this.qaAuditTrails = new Map();
    this.qaAuditTrailsByEntity = new Map();
    this.qcStageTemplates = new Map();
    // Initialize Production Management data stores
    this.productionBatches = new Map();
    this.batchStagesMap = new Map();
    this.batchStagesByBatch = new Map();
    this.batchExecutionsMap = new Map();
    this.batchExecutionsByBatch = new Map();
    this.jobWorksMap = new Map();
    this.batchReviewsMap = new Map();
    this.batchReviewsByBatch = new Map();
    // Initialize Equipment and Job Scheduling data stores
    this.equipmentMap = new Map();
    this.productionJobsMap = new Map();
    this.jobCardsMap = new Map();
    
    // Initialize Finance Module data stores
    this.chartOfAccountsMap = new Map();
    this.costCentersMap = new Map();
    this.profitCentersMap = new Map();
    this.taxCodesMap = new Map();
    this.paymentTermsMap = new Map();
    this.fiscalYearsMap = new Map();
    this.fiscalPeriodsMap = new Map();
    this.partiesMap = new Map();
    this.financialDocumentsMap = new Map();
    this.documentLinesMap = new Map();
    this.paymentsMap = new Map();
    this.glJournalsMap = new Map();
    this.glJournalLinesMap = new Map();

    // Initialize RFID Module data stores
    this.rfidZonesMap = new Map();
    this.rfidReadersMap = new Map();
    this.rfidTagsMap = new Map();
    this.rfidEventsMap = new Map();

    // Initialize Traceability data stores
    this.handlingUnitsMap = new Map();
    this.barcodesMap = new Map();
    this.scanExceptionsMap = new Map();
    this.movementLedgerMap = new Map();
    this.suppliersMap = new Map();
    this.movementCounter = 0;
    
    this.initializeDummyData().catch(console.error);
    this.initializeFinanceData().catch(console.error);
    this.initializeRfidData().catch(console.error);
    this.initializeTraceabilityData().catch(console.error);
    this.initializeSupplierData();
  }

  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getMaterialsByType(type: string): Promise<Material[]> {
    return Array.from(this.materials.values())
      .filter(material => material.type === type)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = randomUUID();
    const now = new Date();
    const material: Material = {
      ...insertMaterial,
      id,
      description: insertMaterial.description || null,
      status: 'ready-for-qc',
      stock: insertMaterial.stock || 0,
      score: insertMaterial.score || null,
      batchNumber: insertMaterial.batchNumber || null,
      supplierName: insertMaterial.supplierName || null,
      receiptDate: insertMaterial.receiptDate || null,
      expiryDate: insertMaterial.expiryDate || null,
      storageConditions: insertMaterial.storageConditions || null,
      jobId: insertMaterial.jobId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.materials.set(id, material);
    
    // Auto-assign test configurations for this material type
    await this.autoAssignTestsToMaterial(id, insertMaterial.type);
    
    return material;
  }

  // Auto-assign tests to materials based on material type
  private async autoAssignTestsToMaterial(materialId: string, materialType: string): Promise<void> {
    // Get all test instructions for this material type
    const instructions = await this.getTestInstructionsByMaterialType(materialType);
    
    // Create test result placeholders for each applicable test
    for (const instruction of instructions) {
      if (instruction.testConfigId) {
        await this.createTestResult({
          materialId,
          testConfigId: instruction.testConfigId,
          resultValue: null,
          status: 'pending',
          testedBy: null,
          testedDate: null,
          remarks: null,
          retestCount: 0,
        });
      }
    }
  }

  // Update material status based on test results
  async updateMaterialStatusFromTests(materialId: string): Promise<void> {
    const material = this.materials.get(materialId);
    if (!material) return;

    const testResults = await this.getTestResultsByMaterial(materialId);
    
    if (testResults.length === 0) {
      // No tests assigned, keep as ready-for-qc
      return;
    }

    const pendingTests = testResults.filter(result => result.status === 'pending').length;
    const failedTests = testResults.filter(result => result.status === 'failed').length;
    const passedTests = testResults.filter(result => result.status === 'passed').length;
    const inProgressTests = testResults.filter(result => result.status === 'in-progress').length;

    let newStatus: string;
    
    if (failedTests > 0) {
      newStatus = 'qc-failed';
    } else if (inProgressTests > 0 || pendingTests > 0) {
      newStatus = 'in-progress';
    } else if (passedTests === testResults.length && testResults.length > 0) {
      newStatus = 'qc-passed';
    } else {
      newStatus = 'ready-for-qc';
    }

    // Calculate quality score based on test results
    let qualityScore: number | null = null;
    if (passedTests > 0 || failedTests > 0) {
      const totalTests = passedTests + failedTests;
      qualityScore = Math.round((passedTests / totalTests) * 100);
    }

    // Update material status and score
    const updatedMaterial = { 
      ...material, 
      status: newStatus, 
      score: qualityScore,
      updatedAt: new Date() 
    };
    this.materials.set(materialId, updatedMaterial);
  }

  async updateMaterial(id: string, updateData: UpdateMaterial): Promise<Material | undefined> {
    const existing = this.materials.get(id);
    if (!existing) return undefined;

    const updated: Material = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.materials.set(id, updated);
    return updated;
  }

  async deleteMaterial(id: string): Promise<boolean> {
    return this.materials.delete(id);
  }

  async getQualityStats(): Promise<{
    approved: number;
    pending: number;
    failed: number;
    underTesting: number;
    averageScore: number;
  }> {
    const allMaterials = Array.from(this.materials.values());
    
    const approved = allMaterials.filter(m => m.status === 'qc-passed' || m.status === 'approved').length;
    const pending = allMaterials.filter(m => m.status === 'ready-for-qc').length;
    const failed = allMaterials.filter(m => m.status === 'qc-failed' || m.status === 'failed').length;
    const underTesting = allMaterials.filter(m => m.status === 'in-progress' || m.status === 'under-testing').length;
    
    const materialsWithScores = allMaterials.filter(m => m.score !== null && m.score !== undefined);
    const averageScore = materialsWithScores.length > 0 
      ? materialsWithScores.reduce((sum, m) => sum + (m.score || 0), 0) / materialsWithScores.length
      : 0;

    return {
      approved,
      pending,
      failed,
      underTesting,
      averageScore: Math.round(averageScore * 10) / 10,
    };
  }

  // Test Configuration operations
  async getTestConfigs(): Promise<TestConfig[]> {
    return Array.from(this.testConfigs.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createTestConfig(insertTestConfig: InsertTestConfig): Promise<TestConfig> {
    const id = randomUUID();
    const now = new Date();
    const testConfig: TestConfig = {
      ...insertTestConfig,
      id,
      testMethod: insertTestConfig.testMethod || null,
      expectedRange: insertTestConfig.expectedRange || null,
      units: insertTestConfig.units || null,
      isMandatory: insertTestConfig.isMandatory ?? true,
      acceptanceCriteria: insertTestConfig.acceptanceCriteria || null,
      createdAt: now,
      updatedAt: now,
    };
    this.testConfigs.set(id, testConfig);
    return testConfig;
  }

  // Test Results operations
  async getTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTestResultsByMaterial(materialId: string): Promise<TestResult[]> {
    return Array.from(this.testResults.values())
      .filter(result => result.materialId === materialId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async updateTestResult(id: string, updateData: Partial<InsertTestResult>): Promise<TestResult | undefined> {
    const existing = this.testResults.get(id);
    if (!existing) return undefined;

    const updated: TestResult = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    
    // Auto-evaluate if result value is provided and we have acceptance criteria
    if (updateData.resultValue && existing.testConfigId) {
      const testConfig = this.testConfigs.get(existing.testConfigId);
      if (testConfig?.acceptanceCriteria && testConfig?.expectedRange) {
        updated.status = this.evaluateTestResult(updateData.resultValue, testConfig);
        updated.testedDate = updated.testedDate || new Date();
      }
    }
    
    this.testResults.set(id, updated);
    
    // Update material status based on test results
    if (updated.materialId) {
      await this.updateMaterialStatusFromTests(updated.materialId);
    }
    
    return updated;
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = randomUUID();
    const now = new Date();
    const testResult: TestResult = {
      ...insertTestResult,
      id,
      materialId: insertTestResult.materialId || null,
      testConfigId: insertTestResult.testConfigId || null,
      resultValue: insertTestResult.resultValue || null,
      status: insertTestResult.status || 'pending',
      testedBy: insertTestResult.testedBy || null,
      testedDate: insertTestResult.testedDate || null,
      remarks: insertTestResult.remarks || null,
      retestCount: insertTestResult.retestCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    // Auto-evaluate test result if we have acceptance criteria
    if (testResult.resultValue && testResult.testConfigId) {
      const testConfig = this.testConfigs.get(testResult.testConfigId);
      if (testConfig?.acceptanceCriteria && testConfig?.expectedRange) {
        testResult.status = this.evaluateTestResult(testResult.resultValue, testConfig);
      }
    }
    this.testResults.set(id, testResult);
    
    // Update material status based on test results
    if (insertTestResult.materialId) {
      await this.updateMaterialStatusFromTests(insertTestResult.materialId);
    }
    
    return testResult;
  }

  // Test Instructions operations
  async getTestInstructions(): Promise<TestInstruction[]> {
    return Array.from(this.testInstructions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTestInstructionsByMaterialType(materialType: string): Promise<TestInstruction[]> {
    return Array.from(this.testInstructions.values())
      .filter(instruction => instruction.materialType === materialType && instruction.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // Evaluate test result against acceptance criteria
  private evaluateTestResult(resultValue: string, testConfig: TestConfig): string {
    if (!testConfig.expectedRange || !resultValue) return 'pending';
    
    try {
      // Handle percentage ranges (e.g., "95.0 - 105.0%")
      if (testConfig.expectedRange.includes('%')) {
        const range = testConfig.expectedRange.replace('%', '').trim();
        const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
        const value = parseFloat(resultValue.replace('%', ''));
        
        if (!isNaN(value) && !isNaN(min) && !isNaN(max)) {
          return (value >= min && value <= max) ? 'passed' : 'failed';
        }
      }
      
      // Handle pH ranges (e.g., "6.8 - 7.2")
      if (testConfig.expectedRange.includes('-')) {
        const [min, max] = testConfig.expectedRange.split('-').map(v => parseFloat(v.trim()));
        const value = parseFloat(resultValue);
        
        if (!isNaN(value) && !isNaN(min) && !isNaN(max)) {
          return (value >= min && value <= max) ? 'passed' : 'failed';
        }
      }
      
      // Handle "greater than" criteria (e.g., ">80% in 30 min")
      if (testConfig.expectedRange.startsWith('>')) {
        const threshold = parseFloat(testConfig.expectedRange.substring(1).replace('%', '').trim());
        const value = parseFloat(resultValue.replace('%', ''));
        
        if (!isNaN(value) && !isNaN(threshold)) {
          return value > threshold ? 'passed' : 'failed';
        }
      }
      
      // Handle "less than" criteria (e.g., "<10 CFU/g")
      if (testConfig.expectedRange.startsWith('<')) {
        const threshold = parseFloat(testConfig.expectedRange.substring(1).split(' ')[0].trim());
        const value = parseFloat(resultValue.split(' ')[0]);
        
        if (!isNaN(value) && !isNaN(threshold)) {
          return value < threshold ? 'passed' : 'failed';
        }
      }
    } catch (error) {
      console.error('Error evaluating test result:', error);
    }
    
    return 'pending'; // Default to pending if evaluation fails
  }

  async createTestInstruction(insertTestInstruction: InsertTestInstruction): Promise<TestInstruction> {
    const id = randomUUID();
    const now = new Date();
    const testInstruction: TestInstruction = {
      ...insertTestInstruction,
      id,
      testConfigId: insertTestInstruction.testConfigId || null,
      samplingProcedure: insertTestInstruction.samplingProcedure || null,
      equipmentRequired: insertTestInstruction.equipmentRequired || null,
      safetyPrecautions: insertTestInstruction.safetyPrecautions || null,
      isActive: insertTestInstruction.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.testInstructions.set(id, testInstruction);
    return testInstruction;
  }

  // Initialize dummy pharma manufacturing data
  private async initializeDummyData() {
    // Add pharma test configurations
    const testConfigData = [
      {
        id: "tc1",
        name: "Assay by HPLC",
        code: "TC-HPLC-001",
        category: "Chemical",
        testMethod: "HPLC",
        expectedRange: "95.0 - 105.0%",
        units: "%",
        isMandatory: true,
        acceptanceCriteria: "Results must be within 95.0 - 105.0% of label claim",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tc2", 
        name: "pH Test",
        code: "TC-PH-002",
        category: "Physical",
        testMethod: "pH meter",
        expectedRange: "6.8 - 7.2",
        units: "pH",
        isMandatory: true,
        acceptanceCriteria: "pH must be between 6.8 and 7.2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tc3",
        name: "Dissolution",
        code: "TC-DISS-003",
        category: "Physical", 
        testMethod: "USP Type II Paddle",
        expectedRange: ">80% in 30 min",
        units: "%",
        isMandatory: true,
        acceptanceCriteria: "Not less than 80% dissolved in 30 minutes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tc4",
        name: "Microbial Limit Test",
        code: "TC-MIC-004",
        category: "Microbiological",
        testMethod: "USP <61>",
        expectedRange: "<10 CFU/g",
        units: "CFU/g",
        isMandatory: true,
        acceptanceCriteria: "Total aerobic microbial count not more than 10 CFU/g",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    testConfigData.forEach(config => this.testConfigs.set(config.id, config));

    // Add pharma materials with different statuses to demonstrate the system
    const materialData = [
      {
        id: "m1",
        name: "Acetaminophen USP",
        description: "Active pharmaceutical ingredient for pain relief tablets",
        code: "API-ACET-001",
        type: "raw-materials",
        category: "Active Ingredient",
        status: "in-progress", // Testing in progress
        stock: 250,
        score: null,
        referenceNumber: "RM-240825-001",
        batchNumber: "ACT240825A",
        jobId: null,
        supplierName: "PharmaChem Industries",
        receiptDate: new Date('2024-08-25'),
        expiryDate: new Date('2026-08-25'),
        storageConditions: "Store in a cool, dry place at 15-25°C",
        createdAt: new Date('2024-08-25'),
        updatedAt: new Date(),
      },
      {
        id: "m2",
        name: "Microcrystalline Cellulose",
        description: "Pharmaceutical excipient used as binder and filler",
        code: "EXC-MCC-002",
        type: "raw-materials",
        category: "Excipient",
        status: "qc-passed", // QC Passed
        stock: 500,
        score: 98,
        referenceNumber: "RM-240820-002",
        batchNumber: "MCC240820B",
        jobId: null,
        supplierName: "CelluTech Corp",
        receiptDate: new Date('2024-08-20'),
        expiryDate: new Date('2027-08-20'),
        storageConditions: "Store in a dry place, protect from moisture",
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date(),
      },
      {
        id: "m3",
        name: "HPMC Capsules Size 0",
        description: "Hydroxypropyl methylcellulose capsules for oral dosage forms",
        code: "PKG-CAP-003",
        type: "packaging-material",
        category: "Capsule",
        status: "ready-for-qc", // Ready for QC
        stock: 100000,
        score: null,
        referenceNumber: "PM-240822-003",
        batchNumber: "HPM240822C",
        jobId: null,
        supplierName: "CapsuleTech Ltd",
        receiptDate: new Date('2024-08-22'),
        expiryDate: new Date('2029-08-22'),
        storageConditions: "Store in original container, protect from humidity",
        createdAt: new Date('2024-08-22'),
        updatedAt: new Date(),
      },
      {
        id: "m4",
        name: "Acetaminophen Tablets 500mg",
        description: "Finished pharmaceutical product for pain relief",
        code: "FP-TAB-004",
        type: "final-products",
        category: "Tablet",
        status: "qc-passed", // QC Passed
        stock: 10000,
        score: 99,
        referenceNumber: "FP-240823-004",
        batchNumber: "TAB240823D",
        jobId: null,
        supplierName: "Internal Manufacturing",
        receiptDate: new Date('2024-08-23'),
        expiryDate: new Date('2026-08-23'),
        storageConditions: "Store at 15-30°C, protect from light and moisture",
        createdAt: new Date('2024-08-23'),
        updatedAt: new Date(),
      },
      {
        id: "m5",
        name: "Sodium Starch Glycolate",
        description: "Pharmaceutical excipient used as disintegrant",
        code: "EXC-SSG-005",
        type: "raw-materials",
        category: "Excipient",
        status: "qc-failed", // QC Failed
        stock: 150,
        score: 65,
        referenceNumber: "RM-240826-005",
        batchNumber: "SSG240826E",
        jobId: null,
        supplierName: "ExcipientCorp Ltd",
        receiptDate: new Date('2024-08-26'),
        expiryDate: new Date('2027-08-26'),
        storageConditions: "Store in dry place below 30°C",
        createdAt: new Date('2024-08-26'),
        updatedAt: new Date(),
      },
      // In-Process Materials
      {
        id: "m6",
        name: "Paracetamol Blend (Pre-Compression)",
        description: "Pharmaceutical blend ready for tablet compression",
        code: "IP-BLD-006",
        type: "in-process",
        category: "Blend",
        status: "in-progress", // In progress testing
        stock: 500,
        score: null,
        referenceNumber: "IP-240827-006",
        batchNumber: "BLD240827F",
        jobId: "JOB-24082701",
        supplierName: "Internal Manufacturing",
        receiptDate: new Date('2024-08-27'),
        expiryDate: null,
        storageConditions: "Store in controlled environment, 15-25°C",
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date(),
      },
      {
        id: "m7",
        name: "Compressed Tablet Cores",
        description: "Tablet cores post-compression, pre-coating",
        code: "IP-TAB-007",
        type: "in-process",
        category: "Tablet Core",
        status: "ready-for-qc", // Ready for QC
        stock: 45000,
        score: null,
        referenceNumber: "IP-240827-007",
        batchNumber: "TAB240827G",
        jobId: "JOB-24082701",
        supplierName: "Internal Manufacturing",
        receiptDate: new Date('2024-08-27'),
        expiryDate: null,
        storageConditions: "Store in controlled environment",
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date(),
      },
      {
        id: "m8",
        name: "Coated Tablets (Pre-Packaging)",
        description: "Film coated tablets ready for packaging",
        code: "IP-COA-008",
        type: "in-process",
        category: "Coated Tablet",
        status: "qc-passed", // QC Passed
        stock: 40000,
        score: 97,
        referenceNumber: "IP-240828-008",
        batchNumber: "COA240828H",
        jobId: "JOB-24082701",
        supplierName: "Internal Manufacturing",
        receiptDate: new Date('2024-08-28'),
        expiryDate: null,
        storageConditions: "Store in controlled environment, protect from light",
        createdAt: new Date('2024-08-28'),
        updatedAt: new Date(),
      }
    ];

    materialData.forEach(material => this.materials.set(material.id, material));

    // Add test instructions
    const instructionData = [
      {
        id: "ti1",
        materialType: "raw-materials",
        testConfigId: "tc1",
        instructions: "1. Prepare standard solution according to USP monograph\n2. Prepare sample solution by weighing 100mg and dissolving in mobile phase\n3. Inject standard and sample in triplicate\n4. Calculate assay percentage using peak areas",
        samplingProcedure: "Collect representative samples from at least 3 different locations of the batch using a sampling thief",
        equipmentRequired: "HPLC system, analytical balance, volumetric flasks, mobile phase",
        safetyPrecautions: "Wear safety glasses, lab coat, and gloves. Work in well-ventilated area",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "ti2", 
        materialType: "raw-materials",
        testConfigId: "tc2",
        instructions: "1. Calibrate pH meter using buffer solutions\n2. Prepare 1% w/v aqueous solution\n3. Measure pH at room temperature\n4. Record reading when stable",
        samplingProcedure: "Take samples from top, middle, and bottom of container",
        equipmentRequired: "Calibrated pH meter, buffer solutions (pH 4.0, 7.0, 10.0), beakers",
        safetyPrecautions: "Handle buffer solutions carefully, rinse electrodes properly",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    instructionData.forEach(instruction => this.testInstructions.set(instruction.id, instruction));

    // Add comprehensive test results to demonstrate the system
    const testResultData = [
      // MCC (m2) - All tests passed
      {
        id: "tr1",
        materialId: "m2",
        testConfigId: "tc2", // pH test
        resultValue: "7.0",
        status: "passed",
        testedBy: "Dr. Sarah Johnson",
        testedDate: new Date('2024-08-21'),
        remarks: "pH within acceptable range",
        retestCount: 0,
        createdAt: new Date('2024-08-21'),
        updatedAt: new Date('2024-08-21'),
      },
      {
        id: "tr2",
        materialId: "m2",
        testConfigId: "tc1", // Assay
        resultValue: "98.5%",
        status: "passed",
        testedBy: "Dr. Sarah Johnson",
        testedDate: new Date('2024-08-21'),
        remarks: "Assay results within specification",
        retestCount: 0,
        createdAt: new Date('2024-08-21'),
        updatedAt: new Date('2024-08-21'),
      },
      // Acetaminophen (m1) - In progress testing
      {
        id: "tr3",
        materialId: "m1",
        testConfigId: "tc1", // Assay
        resultValue: "99.2%",
        status: "passed",
        testedBy: "Dr. Michael Chen",
        testedDate: new Date('2024-08-26'),
        remarks: "Assay results within specification",
        retestCount: 0,
        createdAt: new Date('2024-08-26'),
        updatedAt: new Date('2024-08-26'),
      },
      {
        id: "tr4",
        materialId: "m1",
        testConfigId: "tc2", // pH test
        resultValue: null,
        status: "pending",
        testedBy: null,
        testedDate: null,
        remarks: null,
        retestCount: 0,
        createdAt: new Date('2024-08-26'),
        updatedAt: new Date('2024-08-26'),
      },
      // Acetaminophen Tablets (m4) - All tests passed
      {
        id: "tr5",
        materialId: "m4",
        testConfigId: "tc3", // Dissolution
        resultValue: "85% in 30 min",
        status: "passed",
        testedBy: "Dr. Lisa Wang",
        testedDate: new Date('2024-08-23'),
        remarks: "Dissolution rate meets specification",
        retestCount: 0,
        createdAt: new Date('2024-08-23'),
        updatedAt: new Date('2024-08-23'),
      },
      {
        id: "tr6",
        materialId: "m4",
        testConfigId: "tc1", // Assay
        resultValue: "99.8%",
        status: "passed",
        testedBy: "Dr. Lisa Wang",
        testedDate: new Date('2024-08-23'),
        remarks: "Content meets label claim",
        retestCount: 0,
        createdAt: new Date('2024-08-23'),
        updatedAt: new Date('2024-08-23'),
      },
      // Sodium Starch Glycolate (m5) - Failed test
      {
        id: "tr7",
        materialId: "m5",
        testConfigId: "tc2", // pH test
        resultValue: "5.2",
        status: "failed",
        testedBy: "Dr. James Brown",
        testedDate: new Date('2024-08-27'),
        remarks: "pH below acceptable range - requires retest or rejection",
        retestCount: 0,
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date('2024-08-27'),
      },
      // HPMC Capsules (m3) - Ready for testing
      {
        id: "tr8",
        materialId: "m3",
        testConfigId: "tc4", // Microbial Limit
        resultValue: null,
        status: "pending",
        testedBy: null,
        testedDate: null,
        remarks: null,
        retestCount: 0,
        createdAt: new Date('2024-08-22'),
        updatedAt: new Date('2024-08-22'),
      },
      // In-Process Material Test Results
      // Paracetamol Blend (m6) - In progress testing
      {
        id: "tr9",
        materialId: "m6",
        testConfigId: "tc1", // Assay
        resultValue: "98.8%",
        status: "passed",
        testedBy: "Dr. Rachel Martinez",
        testedDate: new Date('2024-08-27'),
        remarks: "Assay within specification for blend uniformity",
        retestCount: 0,
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date('2024-08-27'),
      },
      {
        id: "tr10",
        materialId: "m6",
        testConfigId: "tc2", // pH test
        resultValue: null,
        status: "pending",
        testedBy: null,
        testedDate: null,
        remarks: null,
        retestCount: 0,
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date('2024-08-27'),
      },
      // Compressed Tablet Cores (m7) - Ready for QC
      {
        id: "tr11",
        materialId: "m7",
        testConfigId: "tc1", // Assay
        resultValue: null,
        status: "pending",
        testedBy: null,
        testedDate: null,
        remarks: null,
        retestCount: 0,
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date('2024-08-27'),
      },
      {
        id: "tr12",
        materialId: "m7",
        testConfigId: "tc3", // Dissolution
        resultValue: null,
        status: "pending",
        testedBy: null,
        testedDate: null,
        remarks: null,
        retestCount: 0,
        createdAt: new Date('2024-08-27'),
        updatedAt: new Date('2024-08-27'),
      },
      // Coated Tablets (m8) - QC Passed
      {
        id: "tr13",
        materialId: "m8",
        testConfigId: "tc1", // Assay
        resultValue: "99.5%",
        status: "passed",
        testedBy: "Dr. Kevin Thompson",
        testedDate: new Date('2024-08-28'),
        remarks: "Content uniformity meets specification",
        retestCount: 0,
        createdAt: new Date('2024-08-28'),
        updatedAt: new Date('2024-08-28'),
      },
      {
        id: "tr14",
        materialId: "m8",
        testConfigId: "tc3", // Dissolution
        resultValue: "88% in 30 min",
        status: "passed",
        testedBy: "Dr. Kevin Thompson",
        testedDate: new Date('2024-08-28'),
        remarks: "Dissolution rate excellent, ready for packaging",
        retestCount: 0,
        createdAt: new Date('2024-08-28'),
        updatedAt: new Date('2024-08-28'),
      }
    ];

    testResultData.forEach(result => this.testResults.set(result.id, result));
    
    // Add sample SOP data
    const sopData = [
      {
        id: "sop1",
        title: "Manufacturing Process for Oral Solid Dosage Forms",
        sopNumber: "SOP-MAN-001",
        category: "Manufacturing",
        description: "Standard operating procedure for tablet manufacturing including weighing, blending, compression and coating",
        version: "2.1",
        status: "approved" as const,
        filePath: null,
        fileName: null,
        fileSize: null,
        approvedBy: "John Smith, QA Manager",
        approvedDate: new Date('2024-01-15'),
        effectiveDate: new Date('2024-02-01'),
        nextReviewDate: new Date('2025-02-01'),
        createdBy: "Manufacturing Team",
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: "sop2",
        title: "HPLC Method for API Assay Testing",
        sopNumber: "SOP-QC-002",
        category: "Quality Control",
        description: "Analytical method for quantitative determination of active pharmaceutical ingredients using HPLC",
        version: "1.3",
        status: "approved" as const,
        filePath: null,
        fileName: null,
        fileSize: null,
        approvedBy: "Sarah Johnson, Analytical Manager",
        approvedDate: new Date('2024-03-10'),
        effectiveDate: new Date('2024-03-20'),
        nextReviewDate: new Date('2025-03-20'),
        createdBy: "QC Laboratory",
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-10'),
      },
      {
        id: "sop3", 
        title: "Equipment Cleaning and Sanitization",
        sopNumber: "SOP-CLN-003",
        category: "Cleaning & Sanitization",
        description: "Procedures for cleaning and sanitizing manufacturing equipment between batches",
        version: "1.0",
        status: "under-review" as const,
        filePath: null,
        fileName: null,
        fileSize: null,
        approvedBy: null,
        approvedDate: null,
        effectiveDate: null,
        nextReviewDate: null,
        createdBy: "Operations Team",
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-08-15'),
      }
    ];

    sopData.forEach(sop => this.sops.set(sop.id, sop));
    
    // Add sample production order data
    const productionOrderData = [
      {
        id: "po1",
        orderNumber: "PO-2024-001",
        skuProduct: "TAB-500MG-100",
        customerName: "Pharma Distributors Inc",
        jobId: "JOB-2024-001",
        quantity: 50000,
        priority: "High" as const,
        dueDate: new Date('2024-12-15'),
        status: "In Progress" as const,
        createdBy: "Production Manager",
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-25'),
      },
      {
        id: "po2",
        orderNumber: "PO-2024-002",
        skuProduct: "CAP-250MG-60",
        customerName: "Healthcare Solutions Ltd",
        jobId: "JOB-2024-002",
        quantity: 25000,
        priority: "Medium" as const,
        dueDate: new Date('2024-12-20'),
        status: "Pending" as const,
        createdBy: "Production Manager",
        createdAt: new Date('2024-08-22'),
        updatedAt: new Date('2024-08-22'),
      },
      {
        id: "po3",
        orderNumber: "PO-2024-003",
        skuProduct: "SYR-125ML",
        customerName: "MedSupply Corp",
        jobId: "JOB-2024-003",
        quantity: 15000,
        priority: "Low" as const,
        dueDate: new Date('2024-12-25'),
        status: "Completed" as const,
        createdBy: "Production Manager",
        createdAt: new Date('2024-08-10'),
        updatedAt: new Date('2024-08-28'),
      },
      {
        id: "po4",
        orderNumber: "PO-2024-004",
        skuProduct: "INJ-10ML",
        customerName: "Global Pharma Network",
        jobId: "JOB-2024-004",
        quantity: 5000,
        priority: "Critical" as const,
        dueDate: new Date('2024-12-10'),
        status: "On Hold" as const,
        createdBy: "Production Manager",
        createdAt: new Date('2024-08-28'),
        updatedAt: new Date('2024-08-28'),
      }
    ];

    productionOrderData.forEach(order => this.productionOrders.set(order.id, order));
    
    // Create batch releases for sample production orders
    for (const order of productionOrderData) {
      await this.createBatchReleaseWithWorkflow(order);
    }

    // Create sample RELEASED batches for Terminal Testing
    const releasedBatchData = [
      {
        batchNumber: "BT-2024-REL-001",
        productCode: "TAB-500MG-100",
        productName: "Acetaminophen 500mg Tablets",
        batchSize: 50000,
        manufacturedDate: new Date('2024-11-01'),
        expiryDate: new Date('2026-11-01'),
        releasedBy: "Dr. Rajesh Kumar, QA Manager",
      },
      {
        batchNumber: "BT-2024-REL-002",
        productCode: "CAP-250MG-60",
        productName: "Ibuprofen 250mg Capsules",
        batchSize: 25000,
        manufacturedDate: new Date('2024-11-05'),
        expiryDate: new Date('2026-11-05'),
        releasedBy: "Dr. Priya Sharma, Authorized Person",
      },
      {
        batchNumber: "BT-2024-REL-003",
        productCode: "SYR-125ML",
        productName: "Cough Syrup 125ml",
        batchSize: 15000,
        manufacturedDate: new Date('2024-11-10'),
        expiryDate: new Date('2026-11-10'),
        releasedBy: "Dr. Anil Verma, QA Head",
      }
    ];

    for (const batchData of releasedBatchData) {
      const releasedBatch = await this.createBatchRelease({
        productionOrderId: productionOrderData[0].id, // Link to first production order
        ...batchData,
        releaseStatus: 'released',
        releaseDate: new Date(),
        storageConditions: 'Store in a cool, dry place at 15-25°C',
        shelfLife: 24,
        packagingDetails: 'Standard pharmaceutical packaging',
      });

      // Create sample terminal testing workflow steps
      const terminalSteps = [
        {
          stepNumber: 1,
          stepName: 'Final Quality Check',
          stepCategory: 'Quality Verification',
          assignedTo: 'QC Analyst - Final',
          assignedTeam: 'Quality Control',
          status: 'completed' as const,
          completedAt: new Date(),
          requiredActions: JSON.stringify(['Perform final visual inspection', 'Verify batch identity']),
          completedActions: JSON.stringify(['Final inspection passed', 'Batch identity confirmed']),
          estimatedHours: 2,
        },
        {
          stepNumber: 2,
          stepName: 'Labeling Review',
          stepCategory: 'Documentation',
          assignedTo: 'Documentation Specialist',
          assignedTeam: 'Quality Assurance',
          status: 'completed' as const,
          completedAt: new Date(),
          findings: 'All labels correct and intact',
          requiredActions: JSON.stringify(['Review label accuracy', 'Check expiry dates']),
          completedActions: JSON.stringify(['Labels verified', 'Dates confirmed']),
          estimatedHours: 1,
        },
        {
          stepNumber: 3,
          stepName: 'Packaging Integrity',
          stepCategory: 'Packaging Verification',
          assignedTo: 'Packaging Inspector',
          assignedTeam: 'Quality Control',
          status: 'completed' as const,
          completedAt: new Date(),
          findings: 'Packaging integrity verified - no defects found',
          requiredActions: JSON.stringify(['Check container seals', 'Verify packaging condition']),
          completedActions: JSON.stringify(['Seals intact', 'No damage observed']),
          estimatedHours: 3,
        },
        {
          stepNumber: 4,
          stepName: 'Shipping Preparation',
          stepCategory: 'Preparation',
          assignedTo: 'Logistics Coordinator',
          assignedTeam: 'Shipping',
          status: 'completed' as const,
          completedAt: new Date(),
          findings: 'Batch ready for shipment',
          requiredActions: JSON.stringify(['Prepare shipping documentation', 'Arrange transport']),
          completedActions: JSON.stringify(['Shipping docs prepared', 'Courier arranged']),
          estimatedHours: 2,
        }
      ];

      for (const stepData of terminalSteps) {
        await this.createBatchWorkflowStep({
          batchReleaseId: releasedBatch.id,
          ...stepData,
        });
      }
    }
    
    // ── BOM seed data — 10 pharma BOMs matching D4 Workspace image (replit.md §BOM Management) ──
    const bomData: any[] = [
      { id: "bom1",  bomNumber: "BOM0000001", name: "OFLACIN-OZ(MAY)", productCode: "OFLN-OZ-MAY", productName: "OFLACIN-OZ(MAY)", version: "1.1", status: "Active", batchSize: 1000, batchSizeUom: "strips", totalCost: "1988.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-25'), updatedAt: new Date('2026-03-25') },
      { id: "bom2",  bomNumber: "BOM0000002", name: "MEDISUM'S NIMUPARA", productCode: "MED-NIMU", productName: "MEDISUM'S NIMUPARA", version: "1.2", status: "Active", batchSize: 500, batchSizeUom: "strips", totalCost: "2742.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-25'), updatedAt: new Date('2026-03-25') },
      { id: "bom3",  bomNumber: "BOM0000003", name: "PANTOBIS-DSR", productCode: "PAN-DSR", productName: "PANTOBIS-DSR", version: "1.0", status: "Active", batchSize: 1000, batchSizeUom: "capsules", totalCost: "1520.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-20'), updatedAt: new Date('2026-03-20') },
      { id: "bom4",  bomNumber: "BOM0000004", name: "CEFIXIME-200", productCode: "CEF-200", productName: "CEFIXIME-200", version: "1.0", status: "Active", batchSize: 1000, batchSizeUom: "tablets", totalCost: "1840.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-18'), updatedAt: new Date('2026-03-18') },
      { id: "bom5",  bomNumber: "BOM0000005", name: "LEVOBACT-500", productCode: "LEV-500", productName: "LEVOBACT-500", version: "1.1", status: "Active", batchSize: 1000, batchSizeUom: "tablets", totalCost: "1290.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-15'), updatedAt: new Date('2026-03-15') },
      { id: "bom6",  bomNumber: "BOM0000006", name: "METFORMIN-SR-500", productCode: "MET-SR-500", productName: "METFORMIN-SR-500", version: "1.0", status: "Active", batchSize: 2000, batchSizeUom: "tablets", totalCost: "1650.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-10'), updatedAt: new Date('2026-03-10') },
      { id: "bom7",  bomNumber: "BOM0000007", name: "AMOXYCLAV-625", productCode: "AMX-625", productName: "AMOXYCLAV-625", version: "1.3", status: "Active", batchSize: 500, batchSizeUom: "tablets", totalCost: "1950.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-08'), updatedAt: new Date('2026-03-08') },
      { id: "bom8",  bomNumber: "BOM0000008", name: "ATORVASTATIN-10", productCode: "ATV-10", productName: "ATORVASTATIN-10", version: "1.0", status: "Active", batchSize: 1000, batchSizeUom: "tablets", totalCost: "1320.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-03-05'), updatedAt: new Date('2026-03-05') },
      { id: "bom9",  bomNumber: "BOM0000009", name: "RABEZOLE-20-DSR", productCode: "RAB-20-DSR", productName: "RABEZOLE-20-DSR", version: "1.0", status: "Draft", batchSize: 1000, batchSizeUom: "capsules", totalCost: "1760.00", approvedBy: null, createdBy: "system", createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-03-01') },
      { id: "bom10", bomNumber: "BOM0000010", name: "DOLO-650", productCode: "DOL-650", productName: "DOLO-650", version: "2.0", status: "Active", batchSize: 5000, batchSizeUom: "tablets", totalCost: "1931.00", approvedBy: "admin@d4workspace.com", createdBy: "system", createdAt: new Date('2026-02-28'), updatedAt: new Date('2026-02-28') },
    ];
    bomData.forEach(bom => this.boms.set(bom.id, bom));

    // ── BOM items — raw material components per BOM ──
    const bomMaterialsData: any[] = [
      // BOM1: OFLACIN-OZ(MAY) — 7 foil packing materials (matches D4 Workspace image)
      { id: "bi1a", bomId: "bom1", materialCode: "PM-4501", materialName: "FERROCHIP-40 TAB FOIL", materialType: "RM", labelClaim: null, quantity: "6", uom: "pcs", scrapPercentage: "4", overagePercent: "0", unitCost: "45.00", totalCost: "270.00", supplierCode: "SUP-001", sequenceNumber: 1, createdAt: new Date('2026-03-25') },
      { id: "bi1b", bomId: "bom1", materialCode: "PM-4502", materialName: "TROYFENAC-SP FORTE TAB FOIL", materialType: "RM", labelClaim: null, quantity: "8", uom: "pcs", scrapPercentage: "4", overagePercent: "0", unitCost: "72.00", totalCost: "576.00", supplierCode: "SUP-002", sequenceNumber: 2, createdAt: new Date('2026-03-25') },
      { id: "bi1c", bomId: "bom1", materialCode: "PM-4503", materialName: "MONTEL-LC TAB 1ST FOIL 220MM", materialType: "RM", labelClaim: null, quantity: "8", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "37.00", totalCost: "296.00", supplierCode: "SUP-003", sequenceNumber: 3, createdAt: new Date('2026-03-25') },
      { id: "bi1d", bomId: "bom1", materialCode: "PM-4504", materialName: "NUDICLO-50 TAB FOIL", materialType: "RM", labelClaim: null, quantity: "2", uom: "pcs", scrapPercentage: "4", overagePercent: "0", unitCost: "86.00", totalCost: "172.00", supplierCode: "SUP-001", sequenceNumber: 4, createdAt: new Date('2026-03-25') },
      { id: "bi1e", bomId: "bom1", materialCode: "PM-4505", materialName: "LEVOWON-500 TAB A/A CTN", materialType: "RM", labelClaim: null, quantity: "1", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "74.00", totalCost: "74.00", supplierCode: "SUP-004", sequenceNumber: 5, createdAt: new Date('2026-03-25') },
      { id: "bi1f", bomId: "bom1", materialCode: "PM-4506", materialName: "236MM ACUPERA-SP PTD BASE FOIL", materialType: "RM", labelClaim: null, quantity: "2", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "30.00", totalCost: "60.00", supplierCode: "SUP-002", sequenceNumber: 6, createdAt: new Date('2026-03-25') },
      { id: "bi1g", bomId: "bom1", materialCode: "PM-4507", materialName: "LEVOWON-500 TAB FOIL A/A", materialType: "RM", labelClaim: null, quantity: "10", uom: "pcs", scrapPercentage: "1", overagePercent: "0", unitCost: "54.00", totalCost: "540.00", supplierCode: "SUP-003", sequenceNumber: 7, createdAt: new Date('2026-03-25') },

      // BOM2: MEDISUM'S NIMUPARA — 6 items
      { id: "bi2a", bomId: "bom2", materialCode: "RM-3001", materialName: "NIMESULIDE 100MG API", materialType: "RM", labelClaim: "100mg", quantity: "10", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "180.00", totalCost: "1800.00", supplierCode: "SUP-005", sequenceNumber: 1, createdAt: new Date('2026-03-25') },
      { id: "bi2b", bomId: "bom2", materialCode: "RM-3002", materialName: "PARACETAMOL 500MG API", materialType: "RM", labelClaim: "500mg", quantity: "5", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "94.00", totalCost: "470.00", supplierCode: "SUP-006", sequenceNumber: 2, createdAt: new Date('2026-03-25') },
      { id: "bi2c", bomId: "bom2", materialCode: "EX-2001", materialName: "MICROCRYSTALLINE CELLULOSE PH102", materialType: "RM", labelClaim: null, quantity: "3", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "58.00", totalCost: "174.00", supplierCode: "SUP-007", sequenceNumber: 3, createdAt: new Date('2026-03-25') },
      { id: "bi2d", bomId: "bom2", materialCode: "EX-2002", materialName: "CROSCARMELLOSE SODIUM", materialType: "RM", labelClaim: null, quantity: "1", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "120.00", totalCost: "120.00", supplierCode: "SUP-007", sequenceNumber: 4, createdAt: new Date('2026-03-25') },
      { id: "bi2e", bomId: "bom2", materialCode: "PM-5001", materialName: "ALU-ALU FOIL 20x10 CM", materialType: "PM", labelClaim: null, quantity: "100", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "1.38", totalCost: "138.00", supplierCode: "SUP-001", sequenceNumber: 5, createdAt: new Date('2026-03-25') },
      { id: "bi2f", bomId: "bom2", materialCode: "PM-5002", materialName: "OUTER CARTON MEDISUM NIMUPARA", materialType: "PM", labelClaim: null, quantity: "10", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "4.00", totalCost: "40.00", supplierCode: "SUP-008", sequenceNumber: 6, createdAt: new Date('2026-03-25') },

      // BOM3: PANTOBIS-DSR — 5 items
      { id: "bi3a", bomId: "bom3", materialCode: "RM-4001", materialName: "PANTOPRAZOLE 40MG API", materialType: "RM", labelClaim: "40mg", quantity: "8", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "95.00", totalCost: "760.00", supplierCode: "SUP-005", sequenceNumber: 1, createdAt: new Date('2026-03-20') },
      { id: "bi3b", bomId: "bom3", materialCode: "RM-4002", materialName: "DOMPERIDONE 30MG SR API", materialType: "RM", labelClaim: "30mg", quantity: "6", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "65.00", totalCost: "390.00", supplierCode: "SUP-006", sequenceNumber: 2, createdAt: new Date('2026-03-20') },
      { id: "bi3c", bomId: "bom3", materialCode: "EX-3001", materialName: "HPMC E5 BINDER", materialType: "RM", labelClaim: null, quantity: "2", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "85.00", totalCost: "170.00", supplierCode: "SUP-007", sequenceNumber: 3, createdAt: new Date('2026-03-20') },
      { id: "bi3d", bomId: "bom3", materialCode: "PM-6001", materialName: "CAPSULE SHELL SIZE 1 CLEAR", materialType: "PM", labelClaim: null, quantity: "1000", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "0.12", totalCost: "120.00", supplierCode: "SUP-009", sequenceNumber: 4, createdAt: new Date('2026-03-20') },
      { id: "bi3e", bomId: "bom3", materialCode: "PM-6002", materialName: "BLISTER FOIL 200MIC PVC/PVDC", materialType: "PM", labelClaim: null, quantity: "50", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "1.60", totalCost: "80.00", supplierCode: "SUP-002", sequenceNumber: 5, createdAt: new Date('2026-03-20') },

      // BOM4: CEFIXIME-200 — 5 items
      { id: "bi4a", bomId: "bom4", materialCode: "RM-5001", materialName: "CEFIXIME TRIHYDRATE 200MG API", materialType: "RM", labelClaim: "200mg", quantity: "10", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "120.00", totalCost: "1200.00", supplierCode: "SUP-005", sequenceNumber: 1, createdAt: new Date('2026-03-18') },
      { id: "bi4b", bomId: "bom4", materialCode: "EX-4001", materialName: "STARCH MAIZE IP", materialType: "RM", labelClaim: null, quantity: "3", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "28.00", totalCost: "84.00", supplierCode: "SUP-007", sequenceNumber: 2, createdAt: new Date('2026-03-18') },
      { id: "bi4c", bomId: "bom4", materialCode: "EX-4002", materialName: "MAGNESIUM STEARATE IP", materialType: "RM", labelClaim: null, quantity: "0.5", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "95.00", totalCost: "47.50", supplierCode: "SUP-007", sequenceNumber: 3, createdAt: new Date('2026-03-18') },
      { id: "bi4d", bomId: "bom4", materialCode: "PM-7001", materialName: "PVC FOIL 250MIC CLEAR", materialType: "PM", labelClaim: null, quantity: "80", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "3.00", totalCost: "240.00", supplierCode: "SUP-003", sequenceNumber: 4, createdAt: new Date('2026-03-18') },
      { id: "bi4e", bomId: "bom4", materialCode: "PM-7002", materialName: "CARTON BOX CEFIXIME-200", materialType: "PM", labelClaim: null, quantity: "20", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "13.42", totalCost: "268.50", supplierCode: "SUP-008", sequenceNumber: 5, createdAt: new Date('2026-03-18') },

      // BOM5: LEVOBACT-500 — 4 items
      { id: "bi5a", bomId: "bom5", materialCode: "RM-6001", materialName: "LEVOFLOXACIN HEMIHYDRATE 500MG", materialType: "RM", labelClaim: "500mg", quantity: "10", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "85.00", totalCost: "850.00", supplierCode: "SUP-006", sequenceNumber: 1, createdAt: new Date('2026-03-15') },
      { id: "bi5b", bomId: "bom5", materialCode: "EX-5001", materialName: "DICALCIUM PHOSPHATE", materialType: "RM", labelClaim: null, quantity: "4", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "35.00", totalCost: "140.00", supplierCode: "SUP-007", sequenceNumber: 2, createdAt: new Date('2026-03-15') },
      { id: "bi5c", bomId: "bom5", materialCode: "PM-8001", materialName: "ALU FOIL 20 MICRON", materialType: "PM", labelClaim: null, quantity: "80", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "2.50", totalCost: "200.00", supplierCode: "SUP-001", sequenceNumber: 3, createdAt: new Date('2026-03-15') },
      { id: "bi5d", bomId: "bom5", materialCode: "PM-8002", materialName: "OUTER BOX LEVOBACT-500", materialType: "PM", labelClaim: null, quantity: "20", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "5.00", totalCost: "100.00", supplierCode: "SUP-008", sequenceNumber: 4, createdAt: new Date('2026-03-15') },

      // BOM10: DOLO-650 — 6 items
      { id: "bi10a", bomId: "bom10", materialCode: "RM-9001", materialName: "PARACETAMOL 650MG DC GRADE", materialType: "RM", labelClaim: "650mg", quantity: "30", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "38.00", totalCost: "1140.00", supplierCode: "SUP-006", sequenceNumber: 1, createdAt: new Date('2026-02-28') },
      { id: "bi10b", bomId: "bom10", materialCode: "EX-9001", materialName: "AVICEL PH102 MCC", materialType: "RM", labelClaim: null, quantity: "8", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "58.00", totalCost: "464.00", supplierCode: "SUP-007", sequenceNumber: 2, createdAt: new Date('2026-02-28') },
      { id: "bi10c", bomId: "bom10", materialCode: "EX-9002", materialName: "POLYPLASDONE XL-10", materialType: "RM", labelClaim: null, quantity: "2", uom: "kg", scrapPercentage: "1", overagePercent: "0", unitCost: "68.00", totalCost: "136.00", supplierCode: "SUP-007", sequenceNumber: 3, createdAt: new Date('2026-02-28') },
      { id: "bi10d", bomId: "bom10", materialCode: "EX-9003", materialName: "TALC IP GRADE", materialType: "RM", labelClaim: null, quantity: "1", uom: "kg", scrapPercentage: "2", overagePercent: "0", unitCost: "15.00", totalCost: "15.00", supplierCode: "SUP-007", sequenceNumber: 4, createdAt: new Date('2026-02-28') },
      { id: "bi10e", bomId: "bom10", materialCode: "PM-9001", materialName: "STRIP FOIL ALU-PVC 10X10", materialType: "PM", labelClaim: null, quantity: "500", uom: "pcs", scrapPercentage: "3", overagePercent: "0", unitCost: "0.30", totalCost: "150.00", supplierCode: "SUP-002", sequenceNumber: 5, createdAt: new Date('2026-02-28') },
      { id: "bi10f", bomId: "bom10", materialCode: "PM-9002", materialName: "OUTER CARTON DOLO-650", materialType: "PM", labelClaim: null, quantity: "50", uom: "pcs", scrapPercentage: "2", overagePercent: "0", unitCost: "0.52", totalCost: "26.00", supplierCode: "SUP-008", sequenceNumber: 6, createdAt: new Date('2026-02-28') },
    ];

    // Group materials by bomId
    bomMaterialsData.forEach(material => {
      const existingMaterials = this.bomMaterials.get(material.bomId) || [];
      existingMaterials.push(material);
      this.bomMaterials.set(material.bomId, existingMaterials);
    });

    // Add sample inventory items data
    const inventoryItemsData = [
      {
        id: "inv1",
        itemCode: "RM001",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "PharmaChem Ltd",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB001",
        currentStock: 1085,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 3408000, // ₹34,080.00 in paise
        leadTimeDays: 14,
        specification: "max 50 words",
        imageUrl: null,
        expiryDate: new Date('2026-08-25'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-25'),
      },
      {
        id: "inv2",
        itemCode: "RM002",
        name: "Raw Materials",
        category: "Raw Materials", 
        type: "RM",
        supplierName: "BioSupply Corp",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB002",
        currentStock: 449,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 2469500, // ₹24,695.00 in paise
        leadTimeDays: 3,
        specification: "High purity grade",
        imageUrl: null,
        expiryDate: new Date('2027-03-15'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-22'),
        updatedAt: new Date('2024-08-25'),
      },
      {
        id: "inv3",
        itemCode: "RM003",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "ChemSource Industries",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB003",
        currentStock: 927,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 906200, // ₹9,062.00 in paise
        leadTimeDays: 4,
        specification: "USP grade material",
        imageUrl: null,
        expiryDate: new Date('2025-12-30'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-18'),
        updatedAt: new Date('2024-08-20'),
      },
      {
        id: "inv4",
        itemCode: "RM004",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "PureChem Solutions",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB004",
        currentStock: 713,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 1278600, // ₹12,786.00 in paise
        leadTimeDays: 13,
        specification: "Pharmaceutical grade",
        imageUrl: null,
        expiryDate: new Date('2026-05-20'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-08-18'),
      },
      {
        id: "inv5",
        itemCode: "RM005",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "MedGrade Supplies",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB005",
        currentStock: 422,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 1138400, // ₹11,384.00 in paise
        leadTimeDays: 9,
        specification: "High quality excipient",
        imageUrl: null,
        expiryDate: new Date('2026-11-10'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-12'),
        updatedAt: new Date('2024-08-15'),
      },
      {
        id: "inv6",
        itemCode: "RM006",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "Global Pharma Tech",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB006",
        currentStock: 1051,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 5570300, // ₹55,703.00 in paise
        leadTimeDays: 4,
        specification: "Premium grade",
        imageUrl: null,
        expiryDate: new Date('2025-09-18'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-10'),
        updatedAt: new Date('2024-08-12'),
      },
      {
        id: "inv7", 
        itemCode: "RM007",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "Specialty Chemicals",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB007",
        currentStock: 556,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 870800, // ₹8,708.00 in paise
        leadTimeDays: 2,
        specification: "Research grade",
        imageUrl: null,
        expiryDate: new Date('2027-01-25'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-08'),
        updatedAt: new Date('2024-08-10'),
      },
      {
        id: "inv8",
        itemCode: "RM008",
        name: "Raw Materials",
        category: "Raw Materials",
        type: "RM",
        supplierName: "Advanced Materials Co",
        warehouseLocation: "50 / 2000",
        batchNumber: "RMB008",
        currentStock: 276,
        minimumLevel: 10,
        maximumLevel: 2000,
        moq: 10,
        uom: "KG",
        rate: 1596000, // ₹15,960.00 in paise
        leadTimeDays: 12,
        specification: "Industrial grade",
        imageUrl: null,
        expiryDate: new Date('2026-02-14'),
        status: "Active",
        qualityStatus: "Passed",
        createdBy: "system",
        createdAt: new Date('2024-08-06'),
        updatedAt: new Date('2024-08-08'),
      }
    ];

    inventoryItemsData.forEach(item => this.inventoryItems.set(item.id, item));

    // Add sample stock movements data
    const stockMovementsData = [
      {
        id: "sm1",
        inventoryItemId: "inv1",
        type: "IN",
        quantity: 100,
        fromLocation: null,
        toLocation: "Warehouse A",
        referenceNumber: "PO-001",
        user: "admin@pharma.com",
        qualityIssue: null,
        notes: "Initial stock receipt",
        movementDate: new Date('2024-08-20'),
        createdAt: new Date('2024-08-20'),
      },
      {
        id: "sm2", 
        inventoryItemId: "inv2",
        type: "IN",
        quantity: 50,
        fromLocation: null,
        toLocation: "Warehouse B",
        referenceNumber: "PO-002",
        user: "admin@pharma.com",
        qualityIssue: null,
        notes: "Stock replenishment",
        movementDate: new Date('2024-08-22'),
        createdAt: new Date('2024-08-22'),
      },
      {
        id: "sm3",
        inventoryItemId: "inv3",
        type: "OUT",
        quantity: 25,
        fromLocation: "Warehouse A",
        toLocation: "Production Floor",
        referenceNumber: "WO-001",
        user: "production@pharma.com",
        qualityIssue: null,
        notes: "Issued for production",
        movementDate: new Date('2024-08-23'),
        createdAt: new Date('2024-08-23'),
      }
    ];

    // Group stock movements by inventory item ID
    stockMovementsData.forEach(movement => {
      const existingMovements = this.stockMovements.get(movement.inventoryItemId) || [];
      existingMovements.push(movement);
      this.stockMovements.set(movement.inventoryItemId, existingMovements);
    });

    // Initialize Production Management sample data
    const productionBatchData: ProductionBatch[] = [
      {
        id: "pb1",
        batchNumber: "BTH-2024-001",
        productionOrderId: null,
        productCode: "TAB-PARA-500",
        productName: "Paracetamol Tablets 500mg",
        bomId: "bom1",
        site: "Plant A - Mumbai",
        targetQuantity: 50000,
        actualQuantity: 48500,
        uom: "tablets",
        plannedStartDate: new Date('2024-12-01'),
        plannedEndDate: new Date('2024-12-05'),
        actualStartDate: new Date('2024-12-01'),
        actualEndDate: null,
        status: "in-progress",
        currentStage: "Compression",
        priority: "high",
        assignedTo: "John Smith",
        supervisorId: null,
        yieldPercentage: "97.0",
        scrapQuantity: 500,
        reworkQuantity: 0,
        isDelayed: false,
        delayReason: null,
        isArchived: false,
        archivedAt: null,
        completedStagesCount: 5,
        totalStagesCount: 8,
        progressPercentage: 62,
        notes: "Production running on schedule",
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-12-10'),
      },
      {
        id: "pb2",
        batchNumber: "BTH-2024-002",
        productionOrderId: null,
        productCode: "CAP-AMOX-250",
        productName: "Amoxicillin Capsules 250mg",
        bomId: "bom2",
        site: "Plant A - Mumbai",
        targetQuantity: 100000,
        actualQuantity: 0,
        uom: "capsules",
        plannedStartDate: new Date('2024-12-15'),
        plannedEndDate: new Date('2024-12-20'),
        actualStartDate: null,
        actualEndDate: null,
        status: "planned",
        currentStage: "Dispensing",
        priority: "critical",
        assignedTo: "Sarah Johnson",
        supervisorId: null,
        yieldPercentage: null,
        scrapQuantity: null,
        reworkQuantity: null,
        isDelayed: false,
        delayReason: null,
        isArchived: false,
        archivedAt: null,
        completedStagesCount: 0,
        totalStagesCount: 6,
        progressPercentage: 0,
        notes: null,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: "pb3",
        batchNumber: "BTH-2024-003",
        productionOrderId: null,
        productCode: "SYR-CEFU-100",
        productName: "Cefuroxime Syrup 100mg/5ml",
        bomId: null,
        site: "Plant B - Hyderabad",
        targetQuantity: 25000,
        actualQuantity: 25000,
        uom: "bottles",
        plannedStartDate: new Date('2024-11-20'),
        plannedEndDate: new Date('2024-11-25'),
        actualStartDate: new Date('2024-11-20'),
        actualEndDate: new Date('2024-11-25'),
        status: "completed",
        currentStage: "Packaging",
        priority: "medium",
        assignedTo: "Mike Chen",
        supervisorId: null,
        yieldPercentage: "100.0",
        scrapQuantity: 0,
        reworkQuantity: 0,
        isDelayed: false,
        delayReason: null,
        isArchived: false,
        archivedAt: null,
        completedStagesCount: 5,
        totalStagesCount: 5,
        progressPercentage: 100,
        notes: "Batch completed successfully",
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-25'),
      },
      {
        id: "pb4",
        batchNumber: "BTH-2024-004",
        productionOrderId: null,
        productCode: "TAB-IBUP-400",
        productName: "Ibuprofen Tablets 400mg",
        bomId: null,
        site: "Plant A - Mumbai",
        targetQuantity: 75000,
        actualQuantity: 72000,
        uom: "tablets",
        plannedStartDate: new Date('2024-12-08'),
        plannedEndDate: new Date('2024-12-12'),
        actualStartDate: new Date('2024-12-08'),
        actualEndDate: null,
        status: "qc-hold",
        currentStage: "Coating",
        priority: "high",
        assignedTo: "Emily Wang",
        supervisorId: null,
        yieldPercentage: "96.0",
        scrapQuantity: 1000,
        reworkQuantity: 2000,
        isDelayed: true,
        delayReason: "Pending QC clearance for coating solution",
        isArchived: false,
        archivedAt: null,
        completedStagesCount: 2,
        totalStagesCount: 4,
        progressPercentage: 50,
        notes: "QC hold for coating deviation investigation",
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-10'),
      },
      {
        id: "pb5",
        batchNumber: "BTH-2024-005",
        productionOrderId: null,
        productCode: "INJ-CEFT-1G",
        productName: "Ceftriaxone Injection 1g",
        bomId: null,
        site: "Plant C - Ahmedabad",
        targetQuantity: 10000,
        actualQuantity: 0,
        uom: "vials",
        plannedStartDate: new Date('2024-12-18'),
        plannedEndDate: new Date('2024-12-22'),
        actualStartDate: null,
        actualEndDate: null,
        status: "planned",
        currentStage: "Dispensing",
        priority: "low",
        assignedTo: "Robert Kim",
        supervisorId: null,
        yieldPercentage: null,
        scrapQuantity: null,
        reworkQuantity: null,
        isDelayed: false,
        delayReason: null,
        isArchived: false,
        archivedAt: null,
        completedStagesCount: 0,
        totalStagesCount: 7,
        progressPercentage: 0,
        notes: null,
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      }
    ];

    productionBatchData.forEach(batch => this.productionBatches.set(batch.id, batch));

    // Initialize Batch Stages for production batches
    const batchStageData: BatchStage[] = [
      // Stages for BTH-2024-001 (Paracetamol)
      { id: "bs1", batchId: "pb1", stageName: "Dispensing", stageOrder: 1, status: "completed", operatorName: "John Smith", equipmentUsed: "EQ-DISP-001", startTime: new Date('2024-12-01T08:15:00'), endTime: new Date('2024-12-01T11:45:00'), estimatedDuration: 240, actualDuration: 210, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "All materials dispensed as per BOM", createdAt: new Date('2024-12-01'), updatedAt: new Date('2024-12-01') },
      { id: "bs2", batchId: "pb1", stageName: "Sifting", stageOrder: 2, status: "completed", operatorName: "Mike Johnson", equipmentUsed: "EQ-SIFT-001", startTime: new Date('2024-12-01T13:00:00'), endTime: new Date('2024-12-01T14:45:00'), estimatedDuration: 120, actualDuration: 105, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "40 mesh sieve used", createdAt: new Date('2024-12-01'), updatedAt: new Date('2024-12-01') },
      { id: "bs3", batchId: "pb1", stageName: "Dry Mixing", stageOrder: 3, status: "completed", operatorName: "Sarah Lee", equipmentUsed: "EQ-MIX-002", startTime: new Date('2024-12-02T08:00:00'), endTime: new Date('2024-12-02T09:50:00'), estimatedDuration: 120, actualDuration: 110, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "Blend uniformity achieved", createdAt: new Date('2024-12-02'), updatedAt: new Date('2024-12-02') },
      { id: "bs4", batchId: "pb1", stageName: "Granulation", stageOrder: 4, status: "completed", operatorName: "Sarah Lee", equipmentUsed: "EQ-GRAN-001", startTime: new Date('2024-12-02T10:30:00'), endTime: new Date('2024-12-02T14:15:00'), estimatedDuration: 210, actualDuration: 225, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "Wet granulation completed", createdAt: new Date('2024-12-02'), updatedAt: new Date('2024-12-02') },
      { id: "bs5", batchId: "pb1", stageName: "Drying", stageOrder: 5, status: "completed", operatorName: "Mike Johnson", equipmentUsed: "EQ-FBD-001", startTime: new Date('2024-12-03T08:00:00'), endTime: new Date('2024-12-03T11:30:00'), estimatedDuration: 240, actualDuration: 210, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "LOD: 2.1%", createdAt: new Date('2024-12-03'), updatedAt: new Date('2024-12-03') },
      { id: "bs6", batchId: "pb1", stageName: "Compression", stageOrder: 6, status: "in-progress", operatorName: "David Chen", equipmentUsed: "EQ-COMP-001", startTime: new Date('2024-12-04T08:00:00'), endTime: null, estimatedDuration: 600, actualDuration: null, qcCheckpointRequired: true, qcCheckpointCompleted: false, qcCheckpointResult: "pending", inputQuantity: null, outputQuantity: 35000, scrapQuantity: 150, notes: "Compression in progress, 35000 tablets done", createdAt: new Date('2024-12-04'), updatedAt: new Date('2024-12-10') },
      { id: "bs7", batchId: "pb1", stageName: "Coating", stageOrder: 7, status: "not-started", operatorName: "Emily Wang", equipmentUsed: "EQ-COAT-001", startTime: null, endTime: null, estimatedDuration: 360, actualDuration: null, qcCheckpointRequired: true, qcCheckpointCompleted: false, qcCheckpointResult: null, inputQuantity: null, outputQuantity: null, scrapQuantity: null, notes: null, createdAt: new Date('2024-12-04'), updatedAt: new Date('2024-12-04') },
      { id: "bs8", batchId: "pb1", stageName: "Packaging", stageOrder: 8, status: "not-started", operatorName: "Robert Kim", equipmentUsed: "EQ-PACK-001", startTime: null, endTime: null, estimatedDuration: 210, actualDuration: null, qcCheckpointRequired: true, qcCheckpointCompleted: false, qcCheckpointResult: null, inputQuantity: null, outputQuantity: null, scrapQuantity: null, notes: null, createdAt: new Date('2024-12-04'), updatedAt: new Date('2024-12-04') },
      // Stages for BTH-2024-004 (Ibuprofen - QC Hold)
      { id: "bs9", batchId: "pb4", stageName: "Dispensing", stageOrder: 1, status: "completed", operatorName: "John Smith", equipmentUsed: "EQ-DISP-001", startTime: new Date('2024-12-08T08:00:00'), endTime: new Date('2024-12-08T11:30:00'), estimatedDuration: 240, actualDuration: 210, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: null, scrapQuantity: 0, notes: "Dispensing complete", createdAt: new Date('2024-12-08'), updatedAt: new Date('2024-12-08') },
      { id: "bs10", batchId: "pb4", stageName: "Compression", stageOrder: 2, status: "completed", operatorName: "David Chen", equipmentUsed: "EQ-COMP-002", startTime: new Date('2024-12-09T08:00:00'), endTime: new Date('2024-12-09T17:30:00'), estimatedDuration: 600, actualDuration: 570, qcCheckpointRequired: true, qcCheckpointCompleted: true, qcCheckpointResult: "passed", inputQuantity: null, outputQuantity: 72000, scrapQuantity: 500, notes: "72000 tablets compressed", createdAt: new Date('2024-12-09'), updatedAt: new Date('2024-12-09') },
      { id: "bs11", batchId: "pb4", stageName: "Coating", stageOrder: 3, status: "on-hold", operatorName: "Emily Wang", equipmentUsed: "EQ-COAT-001", startTime: new Date('2024-12-10T08:00:00'), endTime: null, estimatedDuration: 360, actualDuration: null, qcCheckpointRequired: true, qcCheckpointCompleted: false, qcCheckpointResult: "pending", inputQuantity: 72000, outputQuantity: null, scrapQuantity: null, notes: "QC hold - coating solution viscosity deviation", createdAt: new Date('2024-12-10'), updatedAt: new Date('2024-12-10') },
    ];

    batchStageData.forEach(stage => {
      this.batchStagesMap.set(stage.id, stage);
      const stages = this.batchStagesByBatch.get(stage.batchId) || [];
      stages.push(stage);
      this.batchStagesByBatch.set(stage.batchId, stages);
    });

    // Initialize Batch Executions
    const batchExecutionData: BatchExecution[] = [
      { id: "be1", batchId: "pb1", stageId: "bs1", executionType: "material-consumption", materialId: "m1", materialName: "Acetaminophen USP", quantityUsed: "25", quantityExpected: "25", uom: "KG", yieldRecorded: null, scrapRecorded: "0", reworkRecorded: null, deviationDescription: null, deviationSeverity: null, comment: "API issued as per BOM", recordedBy: "John Smith", recordedAt: new Date('2024-12-01T09:00:00'), createdAt: new Date('2024-12-01') },
      { id: "be2", batchId: "pb1", stageId: "bs1", executionType: "material-consumption", materialId: "m2", materialName: "Microcrystalline Cellulose", quantityUsed: "15", quantityExpected: "15", uom: "KG", yieldRecorded: null, scrapRecorded: "0", reworkRecorded: null, deviationDescription: null, deviationSeverity: null, comment: "MCC issued", recordedBy: "John Smith", recordedAt: new Date('2024-12-01T09:30:00'), createdAt: new Date('2024-12-01') },
      { id: "be3", batchId: "pb1", stageId: "bs3", executionType: "comment", materialId: null, materialName: null, quantityUsed: null, quantityExpected: null, uom: null, yieldRecorded: null, scrapRecorded: null, reworkRecorded: null, deviationDescription: null, deviationSeverity: null, comment: "Mixer speed: 25 RPM, Time: 15 min, Blend uniformity RSD: 2.3%", recordedBy: "Sarah Lee", recordedAt: new Date('2024-12-02T09:30:00'), createdAt: new Date('2024-12-02') },
      { id: "be4", batchId: "pb1", stageId: "bs5", executionType: "comment", materialId: null, materialName: null, quantityUsed: null, quantityExpected: null, uom: null, yieldRecorded: null, scrapRecorded: null, reworkRecorded: null, deviationDescription: null, deviationSeverity: null, comment: "Inlet temp: 60°C, Product temp: 45°C, LOD achieved: 2.1%", recordedBy: "Mike Johnson", recordedAt: new Date('2024-12-03T11:00:00'), createdAt: new Date('2024-12-03') },
      { id: "be5", batchId: "pb1", stageId: "bs6", executionType: "yield-record", materialId: null, materialName: null, quantityUsed: null, quantityExpected: "50000", uom: "Tablets", yieldRecorded: "35000", scrapRecorded: "150", reworkRecorded: "0", deviationDescription: null, deviationSeverity: null, comment: "Compression in progress - partial yield recorded", recordedBy: "David Chen", recordedAt: new Date('2024-12-10T14:00:00'), createdAt: new Date('2024-12-10') },
      { id: "be6", batchId: "pb4", stageId: "bs11", executionType: "deviation", materialId: null, materialName: null, quantityUsed: null, quantityExpected: null, uom: null, yieldRecorded: null, scrapRecorded: null, reworkRecorded: null, deviationDescription: "Coating solution viscosity found to be 85 cps instead of 75-80 cps specification", deviationSeverity: "minor", comment: "QC hold initiated pending investigation", recordedBy: "Emily Wang", recordedAt: new Date('2024-12-10T10:30:00'), createdAt: new Date('2024-12-10') },
    ];

    batchExecutionData.forEach(exec => {
      this.batchExecutionsMap.set(exec.id, exec);
      const execs = this.batchExecutionsByBatch.get(exec.batchId) || [];
      execs.push(exec);
      this.batchExecutionsByBatch.set(exec.batchId, execs);
    });

    // Initialize Job Works (External Vendor Operations)
    const jobWorkData: JobWork[] = [
      {
        id: "jw1",
        jobWorkNumber: "JW-2024-001",
        batchId: "pb1",
        vendorName: "CoatTech Industries",
        vendorCode: "VND-COAT-001",
        vendorContact: "+91 9876543210",
        processDescription: "Enteric Coating Application",
        status: "in-progress",
        materialIssuedDate: new Date('2024-12-10'),
        expectedReceiptDate: new Date('2024-12-14'),
        actualReceiptDate: null,
        materialIssuedQty: 35000,
        expectedReceiptQty: 34500,
        actualReceiptQty: null,
        processLoss: null,
        scrapQuantity: null,
        qualityStatus: "pending",
        invoiceNumber: null,
        invoiceAmount: null,
        notes: "Enteric coating for delayed release formulation",
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      },
      {
        id: "jw2",
        jobWorkNumber: "JW-2024-002",
        batchId: "pb3",
        vendorName: "PackPro Solutions",
        vendorCode: "VND-PACK-001",
        vendorContact: "+91 9876543211",
        processDescription: "Blister Packaging",
        status: "completed",
        materialIssuedDate: new Date('2024-11-23'),
        expectedReceiptDate: new Date('2024-11-25'),
        actualReceiptDate: new Date('2024-11-25'),
        materialIssuedQty: 25000,
        expectedReceiptQty: 24750,
        actualReceiptQty: 24800,
        processLoss: 0.8,
        scrapQuantity: 200,
        qualityStatus: "approved",
        invoiceNumber: "INV-PP-2024-156",
        invoiceAmount: 125000,
        notes: "Blister packing completed successfully",
        createdAt: new Date('2024-11-23'),
        updatedAt: new Date('2024-11-25'),
      },
      {
        id: "jw3",
        jobWorkNumber: "JW-2024-003",
        batchId: null,
        vendorName: "SterilePack Pharma",
        vendorCode: "VND-STER-001",
        vendorContact: "+91 9876543212",
        processDescription: "Sterile Vial Filling",
        status: "pending",
        materialIssuedDate: null,
        expectedReceiptDate: new Date('2024-12-25'),
        actualReceiptDate: null,
        materialIssuedQty: null,
        expectedReceiptQty: 10000,
        actualReceiptQty: null,
        processLoss: null,
        scrapQuantity: null,
        qualityStatus: null,
        invoiceNumber: null,
        invoiceAmount: null,
        notes: "Scheduled for Ceftriaxone batch",
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      },
      {
        id: "jw4",
        jobWorkNumber: "JW-2024-004",
        batchId: "pb4",
        vendorName: "QualityTest Labs",
        vendorCode: "VND-LAB-001",
        vendorContact: "+91 9876543213",
        processDescription: "Stability Testing",
        status: "in-progress",
        materialIssuedDate: new Date('2024-12-09'),
        expectedReceiptDate: new Date('2024-12-16'),
        actualReceiptDate: null,
        materialIssuedQty: 500,
        expectedReceiptQty: 0,
        actualReceiptQty: null,
        processLoss: null,
        scrapQuantity: null,
        qualityStatus: "pending",
        invoiceNumber: null,
        invoiceAmount: null,
        notes: "Accelerated stability samples submitted",
        createdAt: new Date('2024-12-09'),
        updatedAt: new Date('2024-12-09'),
      }
    ];

    jobWorkData.forEach(jw => this.jobWorksMap.set(jw.id, jw));

    // Initialize Batch Reviews
    const batchReviewData: BatchReview[] = [
      {
        id: "br1",
        batchId: "pb3",
        reviewStatus: "approved",
        allStagesCompleted: true,
        yieldRecorded: true,
        deviationsLogged: true,
        materialBalanceOk: true,
        reviewedBy: "QA Manager - Dr. Priya Sharma",
        reviewedAt: new Date('2024-11-25T16:00:00'),
        approvedBy: "QA Head - Dr. Rajesh Kumar",
        approvedAt: new Date('2024-11-25T17:00:00'),
        rejectionReason: null,
        productionSummary: "Batch completed successfully with 100% yield. All IPC checks passed. No deviations observed.",
        closureNotes: "Batch released for distribution. COA issued.",
        createdAt: new Date('2024-11-25'),
        updatedAt: new Date('2024-11-25'),
      },
      {
        id: "br2",
        batchId: "pb4",
        reviewStatus: "pending",
        allStagesCompleted: false,
        yieldRecorded: true,
        deviationsLogged: true,
        materialBalanceOk: true,
        reviewedBy: null,
        reviewedAt: null,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        productionSummary: "Batch on QC hold due to coating solution deviation. Investigation ongoing.",
        closureNotes: null,
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      }
    ];

    batchReviewData.forEach(review => {
      this.batchReviewsMap.set(review.id, review);
      this.batchReviewsByBatch.set(review.batchId, review);
    });

    // Initialize Equipment
    const equipmentData: Equipment[] = [
      { id: "eq1", name: "High-Shear Granulator HSG-100", code: "HSG-100", type: "granulator", capacity: 100, capacityUom: "kg/batch", location: "Block A - Granulation", status: "available", lastMaintenanceDate: new Date('2024-11-15'), nextMaintenanceDate: new Date('2025-02-15'), manufacturer: "GEA Pharma Systems", model: "PMA 300", serialNumber: "GEA-PMA-2019-001", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "eq2", name: "Tablet Press TP-500", code: "TP-500", type: "tablet-press", capacity: 50000, capacityUom: "tablets/hr", location: "Block B - Compression", status: "in-use", lastMaintenanceDate: new Date('2024-10-01'), nextMaintenanceDate: new Date('2025-01-01'), manufacturer: "Fette Compacting", model: "P 3020", serialNumber: "FC-P3020-2020-003", notes: "Currently running Paracetamol batch", createdAt: new Date(), updatedAt: new Date() },
      { id: "eq3", name: "Coating Machine CM-200", code: "CM-200", type: "coating-machine", capacity: 200, capacityUom: "kg/batch", location: "Block C - Coating", status: "available", lastMaintenanceDate: new Date('2024-09-20'), nextMaintenanceDate: new Date('2024-12-20'), manufacturer: "Glatt", model: "GCGA 150", serialNumber: "GLT-GCGA-2018-002", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "eq4", name: "Blister Packaging Line BPL-01", code: "BPL-01", type: "packaging-line", capacity: 300, capacityUom: "blisters/min", location: "Block D - Packaging", status: "available", lastMaintenanceDate: new Date('2024-11-01'), nextMaintenanceDate: new Date('2025-02-01'), manufacturer: "IMA", model: "C80", serialNumber: "IMA-C80-2021-001", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "eq5", name: "Fluid Bed Dryer FBD-50", code: "FBD-50", type: "granulator", capacity: 50, capacityUom: "kg/batch", location: "Block A - Granulation", status: "maintenance", lastMaintenanceDate: new Date('2024-08-15'), nextMaintenanceDate: new Date('2024-12-15'), manufacturer: "Glatt", model: "WSG 60", serialNumber: "GLT-WSG-2017-001", notes: "Under preventive maintenance", createdAt: new Date(), updatedAt: new Date() },
      { id: "eq6", name: "V-Blender VB-300", code: "VB-300", type: "mixer", capacity: 300, capacityUom: "liters", location: "Block A - Mixing", status: "available", lastMaintenanceDate: new Date('2024-11-10'), nextMaintenanceDate: new Date('2025-02-10'), manufacturer: "Patterson-Kelley", model: "V-300", serialNumber: "PK-V300-2019-002", notes: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    equipmentData.forEach(eq => this.equipmentMap.set(eq.id, eq));

    // Initialize Production Jobs (for current week scheduling)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(8, 0, 0, 0);
    
    const productionJobData: ProductionJob[] = [
      { id: "pj1", jobNumber: "JOB-2024-001", orderNumber: "PO-2024-156", productionOrderId: null, batchId: "pb1", productName: "Paracetamol 500mg Tablets", productCode: "PARA-500", equipmentId: "eq2", scheduledStart: new Date(weekStart.getTime()), scheduledEnd: new Date(weekStart.getTime() + 8 * 60 * 60 * 1000), actualStart: new Date(weekStart.getTime()), actualEnd: null, durationMinutes: 480, quantity: 50000, uom: "tablets", status: "in-progress", priority: "high", assignedTo: "David Chen", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "pj2", jobNumber: "JOB-2024-002", orderNumber: "PO-2024-157", productionOrderId: null, batchId: null, productName: "Amoxicillin 250mg Capsules", productCode: "AMOX-250", equipmentId: "eq1", scheduledStart: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000), scheduledEnd: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), actualStart: null, actualEnd: null, durationMinutes: 360, quantity: 25000, uom: "capsules", status: "scheduled", priority: "medium", assignedTo: "Sarah Johnson", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "pj3", jobNumber: "JOB-2024-003", orderNumber: "PO-2024-158", productionOrderId: null, batchId: null, productName: "Ibuprofen 400mg Tablets", productCode: "IBU-400", equipmentId: "eq2", scheduledStart: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), scheduledEnd: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), actualStart: null, actualEnd: null, durationMinutes: 480, quantity: 40000, uom: "tablets", status: "scheduled", priority: "medium", assignedTo: "Michael Brown", notes: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "pj4", jobNumber: "JOB-2024-004", orderNumber: "PO-2024-159", productionOrderId: null, batchId: null, productName: "Aspirin 100mg Tablets", productCode: "ASP-100", equipmentId: "eq3", scheduledStart: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000), scheduledEnd: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), actualStart: null, actualEnd: null, durationMinutes: 240, quantity: 30000, uom: "tablets", status: "scheduled", priority: "low", assignedTo: "Emily Wang", notes: "Coating operation", createdAt: new Date(), updatedAt: new Date() },
      { id: "pj5", jobNumber: "JOB-2024-005", orderNumber: "PO-2024-160", productionOrderId: null, batchId: null, productName: "Omeprazole 20mg Capsules", productCode: "OME-20", equipmentId: "eq4", scheduledStart: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000), scheduledEnd: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), actualStart: null, actualEnd: null, durationMinutes: 360, quantity: 20000, uom: "capsules", status: "scheduled", priority: "high", assignedTo: "James Wilson", notes: "Packaging operation", createdAt: new Date(), updatedAt: new Date() },
      { id: "pj6", jobNumber: "JOB-2024-006", orderNumber: "PO-2024-161", productionOrderId: null, batchId: "pb3", productName: "Metformin 500mg Tablets", productCode: "MET-500", equipmentId: "eq2", scheduledStart: new Date(weekStart.getTime() - 3 * 24 * 60 * 60 * 1000), scheduledEnd: new Date(weekStart.getTime() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), actualStart: new Date(weekStart.getTime() - 3 * 24 * 60 * 60 * 1000), actualEnd: new Date(weekStart.getTime() - 3 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000), durationMinutes: 480, quantity: 60000, uom: "tablets", status: "completed", priority: "medium", assignedTo: "David Chen", notes: "Completed ahead of schedule", createdAt: new Date(), updatedAt: new Date() },
    ];
    productionJobData.forEach(job => this.productionJobsMap.set(job.id, job));

    // Initialize Job Cards
    const jobCardData: JobCard[] = [
      { id: "jc1", cardNumber: "JC-2024-001", jobId: "pj1", batchId: "pb1", stageId: "bs1", title: "Verify Raw Material Release", description: "Check QC approval status for all batch materials", cardType: "checklist", stepNumber: 1, status: "completed", priority: "high", assignedTo: "QC Analyst", assignedOperator: null, equipmentRequired: null, materialsRequired: null, plannedStart: new Date(weekStart.getTime()), plannedEnd: new Date(weekStart.getTime() + 1 * 60 * 60 * 1000), actualStart: new Date(weekStart.getTime()), actualEnd: new Date(weekStart.getTime() + 1 * 60 * 60 * 1000), dueDate: new Date(weekStart.getTime()), completedAt: new Date(weekStart.getTime() + 1 * 60 * 60 * 1000), completedBy: "QC Analyst", estimatedDuration: 60, actualDuration: 60, inputQuantity: null, outputQuantity: null, yieldPercentage: null, checklist: JSON.stringify([{item: "Paracetamol API released", checked: true}, {item: "Excipients released", checked: true}, {item: "Packaging materials checked", checked: true}]), formData: null, qcRequired: true, qcStatus: "passed", qcNotes: null, deviationLogged: false, deviationDetails: null, notes: null, attachments: null, uploadedFile: null, createdBy: "Production Manager", createdAt: new Date(), updatedAt: new Date() },
      { id: "jc2", cardNumber: "JC-2024-002", jobId: "pj1", batchId: "pb1", stageId: "bs1", title: "Equipment Line Clearance", description: "Complete line clearance before batch start", cardType: "inspection", stepNumber: 2, status: "completed", priority: "high", assignedTo: "Production Operator", assignedOperator: null, equipmentRequired: "Tablet Press TP-500", materialsRequired: null, plannedStart: new Date(weekStart.getTime()), plannedEnd: new Date(weekStart.getTime() + 0.5 * 60 * 60 * 1000), actualStart: new Date(weekStart.getTime()), actualEnd: new Date(weekStart.getTime() + 0.5 * 60 * 60 * 1000), dueDate: new Date(weekStart.getTime()), completedAt: new Date(weekStart.getTime() + 0.5 * 60 * 60 * 1000), completedBy: "Production Operator", estimatedDuration: 30, actualDuration: 30, inputQuantity: null, outputQuantity: null, yieldPercentage: null, checklist: null, formData: null, qcRequired: false, qcStatus: null, qcNotes: null, deviationLogged: false, deviationDetails: null, notes: "Line clearance verified by shift supervisor", attachments: null, uploadedFile: null, createdBy: "Production Manager", createdAt: new Date(), updatedAt: new Date() },
      { id: "jc3", cardNumber: "JC-2024-003", jobId: "pj1", batchId: "pb1", stageId: "bs6", title: "In-Process QC Sampling", description: "Collect samples at compression stage for IPC testing", cardType: "task", stepNumber: 1, status: "in-progress", priority: "medium", assignedTo: "QC Technician", assignedOperator: null, equipmentRequired: null, materialsRequired: null, plannedStart: new Date(weekStart.getTime() + 4 * 60 * 60 * 1000), plannedEnd: new Date(weekStart.getTime() + 5 * 60 * 60 * 1000), actualStart: new Date(weekStart.getTime() + 4 * 60 * 60 * 1000), actualEnd: null, dueDate: new Date(weekStart.getTime() + 4 * 60 * 60 * 1000), completedAt: null, completedBy: null, estimatedDuration: 60, actualDuration: null, inputQuantity: null, outputQuantity: null, yieldPercentage: null, checklist: null, formData: null, qcRequired: true, qcStatus: "pending", qcNotes: null, deviationLogged: false, deviationDetails: null, notes: null, attachments: null, uploadedFile: null, createdBy: "QC Manager", createdAt: new Date(), updatedAt: new Date() },
      { id: "jc4", cardNumber: "JC-2024-004", jobId: "pj2", batchId: null, stageId: null, title: "Pre-production Setup", description: "Prepare granulator for Amoxicillin batch", cardType: "task", stepNumber: 1, status: "pending", priority: "medium", assignedTo: "Production Operator", assignedOperator: null, equipmentRequired: "High-Shear Granulator HSG-100", materialsRequired: null, plannedStart: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000), plannedEnd: new Date(weekStart.getTime() + 25 * 60 * 60 * 1000), actualStart: null, actualEnd: null, dueDate: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000), completedAt: null, completedBy: null, estimatedDuration: 60, actualDuration: null, inputQuantity: null, outputQuantity: null, yieldPercentage: null, checklist: null, formData: null, qcRequired: false, qcStatus: null, qcNotes: null, deviationLogged: false, deviationDetails: null, notes: null, attachments: null, uploadedFile: null, createdBy: "Production Manager", createdAt: new Date(), updatedAt: new Date() },
      { id: "jc5", cardNumber: "JC-2024-005", jobId: "pj1", batchId: "pb1", stageId: null, title: "Batch Documentation Review", description: "Review and sign batch manufacturing record", cardType: "documentation", stepNumber: 1, status: "pending", priority: "high", assignedTo: "Production Manager", assignedOperator: null, equipmentRequired: null, materialsRequired: null, plannedStart: new Date(weekStart.getTime() + 8 * 60 * 60 * 1000), plannedEnd: new Date(weekStart.getTime() + 9 * 60 * 60 * 1000), actualStart: null, actualEnd: null, dueDate: new Date(weekStart.getTime() + 8 * 60 * 60 * 1000), completedAt: null, completedBy: null, estimatedDuration: 60, actualDuration: null, inputQuantity: null, outputQuantity: null, yieldPercentage: null, checklist: null, formData: null, qcRequired: false, qcStatus: null, qcNotes: null, deviationLogged: false, deviationDetails: null, notes: null, attachments: null, uploadedFile: null, createdBy: "QA Manager", createdAt: new Date(), updatedAt: new Date() },
    ];
    jobCardData.forEach(card => this.jobCardsMap.set(card.id, card));
  }

  // SOP operations
  async getSops(): Promise<Sop[]> {
    return Array.from(this.sops.values()).sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    );
  }

  async getSopsByCategory(category: string): Promise<Sop[]> {
    return Array.from(this.sops.values())
      .filter(sop => sop.category === category)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }

  async getSop(id: string): Promise<Sop | undefined> {
    return this.sops.get(id);
  }

  async createSop(insertSop: InsertSop): Promise<Sop> {
    const id = randomUUID();
    const now = new Date();
    const sop: Sop = {
      ...insertSop,
      id,
      version: insertSop.version || '1.0',
      status: insertSop.status || 'draft',
      description: insertSop.description || null,
      filePath: insertSop.filePath || null,
      fileName: insertSop.fileName || null,
      fileSize: insertSop.fileSize || null,
      approvedBy: insertSop.approvedBy || null,
      approvedDate: insertSop.approvedDate || null,
      effectiveDate: insertSop.effectiveDate || null,
      nextReviewDate: insertSop.nextReviewDate || null,
      createdAt: now,
      updatedAt: now,
    };
    this.sops.set(id, sop);
    return sop;
  }

  async updateSop(id: string, updateData: Partial<InsertSop>): Promise<Sop | undefined> {
    const existing = this.sops.get(id);
    if (!existing) return undefined;

    const updated: Sop = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    
    // If version is being updated, create a version history record
    if (updateData.version && updateData.version !== existing.version) {
      await this.createSopVersion({
        sopId: id,
        version: existing.version,
        filePath: existing.filePath,
        fileName: existing.fileName,
        fileSize: existing.fileSize,
        changeLog: `Updated to version ${updateData.version}`,
        createdBy: updateData.createdBy || existing.createdBy,
      });
    }
    
    this.sops.set(id, updated);
    return updated;
  }

  async deleteSop(id: string): Promise<boolean> {
    const deleted = this.sops.delete(id);
    if (deleted) {
      // Also remove version history
      this.sopVersions.delete(id);
    }
    return deleted;
  }

  async getSopVersions(sopId: string): Promise<SopVersion[]> {
    const versions = this.sopVersions.get(sopId) || [];
    return versions.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createSopVersion(insertSopVersion: InsertSopVersion): Promise<SopVersion> {
    const id = randomUUID();
    const now = new Date();
    const sopVersion: SopVersion = {
      ...insertSopVersion,
      id,
      filePath: insertSopVersion.filePath || null,
      fileName: insertSopVersion.fileName || null,
      fileSize: insertSopVersion.fileSize || null,
      changeLog: insertSopVersion.changeLog || null,
      createdAt: now,
    };
    
    const existingVersions = this.sopVersions.get(insertSopVersion.sopId) || [];
    existingVersions.push(sopVersion);
    this.sopVersions.set(insertSopVersion.sopId, existingVersions);
    
    return sopVersion;
  }

  // SOP Change Request operations
  async getSopChangeRequests(): Promise<SopChangeRequest[]> {
    return Array.from(this.sopChangeRequests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSopChangeRequestsBySop(sopId: string): Promise<SopChangeRequest[]> {
    return Array.from(this.sopChangeRequests.values())
      .filter(cr => cr.sopId === sopId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getSopChangeRequest(id: string): Promise<SopChangeRequest | undefined> {
    return this.sopChangeRequests.get(id);
  }

  async createSopChangeRequest(insertChangeRequest: InsertSopChangeRequest): Promise<SopChangeRequest> {
    const id = randomUUID();
    const now = new Date();
    const changeRequest: SopChangeRequest = {
      ...insertChangeRequest,
      id,
      status: 'pending',
      requestedAt: now,
      reviewedBy: insertChangeRequest.reviewedBy || null,
      reviewedAt: insertChangeRequest.reviewedAt || null,
      reviewComments: insertChangeRequest.reviewComments || null,
      approvedBy: insertChangeRequest.approvedBy || null,
      approvedAt: insertChangeRequest.approvedAt || null,
      implementedAt: insertChangeRequest.implementedAt || null,
      rejectedBy: insertChangeRequest.rejectedBy || null,
      rejectedAt: insertChangeRequest.rejectedAt || null,
      rejectionReason: insertChangeRequest.rejectionReason || null,
      createdAt: now,
      updatedAt: now,
    };
    this.sopChangeRequests.set(id, changeRequest);
    return changeRequest;
  }

  async updateSopChangeRequest(id: string, updateData: Partial<InsertSopChangeRequest>): Promise<SopChangeRequest | undefined> {
    const existing = this.sopChangeRequests.get(id);
    if (!existing) return undefined;

    const updated: SopChangeRequest = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.sopChangeRequests.set(id, updated);
    return updated;
  }

  async approveSopChangeRequest(id: string, approvalData: { approvedBy: string; reviewComments?: string; }): Promise<SopChangeRequest | undefined> {
    const existing = this.sopChangeRequests.get(id);
    if (!existing) return undefined;

    const now = new Date();
    const updated: SopChangeRequest = {
      ...existing,
      status: 'approved',
      approvedBy: approvalData.approvedBy,
      approvedAt: now,
      reviewComments: approvalData.reviewComments || existing.reviewComments,
      updatedAt: now,
    };
    this.sopChangeRequests.set(id, updated);

    // When approved, create new SOP version and update SOP
    if (existing.newFilePath && existing.proposedVersion) {
      await this.createSopVersion({
        sopId: existing.sopId,
        version: existing.proposedVersion,
        filePath: existing.newFilePath,
        fileName: existing.newFileName || null,
        fileSize: existing.newFileSize || null,
        changeLog: `Change Request #${existing.id}: ${existing.title}`,
        createdBy: approvalData.approvedBy,
      });

      // Update the main SOP record
      await this.updateSop(existing.sopId, {
        version: existing.proposedVersion,
        filePath: existing.newFilePath,
        fileName: existing.newFileName,
        fileSize: existing.newFileSize,
        status: 'approved',
        approvedBy: approvalData.approvedBy,
        approvedDate: now,
        updatedAt: now,
      });

      // Mark as implemented
      updated.implementedAt = now;
      this.sopChangeRequests.set(id, updated);
    }

    return updated;
  }

  async rejectSopChangeRequest(id: string, rejectionData: { rejectedBy: string; rejectionReason: string; }): Promise<SopChangeRequest | undefined> {
    const existing = this.sopChangeRequests.get(id);
    if (!existing) return undefined;

    const now = new Date();
    const updated: SopChangeRequest = {
      ...existing,
      status: 'rejected',
      rejectedBy: rejectionData.rejectedBy,
      rejectedAt: now,
      rejectionReason: rejectionData.rejectionReason,
      updatedAt: now,
    };
    this.sopChangeRequests.set(id, updated);
    return updated;
  }

  // Production Order operations
  async getProductionOrders(): Promise<ProductionOrder[]> {
    return Array.from(this.productionOrders.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getProductionOrder(id: string): Promise<ProductionOrder | undefined> {
    return this.productionOrders.get(id);
  }

  async createProductionOrder(insertOrder: InsertProductionOrder): Promise<ProductionOrder> {
    const id = randomUUID();
    const now = new Date();
    const productionOrder: ProductionOrder = {
      ...insertOrder,
      id,
      status: insertOrder.status || 'Pending',
      priority: insertOrder.priority || 'Medium',
      createdAt: now,
      updatedAt: now,
    };
    this.productionOrders.set(id, productionOrder);
    
    // Automatically create batch release and workflow steps
    await this.createBatchReleaseWithWorkflow(productionOrder);
    
    return productionOrder;
  }

  // Helper method to create batch release with default workflow steps
  private async createBatchReleaseWithWorkflow(productionOrder: ProductionOrder): Promise<void> {
    const year = new Date(productionOrder.createdAt || new Date()).getFullYear();
    const existingReleases = await this.getBatchReleases();
    const batchNumber = `BT-${year}-${String(existingReleases.length + 1).padStart(4, '0')}`;
    
    // Create batch release
    const batchRelease = await this.createBatchRelease({
      productionOrderId: productionOrder.id,
      batchNumber,
      productCode: productionOrder.skuProduct || 'UNKNOWN',
      productName: productionOrder.skuProduct || 'Unknown Product',
      batchSize: productionOrder.quantity || 0,
      manufacturedDate: new Date(),
      expiryDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)), // 2 years from now
      releaseStatus: 'under-testing',
      storageConditions: 'Store in a cool, dry place at 15-25°C',
      shelfLife: 24, // 24 months
      packagingDetails: 'Standard pharmaceutical packaging',
    });

    // Create default workflow steps
    const workflowSteps = [
      {
        stepNumber: 1,
        stepName: 'Verification of Raw Materials (RM) & Packing Materials (PM)',
        stepCategory: 'Materials Verification',
        assignedTo: 'QC Analyst - Materials',
        assignedTeam: 'Quality Control',
        dueDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
        requiredActions: JSON.stringify([
          'Verify lot numbers and expiry dates',
          'Check AR traceability',
          'Confirm no expired materials used',
          'Complete material verification report'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 4,
      },
      {
        stepNumber: 2,
        stepName: 'In-process Quality Checks',
        stepCategory: 'Process Controls',
        assignedTo: 'QC Analyst - Process',
        assignedTeam: 'Quality Control',
        dueDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
        requiredActions: JSON.stringify([
          'Monitor granulation parameters',
          'Check compression data',
          'Verify coating parameters',
          'Complete filling/FG checks'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 6,
      },
      {
        stepNumber: 3,
        stepName: 'Finished Goods Testing',
        stepCategory: 'Final Testing',
        assignedTo: 'Senior QC Analyst',
        assignedTeam: 'Quality Control',
        dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
        requiredActions: JSON.stringify([
          'Perform assay testing',
          'Complete dissolution testing',
          'Verify stability parameters',
          'Check packaging integrity'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 8,
      },
      {
        stepNumber: 4,
        stepName: 'Compliance of BMR/BPR',
        stepCategory: 'Documentation Review',
        assignedTo: 'Documentation Specialist',
        assignedTeam: 'Quality Assurance',
        dueDate: new Date(Date.now() + (8 * 24 * 60 * 60 * 1000)), // 8 days from now
        requiredActions: JSON.stringify([
          'Review BMR completeness',
          'Verify BPR accuracy',
          'Check deviation records',
          'Validate all signatures'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 4,
      },
      {
        stepNumber: 5,
        stepName: 'Deviations / OOS / CAPA Review',
        stepCategory: 'Quality Review',
        assignedTo: 'QA Specialist - CAPA',
        assignedTeam: 'Quality Assurance',
        dueDate: new Date(Date.now() + (9 * 24 * 60 * 60 * 1000)), // 9 days from now
        requiredActions: JSON.stringify([
          'Review all deviations',
          'Check OOS results',
          'Verify CAPA closure',
          'Complete investigation reports'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 6,
      },
      {
        stepNumber: 6,
        stepName: 'Yield & Reconciliation',
        stepCategory: 'Material Balance',
        assignedTo: 'Production Analyst',
        assignedTeam: 'Production',
        dueDate: new Date(Date.now() + (10 * 24 * 60 * 60 * 1000)), // 10 days from now
        requiredActions: JSON.stringify([
          'Calculate yield percentage',
          'Complete material balance',
          'Verify waste reconciliation',
          'Check packaging reconciliation'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 4,
      },
      {
        stepNumber: 7,
        stepName: 'Document Review',
        stepCategory: 'Compliance Check',
        assignedTo: 'Compliance Officer',
        assignedTeam: 'Regulatory Affairs',
        dueDate: new Date(Date.now() + (11 * 24 * 60 * 60 * 1000)), // 11 days from now
        requiredActions: JSON.stringify([
          'Verify SOP adherence',
          'Check logbook completeness',
          'Confirm instrument calibrations',
          'Review regulatory compliance'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 3,
      },
      {
        stepNumber: 8,
        stepName: 'Approval Sign-offs',
        stepCategory: 'Final Approval',
        assignedTo: 'QA Manager',
        assignedTeam: 'Quality Assurance',
        dueDate: new Date(Date.now() + (12 * 24 * 60 * 60 * 1000)), // 12 days from now
        requiredActions: JSON.stringify([
          'Complete QA reviews',
          'Obtain digital signatures',
          'Verify all approvals',
          'Authorize release'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 2,
      },
      {
        stepNumber: 9,
        stepName: 'Certificate of Analysis (CoA) / Batch Release Note',
        stepCategory: 'Certificate Generation',
        assignedTo: 'QA Documentation',
        assignedTeam: 'Quality Assurance',
        dueDate: new Date(Date.now() + (13 * 24 * 60 * 60 * 1000)), // 13 days from now
        requiredActions: JSON.stringify([
          'Generate CoA',
          'Prepare batch release note',
          'Issue distribution authorization',
          'Complete final documentation'
        ]),
        completedActions: JSON.stringify([]),
        estimatedHours: 3,
      },
    ];

    // Create all workflow steps
    for (const stepData of workflowSteps) {
      await this.createBatchWorkflowStep({
        batchReleaseId: batchRelease.id,
        ...stepData,
      });
    }
  }

  async updateProductionOrder(id: string, updateData: Partial<InsertProductionOrder>): Promise<ProductionOrder | undefined> {
    const existing = this.productionOrders.get(id);
    if (!existing) return undefined;

    const updated: ProductionOrder = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.productionOrders.set(id, updated);
    return updated;
  }

  async deleteProductionOrder(id: string): Promise<boolean> {
    return this.productionOrders.delete(id);
  }

  // BOM operations
  async getBoms(): Promise<Bom[]> {
    return Array.from(this.boms.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBom(id: string): Promise<Bom | undefined> {
    return this.boms.get(id);
  }

  async createBom(insertBom: InsertBom): Promise<Bom> {
    const id = randomUUID();
    const now = new Date();
    const bom: Bom = {
      ...insertBom,
      id,
      version: insertBom.version || '1.0',
      status: insertBom.status || 'Active',
      totalCost: insertBom.totalCost || 0,
      approvedBy: insertBom.approvedBy || null,
      shelfLifeDays: insertBom.shelfLifeDays || null,
      createdAt: now,
      updatedAt: now,
    };
    this.boms.set(id, bom);
    return bom;
  }

  async updateBom(id: string, updateData: Partial<InsertBom>): Promise<Bom | undefined> {
    const existing = this.boms.get(id);
    if (!existing) return undefined;

    const updated: Bom = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.boms.set(id, updated);
    return updated;
  }

  async deleteBom(id: string): Promise<boolean> {
    const deleted = this.boms.delete(id);
    if (deleted) {
      // Also delete related materials and sub-assemblies
      this.bomMaterials.delete(id);
      this.bomSubAssemblies.delete(id);
    }
    return deleted;
  }

  async getBomMaterials(bomId: string): Promise<BomMaterial[]> {
    return this.bomMaterials.get(bomId) || [];
  }

  async createBomMaterial(insertBomMaterial: InsertBomMaterial): Promise<BomMaterial> {
    const id = randomUUID();
    const now = new Date();
    const bomMaterial: BomMaterial = {
      ...insertBomMaterial,
      id,
      materialId: insertBomMaterial.materialId || null,
      unitCost: insertBomMaterial.unitCost || 0,
      scrapPercentage: insertBomMaterial.scrapPercentage || 0,
      totalCost: insertBomMaterial.totalCost || 0,
      shelfLifeDays: insertBomMaterial.shelfLifeDays || null,
      createdAt: now,
    };
    
    const existingMaterials = this.bomMaterials.get(insertBomMaterial.bomId) || [];
    existingMaterials.push(bomMaterial);
    this.bomMaterials.set(insertBomMaterial.bomId, existingMaterials);
    
    return bomMaterial;
  }

  async getBomSubAssemblies(bomId: string): Promise<BomSubAssembly[]> {
    return this.bomSubAssemblies.get(bomId) || [];
  }

  async createBomSubAssembly(insertBomSubAssembly: InsertBomSubAssembly): Promise<BomSubAssembly> {
    const id = randomUUID();
    const now = new Date();
    const bomSubAssembly: BomSubAssembly = {
      ...insertBomSubAssembly,
      id,
      totalCost: insertBomSubAssembly.totalCost || 0,
      createdAt: now,
    };
    
    const existingSubAssemblies = this.bomSubAssemblies.get(insertBomSubAssembly.bomId) || [];
    existingSubAssemblies.push(bomSubAssembly);
    this.bomSubAssemblies.set(insertBomSubAssembly.bomId, existingSubAssemblies);
    
    return bomSubAssembly;
  }

  async getBomStats(): Promise<{
    totalBoms: number;
    rawMaterials: number;
    liveStockItems: number;
    totalBomValue: number;
  }> {
    const allBoms = Array.from(this.boms.values());
    const totalBoms = allBoms.length;
    
    // Calculate unique raw materials used across all BOMs
    const uniqueMaterials = new Set();
    this.bomMaterials.forEach(materials => {
      materials.forEach(material => uniqueMaterials.add(material.materialCode));
    });
    const rawMaterials = uniqueMaterials.size;
    
    // Count materials with stock status as available
    const liveStockItems = Array.from(this.materials.values())
      .filter(m => m.stock && m.stock > 0).length;
    
    // Calculate total BOM value in rupees
    const totalBomValue = allBoms.reduce((sum, bom) => sum + (bom.totalCost / 100), 0);
    
    return {
      totalBoms,
      rawMaterials,
      liveStockItems,
      totalBomValue,
    };
  }

  // BOM Change Request operations
  async getBomChangeRequests(): Promise<BomChangeRequest[]> {
    return Array.from(this.bomChangeRequests.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBomChangeRequestsByBom(bomId: string): Promise<BomChangeRequest[]> {
    return Array.from(this.bomChangeRequests.values())
      .filter(cr => cr.bomId === bomId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getBomChangeRequest(id: string): Promise<BomChangeRequest | undefined> {
    return this.bomChangeRequests.get(id);
  }

  async createBomChangeRequest(insertChangeRequest: InsertBomChangeRequest): Promise<BomChangeRequest> {
    const id = randomUUID();
    const now = new Date();
    const changeRequest: BomChangeRequest = {
      ...insertChangeRequest,
      id,
      status: 'pending',
      requestedAt: now,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      rejectedAt: null,
      reviewComments: null,
      implementedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.bomChangeRequests.set(id, changeRequest);
    return changeRequest;
  }

  async updateBomChangeRequest(id: string, updateData: Partial<InsertBomChangeRequest>): Promise<BomChangeRequest | undefined> {
    const existing = this.bomChangeRequests.get(id);
    if (!existing) return undefined;

    const updated: BomChangeRequest = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.bomChangeRequests.set(id, updated);
    return updated;
  }

  async approveBomChangeRequest(id: string, approvalData: { approvedBy: string; reviewComments?: string; }): Promise<BomChangeRequest | undefined> {
    const existing = this.bomChangeRequests.get(id);
    if (!existing || existing.status !== 'pending') return undefined;

    const now = new Date();
    
    // Create new version of the BOM when change request is approved
    const bom = await this.getBom(existing.bomId);
    if (bom && existing.proposedVersion) {
      const updatedBom = await this.updateBom(existing.bomId, {
        version: existing.proposedVersion,
        updatedAt: now,
      });
    }

    const approved: BomChangeRequest = {
      ...existing,
      status: 'approved',
      approvedBy: approvalData.approvedBy,
      approvedAt: now,
      reviewComments: approvalData.reviewComments || null,
      implementedAt: now,
      updatedAt: now,
    };
    this.bomChangeRequests.set(id, approved);
    return approved;
  }

  async rejectBomChangeRequest(id: string, rejectionData: { rejectedBy: string; rejectionReason: string; }): Promise<BomChangeRequest | undefined> {
    const existing = this.bomChangeRequests.get(id);
    if (!existing || existing.status !== 'pending') return undefined;

    const now = new Date();
    const rejected: BomChangeRequest = {
      ...existing,
      status: 'rejected',
      rejectedBy: rejectionData.rejectedBy,
      rejectionReason: rejectionData.rejectionReason,
      rejectedAt: now,
      updatedAt: now,
    };
    this.bomChangeRequests.set(id, rejected);
    return rejected;
  }

  // CAPA operations
  async getCapas(): Promise<Capa[]> {
    return Array.from(this.capas.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCapa(id: string): Promise<Capa | undefined> {
    return this.capas.get(id);
  }

  async createCapa(insertCapa: InsertCapa): Promise<Capa> {
    const id = randomUUID();
    const now = new Date();
    const capa: Capa = {
      ...insertCapa,
      id,
      status: insertCapa.status || 'Open',
      priority: insertCapa.priority || 'Medium',
      description: insertCapa.description || null,
      assignedTo: insertCapa.assignedTo || null,
      dueDate: insertCapa.dueDate || null,
      relatedSopId: insertCapa.relatedSopId || null,
      rootCauseAnalysis: insertCapa.rootCauseAnalysis || null,
      correctiveActions: insertCapa.correctiveActions || null,
      preventiveActions: insertCapa.preventiveActions || null,
      implementation: insertCapa.implementation || null,
      verification: insertCapa.verification || null,
      completionDate: insertCapa.completionDate || null,
      createdAt: now,
      updatedAt: now,
    };
    this.capas.set(id, capa);
    return capa;
  }

  async updateCapa(id: string, updateData: Partial<InsertCapa>): Promise<Capa | undefined> {
    const existing = this.capas.get(id);
    if (!existing) return undefined;

    const updated: Capa = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.capas.set(id, updated);
    return updated;
  }

  async deleteCapa(id: string): Promise<boolean> {
    const deleted = this.capas.delete(id);
    if (deleted) {
      // Also delete related actions
      this.capaActions.delete(id);
    }
    return deleted;
  }

  async getCapaActions(capaId: string): Promise<CapaAction[]> {
    const actions = this.capaActions.get(capaId) || [];
    return actions.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createCapaAction(insertCapaAction: InsertCapaAction): Promise<CapaAction> {
    const id = randomUUID();
    const now = new Date();
    const capaAction: CapaAction = {
      ...insertCapaAction,
      id,
      status: insertCapaAction.status || 'Open',
      assignedTo: insertCapaAction.assignedTo || null,
      dueDate: insertCapaAction.dueDate || null,
      completionDate: insertCapaAction.completionDate || null,
      evidence: insertCapaAction.evidence || null,
      createdAt: now,
      updatedAt: now,
    };

    const existingActions = this.capaActions.get(insertCapaAction.capaId) || [];
    existingActions.push(capaAction);
    this.capaActions.set(insertCapaAction.capaId, existingActions);
    
    return capaAction;
  }

  // Inventory operations
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const now = new Date();
    const inventoryItem: InventoryItem = {
      ...insertItem,
      id,
      status: insertItem.status || 'Active',
      currentStock: insertItem.currentStock || 0,
      minimumLevel: insertItem.minimumLevel || 0,
      maximumLevel: insertItem.maximumLevel || 1000,
      moq: insertItem.moq || 1,
      uom: insertItem.uom || 'KG',
      rate: insertItem.rate || 0,
      supplierName: insertItem.supplierName || null,
      warehouseLocation: insertItem.warehouseLocation || null,
      batchNumber: insertItem.batchNumber || null,
      leadTimeDays: insertItem.leadTimeDays || 0,
      specification: insertItem.specification || null,
      imageUrl: insertItem.imageUrl || null,
      expiryDate: insertItem.expiryDate || null,
      qualityStatus: insertItem.qualityStatus || "Passed",
      createdAt: now,
      updatedAt: now,
    };
    this.inventoryItems.set(id, inventoryItem);
    return inventoryItem;
  }

  async updateInventoryItem(id: string, updateData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existing = this.inventoryItems.get(id);
    if (!existing) return undefined;

    const updated: InventoryItem = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const deleted = this.inventoryItems.delete(id);
    if (deleted) {
      // Also delete related stock movements
      this.stockMovements.delete(id);
    }
    return deleted;
  }

  async getInventoryStats(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  }> {
    const allItems = Array.from(this.inventoryItems.values());
    const totalItems = allItems.length;
    
    // Calculate total inventory value
    const totalValue = allItems.reduce((sum, item) => {
      return sum + ((item.rate * item.currentStock) / 100); // Convert paise to rupees
    }, 0);

    // Count items that are low stock (current stock <= minimum level)
    const lowStockItems = allItems.filter(item => 
      item.currentStock <= item.minimumLevel && item.currentStock > 0
    ).length;

    // Count items that are out of stock (current stock = 0)
    const outOfStockItems = allItems.filter(item => item.currentStock === 0).length;

    return {
      totalItems,
      totalValue: Math.round(totalValue), // Round to nearest rupee
      lowStockItems,
      outOfStockItems
    };
  }

  // Stock Movement operations
  async getStockMovements(): Promise<StockMovement[]> {
    const allMovements: StockMovement[] = [];
    for (const movements of Array.from(this.stockMovements.values())) {
      allMovements.push(...movements);
    }
    return allMovements.sort((a, b) => 
      new Date(b.movementDate!).getTime() - new Date(a.movementDate!).getTime()
    );
  }

  async getStockMovementsByItem(itemId: string): Promise<StockMovement[]> {
    const movements = this.stockMovements.get(itemId) || [];
    return movements.sort((a, b) => 
      new Date(b.movementDate!).getTime() - new Date(a.movementDate!).getTime()
    );
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const id = randomUUID();
    const now = new Date();
    const stockMovement: StockMovement = {
      ...insertMovement,
      id,
      fromLocation: insertMovement.fromLocation || null,
      toLocation: insertMovement.toLocation || null,
      referenceNumber: insertMovement.referenceNumber || null,
      qualityIssue: insertMovement.qualityIssue || null,
      notes: insertMovement.notes || null,
      movementDate: insertMovement.movementDate || now,
      createdAt: now,
    };

    const existingMovements = this.stockMovements.get(insertMovement.inventoryItemId) || [];
    existingMovements.push(stockMovement);
    this.stockMovements.set(insertMovement.inventoryItemId, existingMovements);

    // Update inventory item stock based on movement type
    const item = this.inventoryItems.get(insertMovement.inventoryItemId);
    if (item) {
      let newStock = item.currentStock;
      if (insertMovement.type === 'IN' || insertMovement.type === 'ADJUSTMENT') {
        newStock += Math.abs(insertMovement.quantity);
      } else if (insertMovement.type === 'OUT') {
        newStock -= Math.abs(insertMovement.quantity);
        if (newStock < 0) newStock = 0; // Prevent negative stock
      }
      
      const updatedItem: InventoryItem = {
        ...item,
        currentStock: newStock,
        updatedAt: now,
      };
      this.inventoryItems.set(insertMovement.inventoryItemId, updatedItem);
    }
    
    return stockMovement;
  }

  // QA/QC Stage operations
  async getQcStages(): Promise<QcStage[]> {
    return Array.from(this.qcStages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQcStagesByOrder(productionOrderId: string): Promise<QcStage[]> {
    return this.qcStagesByOrder.get(productionOrderId) || [];
  }

  async getQcStage(id: string): Promise<QcStage | undefined> {
    return this.qcStages.get(id);
  }

  async createQcStage(insertQcStage: InsertQcStage): Promise<QcStage> {
    const id = randomUUID();
    const now = new Date();
    const qcStage: QcStage = {
      ...insertQcStage,
      id,
      status: insertQcStage.status || 'Not Started',
      assignedTo: insertQcStage.assignedTo || null,
      startedAt: insertQcStage.startedAt || null,
      completedAt: insertQcStage.completedAt || null,
      notes: insertQcStage.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.qcStages.set(id, qcStage);
    
    // Group by production order
    const existingStages = this.qcStagesByOrder.get(insertQcStage.productionOrderId) || [];
    existingStages.push(qcStage);
    this.qcStagesByOrder.set(insertQcStage.productionOrderId, existingStages);
    
    return qcStage;
  }

  async updateQcStage(id: string, updateData: Partial<InsertQcStage>): Promise<QcStage | undefined> {
    const existing = this.qcStages.get(id);
    if (!existing) return undefined;

    const updated: QcStage = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.qcStages.set(id, updated);

    // Update in grouped map too
    const stagesByOrder = this.qcStagesByOrder.get(existing.productionOrderId) || [];
    const index = stagesByOrder.findIndex(s => s.id === id);
    if (index >= 0) {
      stagesByOrder[index] = updated;
    }
    
    return updated;
  }

  async deleteQcStage(id: string): Promise<boolean> {
    const existing = this.qcStages.get(id);
    if (!existing) return false;

    const deleted = this.qcStages.delete(id);
    if (deleted) {
      // Remove from grouped map
      const stagesByOrder = this.qcStagesByOrder.get(existing.productionOrderId) || [];
      const filtered = stagesByOrder.filter(s => s.id !== id);
      this.qcStagesByOrder.set(existing.productionOrderId, filtered);
      
      // Also delete related checkpoints
      this.qcCheckpointsByStage.delete(id);
      this.qcApprovalsByStage.delete(id);
    }
    return deleted;
  }

  // QC Checkpoint operations
  async getQcCheckpoints(): Promise<QcCheckpoint[]> {
    const allCheckpoints: QcCheckpoint[] = [];
    for (const checkpoints of Array.from(this.qcCheckpointsByStage.values())) {
      allCheckpoints.push(...checkpoints);
    }
    return allCheckpoints.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQcCheckpointsByStage(stageId: string): Promise<QcCheckpoint[]> {
    return this.qcCheckpointsByStage.get(stageId) || [];
  }

  async getQcCheckpoint(id: string): Promise<QcCheckpoint | undefined> {
    return this.qcCheckpoints.get(id);
  }

  async createQcCheckpoint(insertQcCheckpoint: InsertQcCheckpoint): Promise<QcCheckpoint> {
    const id = randomUUID();
    const now = new Date();
    const qcCheckpoint: QcCheckpoint = {
      ...insertQcCheckpoint,
      id,
      status: insertQcCheckpoint.status || 'Pending',
      assignedTo: insertQcCheckpoint.assignedTo || null,
      testResults: insertQcCheckpoint.testResults || null,
      notes: insertQcCheckpoint.notes || null,
      completedAt: insertQcCheckpoint.completedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.qcCheckpoints.set(id, qcCheckpoint);
    
    // Group by stage
    const existingCheckpoints = this.qcCheckpointsByStage.get(insertQcCheckpoint.stageId) || [];
    existingCheckpoints.push(qcCheckpoint);
    this.qcCheckpointsByStage.set(insertQcCheckpoint.stageId, existingCheckpoints);
    
    return qcCheckpoint;
  }

  async updateQcCheckpoint(id: string, updateData: Partial<InsertQcCheckpoint>): Promise<QcCheckpoint | undefined> {
    const existing = this.qcCheckpoints.get(id);
    if (!existing) return undefined;

    const updated: QcCheckpoint = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.qcCheckpoints.set(id, updated);

    // Update in grouped map too
    const checkpointsByStage = this.qcCheckpointsByStage.get(existing.stageId) || [];
    const index = checkpointsByStage.findIndex(c => c.id === id);
    if (index >= 0) {
      checkpointsByStage[index] = updated;
    }
    
    return updated;
  }

  async deleteQcCheckpoint(id: string): Promise<boolean> {
    const existing = this.qcCheckpoints.get(id);
    if (!existing) return false;

    const deleted = this.qcCheckpoints.delete(id);
    if (deleted) {
      // Remove from grouped map
      const checkpointsByStage = this.qcCheckpointsByStage.get(existing.stageId) || [];
      const filtered = checkpointsByStage.filter(c => c.id !== id);
      this.qcCheckpointsByStage.set(existing.stageId, filtered);
      
      // Also delete related test results
      this.qcTestResultsByCheckpoint.delete(id);
    }
    return deleted;
  }

  // QC Test Result operations
  async getQcTestResults(): Promise<QcTestResult[]> {
    const allResults: QcTestResult[] = [];
    for (const results of Array.from(this.qcTestResultsByCheckpoint.values())) {
      allResults.push(...results);
    }
    return allResults.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQcTestResultsByCheckpoint(checkpointId: string): Promise<QcTestResult[]> {
    return this.qcTestResultsByCheckpoint.get(checkpointId) || [];
  }

  async getQcTestResult(id: string): Promise<QcTestResult | undefined> {
    return this.qcTestResults.get(id);
  }

  async createQcTestResult(insertQcTestResult: InsertQcTestResult): Promise<QcTestResult> {
    const id = randomUUID();
    const now = new Date();
    const qcTestResult: QcTestResult = {
      ...insertQcTestResult,
      id,
      status: insertQcTestResult.status || 'Pass',
      notes: insertQcTestResult.notes || null,
      attachments: insertQcTestResult.attachments || null,
      createdAt: now,
      updatedAt: now,
    };
    this.qcTestResults.set(id, qcTestResult);
    
    // Group by checkpoint
    const existingResults = this.qcTestResultsByCheckpoint.get(insertQcTestResult.checkpointId) || [];
    existingResults.push(qcTestResult);
    this.qcTestResultsByCheckpoint.set(insertQcTestResult.checkpointId, existingResults);
    
    return qcTestResult;
  }

  async updateQcTestResult(id: string, updateData: Partial<InsertQcTestResult>): Promise<QcTestResult | undefined> {
    const existing = this.qcTestResults.get(id);
    if (!existing) return undefined;

    const updated: QcTestResult = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.qcTestResults.set(id, updated);

    // Update in grouped map too
    const resultsByCheckpoint = this.qcTestResultsByCheckpoint.get(existing.checkpointId) || [];
    const index = resultsByCheckpoint.findIndex(r => r.id === id);
    if (index >= 0) {
      resultsByCheckpoint[index] = updated;
    }
    
    return updated;
  }

  async deleteQcTestResult(id: string): Promise<boolean> {
    const existing = this.qcTestResults.get(id);
    if (!existing) return false;

    const deleted = this.qcTestResults.delete(id);
    if (deleted) {
      // Remove from grouped map
      const resultsByCheckpoint = this.qcTestResultsByCheckpoint.get(existing.checkpointId) || [];
      const filtered = resultsByCheckpoint.filter(r => r.id !== id);
      this.qcTestResultsByCheckpoint.set(existing.checkpointId, filtered);
    }
    return deleted;
  }

  // QC Approval operations
  async getQcApprovals(): Promise<QcApproval[]> {
    const allApprovals: QcApproval[] = [];
    for (const approvals of Array.from(this.qcApprovalsByStage.values())) {
      allApprovals.push(...approvals);
    }
    return allApprovals.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQcApprovalsByStage(stageId: string): Promise<QcApproval[]> {
    return this.qcApprovalsByStage.get(stageId) || [];
  }

  async getQcApproval(id: string): Promise<QcApproval | undefined> {
    return this.qcApprovals.get(id);
  }

  async createQcApproval(insertQcApproval: InsertQcApproval): Promise<QcApproval> {
    const id = randomUUID();
    const now = new Date();
    const qcApproval: QcApproval = {
      ...insertQcApproval,
      id,
      comments: insertQcApproval.comments || null,
      digitalSignature: insertQcApproval.digitalSignature || null,
      signatureTimestamp: insertQcApproval.signatureTimestamp || null,
      createdAt: now,
      updatedAt: now,
    };
    this.qcApprovals.set(id, qcApproval);
    
    // Group by stage
    const existingApprovals = this.qcApprovalsByStage.get(insertQcApproval.stageId) || [];
    existingApprovals.push(qcApproval);
    this.qcApprovalsByStage.set(insertQcApproval.stageId, existingApprovals);
    
    return qcApproval;
  }

  async updateQcApproval(id: string, updateData: Partial<InsertQcApproval>): Promise<QcApproval | undefined> {
    const existing = this.qcApprovals.get(id);
    if (!existing) return undefined;

    const updated: QcApproval = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.qcApprovals.set(id, updated);

    // Update in grouped map too
    const approvalsByStage = this.qcApprovalsByStage.get(existing.stageId) || [];
    const index = approvalsByStage.findIndex(a => a.id === id);
    if (index >= 0) {
      approvalsByStage[index] = updated;
    }
    
    return updated;
  }

  async deleteQcApproval(id: string): Promise<boolean> {
    const existing = this.qcApprovals.get(id);
    if (!existing) return false;

    const deleted = this.qcApprovals.delete(id);
    if (deleted) {
      // Remove from grouped map
      const approvalsByStage = this.qcApprovalsByStage.get(existing.stageId) || [];
      const filtered = approvalsByStage.filter(a => a.id !== id);
      this.qcApprovalsByStage.set(existing.stageId, filtered);
    }
    return deleted;
  }

  // Batch Release operations
  async getBatchReleases(): Promise<BatchRelease[]> {
    return Array.from(this.batchReleases.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBatchReleasesByOrder(productionOrderId: string): Promise<BatchRelease[]> {
    return this.batchReleasesByOrder.get(productionOrderId) || [];
  }

  async getBatchRelease(id: string): Promise<BatchRelease | undefined> {
    return this.batchReleases.get(id);
  }

  async createBatchRelease(insertBatchRelease: InsertBatchRelease): Promise<BatchRelease> {
    const id = randomUUID();
    const now = new Date();
    const batchRelease: BatchRelease = {
      ...insertBatchRelease,
      id,
      status: insertBatchRelease.status || 'Pending',
      qaDecision: insertBatchRelease.qaDecision || null,
      qaComments: insertBatchRelease.qaComments || null,
      releaseDate: insertBatchRelease.releaseDate || null,
      digitalSignature: insertBatchRelease.digitalSignature || null,
      signatureTimestamp: insertBatchRelease.signatureTimestamp || null,
      createdAt: now,
      updatedAt: now,
    };
    this.batchReleases.set(id, batchRelease);
    
    // Group by production order
    const existingReleases = this.batchReleasesByOrder.get(insertBatchRelease.productionOrderId) || [];
    existingReleases.push(batchRelease);
    this.batchReleasesByOrder.set(insertBatchRelease.productionOrderId, existingReleases);
    
    return batchRelease;
  }

  async updateBatchRelease(id: string, updateData: Partial<InsertBatchRelease>): Promise<BatchRelease | undefined> {
    const existing = this.batchReleases.get(id);
    if (!existing) return undefined;

    const updated: BatchRelease = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.batchReleases.set(id, updated);

    // Update in grouped map too
    const releasesByOrder = this.batchReleasesByOrder.get(existing.productionOrderId) || [];
    const index = releasesByOrder.findIndex(r => r.id === id);
    if (index >= 0) {
      releasesByOrder[index] = updated;
    }
    
    return updated;
  }

  async deleteBatchRelease(id: string): Promise<boolean> {
    const existing = this.batchReleases.get(id);
    if (!existing) return false;

    const deleted = this.batchReleases.delete(id);
    if (deleted) {
      // Remove from grouped map
      const releasesByOrder = this.batchReleasesByOrder.get(existing.productionOrderId) || [];
      const filtered = releasesByOrder.filter(r => r.id !== id);
      this.batchReleasesByOrder.set(existing.productionOrderId, filtered);
      
      // Also delete related certificate
      this.batchCertificatesByBatchRelease.delete(id);
    }
    return deleted;
  }

  // Batch Workflow Step operations
  async getBatchWorkflowSteps(): Promise<BatchWorkflowStep[]> {
    return Array.from(this.batchWorkflowSteps.values()).sort((a, b) => 
      a.stepNumber - b.stepNumber
    );
  }

  async getBatchWorkflowStepsByBatch(batchReleaseId: string): Promise<BatchWorkflowStep[]> {
    return this.batchWorkflowStepsByBatch.get(batchReleaseId) || [];
  }

  async getBatchWorkflowStep(id: string): Promise<BatchWorkflowStep | undefined> {
    return this.batchWorkflowSteps.get(id);
  }

  async createBatchWorkflowStep(insertBatchWorkflowStep: InsertBatchWorkflowStep): Promise<BatchWorkflowStep> {
    const id = randomUUID();
    const now = new Date();
    const batchWorkflowStep: BatchWorkflowStep = {
      ...insertBatchWorkflowStep,
      id,
      status: insertBatchWorkflowStep.status || 'pending',
      approvalRequired: insertBatchWorkflowStep.approvalRequired ?? true,
      startedAt: insertBatchWorkflowStep.startedAt || null,
      completedAt: insertBatchWorkflowStep.completedAt || null,
      dueDate: insertBatchWorkflowStep.dueDate || null,
      approvedBy: insertBatchWorkflowStep.approvedBy || null,
      approvedAt: insertBatchWorkflowStep.approvedAt || null,
      rejectedBy: insertBatchWorkflowStep.rejectedBy || null,
      rejectedAt: insertBatchWorkflowStep.rejectedAt || null,
      rejectionReason: insertBatchWorkflowStep.rejectionReason || null,
      findings: insertBatchWorkflowStep.findings || null,
      evidence: insertBatchWorkflowStep.evidence || null,
      deviations: insertBatchWorkflowStep.deviations || null,
      correctiveActions: insertBatchWorkflowStep.correctiveActions || null,
      requiredActions: insertBatchWorkflowStep.requiredActions || null,
      completedActions: insertBatchWorkflowStep.completedActions || null,
      comments: insertBatchWorkflowStep.comments || null,
      estimatedHours: insertBatchWorkflowStep.estimatedHours || null,
      actualHours: insertBatchWorkflowStep.actualHours || null,
      createdAt: now,
      updatedAt: now,
    };
    this.batchWorkflowSteps.set(id, batchWorkflowStep);
    
    // Group by batch release
    const existingSteps = this.batchWorkflowStepsByBatch.get(insertBatchWorkflowStep.batchReleaseId) || [];
    existingSteps.push(batchWorkflowStep);
    existingSteps.sort((a, b) => a.stepNumber - b.stepNumber);
    this.batchWorkflowStepsByBatch.set(insertBatchWorkflowStep.batchReleaseId, existingSteps);
    
    return batchWorkflowStep;
  }

  async updateBatchWorkflowStep(id: string, updateData: Partial<InsertBatchWorkflowStep>): Promise<BatchWorkflowStep | undefined> {
    const existing = this.batchWorkflowSteps.get(id);
    if (!existing) return undefined;

    const updated: BatchWorkflowStep = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.batchWorkflowSteps.set(id, updated);

    // Update in grouped map too
    const stepsByBatch = this.batchWorkflowStepsByBatch.get(existing.batchReleaseId) || [];
    const index = stepsByBatch.findIndex(s => s.id === id);
    if (index >= 0) {
      stepsByBatch[index] = updated;
      stepsByBatch.sort((a, b) => a.stepNumber - b.stepNumber);
    }
    
    return updated;
  }

  async deleteBatchWorkflowStep(id: string): Promise<boolean> {
    const existing = this.batchWorkflowSteps.get(id);
    if (!existing) return false;

    const deleted = this.batchWorkflowSteps.delete(id);
    if (deleted) {
      // Remove from grouped map
      const stepsByBatch = this.batchWorkflowStepsByBatch.get(existing.batchReleaseId) || [];
      const filtered = stepsByBatch.filter(s => s.id !== id);
      this.batchWorkflowStepsByBatch.set(existing.batchReleaseId, filtered);
    }
    return deleted;
  }

  // Batch Certificate operations
  async getBatchCertificates(): Promise<BatchCertificate[]> {
    return Array.from(this.batchCertificates.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBatchCertificateByBatchRelease(batchReleaseId: string): Promise<BatchCertificate | undefined> {
    return this.batchCertificatesByBatchRelease.get(batchReleaseId);
  }

  async getBatchCertificate(id: string): Promise<BatchCertificate | undefined> {
    return this.batchCertificates.get(id);
  }

  async createBatchCertificate(insertBatchCertificate: InsertBatchCertificate): Promise<BatchCertificate> {
    const id = randomUUID();
    const now = new Date();
    const batchCertificate: BatchCertificate = {
      ...insertBatchCertificate,
      id,
      issueDate: insertBatchCertificate.issueDate || now,
      digitalSignature: insertBatchCertificate.digitalSignature || null,
      signatureTimestamp: insertBatchCertificate.signatureTimestamp || null,
      qrCodeData: insertBatchCertificate.qrCodeData || null,
      createdAt: now,
      updatedAt: now,
    };
    this.batchCertificates.set(id, batchCertificate);
    this.batchCertificatesByBatchRelease.set(insertBatchCertificate.batchReleaseId, batchCertificate);
    
    return batchCertificate;
  }

  async updateBatchCertificate(id: string, updateData: Partial<InsertBatchCertificate>): Promise<BatchCertificate | undefined> {
    const existing = this.batchCertificates.get(id);
    if (!existing) return undefined;

    const updated: BatchCertificate = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.batchCertificates.set(id, updated);
    this.batchCertificatesByBatchRelease.set(existing.batchReleaseId, updated);
    
    return updated;
  }

  async deleteBatchCertificate(id: string): Promise<boolean> {
    const existing = this.batchCertificates.get(id);
    if (!existing) return false;

    const deleted = this.batchCertificates.delete(id);
    if (deleted) {
      this.batchCertificatesByBatchRelease.delete(existing.batchReleaseId);
    }
    return deleted;
  }

  // QA Audit Trail operations
  async getQaAuditTrails(): Promise<QaAuditTrail[]> {
    return Array.from(this.qaAuditTrails.values()).sort((a, b) => 
      new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
  }

  async getQaAuditTrailsByEntity(entityType: string, entityId: string): Promise<QaAuditTrail[]> {
    const entityKey = `${entityType}:${entityId}`;
    return this.qaAuditTrailsByEntity.get(entityKey) || [];
  }

  async getQaAuditTrail(id: string): Promise<QaAuditTrail | undefined> {
    return this.qaAuditTrails.get(id);
  }

  async createQaAuditTrail(insertQaAuditTrail: InsertQaAuditTrail): Promise<QaAuditTrail> {
    const id = randomUUID();
    const now = new Date();
    const qaAuditTrail: QaAuditTrail = {
      ...insertQaAuditTrail,
      id,
      timestamp: insertQaAuditTrail.timestamp || now,
      ipAddress: insertQaAuditTrail.ipAddress || null,
      userAgent: insertQaAuditTrail.userAgent || null,
      createdAt: now,
    };
    this.qaAuditTrails.set(id, qaAuditTrail);
    
    // Group by entity
    const entityKey = `${insertQaAuditTrail.entityType}:${insertQaAuditTrail.entityId}`;
    const existingTrails = this.qaAuditTrailsByEntity.get(entityKey) || [];
    existingTrails.push(qaAuditTrail);
    this.qaAuditTrailsByEntity.set(entityKey, existingTrails);
    
    return qaAuditTrail;
  }

  // QC Stage Template operations
  async getQcStageTemplates(): Promise<QcStageTemplate[]> {
    return Array.from(this.qcStageTemplates.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQcStageTemplate(id: string): Promise<QcStageTemplate | undefined> {
    return this.qcStageTemplates.get(id);
  }

  async createQcStageTemplate(insertQcStageTemplate: InsertQcStageTemplate): Promise<QcStageTemplate> {
    const id = randomUUID();
    const now = new Date();
    const qcStageTemplate: QcStageTemplate = {
      ...insertQcStageTemplate,
      id,
      description: insertQcStageTemplate.description || null,
      estimatedDurationHours: insertQcStageTemplate.estimatedDurationHours || null,
      requiredApprovals: insertQcStageTemplate.requiredApprovals || 1,
      isActive: insertQcStageTemplate.isActive !== false, // default to true
      createdAt: now,
      updatedAt: now,
    };
    this.qcStageTemplates.set(id, qcStageTemplate);
    
    return qcStageTemplate;
  }

  async updateQcStageTemplate(id: string, updateData: Partial<InsertQcStageTemplate>): Promise<QcStageTemplate | undefined> {
    const existing = this.qcStageTemplates.get(id);
    if (!existing) return undefined;

    const updated: QcStageTemplate = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.qcStageTemplates.set(id, updated);
    
    return updated;
  }

  async deleteQcStageTemplate(id: string): Promise<boolean> {
    return this.qcStageTemplates.delete(id);
  }

  // Production Management implementations
  async getProductionBatches(): Promise<ProductionBatch[]> {
    return Array.from(this.productionBatches.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getProductionBatch(id: string): Promise<ProductionBatch | undefined> {
    return this.productionBatches.get(id);
  }

  async createProductionBatch(insertBatch: InsertProductionBatch): Promise<ProductionBatch> {
    const id = randomUUID();
    const now = new Date();
    const batch: ProductionBatch = {
      ...insertBatch,
      id,
      productionOrderId: insertBatch.productionOrderId || null,
      bomId: insertBatch.bomId || null,
      actualQuantity: insertBatch.actualQuantity || null,
      currentStage: insertBatch.currentStage || null,
      plannedStartDate: insertBatch.plannedStartDate || null,
      plannedEndDate: insertBatch.plannedEndDate || null,
      actualStartDate: insertBatch.actualStartDate || null,
      actualEndDate: insertBatch.actualEndDate || null,
      assignedTo: insertBatch.assignedTo || null,
      supervisorId: insertBatch.supervisorId || null,
      yieldPercentage: insertBatch.yieldPercentage || null,
      scrapQuantity: insertBatch.scrapQuantity || null,
      reworkQuantity: insertBatch.reworkQuantity || null,
      isDelayed: insertBatch.isDelayed || false,
      delayReason: insertBatch.delayReason || null,
      notes: insertBatch.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.productionBatches.set(id, batch);
    return batch;
  }

  async updateProductionBatch(id: string, data: Partial<InsertProductionBatch>): Promise<ProductionBatch | undefined> {
    const existing = this.productionBatches.get(id);
    if (!existing) return undefined;
    const updated: ProductionBatch = { ...existing, ...data, updatedAt: new Date() };
    this.productionBatches.set(id, updated);
    return updated;
  }

  async deleteProductionBatch(id: string): Promise<boolean> {
    return this.productionBatches.delete(id);
  }

  // Batch Stage implementations
  async getBatchStages(batchId: string): Promise<BatchStage[]> {
    return (this.batchStagesByBatch.get(batchId) || []).sort((a, b) => a.stageOrder - b.stageOrder);
  }

  async createBatchStage(insertStage: InsertBatchStage): Promise<BatchStage> {
    const id = randomUUID();
    const now = new Date();
    const stage: BatchStage = {
      ...insertStage,
      id,
      operatorName: insertStage.operatorName || null,
      equipmentUsed: insertStage.equipmentUsed || null,
      startTime: insertStage.startTime || null,
      endTime: insertStage.endTime || null,
      estimatedDuration: insertStage.estimatedDuration || null,
      actualDuration: insertStage.actualDuration || null,
      qcCheckpointRequired: insertStage.qcCheckpointRequired ?? true,
      qcCheckpointCompleted: insertStage.qcCheckpointCompleted ?? false,
      qcCheckpointResult: insertStage.qcCheckpointResult || null,
      inputQuantity: insertStage.inputQuantity || null,
      outputQuantity: insertStage.outputQuantity || null,
      scrapQuantity: insertStage.scrapQuantity || null,
      notes: insertStage.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.batchStagesMap.set(id, stage);
    const stages = this.batchStagesByBatch.get(insertStage.batchId) || [];
    stages.push(stage);
    this.batchStagesByBatch.set(insertStage.batchId, stages);
    return stage;
  }

  async updateBatchStage(id: string, data: Partial<InsertBatchStage>): Promise<BatchStage | undefined> {
    const existing = this.batchStagesMap.get(id);
    if (!existing) return undefined;
    const updated: BatchStage = { ...existing, ...data, updatedAt: new Date() };
    this.batchStagesMap.set(id, updated);
    const stages = this.batchStagesByBatch.get(existing.batchId) || [];
    const idx = stages.findIndex(s => s.id === id);
    if (idx >= 0) stages[idx] = updated;
    this.batchStagesByBatch.set(existing.batchId, stages);
    return updated;
  }

  // Batch Execution implementations
  async getBatchExecutions(batchId: string): Promise<BatchExecution[]> {
    return (this.batchExecutionsByBatch.get(batchId) || []).sort((a, b) => 
      new Date(b.recordedAt!).getTime() - new Date(a.recordedAt!).getTime()
    );
  }

  async createBatchExecution(insertExec: InsertBatchExecution): Promise<BatchExecution> {
    const id = randomUUID();
    const now = new Date();
    const exec: BatchExecution = {
      ...insertExec,
      id,
      stageId: insertExec.stageId || null,
      materialId: insertExec.materialId || null,
      materialName: insertExec.materialName || null,
      quantityUsed: insertExec.quantityUsed || null,
      quantityExpected: insertExec.quantityExpected || null,
      uom: insertExec.uom || null,
      yieldRecorded: insertExec.yieldRecorded || null,
      scrapRecorded: insertExec.scrapRecorded || null,
      reworkRecorded: insertExec.reworkRecorded || null,
      deviationDescription: insertExec.deviationDescription || null,
      deviationSeverity: insertExec.deviationSeverity || null,
      comment: insertExec.comment || null,
      recordedAt: insertExec.recordedAt || now,
      createdAt: now,
    };
    this.batchExecutionsMap.set(id, exec);
    const execs = this.batchExecutionsByBatch.get(insertExec.batchId) || [];
    execs.push(exec);
    this.batchExecutionsByBatch.set(insertExec.batchId, execs);
    return exec;
  }

  // Job Work implementations
  async getJobWorks(): Promise<JobWork[]> {
    return Array.from(this.jobWorksMap.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getJobWork(id: string): Promise<JobWork | undefined> {
    return this.jobWorksMap.get(id);
  }

  async createJobWork(insertJobWork: InsertJobWork): Promise<JobWork> {
    const id = randomUUID();
    const now = new Date();
    const jobWork: JobWork = {
      ...insertJobWork,
      id,
      batchId: insertJobWork.batchId || null,
      vendorCode: insertJobWork.vendorCode || null,
      vendorContact: insertJobWork.vendorContact || null,
      materialIssuedDate: insertJobWork.materialIssuedDate || null,
      expectedReceiptDate: insertJobWork.expectedReceiptDate || null,
      actualReceiptDate: insertJobWork.actualReceiptDate || null,
      materialIssuedQty: insertJobWork.materialIssuedQty || null,
      expectedReceiptQty: insertJobWork.expectedReceiptQty || null,
      actualReceiptQty: insertJobWork.actualReceiptQty || null,
      processLoss: insertJobWork.processLoss || null,
      scrapQuantity: insertJobWork.scrapQuantity || null,
      qualityStatus: insertJobWork.qualityStatus || null,
      invoiceNumber: insertJobWork.invoiceNumber || null,
      invoiceAmount: insertJobWork.invoiceAmount || null,
      notes: insertJobWork.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.jobWorksMap.set(id, jobWork);
    return jobWork;
  }

  async updateJobWork(id: string, data: Partial<InsertJobWork>): Promise<JobWork | undefined> {
    const existing = this.jobWorksMap.get(id);
    if (!existing) return undefined;
    const updated: JobWork = { ...existing, ...data, updatedAt: new Date() };
    this.jobWorksMap.set(id, updated);
    return updated;
  }

  // Batch Review implementations
  async getBatchReviews(): Promise<BatchReview[]> {
    return Array.from(this.batchReviewsMap.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBatchReview(id: string): Promise<BatchReview | undefined> {
    return this.batchReviewsMap.get(id);
  }

  async getBatchReviewByBatchId(batchId: string): Promise<BatchReview | undefined> {
    return this.batchReviewsByBatch.get(batchId);
  }

  async createBatchReview(insertReview: InsertBatchReview): Promise<BatchReview> {
    const id = randomUUID();
    const now = new Date();
    const review: BatchReview = {
      ...insertReview,
      id,
      allStagesCompleted: insertReview.allStagesCompleted ?? false,
      yieldRecorded: insertReview.yieldRecorded ?? false,
      deviationsLogged: insertReview.deviationsLogged ?? false,
      materialBalanceOk: insertReview.materialBalanceOk ?? false,
      reviewedBy: insertReview.reviewedBy || null,
      reviewedAt: insertReview.reviewedAt || null,
      approvedBy: insertReview.approvedBy || null,
      approvedAt: insertReview.approvedAt || null,
      rejectionReason: insertReview.rejectionReason || null,
      productionSummary: insertReview.productionSummary || null,
      closureNotes: insertReview.closureNotes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.batchReviewsMap.set(id, review);
    this.batchReviewsByBatch.set(insertReview.batchId, review);
    return review;
  }

  async updateBatchReview(id: string, data: Partial<InsertBatchReview>): Promise<BatchReview | undefined> {
    const existing = this.batchReviewsMap.get(id);
    if (!existing) return undefined;
    const updated: BatchReview = { ...existing, ...data, updatedAt: new Date() };
    this.batchReviewsMap.set(id, updated);
    this.batchReviewsByBatch.set(existing.batchId, updated);
    return updated;
  }

  // Equipment implementations
  async getEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipmentMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    return this.equipmentMap.get(id);
  }

  async getEquipmentByStatus(status: string): Promise<Equipment[]> {
    return Array.from(this.equipmentMap.values())
      .filter(e => e.status === status)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createEquipment(insertEquip: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    const now = new Date();
    const equip: Equipment = {
      ...insertEquip,
      id,
      capacity: insertEquip.capacity || null,
      capacityUom: insertEquip.capacityUom || 'units/hr',
      location: insertEquip.location || 'Main Plant',
      status: insertEquip.status || 'available',
      lastMaintenanceDate: insertEquip.lastMaintenanceDate || null,
      nextMaintenanceDate: insertEquip.nextMaintenanceDate || null,
      manufacturer: insertEquip.manufacturer || null,
      model: insertEquip.model || null,
      serialNumber: insertEquip.serialNumber || null,
      notes: insertEquip.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.equipmentMap.set(id, equip);
    return equip;
  }

  async updateEquipment(id: string, data: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const existing = this.equipmentMap.get(id);
    if (!existing) return undefined;
    const updated: Equipment = { ...existing, ...data, updatedAt: new Date() };
    this.equipmentMap.set(id, updated);
    return updated;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    return this.equipmentMap.delete(id);
  }

  // Production Job implementations
  async getProductionJobs(): Promise<ProductionJob[]> {
    return Array.from(this.productionJobsMap.values()).sort((a, b) => 
      new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
    );
  }

  async getProductionJob(id: string): Promise<ProductionJob | undefined> {
    return this.productionJobsMap.get(id);
  }

  async getProductionJobsByDateRange(startDate: Date, endDate: Date): Promise<ProductionJob[]> {
    return Array.from(this.productionJobsMap.values())
      .filter(job => {
        const jobStart = new Date(job.scheduledStart).getTime();
        const jobEnd = new Date(job.scheduledEnd).getTime();
        return jobStart <= endDate.getTime() && jobEnd >= startDate.getTime();
      })
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }

  async getProductionJobsByEquipment(equipmentId: string): Promise<ProductionJob[]> {
    return Array.from(this.productionJobsMap.values())
      .filter(job => job.equipmentId === equipmentId)
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }

  async createProductionJob(insertJob: InsertProductionJob): Promise<ProductionJob> {
    const id = randomUUID();
    const now = new Date();
    const job: ProductionJob = {
      ...insertJob,
      id,
      orderNumber: insertJob.orderNumber || null,
      productionOrderId: insertJob.productionOrderId || null,
      batchId: insertJob.batchId || null,
      productCode: insertJob.productCode || null,
      equipmentId: insertJob.equipmentId || null,
      actualStart: insertJob.actualStart || null,
      actualEnd: insertJob.actualEnd || null,
      uom: insertJob.uom || 'units',
      status: insertJob.status || 'scheduled',
      priority: insertJob.priority || 'medium',
      assignedTo: insertJob.assignedTo || null,
      notes: insertJob.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.productionJobsMap.set(id, job);
    return job;
  }

  async updateProductionJob(id: string, data: Partial<InsertProductionJob>): Promise<ProductionJob | undefined> {
    const existing = this.productionJobsMap.get(id);
    if (!existing) return undefined;
    const updated: ProductionJob = { ...existing, ...data, updatedAt: new Date() };
    this.productionJobsMap.set(id, updated);
    return updated;
  }

  async deleteProductionJob(id: string): Promise<boolean> {
    return this.productionJobsMap.delete(id);
  }

  // Job Card implementations
  async getJobCards(): Promise<JobCard[]> {
    return Array.from(this.jobCardsMap.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getJobCard(id: string): Promise<JobCard | undefined> {
    return this.jobCardsMap.get(id);
  }

  async getJobCardsByJob(jobId: string): Promise<JobCard[]> {
    return Array.from(this.jobCardsMap.values())
      .filter(card => card.jobId === jobId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getJobCardsByBatch(batchId: string): Promise<JobCard[]> {
    return Array.from(this.jobCardsMap.values())
      .filter(card => card.batchId === batchId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createJobCard(insertCard: InsertJobCard): Promise<JobCard> {
    const id = randomUUID();
    const now = new Date();
    const card: JobCard = {
      ...insertCard,
      id,
      jobId: insertCard.jobId || null,
      batchId: insertCard.batchId || null,
      description: insertCard.description || null,
      cardType: insertCard.cardType || 'task',
      status: insertCard.status || 'pending',
      priority: insertCard.priority || 'medium',
      assignedTo: insertCard.assignedTo || null,
      dueDate: insertCard.dueDate || null,
      completedAt: insertCard.completedAt || null,
      checklist: insertCard.checklist || null,
      notes: insertCard.notes || null,
      attachments: insertCard.attachments || null,
      createdBy: insertCard.createdBy || null,
      createdAt: now,
      updatedAt: now,
    };
    this.jobCardsMap.set(id, card);
    return card;
  }

  async updateJobCard(id: string, data: Partial<InsertJobCard>): Promise<JobCard | undefined> {
    const existing = this.jobCardsMap.get(id);
    if (!existing) return undefined;
    const updated: JobCard = { ...existing, ...data, updatedAt: new Date() };
    this.jobCardsMap.set(id, updated);
    return updated;
  }

  async deleteJobCard(id: string): Promise<boolean> {
    return this.jobCardsMap.delete(id);
  }

  // ========== FINANCE MODULE IMPLEMENTATIONS ==========

  // Initialize finance sample data
  private async initializeFinanceData(): Promise<void> {
    // Create sample Chart of Accounts
    const accounts: InsertChartOfAccounts[] = [
      { code: "1000", name: "Cash", accountType: "asset", category: "current_asset", normalBalance: "debit", isActive: true },
      { code: "1100", name: "Accounts Receivable", accountType: "asset", category: "current_asset", normalBalance: "debit", isActive: true },
      { code: "1200", name: "Raw Materials Inventory", accountType: "asset", category: "current_asset", normalBalance: "debit", isActive: true },
      { code: "1210", name: "WIP Inventory", accountType: "asset", category: "current_asset", normalBalance: "debit", isActive: true },
      { code: "1220", name: "Finished Goods Inventory", accountType: "asset", category: "current_asset", normalBalance: "debit", isActive: true },
      { code: "1500", name: "Equipment", accountType: "asset", category: "fixed_asset", normalBalance: "debit", isActive: true },
      { code: "2000", name: "Accounts Payable", accountType: "liability", category: "current_liability", normalBalance: "credit", isActive: true },
      { code: "2100", name: "GST Payable", accountType: "liability", category: "current_liability", normalBalance: "credit", isActive: true },
      { code: "3000", name: "Owner's Equity", accountType: "equity", category: "equity", normalBalance: "credit", isActive: true },
      { code: "4000", name: "Sales Revenue", accountType: "revenue", category: "operating_revenue", normalBalance: "credit", isActive: true },
      { code: "5000", name: "Cost of Goods Sold", accountType: "expense", category: "cogs", normalBalance: "debit", isActive: true },
      { code: "5100", name: "Direct Materials", accountType: "expense", category: "cogs", normalBalance: "debit", isActive: true },
      { code: "5200", name: "Direct Labor", accountType: "expense", category: "cogs", normalBalance: "debit", isActive: true },
      { code: "5300", name: "Manufacturing Overhead", accountType: "expense", category: "cogs", normalBalance: "debit", isActive: true },
      { code: "6000", name: "Operating Expenses", accountType: "expense", category: "operating_expense", normalBalance: "debit", isActive: true },
    ];
    for (const account of accounts) {
      await this.createChartOfAccount(account);
    }

    // Create sample Cost Centers
    const costCenters: InsertCostCenter[] = [
      { code: "CC001", name: "Plant Operations", type: "production", isActive: true },
      { code: "CC002", name: "Production Line 1", type: "production", parentId: null, isActive: true },
      { code: "CC003", name: "Quality Control", type: "quality", isActive: true },
      { code: "CC004", name: "Warehouse", type: "logistics", isActive: true },
      { code: "CC005", name: "R&D", type: "support", isActive: true },
    ];
    for (const cc of costCenters) {
      await this.createCostCenter(cc);
    }

    // Create sample Profit Centers
    const profitCenters: InsertProfitCenter[] = [
      { code: "PC001", name: "Pharmaceutical Division", type: "division", isActive: true },
      { code: "PC002", name: "API Products", type: "product_line", isActive: true },
      { code: "PC003", name: "Formulations", type: "product_line", isActive: true },
    ];
    for (const pc of profitCenters) {
      await this.createProfitCenter(pc);
    }

    // Create sample Tax Codes
    const taxCodes: InsertTaxCode[] = [
      { code: "GST18", name: "GST 18%", rate: "18", taxType: "gst", isActive: true },
      { code: "GST12", name: "GST 12%", rate: "12", taxType: "gst", isActive: true },
      { code: "GST5", name: "GST 5%", rate: "5", taxType: "gst", isActive: true },
      { code: "EXEMPT", name: "Tax Exempt", rate: "0", taxType: "exempt", isActive: true },
    ];
    for (const tax of taxCodes) {
      await this.createTaxCode(tax);
    }

    // Create sample Payment Terms
    const paymentTermsList: InsertPaymentTerms[] = [
      { code: "NET30", name: "Net 30 Days", dueDays: 30, discountDays: null, discountPercent: null, isActive: true },
      { code: "NET60", name: "Net 60 Days", dueDays: 60, discountDays: null, discountPercent: null, isActive: true },
      { code: "2NET10", name: "2% 10 Net 30", dueDays: 30, discountDays: 10, discountPercent: "2", isActive: true },
      { code: "COD", name: "Cash on Delivery", dueDays: 0, discountDays: null, discountPercent: null, isActive: true },
    ];
    for (const pt of paymentTermsList) {
      await this.createPaymentTerms(pt);
    }

    // Create Fiscal Year
    const fiscalYear = await this.createFiscalYear({
      name: "FY 2024-25",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2025-03-31"),
      status: "active",
      isClosed: false,
    });

    // Create Fiscal Periods
    const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
    for (let i = 0; i < 12; i++) {
      const year = i < 9 ? 2024 : 2025;
      const month = i < 9 ? i + 4 : i - 8;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      await this.createFiscalPeriod({
        fiscalYearId: fiscalYear.id,
        name: `${months[i]} ${year}`,
        periodNumber: i + 1,
        startDate,
        endDate,
        status: i < 8 ? "closed" : (i === 8 ? "open" : "future"),
        isClosed: i < 8,
      });
    }

    // Create sample Parties (Vendors & Customers)
    const parties: InsertParty[] = [
      { code: "V001", name: "Pharma Supplies Ltd", partyType: "vendor", email: "contact@pharmasupplies.com", phone: "+91-9876543210", taxId: "GSTIN12345", creditLimit: "500000", isActive: true },
      { code: "V002", name: "Chemical Corp", partyType: "vendor", email: "sales@chemcorp.com", phone: "+91-9876543211", taxId: "GSTIN12346", creditLimit: "300000", isActive: true },
      { code: "C001", name: "Metro Hospital", partyType: "customer", email: "procurement@metrohospital.com", phone: "+91-9876543212", taxId: "GSTIN12347", creditLimit: "1000000", isActive: true },
      { code: "C002", name: "City Pharmacy Chain", partyType: "customer", email: "orders@citypharmacy.com", phone: "+91-9876543213", taxId: "GSTIN12348", creditLimit: "750000", isActive: true },
    ];
    for (const party of parties) {
      await this.createParty(party);
    }
  }

  // Chart of Accounts implementations
  async getChartOfAccounts(): Promise<ChartOfAccounts[]> {
    return Array.from(this.chartOfAccountsMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async getChartOfAccountsByType(accountType: string): Promise<ChartOfAccounts[]> {
    return Array.from(this.chartOfAccountsMap.values())
      .filter(account => account.accountType === accountType)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async getChartOfAccount(id: string): Promise<ChartOfAccounts | undefined> {
    return this.chartOfAccountsMap.get(id);
  }

  async createChartOfAccount(data: InsertChartOfAccounts): Promise<ChartOfAccounts> {
    const id = randomUUID();
    const now = new Date();
    const account: ChartOfAccounts = {
      ...data,
      id,
      description: data.description || null,
      parentId: data.parentId || null,
      category: data.category || null,
      normalBalance: data.normalBalance || "debit",
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.chartOfAccountsMap.set(id, account);
    return account;
  }

  async updateChartOfAccount(id: string, data: Partial<InsertChartOfAccounts>): Promise<ChartOfAccounts | undefined> {
    const existing = this.chartOfAccountsMap.get(id);
    if (!existing) return undefined;
    const updated: ChartOfAccounts = { ...existing, ...data, updatedAt: new Date() };
    this.chartOfAccountsMap.set(id, updated);
    return updated;
  }

  async deleteChartOfAccount(id: string): Promise<boolean> {
    return this.chartOfAccountsMap.delete(id);
  }

  // Cost Center implementations
  async getCostCenters(): Promise<CostCenter[]> {
    return Array.from(this.costCentersMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async getCostCenter(id: string): Promise<CostCenter | undefined> {
    return this.costCentersMap.get(id);
  }

  async createCostCenter(data: InsertCostCenter): Promise<CostCenter> {
    const id = randomUUID();
    const now = new Date();
    const costCenter: CostCenter = {
      ...data,
      id,
      description: data.description || null,
      parentId: data.parentId || null,
      type: data.type || null,
      managerId: data.managerId || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.costCentersMap.set(id, costCenter);
    return costCenter;
  }

  async updateCostCenter(id: string, data: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const existing = this.costCentersMap.get(id);
    if (!existing) return undefined;
    const updated: CostCenter = { ...existing, ...data, updatedAt: new Date() };
    this.costCentersMap.set(id, updated);
    return updated;
  }

  async deleteCostCenter(id: string): Promise<boolean> {
    return this.costCentersMap.delete(id);
  }

  // Profit Center implementations
  async getProfitCenters(): Promise<ProfitCenter[]> {
    return Array.from(this.profitCentersMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async getProfitCenter(id: string): Promise<ProfitCenter | undefined> {
    return this.profitCentersMap.get(id);
  }

  async createProfitCenter(data: InsertProfitCenter): Promise<ProfitCenter> {
    const id = randomUUID();
    const now = new Date();
    const profitCenter: ProfitCenter = {
      ...data,
      id,
      description: data.description || null,
      parentId: data.parentId || null,
      type: data.type || null,
      managerId: data.managerId || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.profitCentersMap.set(id, profitCenter);
    return profitCenter;
  }

  async updateProfitCenter(id: string, data: Partial<InsertProfitCenter>): Promise<ProfitCenter | undefined> {
    const existing = this.profitCentersMap.get(id);
    if (!existing) return undefined;
    const updated: ProfitCenter = { ...existing, ...data, updatedAt: new Date() };
    this.profitCentersMap.set(id, updated);
    return updated;
  }

  async deleteProfitCenter(id: string): Promise<boolean> {
    return this.profitCentersMap.delete(id);
  }

  // Tax Code implementations
  async getTaxCodes(): Promise<TaxCode[]> {
    return Array.from(this.taxCodesMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async getTaxCode(id: string): Promise<TaxCode | undefined> {
    return this.taxCodesMap.get(id);
  }

  async createTaxCode(data: InsertTaxCode): Promise<TaxCode> {
    const id = randomUUID();
    const now = new Date();
    const taxCode: TaxCode = {
      ...data,
      id,
      description: data.description || null,
      taxType: data.taxType || null,
      accountId: data.accountId || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.taxCodesMap.set(id, taxCode);
    return taxCode;
  }

  async updateTaxCode(id: string, data: Partial<InsertTaxCode>): Promise<TaxCode | undefined> {
    const existing = this.taxCodesMap.get(id);
    if (!existing) return undefined;
    const updated: TaxCode = { ...existing, ...data, updatedAt: new Date() };
    this.taxCodesMap.set(id, updated);
    return updated;
  }

  async deleteTaxCode(id: string): Promise<boolean> {
    return this.taxCodesMap.delete(id);
  }

  // Payment Terms implementations
  async getPaymentTerms(): Promise<PaymentTerms[]> {
    return Array.from(this.paymentTermsMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async getPaymentTerm(id: string): Promise<PaymentTerms | undefined> {
    return this.paymentTermsMap.get(id);
  }

  async createPaymentTerms(data: InsertPaymentTerms): Promise<PaymentTerms> {
    const id = randomUUID();
    const now = new Date();
    const terms: PaymentTerms = {
      ...data,
      id,
      description: data.description || null,
      discountDays: data.discountDays || null,
      discountPercent: data.discountPercent || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.paymentTermsMap.set(id, terms);
    return terms;
  }

  async updatePaymentTerms(id: string, data: Partial<InsertPaymentTerms>): Promise<PaymentTerms | undefined> {
    const existing = this.paymentTermsMap.get(id);
    if (!existing) return undefined;
    const updated: PaymentTerms = { ...existing, ...data, updatedAt: new Date() };
    this.paymentTermsMap.set(id, updated);
    return updated;
  }

  async deletePaymentTerms(id: string): Promise<boolean> {
    return this.paymentTermsMap.delete(id);
  }

  // Fiscal Year implementations
  async getFiscalYears(): Promise<FiscalYear[]> {
    return Array.from(this.fiscalYearsMap.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getFiscalYear(id: string): Promise<FiscalYear | undefined> {
    return this.fiscalYearsMap.get(id);
  }

  async getActiveFiscalYear(): Promise<FiscalYear | undefined> {
    return Array.from(this.fiscalYearsMap.values()).find(fy => fy.status === "active");
  }

  async createFiscalYear(data: InsertFiscalYear): Promise<FiscalYear> {
    const id = randomUUID();
    const now = new Date();
    const fiscalYear: FiscalYear = {
      ...data,
      id,
      status: data.status || "active",
      isClosed: data.isClosed ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.fiscalYearsMap.set(id, fiscalYear);
    return fiscalYear;
  }

  async updateFiscalYear(id: string, data: Partial<InsertFiscalYear>): Promise<FiscalYear | undefined> {
    const existing = this.fiscalYearsMap.get(id);
    if (!existing) return undefined;
    const updated: FiscalYear = { ...existing, ...data, updatedAt: new Date() };
    this.fiscalYearsMap.set(id, updated);
    return updated;
  }

  async deleteFiscalYear(id: string): Promise<boolean> {
    return this.fiscalYearsMap.delete(id);
  }

  // Fiscal Period implementations
  async getFiscalPeriods(fiscalYearId: string): Promise<FiscalPeriod[]> {
    return Array.from(this.fiscalPeriodsMap.values())
      .filter(fp => fp.fiscalYearId === fiscalYearId)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }

  async getFiscalPeriod(id: string): Promise<FiscalPeriod | undefined> {
    return this.fiscalPeriodsMap.get(id);
  }

  async getOpenFiscalPeriods(): Promise<FiscalPeriod[]> {
    return Array.from(this.fiscalPeriodsMap.values())
      .filter(fp => fp.status === "open")
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }

  async createFiscalPeriod(data: InsertFiscalPeriod): Promise<FiscalPeriod> {
    const id = randomUUID();
    const now = new Date();
    const period: FiscalPeriod = {
      ...data,
      id,
      status: data.status || "future",
      isClosed: data.isClosed ?? false,
      closedBy: data.closedBy || null,
      closedAt: data.closedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.fiscalPeriodsMap.set(id, period);
    return period;
  }

  async updateFiscalPeriod(id: string, data: Partial<InsertFiscalPeriod>): Promise<FiscalPeriod | undefined> {
    const existing = this.fiscalPeriodsMap.get(id);
    if (!existing) return undefined;
    const updated: FiscalPeriod = { ...existing, ...data, updatedAt: new Date() };
    this.fiscalPeriodsMap.set(id, updated);
    return updated;
  }

  async deleteFiscalPeriod(id: string): Promise<boolean> {
    return this.fiscalPeriodsMap.delete(id);
  }

  // Party implementations
  async getParties(): Promise<Party[]> {
    return Array.from(this.partiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPartiesByType(partyType: string): Promise<Party[]> {
    return Array.from(this.partiesMap.values())
      .filter(party => party.partyType === partyType)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getParty(id: string): Promise<Party | undefined> {
    return this.partiesMap.get(id);
  }

  async createParty(data: InsertParty): Promise<Party> {
    const id = randomUUID();
    const now = new Date();
    const party: Party = {
      ...data,
      id,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      postalCode: data.postalCode || null,
      taxId: data.taxId || null,
      creditLimit: data.creditLimit || null,
      paymentTermsId: data.paymentTermsId || null,
      currency: data.currency || "INR",
      defaultAccountId: data.defaultAccountId || null,
      notes: data.notes || null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.partiesMap.set(id, party);
    return party;
  }

  async updateParty(id: string, data: Partial<InsertParty>): Promise<Party | undefined> {
    const existing = this.partiesMap.get(id);
    if (!existing) return undefined;
    const updated: Party = { ...existing, ...data, updatedAt: new Date() };
    this.partiesMap.set(id, updated);
    return updated;
  }

  async deleteParty(id: string): Promise<boolean> {
    return this.partiesMap.delete(id);
  }

  // Financial Document implementations
  async getFinancialDocuments(): Promise<FinancialDocument[]> {
    return Array.from(this.financialDocumentsMap.values()).sort((a, b) => 
      new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime()
    );
  }

  async getFinancialDocumentsByType(docType: string): Promise<FinancialDocument[]> {
    return Array.from(this.financialDocumentsMap.values())
      .filter(doc => doc.documentType === docType)
      .sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());
  }

  async getFinancialDocumentsByParty(partyId: string): Promise<FinancialDocument[]> {
    return Array.from(this.financialDocumentsMap.values())
      .filter(doc => doc.partyId === partyId)
      .sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());
  }

  async getFinancialDocument(id: string): Promise<FinancialDocument | undefined> {
    return this.financialDocumentsMap.get(id);
  }

  async createFinancialDocument(data: InsertFinancialDocument): Promise<FinancialDocument> {
    const id = randomUUID();
    const now = new Date();
    const doc: FinancialDocument = {
      ...data,
      id,
      referenceNumber: data.referenceNumber || null,
      fiscalPeriodId: data.fiscalPeriodId || null,
      costCenterId: data.costCenterId || null,
      profitCenterId: data.profitCenterId || null,
      subtotal: data.subtotal || "0",
      taxAmount: data.taxAmount || "0",
      totalAmount: data.totalAmount || "0",
      paidAmount: data.paidAmount || "0",
      balanceAmount: data.balanceAmount || data.totalAmount || "0",
      status: data.status || "draft",
      paymentStatus: data.paymentStatus || "unpaid",
      notes: data.notes || null,
      terms: data.terms || null,
      postedToGl: data.postedToGl ?? false,
      glJournalId: data.glJournalId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.financialDocumentsMap.set(id, doc);
    return doc;
  }

  async updateFinancialDocument(id: string, data: Partial<InsertFinancialDocument>): Promise<FinancialDocument | undefined> {
    const existing = this.financialDocumentsMap.get(id);
    if (!existing) return undefined;
    const updated: FinancialDocument = { ...existing, ...data, updatedAt: new Date() };
    this.financialDocumentsMap.set(id, updated);
    return updated;
  }

  async deleteFinancialDocument(id: string): Promise<boolean> {
    return this.financialDocumentsMap.delete(id);
  }

  // Document Line implementations
  async getDocumentLines(documentId: string): Promise<DocumentLine[]> {
    return Array.from(this.documentLinesMap.values())
      .filter(line => line.documentId === documentId)
      .sort((a, b) => a.lineNumber - b.lineNumber);
  }

  async createDocumentLine(data: InsertDocumentLine): Promise<DocumentLine> {
    const id = randomUUID();
    const now = new Date();
    const line: DocumentLine = {
      ...data,
      id,
      costCenterId: data.costCenterId || null,
      profitCenterId: data.profitCenterId || null,
      unitPrice: data.unitPrice || "0",
      taxCodeId: data.taxCodeId || null,
      taxAmount: data.taxAmount || "0",
      lineTotal: data.lineTotal || "0",
      notes: data.notes || null,
      createdAt: now,
    };
    this.documentLinesMap.set(id, line);
    return line;
  }

  async updateDocumentLine(id: string, data: Partial<InsertDocumentLine>): Promise<DocumentLine | undefined> {
    const existing = this.documentLinesMap.get(id);
    if (!existing) return undefined;
    const updated: DocumentLine = { ...existing, ...data };
    this.documentLinesMap.set(id, updated);
    return updated;
  }

  async deleteDocumentLine(id: string): Promise<boolean> {
    return this.documentLinesMap.delete(id);
  }

  // Payment implementations
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values()).sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  async getPaymentsByParty(partyId: string): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values())
      .filter(payment => payment.partyId === partyId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.paymentsMap.get(id);
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const now = new Date();
    const payment: Payment = {
      ...data,
      id,
      bankAccountId: data.bankAccountId || null,
      referenceNumber: data.referenceNumber || null,
      fiscalPeriodId: data.fiscalPeriodId || null,
      notes: data.notes || null,
      status: data.status || "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.paymentsMap.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existing = this.paymentsMap.get(id);
    if (!existing) return undefined;
    const updated: Payment = { ...existing, ...data, updatedAt: new Date() };
    this.paymentsMap.set(id, updated);
    return updated;
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.paymentsMap.delete(id);
  }

  // GL Journal implementations
  async getGlJournals(): Promise<GlJournal[]> {
    return Array.from(this.glJournalsMap.values()).sort((a, b) => 
      new Date(b.journalDate).getTime() - new Date(a.journalDate).getTime()
    );
  }

  async getGlJournalsByPeriod(fiscalPeriodId: string): Promise<GlJournal[]> {
    return Array.from(this.glJournalsMap.values())
      .filter(journal => journal.fiscalPeriodId === fiscalPeriodId)
      .sort((a, b) => new Date(b.journalDate).getTime() - new Date(a.journalDate).getTime());
  }

  async getGlJournal(id: string): Promise<GlJournal | undefined> {
    return this.glJournalsMap.get(id);
  }

  async createGlJournal(data: InsertGlJournal): Promise<GlJournal> {
    const id = randomUUID();
    const now = new Date();
    const journal: GlJournal = {
      ...data,
      id,
      description: data.description || null,
      sourceType: data.sourceType || null,
      sourceId: data.sourceId || null,
      totalDebit: data.totalDebit || "0",
      totalCredit: data.totalCredit || "0",
      status: data.status || "draft",
      postedBy: data.postedBy || null,
      postedAt: data.postedAt || null,
      reversalOf: data.reversalOf || null,
      isReversed: data.isReversed ?? false,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    this.glJournalsMap.set(id, journal);
    return journal;
  }

  async updateGlJournal(id: string, data: Partial<InsertGlJournal>): Promise<GlJournal | undefined> {
    const existing = this.glJournalsMap.get(id);
    if (!existing) return undefined;
    const updated: GlJournal = { ...existing, ...data, updatedAt: new Date() };
    this.glJournalsMap.set(id, updated);
    return updated;
  }

  async deleteGlJournal(id: string): Promise<boolean> {
    return this.glJournalsMap.delete(id);
  }

  // GL Journal Line implementations
  async getGlJournalLines(journalId: string): Promise<GlJournalLine[]> {
    return Array.from(this.glJournalLinesMap.values())
      .filter(line => line.journalId === journalId)
      .sort((a, b) => a.lineNumber - b.lineNumber);
  }

  async createGlJournalLine(data: InsertGlJournalLine): Promise<GlJournalLine> {
    const id = randomUUID();
    const now = new Date();
    const line: GlJournalLine = {
      ...data,
      id,
      costCenterId: data.costCenterId || null,
      profitCenterId: data.profitCenterId || null,
      description: data.description || null,
      partyId: data.partyId || null,
      referenceNumber: data.referenceNumber || null,
      createdAt: now,
    };
    this.glJournalLinesMap.set(id, line);
    return line;
  }

  async updateGlJournalLine(id: string, data: Partial<InsertGlJournalLine>): Promise<GlJournalLine | undefined> {
    const existing = this.glJournalLinesMap.get(id);
    if (!existing) return undefined;
    const updated: GlJournalLine = { ...existing, ...data };
    this.glJournalLinesMap.set(id, updated);
    return updated;
  }

  async deleteGlJournalLine(id: string): Promise<boolean> {
    return this.glJournalLinesMap.delete(id);
  }

  // Finance Analytics implementations
  async getAccountBalance(accountId: string): Promise<{ debit: number; credit: number; balance: number }> {
    const journalLines = Array.from(this.glJournalLinesMap.values())
      .filter(line => line.accountId === accountId);
    
    const debit = journalLines.reduce((sum, line) => sum + parseFloat(line.debitAmount || "0"), 0);
    const credit = journalLines.reduce((sum, line) => sum + parseFloat(line.creditAmount || "0"), 0);
    
    return { debit, credit, balance: debit - credit };
  }

  async getTrialBalance(fiscalPeriodId: string): Promise<Array<{ accountId: string; accountName: string; accountCode: string; debit: number; credit: number; }>> {
    const journals = Array.from(this.glJournalsMap.values())
      .filter(journal => journal.fiscalPeriodId === fiscalPeriodId && journal.status === "posted");
    
    const journalIds = new Set(journals.map(j => j.id));
    const lines = Array.from(this.glJournalLinesMap.values())
      .filter(line => journalIds.has(line.journalId));
    
    const balances = new Map<string, { debit: number; credit: number }>();
    
    for (const line of lines) {
      const existing = balances.get(line.accountId) || { debit: 0, credit: 0 };
      existing.debit += parseFloat(line.debitAmount || "0");
      existing.credit += parseFloat(line.creditAmount || "0");
      balances.set(line.accountId, existing);
    }
    
    const result: Array<{ accountId: string; accountName: string; accountCode: string; debit: number; credit: number; }> = [];
    
    for (const [accountId, balance] of balances) {
      const account = this.chartOfAccountsMap.get(accountId);
      if (account) {
        result.push({
          accountId,
          accountName: account.name,
          accountCode: account.code,
          debit: balance.debit,
          credit: balance.credit,
        });
      }
    }
    
    return result.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }

  async getAgingReport(partyType: string): Promise<Array<{ partyId: string; partyName: string; current: number; days30: number; days60: number; days90: number; over90: number; total: number; }>> {
    const parties = Array.from(this.partiesMap.values())
      .filter(party => party.partyType === partyType);
    
    const now = new Date();
    const result: Array<{ partyId: string; partyName: string; current: number; days30: number; days60: number; days90: number; over90: number; total: number; }> = [];
    
    for (const party of parties) {
      const docs = Array.from(this.financialDocumentsMap.values())
        .filter(doc => doc.partyId === party.id && doc.paymentStatus !== "paid");
      
      let current = 0, days30 = 0, days60 = 0, days90 = 0, over90 = 0;
      
      for (const doc of docs) {
        const balance = parseFloat(doc.balanceAmount || "0");
        const daysDue = Math.floor((now.getTime() - new Date(doc.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDue <= 0) current += balance;
        else if (daysDue <= 30) days30 += balance;
        else if (daysDue <= 60) days60 += balance;
        else if (daysDue <= 90) days90 += balance;
        else over90 += balance;
      }
      
      const total = current + days30 + days60 + days90 + over90;
      if (total > 0) {
        result.push({ partyId: party.id, partyName: party.name, current, days30, days60, days90, over90, total });
      }
    }
    
    return result.sort((a, b) => b.total - a.total);
  }

  // ==================== RFID Module Implementations ====================

  private async initializeRfidData(): Promise<void> {
    const now = new Date();

    // Seed zones
    const zones: RfidZone[] = [
      { id: randomUUID(), zoneCode: "ZONE-RM-A", name: "Raw Materials Rack A", type: "rack", warehouseId: "WH-001", locationCode: "A-01", description: "Main raw material storage rack - Row A", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-RM-B", name: "Raw Materials Rack B", type: "rack", warehouseId: "WH-001", locationCode: "A-02", description: "Main raw material storage rack - Row B", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-PKG", name: "Packaging Materials Zone", type: "room", warehouseId: "WH-002", locationCode: "B-01", description: "Packaging and labeling materials storage", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-FG", name: "Finished Goods Zone", type: "room", warehouseId: "WH-003", locationCode: "C-01", description: "Finished product holding area", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-COLD", name: "Cold Storage", type: "cold-storage", warehouseId: "WH-001", locationCode: "D-01", description: "Temperature-controlled storage (2-8°C)", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-QUAR", name: "Quarantine Zone", type: "quarantine", warehouseId: "WH-001", locationCode: "E-01", description: "Materials awaiting QC clearance", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-DOOR-IN", name: "Inbound Dock", type: "door", warehouseId: "WH-001", locationCode: "DOCK-IN", description: "Receiving dock - entry point", isActive: true, createdAt: now, updatedAt: now },
      { id: randomUUID(), zoneCode: "ZONE-DOOR-OUT", name: "Outbound Dock", type: "door", warehouseId: "WH-001", locationCode: "DOCK-OUT", description: "Dispatch dock - exit point", isActive: true, createdAt: now, updatedAt: now },
    ];
    for (const z of zones) this.rfidZonesMap.set(z.id, z);

    const zoneIds = zones.map(z => z.id);

    // Seed readers
    const readers: RfidReader[] = [
      { id: randomUUID(), readerCode: "RDR-001", name: "Zebra FX9600 - RM Rack A", model: "FX9600", vendor: "Zebra", zoneId: zoneIds[0], ipAddress: "192.168.1.101", port: 5084, antennaCount: 4, status: "online", firmwareVersion: "2.3.12.0", lastHeartbeat: now, isActive: true, notes: null, installedDate: new Date("2024-01-15"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-002", name: "Impinj R700 - RM Rack B", model: "R700", vendor: "Impinj", zoneId: zoneIds[1], ipAddress: "192.168.1.102", port: 5084, antennaCount: 4, status: "online", firmwareVersion: "8.0.0.240", lastHeartbeat: now, isActive: true, notes: null, installedDate: new Date("2024-01-15"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-003", name: "Zebra FX7500 - Packaging Zone", model: "FX7500", vendor: "Zebra", zoneId: zoneIds[2], ipAddress: "192.168.1.103", port: 5084, antennaCount: 2, status: "online", firmwareVersion: "2.2.40.0", lastHeartbeat: new Date(now.getTime() - 120000), isActive: true, notes: null, installedDate: new Date("2024-02-10"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-004", name: "Impinj Speedway R420 - FG Zone", model: "Speedway R420", vendor: "Impinj", zoneId: zoneIds[3], ipAddress: "192.168.1.104", port: 5084, antennaCount: 4, status: "online", firmwareVersion: "5.14.1.240", lastHeartbeat: now, isActive: true, notes: null, installedDate: new Date("2024-02-20"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-005", name: "Alien ALR-9900+ - Cold Storage", model: "ALR-9900+", vendor: "Alien", zoneId: zoneIds[4], ipAddress: "192.168.1.105", port: 5084, antennaCount: 4, status: "error", firmwareVersion: "19.1.9.2", lastHeartbeat: new Date(now.getTime() - 3600000), isActive: true, notes: "Antenna 3 fault - maintenance scheduled", installedDate: new Date("2024-03-05"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-006", name: "Honeywell RFID - Inbound Dock", model: "IH21", vendor: "Honeywell", zoneId: zoneIds[6], ipAddress: "192.168.1.106", port: 5084, antennaCount: 2, status: "online", firmwareVersion: "4.2.1", lastHeartbeat: now, isActive: true, notes: null, installedDate: new Date("2024-03-01"), createdAt: now, updatedAt: now },
      { id: randomUUID(), readerCode: "RDR-007", name: "Zebra FX9600 - Outbound Dock", model: "FX9600", vendor: "Zebra", zoneId: zoneIds[7], ipAddress: "192.168.1.107", port: 5084, antennaCount: 4, status: "offline", firmwareVersion: "2.3.12.0", lastHeartbeat: new Date(now.getTime() - 86400000), isActive: true, notes: "Offline for firmware update", installedDate: new Date("2024-03-01"), createdAt: now, updatedAt: now },
    ];
    for (const r of readers) this.rfidReadersMap.set(r.id, r);

    const readerIds = readers.map(r => r.id);

    // Seed tags
    const materialTypes = ["raw-material", "packaging", "artwork", "finished-product", "instructions"];
    const tagData = [
      { epc: "E2000018921802180C006025", materialType: "raw-material", batch: "BT-2024-001", lot: "LOT-001", zoneIdx: 0, readerIdx: 0 },
      { epc: "E2000018921802180C006026", materialType: "raw-material", batch: "BT-2024-001", lot: "LOT-001", zoneIdx: 0, readerIdx: 0 },
      { epc: "E2000018921802180C006027", materialType: "raw-material", batch: "BT-2024-002", lot: "LOT-002", zoneIdx: 1, readerIdx: 1 },
      { epc: "E2000018921802180C006028", materialType: "packaging", batch: "PK-2024-001", lot: "LOT-P01", zoneIdx: 2, readerIdx: 2 },
      { epc: "E2000018921802180C006029", materialType: "packaging", batch: "PK-2024-002", lot: "LOT-P02", zoneIdx: 2, readerIdx: 2 },
      { epc: "E2000018921802180C00602A", materialType: "finished-product", batch: "FP-2024-001", lot: "LOT-F01", zoneIdx: 3, readerIdx: 3 },
      { epc: "E2000018921802180C00602B", materialType: "finished-product", batch: "FP-2024-001", lot: "LOT-F01", zoneIdx: 3, readerIdx: 3 },
      { epc: "E2000018921802180C00602C", materialType: "raw-material", batch: "BT-2024-003", lot: "LOT-003", zoneIdx: 4, readerIdx: 0 },
      { epc: "E2000018921802180C00602D", materialType: "artwork", batch: "ART-2024-001", lot: "LOT-A01", zoneIdx: 2, readerIdx: 2 },
      { epc: "E2000018921802180C00602E", materialType: "raw-material", batch: "BT-2024-004", lot: "LOT-004", zoneIdx: 5, readerIdx: 0 },
      { epc: "E2000018921802180C00602F", materialType: "finished-product", batch: "FP-2024-002", lot: "LOT-F02", zoneIdx: 3, readerIdx: 3 },
      { epc: "E2000018921802180C006030", materialType: "packaging", batch: "PK-2024-003", lot: "LOT-P03", zoneIdx: 2, readerIdx: 2 },
    ];

    const tags: RfidTag[] = tagData.map(t => ({
      id: randomUUID(),
      tagEpc: t.epc,
      tagType: "UHF",
      materialId: null,
      materialType: t.materialType,
      batchNumber: t.batch,
      lotNumber: t.lot,
      status: "active",
      lastSeenAt: new Date(now.getTime() - Math.random() * 3600000),
      lastZoneId: zoneIds[t.zoneIdx],
      lastReaderId: readerIds[t.readerIdx],
      lastRssi: -45 - Math.floor(Math.random() * 30),
      isActive: true,
      notes: null,
      createdAt: new Date("2024-04-01"),
      updatedAt: now,
    }));
    for (const t of tags) this.rfidTagsMap.set(t.id, t);

    const tagIds = tags.map(t => t.id);

    // Seed events
    const eventTypes: Array<{ type: string; direction: string | null }> = [
      { type: "inbound", direction: "in" },
      { type: "outbound", direction: "out" },
      { type: "detected", direction: null },
      { type: "zone-transfer", direction: null },
    ];

    let eventCounter = 1;
    const events: RfidEvent[] = [];
    for (let i = 0; i < 30; i++) {
      const tag = tags[i % tags.length];
      const et = eventTypes[i % eventTypes.length];
      const scannedAt = new Date(now.getTime() - i * 1800000);
      events.push({
        id: randomUUID(),
        eventNumber: `RFID-EVT-${String(eventCounter++).padStart(5, "0")}`,
        tagEpc: tag.tagEpc,
        tagId: tag.id,
        readerId: tag.lastReaderId,
        zoneId: tag.lastZoneId,
        eventType: et.type,
        direction: et.direction,
        rssi: -45 - Math.floor(Math.random() * 30),
        antennaPort: Math.ceil(Math.random() * 4),
        materialId: null,
        materialType: tag.materialType,
        batchNumber: tag.batchNumber,
        fromZoneId: et.type === "zone-transfer" ? zoneIds[Math.floor(Math.random() * zoneIds.length)] : null,
        toZoneId: et.type === "zone-transfer" ? tag.lastZoneId : null,
        quantity: 1,
        performedBy: "System",
        notes: null,
        scannedAt,
        createdAt: scannedAt,
      });
    }
    for (const e of events) this.rfidEventsMap.set(e.id, e);
  }

  // RFID Zone implementations
  async getRfidZones(): Promise<RfidZone[]> {
    return Array.from(this.rfidZonesMap.values()).sort((a, b) => a.zoneCode.localeCompare(b.zoneCode));
  }

  async getRfidZone(id: string): Promise<RfidZone | undefined> {
    return this.rfidZonesMap.get(id);
  }

  async createRfidZone(data: InsertRfidZone): Promise<RfidZone> {
    const id = randomUUID();
    const now = new Date();
    const zone: RfidZone = { ...data, id, warehouseId: data.warehouseId || null, locationCode: data.locationCode || null, description: data.description || null, isActive: data.isActive ?? true, createdAt: now, updatedAt: now };
    this.rfidZonesMap.set(id, zone);
    return zone;
  }

  async updateRfidZone(id: string, data: Partial<InsertRfidZone>): Promise<RfidZone | undefined> {
    const existing = this.rfidZonesMap.get(id);
    if (!existing) return undefined;
    const updated: RfidZone = { ...existing, ...data, updatedAt: new Date() };
    this.rfidZonesMap.set(id, updated);
    return updated;
  }

  async deleteRfidZone(id: string): Promise<boolean> {
    return this.rfidZonesMap.delete(id);
  }

  // RFID Reader implementations
  async getRfidReaders(): Promise<RfidReader[]> {
    return Array.from(this.rfidReadersMap.values()).sort((a, b) => a.readerCode.localeCompare(b.readerCode));
  }

  async getRfidReader(id: string): Promise<RfidReader | undefined> {
    return this.rfidReadersMap.get(id);
  }

  async createRfidReader(data: InsertRfidReader): Promise<RfidReader> {
    const id = randomUUID();
    const now = new Date();
    const reader: RfidReader = { ...data, id, zoneId: data.zoneId || null, ipAddress: data.ipAddress || null, port: data.port ?? 5084, antennaCount: data.antennaCount ?? 4, status: data.status || "offline", firmwareVersion: data.firmwareVersion || null, lastHeartbeat: data.lastHeartbeat || null, isActive: data.isActive ?? true, notes: data.notes || null, installedDate: data.installedDate || null, createdAt: now, updatedAt: now };
    this.rfidReadersMap.set(id, reader);
    return reader;
  }

  async updateRfidReader(id: string, data: Partial<InsertRfidReader>): Promise<RfidReader | undefined> {
    const existing = this.rfidReadersMap.get(id);
    if (!existing) return undefined;
    const updated: RfidReader = { ...existing, ...data, updatedAt: new Date() };
    this.rfidReadersMap.set(id, updated);
    return updated;
  }

  async deleteRfidReader(id: string): Promise<boolean> {
    return this.rfidReadersMap.delete(id);
  }

  // RFID Tag implementations
  async getRfidTags(): Promise<RfidTag[]> {
    return Array.from(this.rfidTagsMap.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getRfidTag(id: string): Promise<RfidTag | undefined> {
    return this.rfidTagsMap.get(id);
  }

  async getRfidTagByEpc(epc: string): Promise<RfidTag | undefined> {
    return Array.from(this.rfidTagsMap.values()).find(t => t.tagEpc === epc);
  }

  async createRfidTag(data: InsertRfidTag): Promise<RfidTag> {
    const id = randomUUID();
    const now = new Date();
    const tag: RfidTag = { ...data, id, materialId: data.materialId || null, materialType: data.materialType || null, batchNumber: data.batchNumber || null, lotNumber: data.lotNumber || null, status: data.status || "active", lastSeenAt: data.lastSeenAt || null, lastZoneId: data.lastZoneId || null, lastReaderId: data.lastReaderId || null, lastRssi: data.lastRssi || null, isActive: data.isActive ?? true, notes: data.notes || null, createdAt: now, updatedAt: now };
    this.rfidTagsMap.set(id, tag);
    return tag;
  }

  async updateRfidTag(id: string, data: Partial<InsertRfidTag>): Promise<RfidTag | undefined> {
    const existing = this.rfidTagsMap.get(id);
    if (!existing) return undefined;
    const updated: RfidTag = { ...existing, ...data, updatedAt: new Date() };
    this.rfidTagsMap.set(id, updated);
    return updated;
  }

  async deleteRfidTag(id: string): Promise<boolean> {
    return this.rfidTagsMap.delete(id);
  }

  // RFID Event implementations
  async getRfidEvents(): Promise<RfidEvent[]> {
    return Array.from(this.rfidEventsMap.values()).sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime());
  }

  async getRfidEventsByTag(tagId: string): Promise<RfidEvent[]> {
    return Array.from(this.rfidEventsMap.values()).filter(e => e.tagId === tagId).sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime());
  }

  async getRfidEventsByZone(zoneId: string): Promise<RfidEvent[]> {
    return Array.from(this.rfidEventsMap.values()).filter(e => e.zoneId === zoneId).sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime());
  }

  async createRfidEvent(data: InsertRfidEvent): Promise<RfidEvent> {
    const id = randomUUID();
    const now = new Date();
    const event: RfidEvent = { ...data, id, tagId: data.tagId || null, readerId: data.readerId || null, zoneId: data.zoneId || null, direction: data.direction || null, rssi: data.rssi || null, antennaPort: data.antennaPort || null, materialId: data.materialId || null, materialType: data.materialType || null, batchNumber: data.batchNumber || null, fromZoneId: data.fromZoneId || null, toZoneId: data.toZoneId || null, quantity: data.quantity ?? 1, performedBy: data.performedBy || null, notes: data.notes || null, scannedAt: data.scannedAt || now, createdAt: now };
    this.rfidEventsMap.set(id, event);

    // Update the tag's last-seen information if tagId is provided
    if (data.tagId) {
      const tag = this.rfidTagsMap.get(data.tagId);
      if (tag) {
        const updatedTag: RfidTag = { ...tag, lastSeenAt: event.scannedAt, lastZoneId: data.zoneId || tag.lastZoneId, lastReaderId: data.readerId || tag.lastReaderId, lastRssi: data.rssi || tag.lastRssi, updatedAt: now };
        this.rfidTagsMap.set(tag.id, updatedTag);
      }
    }
    return event;
  }

  async getRfidStats(): Promise<{ totalReaders: number; onlineReaders: number; activeTags: number; todayEvents: number; inboundToday: number; outboundToday: number; }> {
    const readers = Array.from(this.rfidReadersMap.values());
    const tags = Array.from(this.rfidTagsMap.values());
    const events = Array.from(this.rfidEventsMap.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = events.filter(e => new Date(e.scannedAt!) >= today);

    return {
      totalReaders: readers.length,
      onlineReaders: readers.filter(r => r.status === "online").length,
      activeTags: tags.filter(t => t.status === "active" && t.isActive).length,
      todayEvents: todayEvents.length,
      inboundToday: todayEvents.filter(e => e.eventType === "inbound").length,
      outboundToday: todayEvents.filter(e => e.eventType === "outbound").length,
    };
  }

  // ==================== Traceability Implementations ====================

  private async initializeTraceabilityData(): Promise<void> {
    const now = new Date();

    // Seed Handling Units (pallets/cartons linked to pharma materials)
    const huData = [
      { code: "PALT-00001", type: "pallet", matCode: "RM-001", matName: "Paracetamol API", batch: "BT-2024-001", lot: "LOT-001", qty: "500", uom: "kg", loc: "A-01-R01", locName: "Raw Materials Rack A - Shelf 1", status: "available", barcode: "PALT-00001", rfid: "E2000018921802180C006025", supplier: "Pharma APIs Ltd" },
      { code: "PALT-00002", type: "pallet", matCode: "RM-002", matName: "Microcrystalline Cellulose", batch: "BT-2024-002", lot: "LOT-002", qty: "300", uom: "kg", loc: "A-02-R01", locName: "Raw Materials Rack B - Shelf 1", status: "available", barcode: "PALT-00002", rfid: "E2000018921802180C006026", supplier: "Excipients Corp" },
      { code: "CART-00010", type: "carton", matCode: "PK-001", matName: "HDPE Bottles 100ml", batch: "PK-2024-001", lot: "LOT-P01", qty: "2000", uom: "units", loc: "B-01-S01", locName: "Packaging Zone - Section 1", status: "available", barcode: "CART-00010", rfid: "E2000018921802180C006028", supplier: "PackPlast India" },
      { code: "CART-00011", type: "carton", matCode: "PK-002", matName: "Aluminium Blister Foil", batch: "PK-2024-002", lot: "LOT-P02", qty: "5000", uom: "sheets", loc: "B-01-S02", locName: "Packaging Zone - Section 2", status: "available", barcode: "CART-00011", rfid: "E2000018921802180C006029", supplier: "MetalPack Ltd" },
      { code: "PALT-00003", type: "pallet", matCode: "FG-001", matName: "Paracetamol 500mg Tablets", batch: "FP-2024-001", lot: "LOT-F01", qty: "100000", uom: "units", loc: "C-01-S01", locName: "Finished Goods Zone - Section 1", status: "available", barcode: "PALT-00003", rfid: "E2000018921802180C00602A", supplier: null },
      { code: "PALT-00004", type: "pallet", matCode: "RM-003", matName: "Magnesium Stearate", batch: "BT-2024-003", lot: "LOT-003", qty: "100", uom: "kg", loc: "D-01", locName: "Cold Storage - Bay 1", status: "qc-hold", barcode: "PALT-00004", rfid: "E2000018921802180C00602C", supplier: "ChemSpec Corp" },
      { code: "TOTE-00001", type: "tote", matCode: "ART-001", matName: "Package Artwork v3.2", batch: "ART-2024-001", lot: "LOT-A01", qty: "500", uom: "sheets", loc: "B-01-S03", locName: "Packaging Zone - Section 3", status: "available", barcode: "TOTE-00001", rfid: "E2000018921802180C00602D", supplier: "PrintCo" },
      { code: "PALT-00005", type: "pallet", matCode: "RM-004", matName: "Starch Powder", batch: "BT-2024-004", lot: "LOT-004", qty: "250", uom: "kg", loc: "E-01", locName: "Quarantine Zone", status: "on-hold", barcode: "PALT-00005", rfid: "E2000018921802180C00602E", supplier: "NaturePharma" },
      { code: "PALT-00006", type: "pallet", matCode: "FG-002", matName: "Ibuprofen 200mg Capsules", batch: "FP-2024-002", lot: "LOT-F02", qty: "80000", uom: "units", loc: "C-01-S02", locName: "Finished Goods Zone - Section 2", status: "available", barcode: "PALT-00006", rfid: "E2000018921802180C00602F", supplier: null },
      { code: "CART-00012", type: "carton", matCode: "PK-003", matName: "PVC Film Roll", batch: "PK-2024-003", lot: "LOT-P03", qty: "10", uom: "rolls", loc: "B-01-S04", locName: "Packaging Zone - Section 4", status: "available", barcode: "CART-00012", rfid: "E2000018921802180C006030", supplier: "FlexiPack" },
    ];

    const hus: HandlingUnit[] = huData.map(h => ({
      id: randomUUID(),
      huCode: h.code,
      huType: h.type,
      parentHuId: null,
      materialCode: h.matCode,
      materialName: h.matName,
      batchNumber: h.batch,
      lotNumber: h.lot,
      serialNumber: null,
      quantity: h.qty,
      uom: h.uom,
      currentLocationCode: h.loc,
      currentLocationName: h.locName,
      status: h.status,
      barcodeValue: h.barcode,
      rfidEpc: h.rfid,
      supplierName: h.supplier,
      receivedDate: new Date("2024-04-01"),
      notes: null,
      createdAt: new Date("2024-04-01"),
      updatedAt: now,
    }));
    for (const hu of hus) this.handlingUnitsMap.set(hu.id, hu);

    // Seed Barcodes registry
    const barcodeData = [
      { val: "PALT-00001", type: "HU", huCode: "PALT-00001", matCode: "RM-001", batch: "BT-2024-001", label: "pallet", printed: new Date("2024-04-01"), by: "Warehouse Operator" },
      { val: "PALT-00002", type: "HU", huCode: "PALT-00002", matCode: "RM-002", batch: "BT-2024-002", label: "pallet", printed: new Date("2024-04-01"), by: "Warehouse Operator" },
      { val: "CART-00010", type: "HU", huCode: "CART-00010", matCode: "PK-001", batch: "PK-2024-001", label: "carton", printed: new Date("2024-04-02"), by: "Receiving Desk" },
      { val: "CART-00011", type: "HU", huCode: "CART-00011", matCode: "PK-002", batch: "PK-2024-002", label: "carton", printed: new Date("2024-04-02"), by: "Receiving Desk" },
      { val: "PALT-00003", type: "HU", huCode: "PALT-00003", matCode: "FG-001", batch: "FP-2024-001", label: "pallet", printed: new Date("2024-04-10"), by: "Production Team" },
      { val: "PALT-00004", type: "HU", huCode: "PALT-00004", matCode: "RM-003", batch: "BT-2024-003", label: "pallet", printed: new Date("2024-04-03"), by: "Warehouse Operator" },
      { val: "TOTE-00001", type: "HU", huCode: "TOTE-00001", matCode: "ART-001", batch: "ART-2024-001", label: "carton", printed: new Date("2024-04-05"), by: "Warehouse Operator" },
      { val: "PALT-00005", type: "HU", huCode: "PALT-00005", matCode: "RM-004", batch: "BT-2024-004", label: "pallet", printed: new Date("2024-04-06"), by: "Receiving Desk" },
      { val: "PALT-00006", type: "HU", huCode: "PALT-00006", matCode: "FG-002", batch: "FP-2024-002", label: "pallet", printed: new Date("2024-04-12"), by: "Production Team" },
      { val: "CART-00012", type: "HU", huCode: "CART-00012", matCode: "PK-003", batch: "PK-2024-003", label: "carton", printed: new Date("2024-04-07"), by: "Receiving Desk" },
      { val: "LOC-ZONE-RM-A", type: "location", huCode: null, matCode: null, batch: null, label: "location", printed: new Date("2024-01-10"), by: "System" },
      { val: "LOC-ZONE-FG", type: "location", huCode: null, matCode: null, batch: null, label: "location", printed: new Date("2024-01-10"), by: "System" },
    ];

    const huCodeToId = Object.fromEntries(hus.map(h => [h.huCode, h.id]));
    const barcodeRecs: Barcode[] = barcodeData.map(b => ({
      id: randomUUID(),
      barcodeValue: b.val,
      barcodeType: b.type,
      linkedHuId: b.huCode ? (huCodeToId[b.huCode] || null) : null,
      linkedHuCode: b.huCode,
      materialCode: b.matCode,
      batchNumber: b.batch,
      status: "active",
      printedAt: b.printed,
      printedBy: b.by,
      labelType: b.label,
      notes: null,
      createdAt: b.printed,
    }));
    for (const bc of barcodeRecs) this.barcodesMap.set(bc.id, bc);

    // Seed Scan Exceptions
    const exTypes = [
      { type: "unknown_tag", scan: "rfid", val: "E200001892AA0000DEADBEEF", loc: "ZONE-DOOR-IN", locName: "Inbound Dock", desc: "RFID EPC not registered in tag registry", mat: null, batch: null },
      { type: "wrong_location", scan: "barcode", val: "PALT-00004", loc: "ZONE-FG", locName: "Finished Goods Zone", desc: "QC-held pallet PALT-00004 scanned at FG zone — movement blocked", mat: "RM-003", batch: "BT-2024-003" },
      { type: "hold_violation", scan: "rfid", val: "E2000018921802180C00602E", loc: "ZONE-DOOR-OUT", locName: "Outbound Dock", desc: "On-hold pallet attempted outbound scan without QC release", mat: "RM-004", batch: "BT-2024-004" },
      { type: "duplicate_scan", scan: "barcode", val: "CART-00010", loc: "ZONE-RM-A", locName: "Raw Materials Rack A", desc: "Barcode CART-00010 scanned twice within 5 minutes — possible double receive", mat: "PK-001", batch: "PK-2024-001" },
      { type: "no_shipment", scan: "rfid", val: "E2000018921802180C00602F", loc: "ZONE-DOOR-OUT", locName: "Outbound Dock", desc: "RFID tag detected at outbound dock but no active shipment order found", mat: "FG-002", batch: "FP-2024-002" },
      { type: "wrong_batch", scan: "barcode", val: "PALT-00002", loc: "ZONE-RM-A", locName: "Raw Materials Rack A", desc: "Scanned batch BT-2024-002 does not match production order requirement BT-2024-001", mat: "RM-002", batch: "BT-2024-002" },
    ];

    let excCounter = 1;
    const exceptions: ScanException[] = exTypes.map(e => ({
      id: randomUUID(),
      exceptionNumber: `EXC-${String(excCounter++).padStart(5, "0")}`,
      exceptionType: e.type,
      scanType: e.scan,
      scannedValue: e.val,
      readerId: null,
      locationCode: e.loc,
      locationName: e.locName,
      materialCode: e.mat,
      batchNumber: e.batch,
      description: e.desc,
      resolvedStatus: excCounter <= 3 ? "open" : excCounter === 4 ? "resolved" : "open",
      resolvedBy: excCounter === 4 ? "QC Manager" : null,
      resolvedAt: excCounter === 4 ? new Date("2024-04-08") : null,
      notes: null,
      scannedAt: new Date(now.getTime() - (excCounter * 3600000 * 8)),
      createdAt: new Date(now.getTime() - (excCounter * 3600000 * 8)),
    }));
    for (const ex of exceptions) this.scanExceptionsMap.set(ex.id, ex);
  }

  // Handling Unit implementations
  async getHandlingUnits(): Promise<HandlingUnit[]> {
    return Array.from(this.handlingUnitsMap.values()).sort((a, b) => a.huCode.localeCompare(b.huCode));
  }

  async getHandlingUnit(id: string): Promise<HandlingUnit | undefined> {
    return this.handlingUnitsMap.get(id);
  }

  async getHandlingUnitByCode(huCode: string): Promise<HandlingUnit | undefined> {
    return Array.from(this.handlingUnitsMap.values()).find(h => h.huCode === huCode);
  }

  async createHandlingUnit(data: InsertHandlingUnit): Promise<HandlingUnit> {
    const id = randomUUID();
    const now = new Date();
    const hu: HandlingUnit = { ...data, id, parentHuId: data.parentHuId || null, materialCode: data.materialCode || null, materialName: data.materialName || null, batchNumber: data.batchNumber || null, lotNumber: data.lotNumber || null, serialNumber: data.serialNumber || null, quantity: data.quantity || "0", uom: data.uom || "units", currentLocationCode: data.currentLocationCode || null, currentLocationName: data.currentLocationName || null, status: data.status || "available", barcodeValue: data.barcodeValue || null, rfidEpc: data.rfidEpc || null, supplierName: data.supplierName || null, receivedDate: data.receivedDate || null, notes: data.notes || null, createdAt: now, updatedAt: now };
    this.handlingUnitsMap.set(id, hu);
    return hu;
  }

  async updateHandlingUnit(id: string, data: Partial<InsertHandlingUnit>): Promise<HandlingUnit | undefined> {
    const existing = this.handlingUnitsMap.get(id);
    if (!existing) return undefined;
    const updated: HandlingUnit = { ...existing, ...data, updatedAt: new Date() };
    this.handlingUnitsMap.set(id, updated);
    return updated;
  }

  async deleteHandlingUnit(id: string): Promise<boolean> {
    return this.handlingUnitsMap.delete(id);
  }

  // Barcode implementations
  async getBarcodes(): Promise<Barcode[]> {
    return Array.from(this.barcodesMap.values()).sort((a, b) => a.barcodeValue.localeCompare(b.barcodeValue));
  }

  async getBarcode(id: string): Promise<Barcode | undefined> {
    return this.barcodesMap.get(id);
  }

  async getBarcodeByValue(value: string): Promise<Barcode | undefined> {
    return Array.from(this.barcodesMap.values()).find(b => b.barcodeValue === value);
  }

  async createBarcode(data: InsertBarcode): Promise<Barcode> {
    const id = randomUUID();
    const now = new Date();
    const bc: Barcode = { ...data, id, linkedHuId: data.linkedHuId || null, linkedHuCode: data.linkedHuCode || null, materialCode: data.materialCode || null, batchNumber: data.batchNumber || null, status: data.status || "active", printedAt: data.printedAt || now, printedBy: data.printedBy || null, labelType: data.labelType || null, notes: data.notes || null, createdAt: now };
    this.barcodesMap.set(id, bc);
    return bc;
  }

  async updateBarcode(id: string, data: Partial<InsertBarcode>): Promise<Barcode | undefined> {
    const existing = this.barcodesMap.get(id);
    if (!existing) return undefined;
    const updated: Barcode = { ...existing, ...data };
    this.barcodesMap.set(id, updated);
    return updated;
  }

  // Scan Exception implementations
  async getScanExceptions(): Promise<ScanException[]> {
    return Array.from(this.scanExceptionsMap.values()).sort((a, b) => new Date(b.scannedAt!).getTime() - new Date(a.scannedAt!).getTime());
  }

  async getScanException(id: string): Promise<ScanException | undefined> {
    return this.scanExceptionsMap.get(id);
  }

  async createScanException(data: InsertScanException): Promise<ScanException> {
    const id = randomUUID();
    const now = new Date();
    const ex: ScanException = { ...data, id, readerId: data.readerId || null, locationCode: data.locationCode || null, locationName: data.locationName || null, materialCode: data.materialCode || null, batchNumber: data.batchNumber || null, resolvedStatus: data.resolvedStatus || "open", resolvedBy: data.resolvedBy || null, resolvedAt: data.resolvedAt || null, notes: data.notes || null, scannedAt: data.scannedAt || now, scannedValue: data.scannedValue || null, createdAt: now };
    this.scanExceptionsMap.set(id, ex);
    return ex;
  }

  async resolveScanException(id: string, resolvedBy: string, notes?: string): Promise<ScanException | undefined> {
    const existing = this.scanExceptionsMap.get(id);
    if (!existing) return undefined;
    const updated: ScanException = { ...existing, resolvedStatus: "resolved", resolvedBy, resolvedAt: new Date(), notes: notes || existing.notes };
    this.scanExceptionsMap.set(id, updated);
    return updated;
  }

  async getTraceabilityStats(): Promise<{ totalHUs: number; activeBarcodes: number; openExceptions: number; totalMovements: number; }> {
    const hus = Array.from(this.handlingUnitsMap.values());
    const barcodes = Array.from(this.barcodesMap.values());
    const exceptions = Array.from(this.scanExceptionsMap.values());
    const movements = Array.from(this.movementLedgerMap.values());
    return {
      totalHUs: hus.length,
      activeBarcodes: barcodes.filter(b => b.status === "active").length,
      openExceptions: exceptions.filter(e => e.resolvedStatus === "open").length,
      totalMovements: movements.length,
    };
  }

  // Movement Ledger implementations
  async getMovementLedger(): Promise<MovementLedgerEntry[]> {
    return Array.from(this.movementLedgerMap.values()).sort((a, b) => new Date(b.movedAt!).getTime() - new Date(a.movedAt!).getTime());
  }

  async getMovementsByHuCode(huCode: string): Promise<MovementLedgerEntry[]> {
    return Array.from(this.movementLedgerMap.values())
      .filter(m => m.huCode === huCode)
      .sort((a, b) => new Date(b.movedAt!).getTime() - new Date(a.movedAt!).getTime());
  }

  async getMovementsByBatch(batchNumber: string): Promise<MovementLedgerEntry[]> {
    return Array.from(this.movementLedgerMap.values())
      .filter(m => m.batchNumber === batchNumber)
      .sort((a, b) => new Date(b.movedAt!).getTime() - new Date(a.movedAt!).getTime());
  }

  async getMovementsBySourceDoc(docNumber: string): Promise<MovementLedgerEntry[]> {
    return Array.from(this.movementLedgerMap.values())
      .filter(m => m.sourceDocNumber === docNumber)
      .sort((a, b) => new Date(b.movedAt!).getTime() - new Date(a.movedAt!).getTime());
  }

  async createMovementEntry(data: InsertMovementLedger): Promise<MovementLedgerEntry> {
    const id = randomUUID();
    const now = new Date();
    this.movementCounter++;
    const movementNumber = data.movementNumber || `MVT-${String(this.movementCounter).padStart(6, "0")}`;
    const entry: MovementLedgerEntry = {
      id,
      movementNumber,
      movementType: data.movementType,
      huId: data.huId || null,
      huCode: data.huCode || null,
      huType: data.huType || null,
      materialCode: data.materialCode || null,
      materialName: data.materialName || null,
      batchNumber: data.batchNumber || null,
      lotNumber: data.lotNumber || null,
      quantity: data.quantity || "0",
      uom: data.uom || null,
      fromLocationCode: data.fromLocationCode || null,
      fromLocationName: data.fromLocationName || null,
      toLocationCode: data.toLocationCode || null,
      toLocationName: data.toLocationName || null,
      sourceDocType: data.sourceDocType || null,
      sourceDocNumber: data.sourceDocNumber || null,
      scanMethod: data.scanMethod || "manual",
      performedBy: data.performedBy || null,
      statusBefore: data.statusBefore || null,
      statusAfter: data.statusAfter || null,
      notes: data.notes || null,
      movedAt: data.movedAt || now,
      createdAt: now,
    };
    this.movementLedgerMap.set(id, entry);
    return entry;
  }

  async searchTraceability(query: string): Promise<{ handlingUnits: HandlingUnit[]; barcodes: Barcode[]; movements: MovementLedgerEntry[]; }> {
    const q = query.toLowerCase().trim();
    if (!q) return { handlingUnits: [], barcodes: [], movements: [] };
    const hus = Array.from(this.handlingUnitsMap.values()).filter(h =>
      h.huCode.toLowerCase().includes(q) ||
      (h.materialCode ?? "").toLowerCase().includes(q) ||
      (h.materialName ?? "").toLowerCase().includes(q) ||
      (h.batchNumber ?? "").toLowerCase().includes(q) ||
      (h.lotNumber ?? "").toLowerCase().includes(q) ||
      (h.rfidEpc ?? "").toLowerCase().includes(q) ||
      (h.barcodeValue ?? "").toLowerCase().includes(q)
    );
    const bcs = Array.from(this.barcodesMap.values()).filter(b =>
      b.barcodeValue.toLowerCase().includes(q) ||
      (b.materialCode ?? "").toLowerCase().includes(q) ||
      (b.batchNumber ?? "").toLowerCase().includes(q) ||
      (b.linkedHuCode ?? "").toLowerCase().includes(q)
    );
    const mvts = Array.from(this.movementLedgerMap.values()).filter(m =>
      (m.huCode ?? "").toLowerCase().includes(q) ||
      (m.materialCode ?? "").toLowerCase().includes(q) ||
      (m.batchNumber ?? "").toLowerCase().includes(q) ||
      (m.sourceDocNumber ?? "").toLowerCase().includes(q) ||
      (m.fromLocationName ?? "").toLowerCase().includes(q) ||
      (m.toLocationName ?? "").toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.movedAt!).getTime() - new Date(a.movedAt!).getTime());
    return { handlingUnits: hus, barcodes: bcs, movements: mvts };
  }

  // ── Supplier Master ──────────────────────────────────────────────────────────
  // SOP: SUP-001 — Supplier Master Data Entry; approved by QA Manager 2026-01-15
  private initializeSupplierData(): void {
    const supplierSeed: Supplier[] = [
      { id: "sup1",  supplierCode: "SUP-001", name: "SHREEBHAN PACKAGING PVT LTD", category: "Packaging Material", contactPerson: "Rajesh Sharma", email: "rajesh@shreebhan.com", phone: "+91-9876543210", address: "Plot 42, GIDC Naroda, Ahmedabad - 382330", country: "India", rating: "4.8", onTimeDelivery: "96.5", qualityScore: "98.2", totalOrders: 142, totalValue: "2850000.00", status: "active", blockedReason: null, notes: "Primary foil & blister packaging supplier", createdAt: new Date('2024-01-10'), updatedAt: new Date('2026-03-20') },
      { id: "sup2",  supplierCode: "SUP-002", name: "RKE FOIL INDUSTRIES",           category: "Packaging Material", contactPerson: "Ketan Patel",   email: "ketan@rkefoil.com",    phone: "+91-9898765432", address: "B-12, Anand Industrial Estate, Anand - 388001",  country: "India", rating: "4.5", onTimeDelivery: "93.0", qualityScore: "95.0", totalOrders: 98,  totalValue: "1920000.00", status: "active", blockedReason: null, notes: "ALU-ALU and plain foil rolls", createdAt: new Date('2024-02-05'), updatedAt: new Date('2026-03-15') },
      { id: "sup3",  supplierCode: "SUP-003", name: "SJ INDUSTRIES",                  category: "Packaging Material", contactPerson: "Suresh Joshi",  email: "suresh@sjind.com",    phone: "+91-9765432109", address: "14, Phase-II, IDA Jeedimetla, Hyderabad - 500055", country: "India", rating: "4.2", onTimeDelivery: "90.0", qualityScore: "93.5", totalOrders: 67,  totalValue: "875000.00",  status: "active", blockedReason: null, notes: "Carton and secondary packaging", createdAt: new Date('2024-03-12'), updatedAt: new Date('2026-02-28') },
      { id: "sup4",  supplierCode: "SUP-004", name: "MEDIPACK SOLUTIONS LLP",         category: "Packaging Material", contactPerson: "Anita Verma",   email: "anita@medipack.in",   phone: "+91-9654321098", address: "C-45, Bhiwandi Warehouse District, Mumbai - 421302", country: "India", rating: "4.6", onTimeDelivery: "94.5", qualityScore: "96.8", totalOrders: 54,  totalValue: "650000.00",  status: "active", blockedReason: null, notes: "Polypropylene containers and HDPE bottles", createdAt: new Date('2024-04-01'), updatedAt: new Date('2026-03-10') },
      { id: "sup5",  supplierCode: "SUP-005", name: "AARAV PHARMA CHEMICALS",         category: "Active Pharmaceutical Ingredient", contactPerson: "Dr. Ravi Kulkarni", email: "ravi@aaravpharma.com", phone: "+91-9543210987", address: "211-B, TTC Industrial Area, Navi Mumbai - 400706", country: "India", rating: "4.9", onTimeDelivery: "97.0", qualityScore: "99.1", totalOrders: 210, totalValue: "12500000.00", status: "active", blockedReason: null, notes: "Primary API supplier — Cefixime, Pantoprazole, Ofloxacin. CoA verified batch-wise. NABL accredited.", createdAt: new Date('2023-11-20'), updatedAt: new Date('2026-03-25') },
      { id: "sup6",  supplierCode: "SUP-006", name: "SUNRISE EXCIPIENTS PVT LTD",    category: "Raw Material",       contactPerson: "Mehul Shah",    email: "mehul@sunriseexc.com",phone: "+91-9432109876", address: "Shed 7, Vatva GIDC, Ahmedabad - 382445",          country: "India", rating: "4.3", onTimeDelivery: "91.5", qualityScore: "94.2", totalOrders: 176, totalValue: "4300000.00", status: "active", blockedReason: null, notes: "Paracetamol, Nimesulide, Levofloxacin API and excipients", createdAt: new Date('2024-01-25'), updatedAt: new Date('2026-03-18') },
      { id: "sup7",  supplierCode: "SUP-007", name: "NATIONAL EXCIPIENTS CORP",       category: "Excipient",          contactPerson: "Pooja Nair",    email: "pooja@natexc.com",    phone: "+91-9321098765", address: "77, SIDCO Industrial Estate, Chennai - 600098",    country: "India", rating: "4.7", onTimeDelivery: "95.5", qualityScore: "97.3", totalOrders: 321, totalValue: "8750000.00", status: "active", blockedReason: null, notes: "MCC, HPMC, Starch, Talc, Croscarmellose. Master supplier for excipients. GDP-certified.", createdAt: new Date('2023-09-15'), updatedAt: new Date('2026-03-22') },
      { id: "sup8",  supplierCode: "SUP-008", name: "ECOPACK PRINTERS & CARTONS",     category: "Packaging Material", contactPerson: "Deepak Tiwari", email: "deepak@ecopack.in",   phone: "+91-9210987654", address: "Industrial Area Phase-1, Baddi - 173205, Himachal Pradesh", country: "India", rating: "4.0", onTimeDelivery: "88.5", qualityScore: "91.0", totalOrders: 45, totalValue: "320000.00",  status: "active", blockedReason: null, notes: "Mono cartons, shippers, and leaflet printing", createdAt: new Date('2024-06-10'), updatedAt: new Date('2026-01-30') },
      { id: "sup9",  supplierCode: "SUP-009", name: "CAPSUGEL INDIA PVT LTD",         category: "Packaging Material", contactPerson: "Nikhil Bose",   email: "nikhil@capsugel.in",  phone: "+91-9109876543", address: "12th Floor, DLF Cyber City, Gurugram - 122002",   country: "India", rating: "4.8", onTimeDelivery: "96.0", qualityScore: "98.5", totalOrders: 88,  totalValue: "2100000.00", status: "active", blockedReason: null, notes: "Hard gelatin capsule shells — size 0, 1, 2. HPMC variants available. FDA-approved.", createdAt: new Date('2024-02-18'), updatedAt: new Date('2026-03-12') },
      { id: "sup10", supplierCode: "SUP-010", name: "CHEM INDIA SUPPLIES",            category: "Raw Material",       contactPerson: "Vaibhav Doshi", email: "vaibhav@chemindia.com",phone: "+91-9098765432", address: "B-301, Sarabhai Chemicals Campus, Vadodara - 391740", country: "India", rating: "3.5", onTimeDelivery: "78.0", qualityScore: "82.0", totalOrders: 32,  totalValue: "185000.00",  status: "blocked", blockedReason: "Repeated out-of-spec CoA reports (Lot#CI-2025-08, CI-2025-11). Under CAPA review per SOP QA-012.", notes: "Blocked pending CAPA closure", createdAt: new Date('2024-08-01'), updatedAt: new Date('2026-02-10') },
    ];
    supplierSeed.forEach(s => this.suppliersMap.set(s.id, s));
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliersMap.get(id);
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    const id = `sup${Date.now()}`;
    const supplier: Supplier = { ...data, id, createdAt: new Date(), updatedAt: new Date() } as Supplier;
    this.suppliersMap.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliersMap.get(id);
    if (!existing) return undefined;
    const updated: Supplier = { ...existing, ...data, updatedAt: new Date() };
    this.suppliersMap.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliersMap.delete(id);
  }

  async getSupplierStats(): Promise<{ total: number; active: number; blocked: number; avgRating: number; }> {
    const all = Array.from(this.suppliersMap.values());
    const active = all.filter(s => s.status === "active").length;
    const blocked = all.filter(s => s.status === "blocked").length;
    const avgRating = all.length > 0 ? all.reduce((sum, s) => sum + parseFloat(s.rating ?? "0"), 0) / all.length : 0;
    return { total: all.length, active, blocked, avgRating: parseFloat(avgRating.toFixed(1)) };
  }
}

export const storage = new MemStorage();
