import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMaterialSchema, updateMaterialSchema, insertTestConfigSchema, insertTestResultSchema, insertTestInstructionSchema, insertSopSchema, insertSopChangeRequestSchema, insertProductionOrderSchema, insertBomSchema, insertBomItemSchema, insertInventoryItemSchema, insertInventoryTransactionSchema, insertCapaSchema, insertProductionBatchSchema, insertBatchStageSchema, insertBatchExecutionSchema, insertJobWorkSchema, insertBatchReviewSchema, insertEquipmentSchema, insertProductionJobSchema, insertJobCardSchema, insertChartOfAccountsSchema, insertCostCenterSchema, insertProfitCenterSchema, insertTaxCodeSchema, insertPaymentTermsSchema, insertFiscalYearSchema, insertFiscalPeriodSchema, insertPartySchema, insertFinancialDocumentSchema, insertDocumentLineSchema, insertPaymentSchema, insertGlJournalSchema, insertGlJournalLineSchema, insertRfidZoneSchema, insertRfidReaderSchema, insertRfidTagSchema, insertRfidEventSchema, insertHandlingUnitSchema, insertBarcodeSchema, insertScanExceptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all materials
  app.get("/api/materials", async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  // Get materials by type
  app.get("/api/materials/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const materials = await storage.getMaterialsByType(type);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials by type" });
    }
  });

  // Get single material
  app.get("/api/materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch material" });
    }
  });

  // Create material
  app.post("/api/materials", async (req, res) => {
    try {
      const validatedData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  // Update material
  app.put("/api/materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateMaterialSchema.parse(req.body);
      const material = await storage.updateMaterial(id, validatedData);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update material" });
    }
  });

  // Delete material
  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMaterial(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // Get quality statistics
  app.get("/api/quality-stats", async (req, res) => {
    try {
      const stats = await storage.getQualityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quality statistics" });
    }
  });

  // Test Configuration Routes
  app.get("/api/test-configs", async (req, res) => {
    try {
      const testConfigs = await storage.getTestConfigs();
      res.json(testConfigs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test configurations" });
    }
  });

  app.post("/api/test-configs", async (req, res) => {
    try {
      const validatedData = insertTestConfigSchema.parse(req.body);
      const testConfig = await storage.createTestConfig(validatedData);
      res.status(201).json(testConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test config data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test configuration" });
    }
  });

  // Test Results Routes
  app.get("/api/test-results", async (req, res) => {
    try {
      const testResults = await storage.getTestResults();
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  app.get("/api/test-results/material/:materialId", async (req, res) => {
    try {
      const { materialId } = req.params;
      const testResults = await storage.getTestResultsByMaterial(materialId);
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results for material" });
    }
  });

  app.post("/api/test-results", async (req, res) => {
    try {
      const validatedData = insertTestResultSchema.parse(req.body);
      const testResult = await storage.createTestResult(validatedData);
      res.status(201).json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test result" });
    }
  });

  app.put("/api/test-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTestResultSchema.partial().parse(req.body);
      
      const updatedResult = await storage.updateTestResult(id, validatedData);
      
      if (!updatedResult) {
        return res.status(404).json({ message: "Test result not found" });
      }
      
      res.json(updatedResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update test result" });
    }
  });

  // Test Instructions Routes
  app.get("/api/test-instructions", async (req, res) => {
    try {
      const testInstructions = await storage.getTestInstructions();
      res.json(testInstructions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test instructions" });
    }
  });

  app.get("/api/test-instructions/material-type/:materialType", async (req, res) => {
    try {
      const { materialType } = req.params;
      const testInstructions = await storage.getTestInstructionsByMaterialType(materialType);
      res.json(testInstructions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test instructions for material type" });
    }
  });

  app.post("/api/test-instructions", async (req, res) => {
    try {
      const validatedData = insertTestInstructionSchema.parse(req.body);
      const testInstruction = await storage.createTestInstruction(validatedData);
      res.status(201).json(testInstruction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test instruction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test instruction" });
    }
  });

  // SOP Management Routes
  app.get("/api/sops", async (req, res) => {
    try {
      const { category } = req.query;
      let sops;
      if (category && typeof category === 'string') {
        sops = await storage.getSopsByCategory(category);
      } else {
        sops = await storage.getSops();
      }
      res.json(sops);
    } catch (error) {
      console.error("Error fetching SOPs:", error);
      res.status(500).json({ error: "Failed to fetch SOPs" });
    }
  });

  app.get("/api/sops/:id", async (req, res) => {
    try {
      const sop = await storage.getSop(req.params.id);
      if (!sop) {
        return res.status(404).json({ error: "SOP not found" });
      }
      res.json(sop);
    } catch (error) {
      console.error("Error fetching SOP:", error);
      res.status(500).json({ error: "Failed to fetch SOP" });
    }
  });

  app.post("/api/sops", async (req, res) => {
    try {
      const validatedData = insertSopSchema.parse(req.body);
      const sop = await storage.createSop(validatedData);
      res.json(sop);
    } catch (error) {
      console.error("Error creating SOP:", error);
      res.status(400).json({ error: "Invalid SOP data" });
    }
  });

  app.patch("/api/sops/:id", async (req, res) => {
    try {
      const sop = await storage.updateSop(req.params.id, req.body);
      if (!sop) {
        return res.status(404).json({ error: "SOP not found" });
      }
      res.json(sop);
    } catch (error) {
      console.error("Error updating SOP:", error);
      res.status(400).json({ error: "Invalid SOP data" });
    }
  });

  app.delete("/api/sops/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSop(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "SOP not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting SOP:", error);
      res.status(500).json({ error: "Failed to delete SOP" });
    }
  });

  app.get("/api/sops/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getSopVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      console.error("Error fetching SOP versions:", error);
      res.status(500).json({ error: "Failed to fetch SOP versions" });
    }
  });

  // SOP Change Request routes
  app.get("/api/sop-change-requests", async (req, res) => {
    try {
      const { sopId } = req.query;
      let changeRequests;
      if (sopId && typeof sopId === 'string') {
        changeRequests = await storage.getSopChangeRequestsBySop(sopId);
      } else {
        changeRequests = await storage.getSopChangeRequests();
      }
      res.json(changeRequests);
    } catch (error) {
      console.error("Error fetching SOP change requests:", error);
      res.status(500).json({ error: "Failed to fetch SOP change requests" });
    }
  });

  app.get("/api/sop-change-requests/:id", async (req, res) => {
    try {
      const changeRequest = await storage.getSopChangeRequest(req.params.id);
      if (!changeRequest) {
        return res.status(404).json({ error: "Change request not found" });
      }
      res.json(changeRequest);
    } catch (error) {
      console.error("Error fetching change request:", error);
      res.status(500).json({ error: "Failed to fetch change request" });
    }
  });

  app.post("/api/sop-change-requests", async (req, res) => {
    try {
      const validatedData = insertSopChangeRequestSchema.parse(req.body);
      const changeRequest = await storage.createSopChangeRequest(validatedData);
      res.status(201).json(changeRequest);
    } catch (error) {
      console.error("Error creating change request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid change request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create change request" });
    }
  });

  app.patch("/api/sop-change-requests/:id", async (req, res) => {
    try {
      const changeRequest = await storage.updateSopChangeRequest(req.params.id, req.body);
      if (!changeRequest) {
        return res.status(404).json({ error: "Change request not found" });
      }
      res.json(changeRequest);
    } catch (error) {
      console.error("Error updating change request:", error);
      res.status(500).json({ error: "Failed to update change request" });
    }
  });

  app.post("/api/sop-change-requests/:id/approve", async (req, res) => {
    try {
      const { approvedBy, reviewComments } = req.body;
      if (!approvedBy) {
        return res.status(400).json({ error: "approvedBy is required" });
      }
      
      const changeRequest = await storage.approveSopChangeRequest(req.params.id, {
        approvedBy,
        reviewComments
      });
      
      if (!changeRequest) {
        return res.status(404).json({ error: "Change request not found" });
      }
      
      res.json(changeRequest);
    } catch (error) {
      console.error("Error approving change request:", error);
      res.status(500).json({ error: "Failed to approve change request" });
    }
  });

  app.post("/api/sop-change-requests/:id/reject", async (req, res) => {
    try {
      const { rejectedBy, rejectionReason } = req.body;
      if (!rejectedBy || !rejectionReason) {
        return res.status(400).json({ error: "rejectedBy and rejectionReason are required" });
      }
      
      const changeRequest = await storage.rejectSopChangeRequest(req.params.id, {
        rejectedBy,
        rejectionReason
      });
      
      if (!changeRequest) {
        return res.status(404).json({ error: "Change request not found" });
      }
      
      res.json(changeRequest);
    } catch (error) {
      console.error("Error rejecting change request:", error);
      res.status(500).json({ error: "Failed to reject change request" });
    }
  });

  // Object storage routes for file uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getSopDocumentUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Serve SOP documents
  app.get("/objects/sop-documents/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getSopDocumentFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing SOP document:", error);
      if (error instanceof (await import("./objectStorage")).ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // CAPA Management Routes
  app.get("/api/capas", async (req, res) => {
    try {
      const capas = await storage.getCapas();
      res.json(capas);
    } catch (error) {
      console.error("Error fetching CAPAs:", error);
      res.status(500).json({ error: "Failed to fetch CAPAs" });
    }
  });

  app.post("/api/capas", async (req, res) => {
    try {
      const capa = await storage.createCapa(req.body);
      res.status(201).json(capa);
    } catch (error) {
      console.error("Error creating CAPA:", error);
      res.status(500).json({ error: "Failed to create CAPA" });
    }
  });

  app.get("/api/capas/:id", async (req, res) => {
    try {
      const capa = await storage.getCapa(req.params.id);
      if (!capa) {
        return res.status(404).json({ error: "CAPA not found" });
      }
      res.json(capa);
    } catch (error) {
      console.error("Error fetching CAPA:", error);
      res.status(500).json({ error: "Failed to fetch CAPA" });
    }
  });

  app.patch("/api/capas/:id", async (req, res) => {
    try {
      const capa = await storage.updateCapa(req.params.id, req.body);
      if (!capa) {
        return res.status(404).json({ error: "CAPA not found" });
      }
      res.json(capa);
    } catch (error) {
      console.error("Error updating CAPA:", error);
      res.status(500).json({ error: "Failed to update CAPA" });
    }
  });

  app.delete("/api/capas/:id", async (req, res) => {
    try {
      const success = await storage.deleteCapa(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "CAPA not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting CAPA:", error);
      res.status(500).json({ error: "Failed to delete CAPA" });
    }
  });

  app.get("/api/capas/:id/actions", async (req, res) => {
    try {
      const actions = await storage.getCapaActions(req.params.id);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching CAPA actions:", error);
      res.status(500).json({ error: "Failed to fetch CAPA actions" });
    }
  });

  // BOM Management Routes
  app.get("/api/boms", async (req, res) => {
    try {
      const boms = await storage.getBoms();
      res.json(boms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOMs" });
    }
  });

  app.get("/api/boms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bom = await storage.getBom(id);
      
      if (!bom) {
        return res.status(404).json({ message: "BOM not found" });
      }
      
      res.json(bom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM" });
    }
  });

  app.post("/api/boms", async (req, res) => {
    try {
      const validatedData = insertBomSchema.parse(req.body);
      const bom = await storage.createBom(validatedData);
      res.status(201).json(bom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid BOM data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create BOM" });
    }
  });

  app.put("/api/boms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBomSchema.partial().parse(req.body);
      const bom = await storage.updateBom(id, validatedData);
      
      if (!bom) {
        return res.status(404).json({ message: "BOM not found" });
      }
      
      res.json(bom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid BOM data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update BOM" });
    }
  });

  app.delete("/api/boms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBom(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "BOM not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete BOM" });
    }
  });

  app.get("/api/boms/:id/materials", async (req, res) => {
    try {
      const { id } = req.params;
      const materials = await storage.getBomMaterials(id);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM materials" });
    }
  });

  app.post("/api/boms/:id/materials", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBomMaterialSchema.parse({ ...req.body, bomId: id });
      const material = await storage.createBomMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid BOM material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create BOM material" });
    }
  });

  app.get("/api/boms/:id/sub-assemblies", async (req, res) => {
    try {
      const { id } = req.params;
      const subAssemblies = await storage.getBomSubAssemblies(id);
      res.json(subAssemblies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM sub-assemblies" });
    }
  });

  app.post("/api/boms/:id/sub-assemblies", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBomSubAssemblySchema.parse({ ...req.body, bomId: id });
      const subAssembly = await storage.createBomSubAssembly(validatedData);
      res.status(201).json(subAssembly);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid BOM sub-assembly data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create BOM sub-assembly" });
    }
  });

  app.get("/api/bom-stats", async (req, res) => {
    try {
      const stats = await storage.getBomStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM statistics" });
    }
  });

  // BOM Change Request Routes
  app.get("/api/bom-change-requests", async (req, res) => {
    try {
      const changeRequests = await storage.getBomChangeRequests();
      res.json(changeRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM change requests" });
    }
  });

  app.get("/api/bom-change-requests/:bomId", async (req, res) => {
    try {
      const { bomId } = req.params;
      const changeRequests = await storage.getBomChangeRequestsByBom(bomId);
      res.json(changeRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch BOM change requests" });
    }
  });

  app.post("/api/bom-change-requests", async (req, res) => {
    try {
      const validatedData = insertBomChangeRequestSchema.parse(req.body);
      const changeRequest = await storage.createBomChangeRequest(validatedData);
      res.status(201).json(changeRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid change request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create change request" });
    }
  });

  app.post("/api/bom-change-requests/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedBy, reviewComments } = req.body;
      
      if (!approvedBy) {
        return res.status(400).json({ message: "approvedBy is required" });
      }

      const changeRequest = await storage.approveBomChangeRequest(id, { approvedBy, reviewComments });
      
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found or cannot be approved" });
      }
      
      res.json(changeRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve change request" });
    }
  });

  app.post("/api/bom-change-requests/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectedBy, rejectionReason } = req.body;
      
      if (!rejectedBy || !rejectionReason) {
        return res.status(400).json({ message: "rejectedBy and rejectionReason are required" });
      }

      const changeRequest = await storage.rejectBomChangeRequest(id, { rejectedBy, rejectionReason });
      
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found or cannot be rejected" });
      }
      
      res.json(changeRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject change request" });
    }
  });

  // Inventory Management Routes
  app.get("/api/inventory-items", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.get("/api/inventory-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getInventoryItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory-items", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, validatedData);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInventoryItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  app.get("/api/inventory-stats", async (req, res) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory statistics" });
    }
  });

  // Stock Movement Routes
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const movements = await storage.getStockMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.get("/api/stock-movements/item/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const movements = await storage.getStockMovementsByItem(itemId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements for item" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const validatedData = insertStockMovementSchema.parse(req.body);
      const movement = await storage.createStockMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stock movement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });

  // Production Order Routes
  app.get("/api/production-orders", async (req, res) => {
    try {
      const orders = await storage.getProductionOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production orders" });
    }
  });

  app.get("/api/production-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getProductionOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Production order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production order" });
    }
  });

  app.post("/api/production-orders", async (req, res) => {
    try {
      const validatedData = insertProductionOrderSchema.parse(req.body);
      const order = await storage.createProductionOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid production order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create production order" });
    }
  });

  app.put("/api/production-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductionOrderSchema.partial().parse(req.body);
      const order = await storage.updateProductionOrder(id, validatedData);
      
      if (!order) {
        return res.status(404).json({ message: "Production order not found" });
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid production order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update production order" });
    }
  });

  app.delete("/api/production-orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProductionOrder(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Production order not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete production order" });
    }
  });

  // Quality Assurance Management Routes

  // QC Stage Routes
  app.get("/api/qc-stages", async (req, res) => {
    try {
      const stages = await storage.getQcStages();
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC stages" });
    }
  });

  app.get("/api/qc-stages/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const stages = await storage.getQcStagesByOrder(orderId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC stages for order" });
    }
  });

  app.get("/api/qc-stages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const stage = await storage.getQcStage(id);
      
      if (!stage) {
        return res.status(404).json({ message: "QC stage not found" });
      }
      
      res.json(stage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC stage" });
    }
  });

  app.post("/api/qc-stages", async (req, res) => {
    try {
      const validatedData = insertQcStageSchema.parse(req.body);
      const stage = await storage.createQcStage(validatedData);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QC stage" });
    }
  });

  app.patch("/api/qc-stages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertQcStageSchema.partial().parse(req.body);
      const stage = await storage.updateQcStage(id, validatedData);
      
      if (!stage) {
        return res.status(404).json({ message: "QC stage not found" });
      }
      
      res.json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update QC stage" });
    }
  });

  app.delete("/api/qc-stages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQcStage(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "QC stage not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QC stage" });
    }
  });

  // QC Checkpoint Routes
  app.get("/api/qc-checkpoints", async (req, res) => {
    try {
      const checkpoints = await storage.getQcCheckpoints();
      res.json(checkpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC checkpoints" });
    }
  });

  app.get("/api/qc-checkpoints/stage/:stageId", async (req, res) => {
    try {
      const { stageId } = req.params;
      const checkpoints = await storage.getQcCheckpointsByStage(stageId);
      res.json(checkpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC checkpoints for stage" });
    }
  });

  app.get("/api/qc-checkpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const checkpoint = await storage.getQcCheckpoint(id);
      
      if (!checkpoint) {
        return res.status(404).json({ message: "QC checkpoint not found" });
      }
      
      res.json(checkpoint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC checkpoint" });
    }
  });

  app.post("/api/qc-checkpoints", async (req, res) => {
    try {
      const validatedData = insertQcCheckpointSchema.parse(req.body);
      const checkpoint = await storage.createQcCheckpoint(validatedData);
      res.status(201).json(checkpoint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC checkpoint data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QC checkpoint" });
    }
  });

  app.patch("/api/qc-checkpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertQcCheckpointSchema.partial().parse(req.body);
      const checkpoint = await storage.updateQcCheckpoint(id, validatedData);
      
      if (!checkpoint) {
        return res.status(404).json({ message: "QC checkpoint not found" });
      }
      
      res.json(checkpoint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC checkpoint data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update QC checkpoint" });
    }
  });

  app.delete("/api/qc-checkpoints/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQcCheckpoint(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "QC checkpoint not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QC checkpoint" });
    }
  });

  // QC Test Result Routes
  app.get("/api/qc-test-results", async (req, res) => {
    try {
      const testResults = await storage.getQcTestResults();
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC test results" });
    }
  });

  app.get("/api/qc-test-results/checkpoint/:checkpointId", async (req, res) => {
    try {
      const { checkpointId } = req.params;
      const testResults = await storage.getQcTestResultsByCheckpoint(checkpointId);
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC test results for checkpoint" });
    }
  });

  app.get("/api/qc-test-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const testResult = await storage.getQcTestResult(id);
      
      if (!testResult) {
        return res.status(404).json({ message: "QC test result not found" });
      }
      
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC test result" });
    }
  });

  app.post("/api/qc-test-results", async (req, res) => {
    try {
      const validatedData = insertQcTestResultSchema.parse(req.body);
      const testResult = await storage.createQcTestResult(validatedData);
      res.status(201).json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC test result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QC test result" });
    }
  });

  app.patch("/api/qc-test-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertQcTestResultSchema.partial().parse(req.body);
      const testResult = await storage.updateQcTestResult(id, validatedData);
      
      if (!testResult) {
        return res.status(404).json({ message: "QC test result not found" });
      }
      
      res.json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC test result data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update QC test result" });
    }
  });

  app.delete("/api/qc-test-results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQcTestResult(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "QC test result not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QC test result" });
    }
  });

  // QC Approval Routes
  app.get("/api/qc-approvals", async (req, res) => {
    try {
      const approvals = await storage.getQcApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC approvals" });
    }
  });

  app.get("/api/qc-approvals/stage/:stageId", async (req, res) => {
    try {
      const { stageId } = req.params;
      const approvals = await storage.getQcApprovalsByStage(stageId);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC approvals for stage" });
    }
  });

  app.get("/api/qc-approvals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const approval = await storage.getQcApproval(id);
      
      if (!approval) {
        return res.status(404).json({ message: "QC approval not found" });
      }
      
      res.json(approval);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC approval" });
    }
  });

  app.post("/api/qc-approvals", async (req, res) => {
    try {
      const validatedData = insertQcApprovalSchema.parse(req.body);
      const approval = await storage.createQcApproval(validatedData);
      
      // Create audit trail for approval
      await storage.createQaAuditTrail({
        entityType: 'QcApproval',
        entityId: approval.id,
        action: 'APPROVAL_CREATED',
        performedBy: validatedData.approverName,
        newValues: JSON.stringify({ 
          decision: validatedData.decision,
          checkpointId: validatedData.checkpointId 
        })
      });
      
      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QC approval" });
    }
  });

  app.patch("/api/qc-approvals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertQcApprovalSchema.partial().parse(req.body);
      const approval = await storage.updateQcApproval(id, validatedData);
      
      if (!approval) {
        return res.status(404).json({ message: "QC approval not found" });
      }
      
      res.json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update QC approval" });
    }
  });

  app.delete("/api/qc-approvals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQcApproval(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "QC approval not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QC approval" });
    }
  });

  // Batch Release Routes
  app.get("/api/batch-releases", async (req, res) => {
    try {
      const batchReleases = await storage.getBatchReleases();
      res.json(batchReleases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch releases" });
    }
  });

  app.get("/api/batch-releases/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const batchReleases = await storage.getBatchReleasesByOrder(orderId);
      res.json(batchReleases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch releases for order" });
    }
  });

  app.get("/api/batch-releases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const batchRelease = await storage.getBatchRelease(id);
      
      if (!batchRelease) {
        return res.status(404).json({ message: "Batch release not found" });
      }
      
      res.json(batchRelease);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch release" });
    }
  });

  app.post("/api/batch-releases", async (req, res) => {
    try {
      const validatedData = insertBatchReleaseSchema.parse(req.body);
      const batchRelease = await storage.createBatchRelease(validatedData);
      
      // Create audit trail for batch release
      await storage.createQaAuditTrail({
        entityType: 'BatchRelease',
        entityId: batchRelease.id,
        action: 'BATCH_RELEASE_CREATED',
        performedBy: 'QA Reviewer',
        newValues: JSON.stringify({ 
          productionOrderId: validatedData.productionOrderId,
          batchNumber: validatedData.batchNumber 
        })
      });
      
      res.status(201).json(batchRelease);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch release data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create batch release" });
    }
  });

  app.patch("/api/batch-releases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBatchReleaseSchema.partial().parse(req.body);
      const batchRelease = await storage.updateBatchRelease(id, validatedData);
      
      if (!batchRelease) {
        return res.status(404).json({ message: "Batch release not found" });
      }
      
      // Create audit trail for status changes
      if (validatedData.releaseStatus) {
        await storage.createQaAuditTrail({
          entityType: 'BatchRelease',
          entityId: id,
          action: 'QA_DECISION_MADE',
          performedBy: 'QA Manager',
          newValues: JSON.stringify({ 
            status: validatedData.releaseStatus,
            qaReview: validatedData.qaReview 
          })
        });
      }
      
      res.json(batchRelease);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch release data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update batch release" });
    }
  });

  app.delete("/api/batch-releases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBatchRelease(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Batch release not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete batch release" });
    }
  });

  // Batch Workflow Steps
  app.get("/api/batch-workflow-steps/batch/:batchReleaseId", async (req, res) => {
    try {
      const { batchReleaseId } = req.params;
      const workflowSteps = await storage.getBatchWorkflowStepsByBatch(batchReleaseId);
      res.json(workflowSteps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch workflow steps" });
    }
  });

  app.get("/api/batch-workflow-steps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const workflowStep = await storage.getBatchWorkflowStep(id);
      if (!workflowStep) {
        return res.status(404).json({ message: "Batch workflow step not found" });
      }
      res.json(workflowStep);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch workflow step" });
    }
  });

  app.patch("/api/batch-workflow-steps/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBatchWorkflowStepSchema.partial().parse(req.body);
      const updatedStep = await storage.updateBatchWorkflowStep(id, validatedData);
      if (!updatedStep) {
        return res.status(404).json({ message: "Batch workflow step not found" });
      }
      res.json(updatedStep);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch workflow step data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update batch workflow step" });
    }
  });

  app.post("/api/batch-workflow-steps/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      const updatedStep = await storage.updateBatchWorkflowStep(id, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      });
      if (!updatedStep) {
        return res.status(404).json({ message: "Batch workflow step not found" });
      }
      res.json(updatedStep);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve batch workflow step" });
    }
  });

  app.post("/api/batch-workflow-steps/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectedBy, rejectionReason } = req.body;
      const updatedStep = await storage.updateBatchWorkflowStep(id, {
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
      });
      if (!updatedStep) {
        return res.status(404).json({ message: "Batch workflow step not found" });
      }
      res.json(updatedStep);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject batch workflow step" });
    }
  });

  app.post("/api/batch-workflow-steps/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { findings, evidence, completedActions, actualHours, comments } = req.body;
      const updatedStep = await storage.updateBatchWorkflowStep(id, {
        status: 'completed',
        findings,
        evidence,
        completedActions,
        actualHours,
        comments,
        completedAt: new Date(),
      });
      if (!updatedStep) {
        return res.status(404).json({ message: "Batch workflow step not found" });
      }
      res.json(updatedStep);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete batch workflow step" });
    }
  });

  // Batch Certificate Routes
  app.get("/api/batch-certificates", async (req, res) => {
    try {
      const certificates = await storage.getBatchCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch certificates" });
    }
  });

  app.get("/api/batch-certificates/batch-release/:batchReleaseId", async (req, res) => {
    try {
      const { batchReleaseId } = req.params;
      const certificate = await storage.getBatchCertificateByBatchRelease(batchReleaseId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Batch certificate not found for batch release" });
      }
      
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch certificate" });
    }
  });

  app.get("/api/batch-certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await storage.getBatchCertificate(id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Batch certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch certificate" });
    }
  });

  app.post("/api/batch-certificates", async (req, res) => {
    try {
      const validatedData = insertBatchCertificateSchema.parse(req.body);
      const certificate = await storage.createBatchCertificate(validatedData);
      
      // Create audit trail for certificate generation
      await storage.createQaAuditTrail({
        entityType: 'BatchCertificate',
        entityId: certificate.id,
        action: 'CERTIFICATE_GENERATED',
        performedBy: validatedData.generatedBy,
        newValues: JSON.stringify({ 
          certificateNumber: validatedData.certificateNumber,
          batchReleaseId: validatedData.batchReleaseId 
        })
      });
      
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create batch certificate" });
    }
  });

  app.patch("/api/batch-certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBatchCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateBatchCertificate(id, validatedData);
      
      if (!certificate) {
        return res.status(404).json({ message: "Batch certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update batch certificate" });
    }
  });

  app.delete("/api/batch-certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBatchCertificate(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Batch certificate not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete batch certificate" });
    }
  });

  // QA Audit Trail Routes
  app.get("/api/qa-audit-trails", async (req, res) => {
    try {
      const auditTrails = await storage.getQaAuditTrails();
      res.json(auditTrails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA audit trails" });
    }
  });

  app.get("/api/qa-audit-trails/entity/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const auditTrails = await storage.getQaAuditTrailsByEntity(entityType, entityId);
      res.json(auditTrails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA audit trails for entity" });
    }
  });

  app.get("/api/qa-audit-trails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const auditTrail = await storage.getQaAuditTrail(id);
      
      if (!auditTrail) {
        return res.status(404).json({ message: "QA audit trail not found" });
      }
      
      res.json(auditTrail);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA audit trail" });
    }
  });

  app.post("/api/qa-audit-trails", async (req, res) => {
    try {
      const validatedData = insertQaAuditTrailSchema.parse(req.body);
      const auditTrail = await storage.createQaAuditTrail(validatedData);
      res.status(201).json(auditTrail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QA audit trail data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QA audit trail" });
    }
  });

  // QC Stage Template Routes
  app.get("/api/qc-stage-templates", async (req, res) => {
    try {
      const templates = await storage.getQcStageTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC stage templates" });
    }
  });

  app.get("/api/qc-stage-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getQcStageTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "QC stage template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QC stage template" });
    }
  });

  app.post("/api/qc-stage-templates", async (req, res) => {
    try {
      const validatedData = insertQcStageTemplateSchema.parse(req.body);
      const template = await storage.createQcStageTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC stage template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create QC stage template" });
    }
  });

  app.patch("/api/qc-stage-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertQcStageTemplateSchema.partial().parse(req.body);
      const template = await storage.updateQcStageTemplate(id, validatedData);
      
      if (!template) {
        return res.status(404).json({ message: "QC stage template not found" });
      }
      
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid QC stage template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update QC stage template" });
    }
  });

  app.delete("/api/qc-stage-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQcStageTemplate(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "QC stage template not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QC stage template" });
    }
  });

  // Chat endpoint for AI Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, mode, model } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Intelligent pharmaceutical-aware responses based on mode
      const pharmaResponses: Record<string, (msg: string) => string> = {
        ask: (msg: string) => {
          const responses = [
            `For your question about "${msg}", in pharmaceutical QC: This is critical for ensuring product quality. Key considerations include validation of test methods, proper documentation, and adherence to regulatory standards like ICH guidelines.`,
            `Regarding "${msg}": In our manufacturing environment, this falls under strict quality control protocols. We need to ensure batch traceability, proper storage conditions, and compliance with GMP standards.`,
            `Your question about "${msg}" is important for our QC process. We should reference our SOPs, conduct proper risk assessments, and maintain comprehensive audit trails for all critical operations.`,
          ];
          return responses[Math.floor(Math.random() * responses.length)];
        },
        agent: (msg: string) => {
          const responses = [
            `I'll analyze "${msg}" in the context of our pharmaceutical operations. Based on current batch data and quality metrics, the recommended approach would be to: 1) Verify against SOP standards, 2) Cross-reference with recent test results, 3) Document findings in audit trail, 4) Escalate if critical.`,
            `As an intelligent agent for "${msg}": I've reviewed our manufacturing data and quality checkpoints. This requires immediate attention following our batch release workflow. Let me prepare a comprehensive action plan.`,
            `Analyzing "${msg}" autonomously: This impacts our production schedule and quality gates. I recommend implementing additional controls, updating documentation, and scheduling a quality review meeting.`,
          ];
          return responses[Math.floor(Math.random() * responses.length)];
        },
        edit: (msg: string) => {
          const responses = [
            `I can refine "${msg}" to improve clarity and compliance. Suggested revision: "This material batch requires comprehensive quality testing including assay verification, dissolution testing, and stability assessment per current SOPs before release authorization."`,
            `Editing your text about "${msg}": Revised version: "The quality control process demands rigorous verification of all raw materials, in-process controls, and finished goods testing to ensure batch conformance and regulatory compliance throughout the manufacturing lifecycle."`,
            `Improved version of "${msg}": "Our pharmaceutical QC system implements multi-stage quality gates including material verification, process controls, finished goods testing, and batch release approvals to guarantee product integrity and patient safety."`,
          ];
          return responses[Math.floor(Math.random() * responses.length)];
        }
      };

      const handler = pharmaResponses[mode] || pharmaResponses.ask;
      const assistantMessage = handler(message);

      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  // ==================== PRODUCTION MANAGEMENT ROUTES ====================

  // Production Batches
  app.get("/api/production-batches", async (req, res) => {
    try {
      const batches = await storage.getProductionBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production batches" });
    }
  });

  app.get("/api/production-batches/:id", async (req, res) => {
    try {
      const batch = await storage.getProductionBatch(req.params.id);
      if (!batch) return res.status(404).json({ message: "Batch not found" });
      res.json(batch);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.post("/api/production-batches", async (req, res) => {
    try {
      const validatedData = insertProductionBatchSchema.parse(req.body);
      const batch = await storage.createProductionBatch(validatedData);
      res.status(201).json(batch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid batch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  app.patch("/api/production-batches/:id", async (req, res) => {
    try {
      const batch = await storage.updateProductionBatch(req.params.id, req.body);
      if (!batch) return res.status(404).json({ message: "Batch not found" });
      res.json(batch);
    } catch (error) {
      res.status(500).json({ message: "Failed to update batch" });
    }
  });

  app.delete("/api/production-batches/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProductionBatch(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Batch not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete batch" });
    }
  });

  // Batch Stages - supports both query param and path param
  app.get("/api/batch-stages", async (req, res) => {
    try {
      const { batchId } = req.query;
      if (!batchId || typeof batchId !== 'string') {
        return res.status(400).json({ message: "batchId query parameter is required" });
      }
      const stages = await storage.getBatchStages(batchId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch stages" });
    }
  });

  app.get("/api/batch-stages/batch/:batchId", async (req, res) => {
    try {
      const stages = await storage.getBatchStages(req.params.batchId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch stages" });
    }
  });

  app.post("/api/batch-stages", async (req, res) => {
    try {
      const validatedData = insertBatchStageSchema.parse(req.body);
      const stage = await storage.createBatchStage(validatedData);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stage" });
    }
  });

  app.patch("/api/batch-stages/:id", async (req, res) => {
    try {
      const stage = await storage.updateBatchStage(req.params.id, req.body);
      if (!stage) return res.status(404).json({ message: "Stage not found" });
      res.json(stage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stage" });
    }
  });

  // Batch Executions - supports both query param and path param
  app.get("/api/batch-executions", async (req, res) => {
    try {
      const { batchId } = req.query;
      if (!batchId || typeof batchId !== 'string') {
        return res.status(400).json({ message: "batchId query parameter is required" });
      }
      const executions = await storage.getBatchExecutions(batchId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch executions" });
    }
  });

  app.get("/api/batch-executions/batch/:batchId", async (req, res) => {
    try {
      const executions = await storage.getBatchExecutions(req.params.batchId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch executions" });
    }
  });

  app.post("/api/batch-executions", async (req, res) => {
    try {
      const validatedData = insertBatchExecutionSchema.parse(req.body);
      const execution = await storage.createBatchExecution(validatedData);
      res.status(201).json(execution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid execution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create execution record" });
    }
  });

  // Job Works
  app.get("/api/job-works", async (req, res) => {
    try {
      const jobWorks = await storage.getJobWorks();
      res.json(jobWorks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job works" });
    }
  });

  app.get("/api/job-works/:id", async (req, res) => {
    try {
      const jobWork = await storage.getJobWork(req.params.id);
      if (!jobWork) return res.status(404).json({ message: "Job work not found" });
      res.json(jobWork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job work" });
    }
  });

  app.post("/api/job-works", async (req, res) => {
    try {
      const validatedData = insertJobWorkSchema.parse(req.body);
      const jobWork = await storage.createJobWork(validatedData);
      res.status(201).json(jobWork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job work data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job work" });
    }
  });

  app.patch("/api/job-works/:id", async (req, res) => {
    try {
      const jobWork = await storage.updateJobWork(req.params.id, req.body);
      if (!jobWork) return res.status(404).json({ message: "Job work not found" });
      res.json(jobWork);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job work" });
    }
  });

  // Batch Reviews
  app.get("/api/batch-reviews", async (req, res) => {
    try {
      const reviews = await storage.getBatchReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch reviews" });
    }
  });

  app.get("/api/batch-reviews/:id", async (req, res) => {
    try {
      const review = await storage.getBatchReview(req.params.id);
      if (!review) return res.status(404).json({ message: "Batch review not found" });
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch review" });
    }
  });

  app.get("/api/batch-reviews/batch/:batchId", async (req, res) => {
    try {
      const review = await storage.getBatchReviewByBatchId(req.params.batchId);
      if (!review) return res.status(404).json({ message: "Batch review not found" });
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch batch review" });
    }
  });

  app.post("/api/batch-reviews", async (req, res) => {
    try {
      const validatedData = insertBatchReviewSchema.parse(req.body);
      const review = await storage.createBatchReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create batch review" });
    }
  });

  app.patch("/api/batch-reviews/:id", async (req, res) => {
    try {
      const review = await storage.updateBatchReview(req.params.id, req.body);
      if (!review) return res.status(404).json({ message: "Batch review not found" });
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to update batch review" });
    }
  });

  // =============== EQUIPMENT MANAGEMENT ===============
  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getEquipment();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/:id", async (req, res) => {
    try {
      const equipment = await storage.getEquipmentById(req.params.id);
      if (!equipment) return res.status(404).json({ message: "Equipment not found" });
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.get("/api/equipment/status/:status", async (req, res) => {
    try {
      const equipment = await storage.getEquipmentByStatus(req.params.status);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment by status" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.put("/api/equipment/:id", async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.partial().parse(req.body);
      const equipment = await storage.updateEquipment(req.params.id, validatedData);
      if (!equipment) return res.status(404).json({ message: "Equipment not found" });
      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update equipment" });
    }
  });

  app.delete("/api/equipment/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEquipment(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Equipment not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete equipment" });
    }
  });

  // =============== PRODUCTION JOBS ===============
  app.get("/api/production-jobs", async (req, res) => {
    try {
      const jobs = await storage.getProductionJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production jobs" });
    }
  });

  app.get("/api/production-jobs/:id", async (req, res) => {
    try {
      const job = await storage.getProductionJob(req.params.id);
      if (!job) return res.status(404).json({ message: "Production job not found" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production job" });
    }
  });

  app.get("/api/production-jobs/date-range/:start/:end", async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      const jobs = await storage.getProductionJobsByDateRange(startDate, endDate);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production jobs by date range" });
    }
  });

  app.get("/api/production-jobs/equipment/:equipmentId", async (req, res) => {
    try {
      const jobs = await storage.getProductionJobsByEquipment(req.params.equipmentId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch production jobs by equipment" });
    }
  });

  app.post("/api/production-jobs", async (req, res) => {
    try {
      const validatedData = insertProductionJobSchema.parse(req.body);
      const job = await storage.createProductionJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid production job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create production job" });
    }
  });

  app.put("/api/production-jobs/:id", async (req, res) => {
    try {
      const validatedData = insertProductionJobSchema.partial().parse(req.body);
      const job = await storage.updateProductionJob(req.params.id, validatedData);
      if (!job) return res.status(404).json({ message: "Production job not found" });
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid production job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update production job" });
    }
  });

  app.delete("/api/production-jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProductionJob(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Production job not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete production job" });
    }
  });

  // =============== JOB CARDS ===============
  app.get("/api/job-cards", async (req, res) => {
    try {
      const cards = await storage.getJobCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job cards" });
    }
  });

  app.get("/api/job-cards/:id", async (req, res) => {
    try {
      const card = await storage.getJobCard(req.params.id);
      if (!card) return res.status(404).json({ message: "Job card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job card" });
    }
  });

  app.get("/api/job-cards/job/:jobId", async (req, res) => {
    try {
      const cards = await storage.getJobCardsByJob(req.params.jobId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job cards by job" });
    }
  });

  app.get("/api/job-cards/batch/:batchId", async (req, res) => {
    try {
      const cards = await storage.getJobCardsByBatch(req.params.batchId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job cards by batch" });
    }
  });

  app.post("/api/job-cards", async (req, res) => {
    try {
      const validatedData = insertJobCardSchema.parse(req.body);
      const card = await storage.createJobCard(validatedData);
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job card data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job card" });
    }
  });

  app.put("/api/job-cards/:id", async (req, res) => {
    try {
      const validatedData = insertJobCardSchema.partial().parse(req.body);
      const card = await storage.updateJobCard(req.params.id, validatedData);
      if (!card) return res.status(404).json({ message: "Job card not found" });
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job card data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  app.patch("/api/job-cards/:id", async (req, res) => {
    try {
      const validatedData = insertJobCardSchema.partial().parse(req.body);
      const card = await storage.updateJobCard(req.params.id, validatedData);
      if (!card) return res.status(404).json({ message: "Job card not found" });
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job card data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  app.delete("/api/job-cards/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJobCard(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Job card not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job card" });
    }
  });

  // =============== FINANCE MODULE ROUTES ===============

  // Chart of Accounts
  app.get("/api/finance/chart-of-accounts", async (req, res) => {
    try {
      const accounts = await storage.getChartOfAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart of accounts" });
    }
  });

  app.get("/api/finance/chart-of-accounts/type/:type", async (req, res) => {
    try {
      const accounts = await storage.getChartOfAccountsByType(req.params.type);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts by type" });
    }
  });

  app.get("/api/finance/chart-of-accounts/:id", async (req, res) => {
    try {
      const account = await storage.getChartOfAccount(req.params.id);
      if (!account) return res.status(404).json({ message: "Account not found" });
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.post("/api/finance/chart-of-accounts", async (req, res) => {
    try {
      const validatedData = insertChartOfAccountsSchema.parse(req.body);
      const account = await storage.createChartOfAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/finance/chart-of-accounts/:id", async (req, res) => {
    try {
      const validatedData = insertChartOfAccountsSchema.partial().parse(req.body);
      const account = await storage.updateChartOfAccount(req.params.id, validatedData);
      if (!account) return res.status(404).json({ message: "Account not found" });
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/finance/chart-of-accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChartOfAccount(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Account not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Cost Centers
  app.get("/api/finance/cost-centers", async (req, res) => {
    try {
      const centers = await storage.getCostCenters();
      res.json(centers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

  app.get("/api/finance/cost-centers/:id", async (req, res) => {
    try {
      const center = await storage.getCostCenter(req.params.id);
      if (!center) return res.status(404).json({ message: "Cost center not found" });
      res.json(center);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost center" });
    }
  });

  app.post("/api/finance/cost-centers", async (req, res) => {
    try {
      const validatedData = insertCostCenterSchema.parse(req.body);
      const center = await storage.createCostCenter(validatedData);
      res.status(201).json(center);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cost center data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create cost center" });
    }
  });

  app.put("/api/finance/cost-centers/:id", async (req, res) => {
    try {
      const validatedData = insertCostCenterSchema.partial().parse(req.body);
      const center = await storage.updateCostCenter(req.params.id, validatedData);
      if (!center) return res.status(404).json({ message: "Cost center not found" });
      res.json(center);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cost center data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update cost center" });
    }
  });

  app.delete("/api/finance/cost-centers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCostCenter(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Cost center not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cost center" });
    }
  });

  // Profit Centers
  app.get("/api/finance/profit-centers", async (req, res) => {
    try {
      const centers = await storage.getProfitCenters();
      res.json(centers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profit centers" });
    }
  });

  app.get("/api/finance/profit-centers/:id", async (req, res) => {
    try {
      const center = await storage.getProfitCenter(req.params.id);
      if (!center) return res.status(404).json({ message: "Profit center not found" });
      res.json(center);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profit center" });
    }
  });

  app.post("/api/finance/profit-centers", async (req, res) => {
    try {
      const validatedData = insertProfitCenterSchema.parse(req.body);
      const center = await storage.createProfitCenter(validatedData);
      res.status(201).json(center);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profit center data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profit center" });
    }
  });

  app.put("/api/finance/profit-centers/:id", async (req, res) => {
    try {
      const validatedData = insertProfitCenterSchema.partial().parse(req.body);
      const center = await storage.updateProfitCenter(req.params.id, validatedData);
      if (!center) return res.status(404).json({ message: "Profit center not found" });
      res.json(center);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profit center data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profit center" });
    }
  });

  app.delete("/api/finance/profit-centers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProfitCenter(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Profit center not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete profit center" });
    }
  });

  // Tax Codes
  app.get("/api/finance/tax-codes", async (req, res) => {
    try {
      const codes = await storage.getTaxCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tax codes" });
    }
  });

  app.get("/api/finance/tax-codes/:id", async (req, res) => {
    try {
      const code = await storage.getTaxCode(req.params.id);
      if (!code) return res.status(404).json({ message: "Tax code not found" });
      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tax code" });
    }
  });

  app.post("/api/finance/tax-codes", async (req, res) => {
    try {
      const validatedData = insertTaxCodeSchema.parse(req.body);
      const code = await storage.createTaxCode(validatedData);
      res.status(201).json(code);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tax code data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tax code" });
    }
  });

  app.put("/api/finance/tax-codes/:id", async (req, res) => {
    try {
      const validatedData = insertTaxCodeSchema.partial().parse(req.body);
      const code = await storage.updateTaxCode(req.params.id, validatedData);
      if (!code) return res.status(404).json({ message: "Tax code not found" });
      res.json(code);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tax code data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tax code" });
    }
  });

  app.delete("/api/finance/tax-codes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTaxCode(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Tax code not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tax code" });
    }
  });

  // Payment Terms
  app.get("/api/finance/payment-terms", async (req, res) => {
    try {
      const terms = await storage.getPaymentTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment terms" });
    }
  });

  app.get("/api/finance/payment-terms/:id", async (req, res) => {
    try {
      const term = await storage.getPaymentTerm(req.params.id);
      if (!term) return res.status(404).json({ message: "Payment term not found" });
      res.json(term);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment term" });
    }
  });

  app.post("/api/finance/payment-terms", async (req, res) => {
    try {
      const validatedData = insertPaymentTermsSchema.parse(req.body);
      const term = await storage.createPaymentTerms(validatedData);
      res.status(201).json(term);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment terms data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment terms" });
    }
  });

  app.put("/api/finance/payment-terms/:id", async (req, res) => {
    try {
      const validatedData = insertPaymentTermsSchema.partial().parse(req.body);
      const term = await storage.updatePaymentTerms(req.params.id, validatedData);
      if (!term) return res.status(404).json({ message: "Payment term not found" });
      res.json(term);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment terms data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment terms" });
    }
  });

  app.delete("/api/finance/payment-terms/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePaymentTerms(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Payment term not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment terms" });
    }
  });

  // Fiscal Years
  app.get("/api/finance/fiscal-years", async (req, res) => {
    try {
      const years = await storage.getFiscalYears();
      res.json(years);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fiscal years" });
    }
  });

  app.get("/api/finance/fiscal-years/active", async (req, res) => {
    try {
      const year = await storage.getActiveFiscalYear();
      if (!year) return res.status(404).json({ message: "No active fiscal year" });
      res.json(year);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active fiscal year" });
    }
  });

  app.get("/api/finance/fiscal-years/:id", async (req, res) => {
    try {
      const year = await storage.getFiscalYear(req.params.id);
      if (!year) return res.status(404).json({ message: "Fiscal year not found" });
      res.json(year);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fiscal year" });
    }
  });

  app.post("/api/finance/fiscal-years", async (req, res) => {
    try {
      const validatedData = insertFiscalYearSchema.parse(req.body);
      const year = await storage.createFiscalYear(validatedData);
      res.status(201).json(year);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fiscal year data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fiscal year" });
    }
  });

  app.put("/api/finance/fiscal-years/:id", async (req, res) => {
    try {
      const validatedData = insertFiscalYearSchema.partial().parse(req.body);
      const year = await storage.updateFiscalYear(req.params.id, validatedData);
      if (!year) return res.status(404).json({ message: "Fiscal year not found" });
      res.json(year);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fiscal year data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update fiscal year" });
    }
  });

  app.delete("/api/finance/fiscal-years/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFiscalYear(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Fiscal year not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fiscal year" });
    }
  });

  // Fiscal Periods
  app.get("/api/finance/fiscal-periods/year/:yearId", async (req, res) => {
    try {
      const periods = await storage.getFiscalPeriods(req.params.yearId);
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fiscal periods" });
    }
  });

  app.get("/api/finance/fiscal-periods/open", async (req, res) => {
    try {
      const periods = await storage.getOpenFiscalPeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch open fiscal periods" });
    }
  });

  app.get("/api/finance/fiscal-periods/:id", async (req, res) => {
    try {
      const period = await storage.getFiscalPeriod(req.params.id);
      if (!period) return res.status(404).json({ message: "Fiscal period not found" });
      res.json(period);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fiscal period" });
    }
  });

  app.post("/api/finance/fiscal-periods", async (req, res) => {
    try {
      const validatedData = insertFiscalPeriodSchema.parse(req.body);
      const period = await storage.createFiscalPeriod(validatedData);
      res.status(201).json(period);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fiscal period data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fiscal period" });
    }
  });

  app.put("/api/finance/fiscal-periods/:id", async (req, res) => {
    try {
      const validatedData = insertFiscalPeriodSchema.partial().parse(req.body);
      const period = await storage.updateFiscalPeriod(req.params.id, validatedData);
      if (!period) return res.status(404).json({ message: "Fiscal period not found" });
      res.json(period);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fiscal period data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update fiscal period" });
    }
  });

  app.delete("/api/finance/fiscal-periods/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFiscalPeriod(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Fiscal period not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fiscal period" });
    }
  });

  // Parties (Vendors & Customers)
  app.get("/api/finance/parties", async (req, res) => {
    try {
      const parties = await storage.getParties();
      res.json(parties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parties" });
    }
  });

  app.get("/api/finance/parties/type/:type", async (req, res) => {
    try {
      const parties = await storage.getPartiesByType(req.params.type);
      res.json(parties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parties by type" });
    }
  });

  app.get("/api/finance/parties/:id", async (req, res) => {
    try {
      const party = await storage.getParty(req.params.id);
      if (!party) return res.status(404).json({ message: "Party not found" });
      res.json(party);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch party" });
    }
  });

  app.post("/api/finance/parties", async (req, res) => {
    try {
      const validatedData = insertPartySchema.parse(req.body);
      const party = await storage.createParty(validatedData);
      res.status(201).json(party);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid party data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create party" });
    }
  });

  app.put("/api/finance/parties/:id", async (req, res) => {
    try {
      const validatedData = insertPartySchema.partial().parse(req.body);
      const party = await storage.updateParty(req.params.id, validatedData);
      if (!party) return res.status(404).json({ message: "Party not found" });
      res.json(party);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid party data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update party" });
    }
  });

  app.delete("/api/finance/parties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteParty(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Party not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete party" });
    }
  });

  // Financial Documents (Invoices, Credit Notes, etc.)
  app.get("/api/finance/documents", async (req, res) => {
    try {
      const docs = await storage.getFinancialDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial documents" });
    }
  });

  app.get("/api/finance/documents/type/:type", async (req, res) => {
    try {
      const docs = await storage.getFinancialDocumentsByType(req.params.type);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents by type" });
    }
  });

  app.get("/api/finance/documents/party/:partyId", async (req, res) => {
    try {
      const docs = await storage.getFinancialDocumentsByParty(req.params.partyId);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents by party" });
    }
  });

  app.get("/api/finance/documents/:id", async (req, res) => {
    try {
      const doc = await storage.getFinancialDocument(req.params.id);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/finance/documents", async (req, res) => {
    try {
      const validatedData = insertFinancialDocumentSchema.parse(req.body);
      const doc = await storage.createFinancialDocument(validatedData);
      res.status(201).json(doc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/finance/documents/:id", async (req, res) => {
    try {
      const validatedData = insertFinancialDocumentSchema.partial().parse(req.body);
      const doc = await storage.updateFinancialDocument(req.params.id, validatedData);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      res.json(doc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/finance/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFinancialDocument(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Document not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Document Lines
  app.get("/api/finance/documents/:docId/lines", async (req, res) => {
    try {
      const lines = await storage.getDocumentLines(req.params.docId);
      res.json(lines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document lines" });
    }
  });

  app.post("/api/finance/document-lines", async (req, res) => {
    try {
      const validatedData = insertDocumentLineSchema.parse(req.body);
      const line = await storage.createDocumentLine(validatedData);
      res.status(201).json(line);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid line data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document line" });
    }
  });

  app.put("/api/finance/document-lines/:id", async (req, res) => {
    try {
      const validatedData = insertDocumentLineSchema.partial().parse(req.body);
      const line = await storage.updateDocumentLine(req.params.id, validatedData);
      if (!line) return res.status(404).json({ message: "Line not found" });
      res.json(line);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid line data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update document line" });
    }
  });

  app.delete("/api/finance/document-lines/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocumentLine(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Line not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document line" });
    }
  });

  // Payments
  app.get("/api/finance/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/finance/payments/party/:partyId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByParty(req.params.partyId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments by party" });
    }
  });

  app.get("/api/finance/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  app.post("/api/finance/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/finance/payments/:id", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(req.params.id, validatedData);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/finance/payments/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePayment(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Payment not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // GL Journals
  app.get("/api/finance/gl-journals", async (req, res) => {
    try {
      const journals = await storage.getGlJournals();
      res.json(journals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GL journals" });
    }
  });

  app.get("/api/finance/gl-journals/period/:periodId", async (req, res) => {
    try {
      const journals = await storage.getGlJournalsByPeriod(req.params.periodId);
      res.json(journals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journals by period" });
    }
  });

  app.get("/api/finance/gl-journals/:id", async (req, res) => {
    try {
      const journal = await storage.getGlJournal(req.params.id);
      if (!journal) return res.status(404).json({ message: "Journal not found" });
      res.json(journal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal" });
    }
  });

  app.post("/api/finance/gl-journals", async (req, res) => {
    try {
      const validatedData = insertGlJournalSchema.parse(req.body);
      const journal = await storage.createGlJournal(validatedData);
      res.status(201).json(journal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal" });
    }
  });

  app.put("/api/finance/gl-journals/:id", async (req, res) => {
    try {
      const validatedData = insertGlJournalSchema.partial().parse(req.body);
      const journal = await storage.updateGlJournal(req.params.id, validatedData);
      if (!journal) return res.status(404).json({ message: "Journal not found" });
      res.json(journal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal" });
    }
  });

  app.delete("/api/finance/gl-journals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGlJournal(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Journal not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal" });
    }
  });

  // GL Journal Lines
  app.get("/api/finance/gl-journals/:journalId/lines", async (req, res) => {
    try {
      const lines = await storage.getGlJournalLines(req.params.journalId);
      res.json(lines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal lines" });
    }
  });

  app.post("/api/finance/gl-journal-lines", async (req, res) => {
    try {
      const validatedData = insertGlJournalLineSchema.parse(req.body);
      const line = await storage.createGlJournalLine(validatedData);
      res.status(201).json(line);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid line data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal line" });
    }
  });

  app.put("/api/finance/gl-journal-lines/:id", async (req, res) => {
    try {
      const validatedData = insertGlJournalLineSchema.partial().parse(req.body);
      const line = await storage.updateGlJournalLine(req.params.id, validatedData);
      if (!line) return res.status(404).json({ message: "Line not found" });
      res.json(line);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid line data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal line" });
    }
  });

  app.delete("/api/finance/gl-journal-lines/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGlJournalLine(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Line not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete journal line" });
    }
  });

  // Finance Analytics
  app.get("/api/finance/analytics/account-balance/:accountId", async (req, res) => {
    try {
      const balance = await storage.getAccountBalance(req.params.accountId);
      res.json(balance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account balance" });
    }
  });

  app.get("/api/finance/analytics/trial-balance/:periodId", async (req, res) => {
    try {
      const trialBalance = await storage.getTrialBalance(req.params.periodId);
      res.json(trialBalance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trial balance" });
    }
  });

  app.get("/api/finance/analytics/aging-report/:partyType", async (req, res) => {
    try {
      const aging = await storage.getAgingReport(req.params.partyType);
      res.json(aging);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch aging report" });
    }
  });

  // ==================== RFID Tracking Routes ====================

  // RFID Stats
  app.get("/api/rfid/stats", async (req, res) => {
    try {
      const stats = await storage.getRfidStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID stats" });
    }
  });

  // RFID Zones
  app.get("/api/rfid/zones", async (req, res) => {
    try {
      res.json(await storage.getRfidZones());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID zones" });
    }
  });

  app.get("/api/rfid/zones/:id", async (req, res) => {
    try {
      const zone = await storage.getRfidZone(req.params.id);
      if (!zone) return res.status(404).json({ message: "Zone not found" });
      res.json(zone);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch zone" });
    }
  });

  app.post("/api/rfid/zones", async (req, res) => {
    try {
      const data = insertRfidZoneSchema.parse(req.body);
      res.status(201).json(await storage.createRfidZone(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid zone data", errors: error.errors });
      res.status(500).json({ message: "Failed to create zone" });
    }
  });

  app.put("/api/rfid/zones/:id", async (req, res) => {
    try {
      const data = insertRfidZoneSchema.partial().parse(req.body);
      const zone = await storage.updateRfidZone(req.params.id, data);
      if (!zone) return res.status(404).json({ message: "Zone not found" });
      res.json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid zone data", errors: error.errors });
      res.status(500).json({ message: "Failed to update zone" });
    }
  });

  app.delete("/api/rfid/zones/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRfidZone(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Zone not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete zone" });
    }
  });

  // RFID Readers
  app.get("/api/rfid/readers", async (req, res) => {
    try {
      res.json(await storage.getRfidReaders());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID readers" });
    }
  });

  app.get("/api/rfid/readers/:id", async (req, res) => {
    try {
      const reader = await storage.getRfidReader(req.params.id);
      if (!reader) return res.status(404).json({ message: "Reader not found" });
      res.json(reader);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reader" });
    }
  });

  app.post("/api/rfid/readers", async (req, res) => {
    try {
      const data = insertRfidReaderSchema.parse(req.body);
      res.status(201).json(await storage.createRfidReader(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid reader data", errors: error.errors });
      res.status(500).json({ message: "Failed to create reader" });
    }
  });

  app.put("/api/rfid/readers/:id", async (req, res) => {
    try {
      const data = insertRfidReaderSchema.partial().parse(req.body);
      const reader = await storage.updateRfidReader(req.params.id, data);
      if (!reader) return res.status(404).json({ message: "Reader not found" });
      res.json(reader);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid reader data", errors: error.errors });
      res.status(500).json({ message: "Failed to update reader" });
    }
  });

  app.delete("/api/rfid/readers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRfidReader(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Reader not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reader" });
    }
  });

  // RFID Tags
  app.get("/api/rfid/tags", async (req, res) => {
    try {
      res.json(await storage.getRfidTags());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID tags" });
    }
  });

  app.get("/api/rfid/tags/epc/:epc", async (req, res) => {
    try {
      const tag = await storage.getRfidTagByEpc(req.params.epc);
      if (!tag) return res.status(404).json({ message: "Tag not found" });
      res.json(tag);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tag" });
    }
  });

  app.get("/api/rfid/tags/:id", async (req, res) => {
    try {
      const tag = await storage.getRfidTag(req.params.id);
      if (!tag) return res.status(404).json({ message: "Tag not found" });
      res.json(tag);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tag" });
    }
  });

  app.post("/api/rfid/tags", async (req, res) => {
    try {
      const data = insertRfidTagSchema.parse(req.body);
      res.status(201).json(await storage.createRfidTag(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  app.put("/api/rfid/tags/:id", async (req, res) => {
    try {
      const data = insertRfidTagSchema.partial().parse(req.body);
      const tag = await storage.updateRfidTag(req.params.id, data);
      if (!tag) return res.status(404).json({ message: "Tag not found" });
      res.json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      res.status(500).json({ message: "Failed to update tag" });
    }
  });

  app.delete("/api/rfid/tags/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRfidTag(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Tag not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });

  // RFID Events
  app.get("/api/rfid/events", async (req, res) => {
    try {
      res.json(await storage.getRfidEvents());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID events" });
    }
  });

  app.get("/api/rfid/events/tag/:tagId", async (req, res) => {
    try {
      res.json(await storage.getRfidEventsByTag(req.params.tagId));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/rfid/events/zone/:zoneId", async (req, res) => {
    try {
      res.json(await storage.getRfidEventsByZone(req.params.zoneId));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/rfid/events", async (req, res) => {
    try {
      const data = insertRfidEventSchema.parse(req.body);
      res.status(201).json(await storage.createRfidEvent(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // ==================== INVENTORY TRACEABILITY ROUTES ====================

  // Traceability stats
  app.get("/api/traceability/stats", async (req, res) => {
    try { res.json(await storage.getTraceabilityStats()); }
    catch { res.status(500).json({ message: "Failed to get stats" }); }
  });

  // Handling Units
  app.get("/api/traceability/handling-units", async (req, res) => {
    try { res.json(await storage.getHandlingUnits()); }
    catch { res.status(500).json({ message: "Failed to get handling units" }); }
  });

  app.get("/api/traceability/handling-units/:id", async (req, res) => {
    try {
      const hu = await storage.getHandlingUnit(req.params.id);
      if (!hu) return res.status(404).json({ message: "Handling unit not found" });
      res.json(hu);
    } catch { res.status(500).json({ message: "Failed to get handling unit" }); }
  });

  app.post("/api/traceability/handling-units", async (req, res) => {
    try {
      const data = insertHandlingUnitSchema.parse(req.body);
      res.status(201).json(await storage.createHandlingUnit(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create handling unit" });
    }
  });

  app.put("/api/traceability/handling-units/:id", async (req, res) => {
    try {
      const data = insertHandlingUnitSchema.partial().parse(req.body);
      const hu = await storage.updateHandlingUnit(req.params.id, data);
      if (!hu) return res.status(404).json({ message: "Not found" });
      res.json(hu);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to update handling unit" });
    }
  });

  app.delete("/api/traceability/handling-units/:id", async (req, res) => {
    try {
      const ok = await storage.deleteHandlingUnit(req.params.id);
      if (!ok) return res.status(404).json({ message: "Not found" });
      res.json({ success: true });
    } catch { res.status(500).json({ message: "Failed to delete" }); }
  });

  // Barcodes
  app.get("/api/traceability/barcodes", async (req, res) => {
    try { res.json(await storage.getBarcodes()); }
    catch { res.status(500).json({ message: "Failed to get barcodes" }); }
  });

  app.post("/api/traceability/barcodes", async (req, res) => {
    try {
      const data = insertBarcodeSchema.parse(req.body);
      res.status(201).json(await storage.createBarcode(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create barcode" });
    }
  });

  app.put("/api/traceability/barcodes/:id", async (req, res) => {
    try {
      const data = insertBarcodeSchema.partial().parse(req.body);
      const bc = await storage.updateBarcode(req.params.id, data);
      if (!bc) return res.status(404).json({ message: "Not found" });
      res.json(bc);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to update barcode" });
    }
  });

  // Scan Exceptions
  app.get("/api/traceability/exceptions", async (req, res) => {
    try { res.json(await storage.getScanExceptions()); }
    catch { res.status(500).json({ message: "Failed to get exceptions" }); }
  });

  app.post("/api/traceability/exceptions", async (req, res) => {
    try {
      const data = insertScanExceptionSchema.parse(req.body);
      res.status(201).json(await storage.createScanException(data));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid data", errors: error.errors });
      res.status(500).json({ message: "Failed to create exception" });
    }
  });

  app.put("/api/traceability/exceptions/:id/resolve", async (req, res) => {
    try {
      const { resolvedBy, notes } = req.body;
      if (!resolvedBy) return res.status(400).json({ message: "resolvedBy is required" });
      const ex = await storage.resolveScanException(req.params.id, resolvedBy, notes);
      if (!ex) return res.status(404).json({ message: "Exception not found" });
      res.json(ex);
    } catch { res.status(500).json({ message: "Failed to resolve exception" }); }
  });

  const httpServer = createServer(app);
  return httpServer;
}
