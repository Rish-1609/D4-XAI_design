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
import { insertBomSchema, insertBomChangeRequestSchema, type Bom, type InsertBom, type BomMaterial, type BomChangeRequest, type InsertBomChangeRequest } from "@shared/schema";
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

  const changeRequestForm = useForm<InsertBomChangeRequest>({
    resolver: zodResolver(insertBomChangeRequestSchema),
    defaultValues: {
      bomId: "",
      requestedBy: "system",
      changeType: "version_update",
      changeDescription: "",
      businessJustification: "",
      proposedVersion: "",
      impactAssessment: "",
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

  // Group materials by type
  const materialsByType = materials.reduce((acc: Record<string, any[]>, material: any) => {
    const type = material.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(material);
    return acc;
  }, {});

  // Group BOMs by material types they contain
  const bomsWithMaterials = boms.map(bom => ({
    ...bom,
    materialTypes: ['raw-materials', 'packaging-materials', 'artwork'], // For demo, in real app get from BOM materials
  }));

  const materialTypes = ['raw-materials', 'packaging-materials', 'artwork'];

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
                        name="changeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Change Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-change-type">
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
                        name="proposedVersion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposed Version</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2.0" {...field} value={field.value || ""} data-testid="input-proposed-version" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="changeDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Change Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the proposed changes..."
                                {...field} 
                                data-testid="textarea-change-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="businessJustification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Justification *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain the business reason for this change..."
                                {...field} 
                                data-testid="textarea-business-justification"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={changeRequestForm.control}
                        name="impactAssessment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impact Assessment</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Assess the impact of this change..."
                                {...field} 
                                value={field.value || ""}
                                data-testid="textarea-impact-assessment"
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
                {/* Hierarchical BOM Display */}
                {materialTypes.map((type) => {
                  const relevantBoms = bomsWithMaterials.filter(bom => bom.materialTypes.includes(type));
                  if (relevantBoms.length === 0) return null;
                  
                  return (
                    <Card key={type}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                          {getMaterialTypeIcon(type)}
                          <span className="ml-2">{getMaterialTypeName(type)}</span>
                          <Badge variant="secondary" className="ml-2">
                            {relevantBoms.length} BOMs
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {relevantBoms.map((bom) => (
                            <div key={bom.id} className="border rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {bom.bomNumber} - {bom.productName}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Version {bom.version} • Created by {bom.createdBy}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <Badge className={`${getStatusColor(bom.status)} text-white`}>
                                    {bom.status.toUpperCase()}
                                  </Badge>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestChange(bom.id)}
                                    data-testid={`button-request-change-${bom.id}`}
                                  >
                                    <GitBranch className="w-4 h-4 mr-1" />
                                    Request Change
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
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
                                      {request.changeDescription}
                                    </p>
                                    <div className="text-xs text-gray-500 space-x-4">
                                      <span>Type: {request.changeType.replace('_', ' ').toUpperCase()}</span>
                                      <span>•</span>
                                      <span>Requested by: {request.requestedBy}</span>
                                      <span>•</span>
                                      <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
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