import { type Material, type InsertMaterial, type UpdateMaterial, type TestConfig, type InsertTestConfig, type TestResult, type InsertTestResult, type TestInstruction, type InsertTestInstruction, type Sop, type InsertSop, type SopVersion, type InsertSopVersion } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;
  private testConfigs: Map<string, TestConfig>;
  private testResults: Map<string, TestResult>;
  private testInstructions: Map<string, TestInstruction>;
  private sops: Map<string, Sop>;
  private sopVersions: Map<string, SopVersion[]>;

  constructor() {
    this.materials = new Map();
    this.testConfigs = new Map();
    this.testResults = new Map();
    this.testInstructions = new Map();
    this.sops = new Map();
    this.sopVersions = new Map();
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
}

export const storage = new MemStorage();
