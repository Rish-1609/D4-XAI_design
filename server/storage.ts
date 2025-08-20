import { type Material, type InsertMaterial, type UpdateMaterial, type TestConfig, type InsertTestConfig, type TestResult, type InsertTestResult, type TestInstruction, type InsertTestInstruction, type Sop, type InsertSop, type SopVersion, type InsertSopVersion, type Capa, type InsertCapa, type CapaAction, type InsertCapaAction, type ProductionOrder, type InsertProductionOrder, type Bom, type InsertBom, type BomMaterial, type InsertBomMaterial, type BomSubAssembly, type InsertBomSubAssembly, type InventoryItem, type InsertInventoryItem, type StockMovement, type InsertStockMovement } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;
  private testConfigs: Map<string, TestConfig>;
  private testResults: Map<string, TestResult>;
  private testInstructions: Map<string, TestInstruction>;
  private sops: Map<string, Sop>;
  private sopVersions: Map<string, SopVersion[]>;
  private productionOrders: Map<string, ProductionOrder>;
  private boms: Map<string, Bom>;
  private bomMaterials: Map<string, BomMaterial[]>;
  private bomSubAssemblies: Map<string, BomSubAssembly[]>;
  private capas: Map<string, Capa>;
  private capaActions: Map<string, CapaAction[]>;
  private inventoryItems: Map<string, InventoryItem>;
  private stockMovements: Map<string, StockMovement[]>;

  constructor() {
    this.materials = new Map();
    this.testConfigs = new Map();
    this.testResults = new Map();
    this.testInstructions = new Map();
    this.sops = new Map();
    this.sopVersions = new Map();
    this.productionOrders = new Map();
    this.boms = new Map();
    this.bomMaterials = new Map();
    this.bomSubAssemblies = new Map();
    this.capas = new Map();
    this.capaActions = new Map();
    this.inventoryItems = new Map();
    this.stockMovements = new Map();
    this.initializeDummyData();
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
  private initializeDummyData() {
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
      createdAt: now,
      updatedAt: now,
    };
    this.productionOrders.set(id, productionOrder);
    return productionOrder;
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
    for (const movements of this.stockMovements.values()) {
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
}

export const storage = new MemStorage();
