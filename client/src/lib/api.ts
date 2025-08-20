import { apiRequest, queryClient } from "./queryClient";
import { type Material, type InsertMaterial, type UpdateMaterial } from "@shared/schema";

export const materialsApi = {
  getAll: async (): Promise<Material[]> => {
    const response = await apiRequest("GET", "/api/materials");
    return response.json();
  },

  getByType: async (type: string): Promise<Material[]> => {
    const response = await apiRequest("GET", `/api/materials/type/${type}`);
    return response.json();
  },

  getById: async (id: string): Promise<Material> => {
    const response = await apiRequest("GET", `/api/materials/${id}`);
    return response.json();
  },

  create: async (material: InsertMaterial): Promise<Material> => {
    const response = await apiRequest("POST", "/api/materials", material);
    queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    queryClient.invalidateQueries({ queryKey: ["/api/quality-stats"] });
    return response.json();
  },

  update: async (id: string, material: UpdateMaterial): Promise<Material> => {
    const response = await apiRequest("PUT", `/api/materials/${id}`, material);
    queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    queryClient.invalidateQueries({ queryKey: ["/api/quality-stats"] });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/materials/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    queryClient.invalidateQueries({ queryKey: ["/api/quality-stats"] });
  },

  getQualityStats: async (): Promise<{
    approved: number;
    pending: number;
    failed: number;
    underTesting: number;
    averageScore: number;
  }> => {
    const response = await apiRequest("GET", "/api/quality-stats");
    return response.json();
  },
};
