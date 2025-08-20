import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMaterialSchema, updateMaterialSchema, insertTestConfigSchema, insertTestResultSchema, insertTestInstructionSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
