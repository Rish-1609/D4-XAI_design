import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMaterialSchema, updateMaterialSchema, insertTestConfigSchema, insertTestResultSchema, insertTestInstructionSchema, insertSopSchema, insertSopChangeRequestSchema, insertProductionOrderSchema, insertBomSchema, insertBomMaterialSchema, insertBomSubAssemblySchema, insertBomChangeRequestSchema, insertInventoryItemSchema, insertStockMovementSchema, insertCapaSchema, insertCapaActionSchema, insertQcStageSchema, insertQcCheckpointSchema, insertQcTestResultSchema, insertQcApprovalSchema, insertBatchReleaseSchema, insertBatchWorkflowStepSchema, insertBatchCertificateSchema, insertQaAuditTrailSchema, insertQcStageTemplateSchema } from "@shared/schema";
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
        extraData: JSON.stringify({ 
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
        extraData: JSON.stringify({ 
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
      if (validatedData.status) {
        await storage.createQaAuditTrail({
          entityType: 'BatchRelease',
          entityId: id,
          action: 'QA_DECISION_MADE',
          performedBy: 'QA Manager',
          extraData: JSON.stringify({ 
            status: validatedData.status,
            qaComments: validatedData.qaComments 
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
        performedBy: validatedData.issuedBy,
        details: { 
          certificateNumber: validatedData.certificateNumber,
          batchReleaseId: validatedData.batchReleaseId 
        }
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

  const httpServer = createServer(app);
  return httpServer;
}
