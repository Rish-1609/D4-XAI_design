import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ObjectUploader } from "@/components/ObjectUploader";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Sidebar } from "@/components/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSopSchema, insertSopChangeRequestSchema, type Sop, type SopVersion, type SopChangeRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Archive,
  AlertTriangle,
  FileCheck,
  History,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { UploadResult } from "@uppy/core";
import { z } from "zod";

const sopCategories = [
  "Manufacturing",
  "Quality Control", 
  "Cleaning & Sanitization",
  "Equipment Operation",
  "Safety & Environmental",
  "Training"
];


const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  "under-review": "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800", 
  archived: "bg-red-100 text-red-800"
};

const statusIcons = {
  draft: Clock,
  "under-review": AlertCircle,
  approved: CheckCircle,
  archived: Archive
};

export default function SopManagement() {
  const [activeTab, setActiveTab] = useState("sops");
  const [sopTab, setSopTab] = useState("all");
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [isChangeRequestDialogOpen, setIsChangeRequestDialogOpen] = useState(false);
  const [isChangeRequestsDialogOpen, setIsChangeRequestsDialogOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string>("");
  const [selectedDocumentName, setSelectedDocumentName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SOPs
  const { data: sops = [], isLoading } = useQuery<Sop[]>({
    queryKey: ['/api/sops'],
  });

  // Fetch SOP versions when needed
  const { data: sopVersions = [] } = useQuery<SopVersion[]>({
    queryKey: ['/api/sops', selectedSop?.id, 'versions'],
    enabled: !!selectedSop && isVersionsDialogOpen,
  });

  // Fetch SOP change requests
  const { data: changeRequests = [] } = useQuery<SopChangeRequest[]>({
    queryKey: ['/api/sop-change-requests'],
    enabled: isChangeRequestsDialogOpen,
  });

  // Fetch change requests for specific SOP
  const { data: sopChangeRequests = [] } = useQuery<SopChangeRequest[]>({
    queryKey: ['/api/sop-change-requests', { sopId: selectedSop?.id }],
    enabled: !!selectedSop && isChangeRequestsDialogOpen,
  });


  // Create SOP mutation
  const createSopMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSopSchema>) => {
      const response = await fetch("/api/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create SOP");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sops'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "SOP created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create SOP", variant: "destructive" });
    },
  });

  // Update SOP mutation
  const updateSopMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertSopSchema>> }) => {
      const response = await fetch(`/api/sops/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update SOP");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sops'] });
      setIsEditDialogOpen(false);
      toast({ title: "Success", description: "SOP updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update SOP", variant: "destructive" });
    },
  });

  // Create change request mutation
  const createChangeRequestMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSopChangeRequestSchema>) => {
      const response = await fetch("/api/sop-change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sop-change-requests'] });
      setIsChangeRequestDialogOpen(false);
      toast({ title: "Success", description: "Change request created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create change request", variant: "destructive" });
    },
  });

  // Approve change request mutation
  const approveChangeRequestMutation = useMutation({
    mutationFn: async ({ id, approvedBy, reviewComments }: { id: string; approvedBy: string; reviewComments?: string }) => {
      const response = await fetch(`/api/sop-change-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy, reviewComments }),
      });
      if (!response.ok) throw new Error("Failed to approve change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sop-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sops'] });
      toast({ title: "Success", description: "Change request approved and implemented" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve change request", variant: "destructive" });
    },
  });

  // Reject change request mutation
  const rejectChangeRequestMutation = useMutation({
    mutationFn: async ({ id, rejectedBy, rejectionReason }: { id: string; rejectedBy: string; rejectionReason: string }) => {
      const response = await fetch(`/api/sop-change-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedBy, rejectionReason }),
      });
      if (!response.ok) throw new Error("Failed to reject change request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sop-change-requests'] });
      toast({ title: "Success", description: "Change request rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject change request", variant: "destructive" });
    },
  });

  // Delete SOP mutation
  const deleteSopMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sops/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete SOP");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sops'] });
      toast({ title: "Success", description: "SOP deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete SOP", variant: "destructive" });
    },
  });

  // Form for creating/editing SOPs
  const form = useForm<z.infer<typeof insertSopSchema>>({
    resolver: zodResolver(insertSopSchema),
    defaultValues: {
      title: "",
      sopNumber: "",
      category: "",
      description: "",
      version: "1.0",
      status: "draft",
      createdBy: "Current User",
    },
  });

  // Form for creating change requests
  const changeRequestForm = useForm<z.infer<typeof insertSopChangeRequestSchema>>({
    resolver: zodResolver(insertSopChangeRequestSchema),
    defaultValues: {
      sopId: "",
      requestType: "update",
      title: "",
      description: "",
      justification: "",
      priority: "medium",
      requestedBy: "Current User",
    },
  });

  // Filter SOPs based on active tab
  const filteredSops = sops.filter((sop: Sop) => {
    if (sopTab === "all") return true;
    return sop.category === sopTab;
  });


  // Handle file upload - this would need to be implemented with object storage routes
  const handleFileUpload = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  };

  // Handler functions for the enhanced SOP management
  const handleViewDocument = (sop: Sop) => {
    if (sop.filePath && sop.fileName) {
      setSelectedDocumentUrl(sop.filePath);
      setSelectedDocumentName(sop.fileName);
      setIsDocumentViewerOpen(true);
    } else {
      toast({
        title: "No document",
        description: "This SOP doesn't have a document attached",
        variant: "destructive",
      });
    }
  };

  const handleCreateChangeRequest = (sop: Sop) => {
    changeRequestForm.setValue("sopId", sop.id);
    const nextVersion = parseFloat(sop.version) + 0.1;
    changeRequestForm.setValue("proposedVersion", nextVersion.toFixed(1));
    setSelectedSop(sop);
    setIsChangeRequestDialogOpen(true);
  };

  const handleViewChangeRequests = (sop: Sop) => {
    setSelectedSop(sop);
    setIsChangeRequestsDialogOpen(true);
  };

  const handleApproveChangeRequest = (changeRequest: SopChangeRequest) => {
    approveChangeRequestMutation.mutate({
      id: changeRequest.id,
      approvedBy: "Current User",
      reviewComments: "Approved via UI",
    });
  };

  const handleRejectChangeRequest = (changeRequest: SopChangeRequest) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      rejectChangeRequestMutation.mutate({
        id: changeRequest.id,
        rejectedBy: "Current User", 
        rejectionReason: reason,
      });
    }
  };

  // Handle upload completion
  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const fileUrl = uploadedFile.uploadURL;
      
      // Update the form with file information
      form.setValue("filePath", fileUrl);
      form.setValue("fileName", uploadedFile.name);
      form.setValue("fileSize", uploadedFile.size || 0);
      
      toast({
        title: "Upload Complete",
        description: `File "${uploadedFile.name}" uploaded successfully`,
      });
    }
  };

  const onSubmit = (data: z.infer<typeof insertSopSchema>) => {
    if (selectedSop && isEditDialogOpen) {
      updateSopMutation.mutate({ id: selectedSop.id, data });
    } else {
      createSopMutation.mutate(data);
    }
  };

  const handleEdit = (sop: Sop) => {
    setSelectedSop(sop);
    form.reset({
      title: sop.title,
      sopNumber: sop.sopNumber,
      category: sop.category,
      description: sop.description || "",
      version: sop.version,
      status: sop.status,
      createdBy: sop.createdBy,
      filePath: sop.filePath,
      fileName: sop.fileName,
      fileSize: sop.fileSize,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewVersions = (sop: Sop) => {
    setSelectedSop(sop);
    setIsVersionsDialogOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">SOP Management</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage Standard Operating Procedures with document upload and version control
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6" data-testid="page-sop-management">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white border-b border-gray-200 h-auto p-0 rounded-none w-full justify-start">
                <div className="flex space-x-8">
                  <TabsTrigger
                    value="sops"
                    className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none bg-transparent"
                    data-testid="tab-sops"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Standard Operating Procedures
                  </TabsTrigger>
                </div>
              </TabsList>

              <TabsContent value="sops" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Standard Operating Procedures</h2>
                    <p className="text-gray-600 text-sm">
                      Manage SOPs with document upload and version control
                    </p>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-sop">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New SOP
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New SOP</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title *</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-sop-title" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="sopNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>SOP Number *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="SOP-001" data-testid="input-sop-number" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-sop-category">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {sopCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                    <Input {...field} data-testid="input-sop-version" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ""} data-testid="textarea-sop-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="space-y-2">
                            <Label>Document Upload</Label>
                            <ObjectUploader
                              maxNumberOfFiles={1}
                              maxFileSize={50 * 1024 * 1024} // 50MB
                              onGetUploadParameters={handleFileUpload}
                              onComplete={handleUploadComplete}
                              buttonClassName="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload SOP Document
                            </ObjectUploader>
                            {form.watch("fileName") && (
                              <p className="text-sm text-muted-foreground">
                                Uploaded: {form.watch("fileName")} ({Math.round((form.watch("fileSize") || 0) / 1024)}KB)
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createSopMutation.isPending} data-testid="button-submit-sop">
                              Create SOP
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Tabs value={sopTab} onValueChange={setSopTab}>
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="all" data-testid="tab-all-sops">All SOPs</TabsTrigger>
                    {sopCategories.map((category) => (
                      <TabsTrigger key={category} value={category} data-testid={`tab-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={sopTab} className="space-y-4">
                    <div className="grid gap-4">
                      {isLoading ? (
                        <div>Loading SOPs...</div>
                      ) : filteredSops.length === 0 ? (
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center py-16">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No SOPs found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                              {sopTab === "all" 
                                ? "Create your first Standard Operating Procedure to get started."
                                : `No SOPs found in the ${sopTab} category.`
                              }
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create New SOP
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>SOP Number</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredSops.map((sop: Sop) => {
                                const StatusIcon = statusIcons[sop.status as keyof typeof statusIcons];
                                return (
                                  <TableRow key={sop.id} data-testid={`row-sop-${sop.id}`}>
                                    <TableCell className="font-mono">{sop.sopNumber}</TableCell>
                                    <TableCell className="font-medium">{sop.title}</TableCell>
                                    <TableCell>{sop.category}</TableCell>
                                    <TableCell>{sop.version}</TableCell>
                                    <TableCell>
                                      <Badge className={statusColors[sop.status as keyof typeof statusColors]}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {sop.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {sop.updatedAt ? format(new Date(sop.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex space-x-1 flex-wrap gap-1">
                                        {/* View Document */}
                                        {sop.filePath && (
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleViewDocument(sop)}
                                            data-testid={`button-view-${sop.id}`}
                                            title="View Document"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        )}
                                        
                                        {/* Request Change */}
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => handleCreateChangeRequest(sop)}
                                          data-testid={`button-change-request-${sop.id}`}
                                          title="Request Change"
                                        >
                                          <FileCheck className="h-4 w-4" />
                                        </Button>
                                        
                                        {/* View Change Requests */}
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => handleViewChangeRequests(sop)}
                                          data-testid={`button-change-requests-${sop.id}`}
                                          title="View Change Requests"
                                        >
                                          <History className="h-4 w-4" />
                                        </Button>
                                        
                                        {/* View Versions */}
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => handleViewVersions(sop)}
                                          data-testid={`button-versions-${sop.id}`}
                                          title="View Versions"
                                        >
                                          <Clock className="h-4 w-4" />
                                        </Button>
                                        
                                        {/* Edit */}
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => handleEdit(sop)}
                                          data-testid={`button-edit-${sop.id}`}
                                          title="Edit SOP"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        
                                        {/* Delete */}
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          onClick={() => deleteSopMutation.mutate(sop.id)}
                                          data-testid={`button-delete-${sop.id}`}
                                          title="Delete SOP"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

            </Tabs>
          </div>
        </main>
      </div>

      {/* Edit SOP Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SOP</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Update Document</Label>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  onGetUploadParameters={handleFileUpload}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Version
                </ObjectUploader>
                {form.watch("fileName") && (
                  <p className="text-sm text-muted-foreground">
                    Current: {form.watch("fileName")} ({Math.round((form.watch("fileSize") || 0) / 1024)}KB)
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSopMutation.isPending}>
                  Update SOP
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isVersionsDialogOpen} onOpenChange={setIsVersionsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version History - {selectedSop?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Change Log</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sopVersions.map((version: SopVersion) => (
                  <TableRow key={version.id}>
                    <TableCell className="font-mono">{version.version}</TableCell>
                    <TableCell>
                      {version.createdAt ? format(new Date(version.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell>{version.createdBy}</TableCell>
                    <TableCell>{version.changeLog || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {version.filePath && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={selectedDocumentUrl}
        documentName={selectedDocumentName}
      />

      {/* Create Change Request Dialog */}
      <Dialog open={isChangeRequestDialogOpen} onOpenChange={setIsChangeRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Change Request - {selectedSop?.title}</DialogTitle>
          </DialogHeader>
          <Form {...changeRequestForm}>
            <form onSubmit={changeRequestForm.handleSubmit((data) => createChangeRequestMutation.mutate(data))} className="space-y-4">
              <FormField
                control={changeRequestForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief title for the change" />
                    </FormControl>
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
                      <Textarea {...field} placeholder="Detailed description of the proposed changes" rows={3} />
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
                    <FormLabel>Business Justification *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Why is this change necessary?" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={changeRequestForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
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
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="revision">Revision</SelectItem>
                          <SelectItem value="archive">Archive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Upload New Document Version (Optional)</Label>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  allowedFileTypes={[
                    'application/pdf',
                    'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ]}
                  fileTypeDescription="Only PDF and Word documents are allowed"
                  onGetUploadParameters={handleFileUpload}
                  onComplete={(result) => {
                    if (result.successful && result.successful.length > 0) {
                      const file = result.successful[0];
                      changeRequestForm.setValue("newFilePath", file.uploadURL || "");
                      changeRequestForm.setValue("newFileName", file.name);
                      changeRequestForm.setValue("newFileSize", file.size || 0);
                      toast({
                        title: "File uploaded",
                        description: `${file.name} has been uploaded successfully`,
                      });
                    }
                  }}
                  buttonClassName="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Updated Document
                </ObjectUploader>
                {changeRequestForm.watch("newFileName") && (
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {changeRequestForm.watch("newFileName")} 
                    ({Math.round((changeRequestForm.watch("newFileSize") || 0) / 1024)}KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsChangeRequestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createChangeRequestMutation.isPending}>
                  Submit Change Request
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Change Requests Dialog */}
      <Dialog open={isChangeRequestsDialogOpen} onOpenChange={setIsChangeRequestsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Change Requests - {selectedSop?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sopChangeRequests.map((cr: SopChangeRequest) => (
                  <TableRow key={cr.id}>
                    <TableCell className="font-medium">{cr.title}</TableCell>
                    <TableCell>{cr.requestType}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          cr.status === 'approved' ? 'default' : 
                          cr.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {cr.status === 'approved' && <UserCheck className="h-3 w-3 mr-1" />}
                        {cr.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {cr.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {cr.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        cr.priority === 'urgent' ? 'destructive' :
                        cr.priority === 'high' ? 'default' :
                        'secondary'
                      }>
                        {cr.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{cr.requestedBy}</TableCell>
                    <TableCell>
                      {cr.requestedAt ? format(new Date(cr.requestedAt), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {cr.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleApproveChangeRequest(cr)}
                              data-testid={`button-approve-${cr.id}`}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleRejectChangeRequest(cr)}
                              data-testid={`button-reject-${cr.id}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {cr.newFilePath && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedDocumentUrl(cr.newFilePath!);
                              setSelectedDocumentName(cr.newFileName || "Document");
                              setIsDocumentViewerOpen(true);
                            }}
                            data-testid={`button-view-cr-doc-${cr.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}