import { type Material, type InsertMaterial, type UpdateMaterial, type TestConfig, type InsertTestConfig, type TestResult, type InsertTestResult, type TestInstruction, type InsertTestInstruction } from "@shared/schema";
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

  // Test Instructions operations
  getTestInstructions(): Promise<TestInstruction[]>;
  getTestInstructionsByMaterialType(materialType: string): Promise<TestInstruction[]>;
  createTestInstruction(testInstruction: InsertTestInstruction): Promise<TestInstruction>;
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;
  private testConfigs: Map<string, TestConfig>;
  private testResults: Map<string, TestResult>;
  private testInstructions: Map<string, TestInstruction>;

  constructor() {
    this.materials = new Map();
    this.testConfigs = new Map();
    this.testResults = new Map();
    this.testInstructions = new Map();
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

    let newStatus: string;
    
    if (failedTests > 0) {
      newStatus = 'failed';
    } else if (pendingTests > 0) {
      newStatus = 'under-testing';
    } else if (passedTests === testResults.length) {
      newStatus = 'approved';
    } else {
      newStatus = 'ready-for-qc';
    }

    // Update material status
    const updatedMaterial = { ...material, status: newStatus, updatedAt: new Date() };
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
    
    const approved = allMaterials.filter(m => m.status === 'approved').length;
    const pending = allMaterials.filter(m => m.status === 'pending' || m.status === 'ready-for-qc').length;
    const failed = allMaterials.filter(m => m.status === 'failed').length;
    const underTesting = allMaterials.filter(m => m.status === 'under-testing').length;
    
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

    // Add pharma materials
    const materialData = [
      {
        id: "m1",
        name: "Acetaminophen USP",
        description: "Active pharmaceutical ingredient for pain relief tablets",
        code: "API-ACET-001",
        type: "raw-materials",
        category: "Active Ingredient",
        status: "ready-for-qc",
        stock: 250,
        score: null,
        referenceNumber: "RM-240825-001",
        batchNumber: "ACT240825A",
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
        status: "approved",
        stock: 500,
        score: 98,
        referenceNumber: "RM-240820-002",
        batchNumber: "MCC240820B",
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
        status: "ready-for-qc",
        stock: 100000,
        score: null,
        referenceNumber: "PM-240822-003",
        batchNumber: "HPM240822C",
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
        status: "approved",
        stock: 10000,
        score: 99,
        referenceNumber: "FP-240823-004",
        batchNumber: "TAB240823D",
        supplierName: "Internal Manufacturing",
        receiptDate: new Date('2024-08-23'),
        expiryDate: new Date('2026-08-23'),
        storageConditions: "Store at 15-30°C, protect from light and moisture",
        createdAt: new Date('2024-08-23'),
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

    // Add some test results
    const testResultData = [
      {
        id: "tr1",
        materialId: "m2", // MCC - already approved
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
        materialId: "m1", // Acetaminophen - under testing
        testConfigId: "tc1", // Assay
        resultValue: "99.2%",
        status: "passed",
        testedBy: "Dr. Michael Chen",
        testedDate: new Date('2024-08-26'),
        remarks: "Assay results within specification",
        retestCount: 0,
        createdAt: new Date('2024-08-26'),
        updatedAt: new Date('2024-08-26'),
      }
    ];

    testResultData.forEach(result => this.testResults.set(result.id, result));
  }
}

export const storage = new MemStorage();
