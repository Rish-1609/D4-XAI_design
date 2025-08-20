import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMaterialSchema, updateMaterialSchema, insertTestConfigSchema, insertTestResultSchema, insertTestInstructionSchema, insertSopSchema } from "@shared/schema";
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

  // Object storage routes for file uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      // This would integrate with ObjectStorageService to get presigned URL
      // For now, return a placeholder response
      res.json({ uploadURL: "https://example.com/upload-placeholder" });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
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

  const httpServer = createServer(app);
  return httpServer;
}
