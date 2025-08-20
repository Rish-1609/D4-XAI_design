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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSopSchema, type Sop, type SopVersion } from "@shared/schema";
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
  Archive 
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
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
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

  // Filter SOPs based on active tab
  const filteredSops = sops.filter((sop: Sop) => {
    if (activeTab === "all") return true;
    return sop.category === activeTab;
  });

  // Handle file upload - this would need to be implemented with object storage routes
  const handleFileUpload = async () => {
    try {
      // This would call a backend route to get presigned upload URL
      return {
        method: "PUT" as const,
        url: "https://example.com/upload", // Placeholder
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
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
    <div className="space-y-6" data-testid="page-sop-management">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SOP Management</h1>
          <p className="text-muted-foreground">
            Manage Standard Operating Procedures with document upload and version control
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" data-testid="tab-all-sops">All SOPs</TabsTrigger>
          {sopCategories.map((category) => (
            <TabsTrigger key={category} value={category} data-testid={`tab-${category.toLowerCase().replace(/\s+/g, '-')}`}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <div>Loading SOPs...</div>
            ) : filteredSops.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No SOPs found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === "all" 
                      ? "Create your first Standard Operating Procedure to get started."
                      : `No SOPs found in the ${activeTab} category.`
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
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEdit(sop)}
                                data-testid={`button-edit-${sop.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleViewVersions(sop)}
                                data-testid={`button-versions-${sop.id}`}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                              {sop.filePath && (
                                <Button size="sm" variant="outline" data-testid={`button-download-${sop.id}`}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => deleteSopMutation.mutate(sop.id)}
                                data-testid={`button-delete-${sop.id}`}
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
    </div>
  );
}