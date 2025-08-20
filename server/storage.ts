import { type Material, type InsertMaterial, type UpdateMaterial } from "@shared/schema";
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
    averageScore: number;
  }>;
}

export class MemStorage implements IStorage {
  private materials: Map<string, Material>;

  constructor() {
    this.materials = new Map();
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
      createdAt: now,
      updatedAt: now,
    };
    this.materials.set(id, material);
    return material;
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
    averageScore: number;
  }> {
    const allMaterials = Array.from(this.materials.values());
    
    const approved = allMaterials.filter(m => m.status === 'approved').length;
    const pending = allMaterials.filter(m => m.status === 'pending').length;
    const failed = allMaterials.filter(m => m.status === 'failed').length;
    
    const materialsWithScores = allMaterials.filter(m => m.score !== null && m.score !== undefined);
    const averageScore = materialsWithScores.length > 0 
      ? materialsWithScores.reduce((sum, m) => sum + (m.score || 0), 0) / materialsWithScores.length
      : 0;

    return {
      approved,
      pending,
      failed,
      averageScore: Math.round(averageScore * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
