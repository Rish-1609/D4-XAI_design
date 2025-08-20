import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertBomSchema, type Bom, type InsertBom, type BomMaterial } from "@shared/schema";
import { Layers, Plus, Search, Filter, ChevronDown, ChevronRight, Edit, Trash2, Package } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500";
    case "Inactive":
      return "bg-gray-500";
    case "Draft":
      return "bg-yellow-500";
    case "Approved":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const formatCurrency = (cents: number) => {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatQuantity = (quantity: number, precision = 1000) => {
  return (quantity / precision).toString();
};

const formatScrapPercentage = (scrapPercentage: number) => {
  return `${(scrapPercentage / 100)}%`;
};

export default function BomManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedBoms, setExpandedBoms] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: boms = [], isLoading } = useQuery<Bom[]>({
    queryKey: ["/api/boms"],
    queryFn: () => fetch("/api/boms").then(res => res.json()),
  });

  const { data: bomStats } = useQuery({
    queryKey: ["/api/bom-stats"],
    queryFn: () => fetch("/api/bom-stats").then(res => res.json()),
  });

  // Query for BOM materials when BOM is expanded
  const expandedBomsArray = Array.from(expandedBoms);
  const bomMaterialsQueries = useQuery({
    queryKey: ["/api/bom-materials", expandedBomsArray],
    queryFn: async () => {
      if (expandedBomsArray.length === 0) return {};
      
      const results = await Promise.all(
        expandedBomsArray.map(async (bomId) => {
          const response = await fetch(`/api/boms/${bomId}/materials`);
          const materials = await response.json();
          return { bomId, materials };
        })
      );
      
      return results.reduce((acc, { bomId, materials }) => {
        acc[bomId] = materials;
        return acc;
      }, {} as Record<string, BomMaterial[]>);
    },
    enabled: expandedBomsArray.length > 0,
  });

  const form = useForm<InsertBom>({
    resolver: zodResolver(insertBomSchema),
    defaultValues: {
      bomNumber: "",
      productName: "",
      version: "1.0",
      status: "Draft",
      totalCost: 0,
      approvedBy: "",
      createdBy: "system",
    },
  });

  const createBomMutation = useMutation({
    mutationFn: async (data: InsertBom) => {
      const response = await fetch("/api/boms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create BOM");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bom-stats"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "BOM created successfully." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create BOM.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBom) => {
    createBomMutation.mutate(data);
  };

  const toggleBomExpansion = (bomId: string) => {
    setExpandedBoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bomId)) {
        newSet.delete(bomId);
      } else {
        newSet.add(bomId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">BOM Management</h2>
              <p className="text-gray-600 text-sm mt-1">Manage your Bill of Materials and sub-assemblies</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-create-bom">
                  <Plus className="w-4 h-4 mr-2" />
                  Create BOM
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create BOM</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bomNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BOM Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 000001" {...field} data-testid="input-bom-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. MEFECUM-P SYP" {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0" {...field} data-testid="input-version" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approvedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approved By</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@pharma.com" {...field} value={field.value || ""} data-testid="input-approved-by" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={createBomMutation.isPending}
                        data-testid="button-create"
                      >
                        {createBomMutation.isPending ? "Creating..." : "Create BOM"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Layers className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total BOMs</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-boms">
                        {bomStats?.totalBoms || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Raw Materials</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-raw-materials">
                        {bomStats?.rawMaterials || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Live Stock Items</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-live-stock">
                        {bomStats?.liveStockItems || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">$</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total BOM Value</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-value">
                        {formatCurrency((bomStats?.totalBomValue || 0) * 100)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search BOMs by name, SKU, version, BOM number, or creator..."
                    className="pl-10"
                    data-testid="input-search-boms"
                  />
                </div>
                <Button variant="outline" className="flex items-center">
                  All Status
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="flex items-center bg-green-600 text-white hover:bg-green-700">
                  Export
                </Button>
              </div>
            </div>

            {/* BOMs Table */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {boms.map((bom) => {
                    const isExpanded = expandedBoms.has(bom.id);
                    const materials = bomMaterialsQueries.data?.[bom.id] || [];
                    
                    return (
                      <div key={bom.id} className="border-b border-gray-100 last:border-b-0">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <div
                              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleBomExpansion(bom.id)}
                              data-testid={`bom-row-${bom.id}`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    SKU: {bom.bomNumber} - {bom.productName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Version {bom.version} | Status: {bom.status}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6">
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    {formatCurrency(bom.totalCost)}
                                  </div>
                                  <div className="text-sm text-gray-500">Total Cost</div>
                                </div>
                                
                                <Badge className={`${getStatusColor(bom.status)} text-white`}>
                                  {bom.status.toUpperCase()}
                                </Badge>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`button-edit-${bom.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-testid={`button-delete-${bom.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          {isExpanded && (
                            <CollapsibleContent>
                              <div className="bg-gray-50 px-4 pb-4">
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    📦 Raw Materials ({materials.length})
                                  </span>
                                </div>
                                
                                <div className="bg-white rounded border">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">MATERIAL</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">QUANTITY</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">UOM</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">UNIT COST</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">SCRAP %</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">TOTAL COST</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-600">STOCK STATUS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {materials.map((material) => (
                                        <tr key={material.id} className="border-t border-gray-100">
                                          <td className="py-2 px-3">
                                            <div>
                                              <div className="font-medium">{material.materialCode}</div>
                                              <div className="text-gray-500 text-xs">{material.materialName}</div>
                                            </div>
                                          </td>
                                          <td className="py-2 px-3">{formatQuantity(material.quantity)}</td>
                                          <td className="py-2 px-3">{material.uom}</td>
                                          <td className="py-2 px-3">{formatCurrency(material.unitCost)}</td>
                                          <td className="py-2 px-3">{formatScrapPercentage(material.scrapPercentage)}</td>
                                          <td className="py-2 px-3 font-medium">{formatCurrency(material.totalCost)}</td>
                                          <td className="py-2 px-3">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                              Unknown
                                            </Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center text-sm">
                                  <div className="text-gray-600">
                                    <span>Created By: {bom.createdBy}</span>
                                    <span className="mx-2">|</span>
                                    <span>Approved By: {bom.approvedBy}</span>
                                    <span className="mx-2">|</span>
                                    <span>Created At: {bom.createdAt ? new Date(bom.createdAt).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                  <div className="text-gray-600">
                                    Items Count: {materials.length} items
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}