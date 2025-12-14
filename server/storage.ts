import { type Material, type InsertMaterial, type UpdateMaterial, type TestConfig, type InsertTestConfig, type TestResult, type InsertTestResult, type TestInstruction, type InsertTestInstruction, type Sop, type InsertSop, type SopVersion, type InsertSopVersion, type SopChangeRequest, type InsertSopChangeRequest, type Capa, type InsertCapa, type CapaAction, type InsertCapaAction, type ProductionOrder, type InsertProductionOrder, type Bom, type InsertBom, type BomMaterial, type InsertBomMaterial, type BomSubAssembly, type InsertBomSubAssembly, type BomChangeRequest, type InsertBomChangeRequest, type InventoryItem, type InsertInventoryItem, type StockMovement, type InsertStockMovement, type QcStage, type InsertQcStage, type QcCheckpoint, type InsertQcCheckpoint, type QcTestResult, type InsertQcTestResult, type QcApproval, type InsertQcApproval, type BatchRelease, type InsertBatchRelease, type BatchWorkflowStep, type InsertBatchWorkflowStep, type BatchCertificate, type InsertBatchCertificate, type QaAuditTrail, type InsertQaAuditTrail, type QcStageTemplate, type InsertQcStageTemplate, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type ProductionBatch, type InsertProductionBatch, type BatchStage, type InsertBatchStage, type BatchExecution, type InsertBatchExecution, type JobWork, type InsertJobWork, type BatchReview, type InsertBatchReview } from "@shared/schema";
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
    this.initializeDummyData().catch(console.error);
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
    
    // Add sample BOM data
    const bomData = [
      {
        id: "bom1",
        bomNumber: "000001",
        productName: "MEFECUM-P SYP",
        version: "1.0",
        status: "Active" as const,
        totalCost: 260700, // ₹2607.00 in paise
        shelfLifeDays: 730, // 2 years shelf life
        approvedBy: "admin@pharma.com",
        createdBy: "system",
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-25'),
      },
      {
        id: "bom2",
        bomNumber: "000002",
        productName: "LEVOCIDAL-500",
        version: "1.0",
        status: "Active" as const,
        totalCost: 338800, // ₹3388.00 in paise
        shelfLifeDays: 1095, // 3 years shelf life
        approvedBy: "admin@pharma.com",
        createdBy: "system",
        createdAt: new Date('2024-08-22'),
        updatedAt: new Date('2024-08-25'),
      },
      {
        id: "bom3",
        bomNumber: "000003",
        productName: "ZEN RSR PLUS(RED)",
        version: "1.0",
        status: "Active" as const,
        totalCost: 346900, // ₹3469.00 in paise
        shelfLifeDays: 1460, // 4 years shelf life
        approvedBy: "admin@pharma.com",
        createdBy: "system",
        createdAt: new Date('2024-08-18'),
        updatedAt: new Date('2024-08-20'),
      }
    ];

    bomData.forEach(bom => this.boms.set(bom.id, bom));
    
    // Add sample BOM materials data
    const bomMaterialsData = [
      // BOM 1 materials (MEFECUM-P SYP)
      {
        id: "bm1",
        bomId: "bom1",
        materialId: "m1", // Reference to existing material
        materialCode: "RM0305",
        materialName: "Paracetamol Active Ingredient",
        quantity: 1000, // 1 Lt with precision
        uom: "KG",
        unitCost: 9400, // ₹94.00 in paise
        scrapPercentage: 100, // 1% with precision (1% * 100)
        totalCost: 9494, // ₹94.94 in paise (including scrap)
        shelfLifeDays: 1095, // 3 years shelf life
        createdAt: new Date('2024-08-20'),
      },
      {
        id: "bm2",
        bomId: "bom1",
        materialId: "m2",
        materialCode: "SM0004",
        materialName: "Sucrose Sugar Base",
        quantity: 500, // 0.5 KG
        uom: "KG",
        unitCost: 4900, // ₹49.00 in paise
        scrapPercentage: 200, // 2%
        totalCost: 4998, // ₹49.98 in paise
        shelfLifeDays: 365, // 1 year shelf life
        createdAt: new Date('2024-08-20'),
      },
      {
        id: "bm3",
        bomId: "bom1",
        materialId: null,
        materialCode: "RM0002",
        materialName: "Flavoring Agent Cherry",
        quantity: 60, // 60g converted to grams with precision
        uom: "KG",
        unitCost: 10900, // ₹109.00 in paise
        scrapPercentage: 300, // 3%
        totalCost: 11227, // ₹112.27 in paise
        shelfLifeDays: 545, // 1.5 years shelf life
        createdAt: new Date('2024-08-20'),
      },
      {
        id: "bm4",
        bomId: "bom1",
        materialId: null,
        materialCode: "RM0001",
        materialName: "Preservative Sodium Benzoate",
        quantity: 10, // 10g
        uom: "KG",
        unitCost: 7250, // ₹72.50 in paise
        scrapPercentage: 400, // 4%
        totalCost: 7540, // ₹75.40 in paise
        shelfLifeDays: 1825, // 5 years shelf life
        createdAt: new Date('2024-08-20'),
      },
      {
        id: "bm5",
        bomId: "bom1",
        materialId: null,
        materialCode: "RM0004",
        materialName: "Citric Acid Stabilizer",
        quantity: 5, // 5g
        uom: "KG",
        unitCost: 4800, // ₹48.00 in paise
        scrapPercentage: 200, // 2%
        totalCost: 4896, // ₹48.96 in paise
        shelfLifeDays: 730, // 2 years shelf life
        createdAt: new Date('2024-08-20'),
      }
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
}

export const storage = new MemStorage();
