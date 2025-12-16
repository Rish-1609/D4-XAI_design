import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertBomSchema, type Bom, type InsertBom, type BomItem } from "@shared/schema";

// Define local types for change requests until schema is updated
type BomChangeRequest = {
  id: string;
  bomId: string;
  requestType: string;
  title: string;
  description: string;
  justification: string;
  status: string;
  priority: string;
  requestedBy: string;
  requestedAt: Date | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewComments: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
};

type InsertBomChangeRequest = Omit<BomChangeRequest, 'id' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewComments' | 'approvedBy' | 'approvedAt' | 'rejectedBy' | 'rejectedAt' | 'rejectionReason'>;

type BomMaterial = BomItem;

import { Plus, Search, ChevronDown, ChevronRight, FileText, GitBranch, Clock, CheckCircle, XCircle, Package2, Palette, FileBox } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const getChangeRequestStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    case "pending":
    default:
      return "bg-yellow-500";
  }
};

const getChangeRequestStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    case "pending":
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getMaterialTypeIcon = (type: string) => {
  switch (type) {
    case "raw-materials":
      return <Package2 className="w-5 h-5 text-blue-600" />;
    case "packaging-materials":
      return <FileBox className="w-5 h-5 text-green-600" />;
    case "artwork":
      return <Palette className="w-5 h-5 text-purple-600" />;
    default:
      return <Package2 className="w-5 h-5 text-gray-600" />;
  }
};

const getMaterialTypeName = (type: string) => {
  switch (type) {
    case "raw-materials":
      return "Raw Materials";
    case "packaging-materials":
      return "Packaging Materials";
    case "artwork":
      return "Artwork";
    default:
      return "Other Materials";
  }
};

export default function BomManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChangeRequestDialogOpen, setIsChangeRequestDialogOpen] = useState(false);
  const [selectedBom, setSelectedBom] = useState<string>("");
  const [expandedBoms, setExpandedBoms] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("boms");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: boms = [], isLoading } = useQuery<Bom[]>({
    queryKey: ["/api/boms"],
    queryFn: () => fetch("/api/boms").then(res => res.json()),
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["/api/materials"],
    queryFn: () => fetch("/api/materials").then(res => res.json()),
  });

  const { data: changeRequests = [] } = useQuery<BomChangeRequest[]>({
    queryKey: ["/api/bom-change-requests"],
    queryFn: () => fetch("/api/bom-change-requests").then(res => res.json()),
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

  const changeRequestForm = useForm<InsertBomChangeRequest>({
    resolver: zodResolver(insertBomChangeRequestSchema),
    defaultValues: {
      title: "BOM Change Request",
      bomId: "",
      requestedBy: "system",
      requestType: "version_update",
      description: "",
      justification: "",
      proposedVersion: "",
      priority: "medium",
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

  const createChangeRequestMutation = useMutation({
    mutationFn: async (data: InsertBomChangeRequest) => {
      const response = await fetch("/api/bom-change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bom-change-requests"] });
      setIsChangeRequestDialogOpen(false);
      changeRequestForm.reset();
      setSelectedBom("");
      toast({ title: "Success", description: "Change request created successfully." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create change request.",
        variant: "destructive",
      });
    },
  });

  const approveChangeRequestMutation = useMutation({
    mutationFn: async ({ id, approvedBy, reviewComments }: { id: string; approvedBy: string; reviewComments?: string }) => {
      const response = await fetch(`/api/bom-change-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy, reviewComments }),
      });
      if (!response.ok) throw new Error("Failed to approve change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bom-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/boms"] });
      toast({ title: "Success", description: "Change request approved successfully." });
    },
  });

  const rejectChangeRequestMutation = useMutation({
    mutationFn: async ({ id, rejectedBy, rejectionReason }: { id: string; rejectedBy: string; rejectionReason: string }) => {
      const response = await fetch(`/api/bom-change-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedBy, rejectionReason }),
      });
      if (!response.ok) throw new Error("Failed to reject change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bom-change-requests"] });
      toast({ title: "Success", description: "Change request rejected successfully." });
    },
  });

  const onSubmit = (data: InsertBom) => {
    createBomMutation.mutate(data);
  };

  const onChangeRequestSubmit = (data: InsertBomChangeRequest) => {
    createChangeRequestMutation.mutate(data);
  };

  const handleRequestChange = (bomId: string) => {
    setSelectedBom(bomId);
    changeRequestForm.setValue("bomId", bomId);
    setIsChangeRequestDialogOpen(true);
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

  // Enhanced BOM materials query
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
              <p className="text-gray-600 text-sm mt-1">Hierarchical Bill of Materials with change control</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isChangeRequestDialogOpen} onOpenChange={setIsChangeRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-request-change">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Request Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request BOM Change</DialogTitle>
                  </DialogHeader>
                  <Form {...changeRequestForm}>
                    <form onSubmit={changeRequestForm.handleSubmit(onChangeRequestSubmit)} className="space-y-4">
                      <FormField
                        control={changeRequestForm.control}
                        name="bomId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>BOM *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-bom">
                                  <SelectValue placeholder="Select BOM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {boms.map((bom) => (
                                  <SelectItem key={bom.id} value={bom.id}>
                                    {bom.bomNumber} - {bom.productName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="requestType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Request Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-request-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="version_update">Version Update</SelectItem>
                                <SelectItem value="material_change">Material Change</SelectItem>
                                <SelectItem value="specification_change">Specification Change</SelectItem>
                                <SelectItem value="process_change">Process Change</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                      <FormField
                        control={changeRequestForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the proposed changes..."
                                {...field} 
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="justification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Justification *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain the business reason for this change..."
                                {...field} 
                                data-testid="textarea-justification"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="proposedVersion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposed Version</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 2.0"
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-proposed-version"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsChangeRequestDialogOpen(false)}
                          data-testid="button-cancel-change"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={createChangeRequestMutation.isPending}
                          data-testid="button-submit-change"
                        >
                          {createChangeRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
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
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search BOMs and change requests..."
                    className="pl-10"
                    data-testid="input-search-boms"
                  />
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="boms" data-testid="tab-boms">
                  <FileText className="w-4 h-4 mr-2" />
                  Bill of Materials
                </TabsTrigger>
                <TabsTrigger value="change-requests" data-testid="tab-change-requests">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Change Requests ({changeRequests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="boms" className="space-y-4">
                {/* SKU-based Hierarchical BOM Display */}
                <div className="space-y-4">
                  {boms.map((bom) => {
                    const isExpanded = expandedBoms.has(bom.id);
                    const materials = bomMaterialsQueries.data?.[bom.id] || [];
                    
                    // Group materials by type
                    const materialsByType = materials.reduce((acc, material) => {
                      // For demo purposes, categorize based on material name/code patterns
                      let type = 'raw-materials';
                      if (material.materialName?.toLowerCase().includes('pack') || 
                          material.materialName?.toLowerCase().includes('bottle') ||
                          material.materialName?.toLowerCase().includes('label')) {
                        type = 'packaging-materials';
                      } else if (material.materialName?.toLowerCase().includes('artwork') ||
                                material.materialName?.toLowerCase().includes('insert')) {
                        type = 'artwork';
                      }
                      
                      if (!acc[type]) acc[type] = [];
                      acc[type].push(material);
                      return acc;
                    }, {} as Record<string, typeof materials>);
                    
                    return (
                      <Card key={bom.id} className="border-l-4 border-l-blue-500">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <CardHeader 
                              className="cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleBomExpansion(bom.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center">
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <Package2 className="w-8 h-8 text-blue-600" />
                                    <div>
                                      <CardTitle className="text-xl text-gray-900">
                                        SKU: {bom.bomNumber} - {bom.productName}
                                      </CardTitle>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Version {bom.version} • Status: {bom.status} • {materials.length} materials
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Badge className={`${getStatusColor(bom.status)} text-white`}>
                                    {bom.status.toUpperCase()}
                                  </Badge>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRequestChange(bom.id);
                                    }}
                                    data-testid={`button-request-change-${bom.id}`}
                                  >
                                    <GitBranch className="w-4 h-4 mr-1" />
                                    Request Change
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          {isExpanded && (
                            <CollapsibleContent>
                              <CardContent className="pt-0 bg-gray-50">
                                <div className="space-y-6">
                                  {/* Raw Materials Section */}
                                  {materialsByType['raw-materials'] && materialsByType['raw-materials'].length > 0 && (
                                    <div>
                                      <div className="flex items-center mb-4">
                                        {getMaterialTypeIcon('raw-materials')}
                                        <h3 className="ml-2 text-lg font-semibold text-gray-800">
                                          {getMaterialTypeName('raw-materials')}
                                        </h3>
                                        <Badge variant="secondary" className="ml-2">
                                          {materialsByType['raw-materials'].length} items
                                        </Badge>
                                      </div>
                                      <div className="bg-white rounded-lg border">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Code</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Name</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">UOM</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Weight/Unit</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {materialsByType['raw-materials'].map((material) => (
                                              <tr key={material.id} className="border-t border-gray-100 hover:bg-blue-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                  {material.materialCode}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.materialName}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {(material.quantity / 1000).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.uom}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.unitCost ? `₹${(material.unitCost / 100).toFixed(2)}` : 'N/A'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Packaging Materials Section */}
                                  {materialsByType['packaging-materials'] && materialsByType['packaging-materials'].length > 0 && (
                                    <div>
                                      <div className="flex items-center mb-4">
                                        {getMaterialTypeIcon('packaging-materials')}
                                        <h3 className="ml-2 text-lg font-semibold text-gray-800">
                                          {getMaterialTypeName('packaging-materials')}
                                        </h3>
                                        <Badge variant="secondary" className="ml-2">
                                          {materialsByType['packaging-materials'].length} items
                                        </Badge>
                                      </div>
                                      <div className="bg-white rounded-lg border">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Code</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Name</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">UOM</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Cost/Unit</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {materialsByType['packaging-materials'].map((material) => (
                                              <tr key={material.id} className="border-t border-gray-100 hover:bg-green-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                  {material.materialCode}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.materialName}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {(material.quantity / 1000).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.uom}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.unitCost ? `₹${(material.unitCost / 100).toFixed(2)}` : 'N/A'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Artwork Section */}
                                  {materialsByType['artwork'] && materialsByType['artwork'].length > 0 && (
                                    <div>
                                      <div className="flex items-center mb-4">
                                        {getMaterialTypeIcon('artwork')}
                                        <h3 className="ml-2 text-lg font-semibold text-gray-800">
                                          {getMaterialTypeName('artwork')}
                                        </h3>
                                        <Badge variant="secondary" className="ml-2">
                                          {materialsByType['artwork'].length} items
                                        </Badge>
                                      </div>
                                      <div className="bg-white rounded-lg border">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Code</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Material Name</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                                              <th className="text-left py-3 px-4 font-medium text-gray-700">UOM</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {materialsByType['artwork'].map((material) => (
                                              <tr key={material.id} className="border-t border-gray-100 hover:bg-purple-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                  {material.materialCode}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.materialName}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {(material.quantity / 1000).toFixed(3)}
                                                </td>
                                                <td className="py-3 px-4 text-gray-700">
                                                  {material.uom}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* BOM Summary */}
                                  <div className="border-t pt-4 mt-6">
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                      <div className="space-x-4">
                                        <span>Created by: {bom.createdBy}</span>
                                        <span>•</span>
                                        <span>Approved by: {bom.approvedBy || 'Pending'}</span>
                                        <span>•</span>
                                        <span>Created: {bom.createdAt ? new Date(bom.createdAt).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        Total Materials: {materials.length}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
                
                {boms.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No BOMs Found</h3>
                      <p className="text-gray-600 mb-4">Create your first BOM to get started.</p>
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-create-first-bom"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create BOM
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="change-requests" className="space-y-4">
                {changeRequests.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-200">
                        {changeRequests.map((request) => {
                          const bom = boms.find(b => b.id === request.bomId);
                          return (
                            <div key={request.id} className="p-6 hover:bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    {getChangeRequestStatusIcon(request.status)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-semibold text-gray-900">
                                        {bom ? `${bom.bomNumber} - ${bom.productName}` : 'Unknown BOM'}
                                      </h4>
                                      <Badge className={`${getChangeRequestStatusColor(request.status)} text-white`}>
                                        {request.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {request.description}
                                    </p>
                                    <div className="text-xs text-gray-500 space-x-4">
                                      <span>Type: {request.requestType.replace('_', ' ').toUpperCase()}</span>
                                      <span>•</span>
                                      <span>Requested by: {request.requestedBy}</span>
                                      <span>•</span>
                                      <span>Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</span>
                                      {request.proposedVersion && (
                                        <>
                                          <span>•</span>
                                          <span>Version: {request.proposedVersion}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {request.status === 'pending' && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => approveChangeRequestMutation.mutate({ 
                                        id: request.id, 
                                        approvedBy: 'system', 
                                        reviewComments: 'Approved via UI'
                                      })}
                                      disabled={approveChangeRequestMutation.isPending}
                                      data-testid={`button-approve-${request.id}`}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => rejectChangeRequestMutation.mutate({ 
                                        id: request.id, 
                                        rejectedBy: 'system', 
                                        rejectionReason: 'Rejected via UI'
                                      })}
                                      disabled={rejectChangeRequestMutation.isPending}
                                      data-testid={`button-reject-${request.id}`}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {(request.reviewComments || request.rejectionReason) && (
                                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    {request.status === 'approved' ? 'Review Comments:' : 'Rejection Reason:'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {request.reviewComments || request.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Change Requests</h3>
                      <p className="text-gray-600 mb-4">All BOM change requests will appear here.</p>
                      <Button 
                        onClick={() => setIsChangeRequestDialogOpen(true)}
                        variant="outline"
                        disabled={boms.length === 0}
                        data-testid="button-create-change-request"
                      >
                        <GitBranch className="w-4 h-4 mr-2" />
                        Request Change
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}