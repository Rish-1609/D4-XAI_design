import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Package,
  Search,
  AlertCircle,
  CheckCircle,
  Save,
  Upload,
  FileText,
} from "lucide-react";
import type { BatchRelease } from "@shared/schema";

const terminalTestSchema = z.object({
  shippingConditions: z.string().min(1, "Shipping conditions are required"),
  storageInstructions: z.string().optional(),
  labelNumber: z.string().min(1, "Label number is required"),
  certificateOfAnalysis: z.string().min(1, "Certificate of Analysis number is required"),
  shippingTemperature: z.string().optional(),
  transportContainer: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  coaFileName: z.string().optional(),
  invoiceFileName: z.string().optional(),
  batchReleaseCertFileName: z.string().optional(),
  packingListFileName: z.string().optional(),
  shippingLabel: z.string().optional(),
  qualityReportFileName: z.string().optional(),
  finalApprovalNotes: z.string().optional(),
});

type TerminalTestForm = z.infer<typeof terminalTestSchema>;

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function TerminalTesting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [submittedBatches, setSubmittedBatches] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: batchReleases = [] } = useQuery<BatchRelease[]>({
    queryKey: ["/api/batch-releases"],
  });

  const form = useForm<TerminalTestForm>({
    resolver: zodResolver(terminalTestSchema),
    defaultValues: {
      shippingConditions: "",
      storageInstructions: "",
      labelNumber: "",
      certificateOfAnalysis: "",
      shippingTemperature: "",
      transportContainer: "",
      invoiceNumber: "",
      coaFileName: "",
      invoiceFileName: "",
      batchReleaseCertFileName: "",
      packingListFileName: "",
      shippingLabel: "",
      qualityReportFileName: "",
      finalApprovalNotes: "",
    },
  });

  // Filter batches that are released
  const releasedBatches = useMemo(() => {
    return batchReleases.filter(batch => batch.releaseStatus === "released");
  }, [batchReleases]);

  const filteredBatches = useMemo(() => {
    let filtered = releasedBatches;
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [searchTerm, releasedBatches]);

  const selectedBatch = useMemo(() => {
    return batchReleases.find(b => b.id === selectedBatchId);
  }, [selectedBatchId, batchReleases]);

  // Handle file uploads
  const handleFileUpload = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name;
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: fileName
      }));
      form.setValue(fieldName as any, fileName);
      toast({
        title: "File Uploaded",
        description: `${fileName} uploaded successfully`,
      });
    }
  };

  // Mutation for submitting terminal test
  const submitTestMutation = useMutation({
    mutationFn: async (data: TerminalTestForm) => {
      return apiRequest("POST", "/api/terminal-tests", {
        batchReleaseId: selectedBatchId,
        ...data,
      });
    },
    onSuccess: () => {
      setSubmittedBatches(prev => new Set([...prev, selectedBatchId]));
      toast({
        title: "Success",
        description: "Batch approved for shipping with all documents uploaded",
      });
      form.reset();
      setUploadedFiles({});
      setSelectedBatchId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit terminal testing results",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TerminalTestForm) => {
    if (!selectedBatchId) {
      toast({
        title: "Error",
        description: "Please select a batch first",
        variant: "destructive",
      });
      return;
    }
    submitTestMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Terminal Testing</h1>
            <p className="text-gray-600 mt-1">Final documentation and dispatch clearance</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Released Batches</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{releasedBatches.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting dispatch clearance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved for Dispatch</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submittedBatches.size}</div>
                  <p className="text-xs text-muted-foreground">Ready to ship</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Batches List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Batch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      <Search className="h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search batches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredBatches.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">No released batches found</p>
                      ) : (
                        filteredBatches.map((batch) => (
                          <div
                            key={batch.id}
                            onClick={() => setSelectedBatchId(batch.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                              selectedBatchId === batch.id
                                ? "bg-green-50 border-green-300"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                            data-testid={`batch-card-${batch.id}`}
                          >
                            <p className="font-semibold text-sm">{batch.batchNumber}</p>
                            <p className="text-xs text-gray-600">{batch.productName}</p>
                            {submittedBatches.has(batch.id) && (
                              <Badge className="mt-2 bg-green-600 text-white">Approved</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Batch Details & Documentation Form */}
              <div className="lg:col-span-2">
                {selectedBatch ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pre-Dispatch Documentation & Shipping</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Batch Details */}
                      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                        <div>
                          <p className="text-xs text-gray-600">Batch Number</p>
                          <p className="font-semibold">{selectedBatch.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Product</p>
                          <p className="font-semibold">{selectedBatch.productName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Batch Size</p>
                          <p className="font-semibold">{selectedBatch.batchSize.toLocaleString()} units</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Released Date</p>
                          <p className="font-semibold">{formatDate(selectedBatch.releaseDate)}</p>
                        </div>
                      </div>

                      {/* Document Upload Form */}
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm">Documents Upload</h3>

                          {/* Certificate of Analysis */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                            <FormField
                              control={form.control}
                              name="coaFileName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    Certificate of Analysis (COA)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload("coaFileName", e)}
                                      className="text-sm cursor-pointer"
                                      data-testid="upload-coa"
                                    />
                                  </FormControl>
                                  {uploadedFiles.coaFileName && (
                                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.coaFileName}</p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Invoice */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                            <FormField
                              control={form.control}
                              name="invoiceNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    Invoice Number
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., INV-2024-12345" {...field} data-testid="input-invoice-number" className="text-sm" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="invoiceFileName"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel className="text-xs">Invoice File</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload("invoiceFileName", e)}
                                      className="text-sm cursor-pointer"
                                      data-testid="upload-invoice"
                                    />
                                  </FormControl>
                                  {uploadedFiles.invoiceFileName && (
                                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.invoiceFileName}</p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Batch Release Certificate */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                            <FormField
                              control={form.control}
                              name="batchReleaseCertFileName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                    Batch Release Certificate
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload("batchReleaseCertFileName", e)}
                                      className="text-sm cursor-pointer"
                                      data-testid="upload-batch-cert"
                                    />
                                  </FormControl>
                                  {uploadedFiles.batchReleaseCertFileName && (
                                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.batchReleaseCertFileName}</p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Packing List */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                            <FormField
                              control={form.control}
                              name="packingListFileName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                    Packing List
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload("packingListFileName", e)}
                                      className="text-sm cursor-pointer"
                                      data-testid="upload-packing-list"
                                    />
                                  </FormControl>
                                  {uploadedFiles.packingListFileName && (
                                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.packingListFileName}</p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Quality Report */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                            <FormField
                              control={form.control}
                              name="qualityReportFileName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-red-600" />
                                    Quality Report
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      onChange={(e) => handleFileUpload("qualityReportFileName", e)}
                                      className="text-sm cursor-pointer"
                                      data-testid="upload-quality-report"
                                    />
                                  </FormControl>
                                  {uploadedFiles.qualityReportFileName && (
                                    <p className="text-xs text-green-600 mt-1">✓ {uploadedFiles.qualityReportFileName}</p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 text-sm mt-4">Shipping Details</h3>

                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="labelNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Label Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., LABEL-2024-0001" {...field} className="text-sm" data-testid="input-label" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="certificateOfAnalysis"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">COA Reference #</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., COA-2024-0001" {...field} className="text-sm" data-testid="input-coa-ref" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="shippingConditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Shipping Conditions</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="e.g., Room temperature (15-25°C), protected from moisture..." rows={2} {...field} className="text-sm" data-testid="input-shipping-conditions" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="storageInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Storage Instructions (for recipient)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="e.g., Store in cool, dry place..." rows={2} {...field} className="text-sm" data-testid="input-storage" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="shippingTemperature"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Shipping Temperature (°C)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 20 ± 5" {...field} className="text-sm" data-testid="input-shipping-temp" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="transportContainer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Transport Container Type</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Insulated box with gel packs" {...field} className="text-sm" data-testid="input-container" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="finalApprovalNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Final Approval Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Any special handling instructions or final notes..." rows={2} {...field} className="text-sm" data-testid="input-final-notes" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full bg-green-600 hover:bg-green-700 sticky bottom-0"
                            disabled={submitTestMutation.isPending}
                            data-testid="button-submit-terminal"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {submitTestMutation.isPending ? "Submitting..." : "Approve & Release for Dispatch"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Select a batch to prepare pre-dispatch documentation</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
