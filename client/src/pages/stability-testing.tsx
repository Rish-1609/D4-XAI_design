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
  ChevronRight,
  Save,
} from "lucide-react";
import type { BatchRelease } from "@shared/schema";

const stabilityTestSchema = z.object({
  temperature: z.string().min(1, "Temperature is required"),
  humidity: z.string().min(1, "Humidity is required"),
  storageLocation: z.string().min(1, "Storage location is required"),
  testInterval: z.string().min(1, "Test interval is required"),
  physicalAppearance: z.string().optional(),
  assayResult: z.string().optional(),
  relatedSubstances: z.string().optional(),
  moisture: z.string().optional(),
  microbiologicalTests: z.string().optional(),
  observations: z.string().optional(),
});

type StabilityTestForm = z.infer<typeof stabilityTestSchema>;

const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function StabilityTesting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [submittedBatches, setSubmittedBatches] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: batchReleases = [] } = useQuery<BatchRelease[]>({
    queryKey: ["/api/batch-releases"],
  });

  const form = useForm<StabilityTestForm>({
    resolver: zodResolver(stabilityTestSchema),
    defaultValues: {
      temperature: "",
      humidity: "",
      storageLocation: "",
      testInterval: "",
      physicalAppearance: "",
      assayResult: "",
      relatedSubstances: "",
      moisture: "",
      microbiologicalTests: "",
      observations: "",
    },
  });

  // Filter batches that are in under-testing status
  const inProcessBatches = useMemo(() => {
    return batchReleases.filter(batch => batch.releaseStatus === "under-testing");
  }, [batchReleases]);

  const filteredBatches = useMemo(() => {
    let filtered = inProcessBatches;
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [searchTerm, inProcessBatches]);

  const selectedBatch = useMemo(() => {
    return batchReleases.find(b => b.id === selectedBatchId);
  }, [selectedBatchId, batchReleases]);

  // Mutation for submitting test results
  const submitTestMutation = useMutation({
    mutationFn: async (data: StabilityTestForm) => {
      return apiRequest("POST", "/api/stability-tests", {
        batchReleaseId: selectedBatchId,
        ...data,
      });
    },
    onSuccess: () => {
      setSubmittedBatches(prev => new Set([...prev, selectedBatchId]));
      toast({
        title: "Success",
        description: "Stability test results submitted",
      });
      form.reset();
      setSelectedBatchId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit test results",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: StabilityTestForm) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Stability Testing</h1>
            <p className="text-gray-600 mt-1">In-process batch stability test results</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stability Testing</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProcessBatches.length}</div>
                  <p className="text-xs text-muted-foreground">Batches awaiting test results</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{submittedBatches.size}</div>
                  <p className="text-xs text-muted-foreground">Test results submitted</p>
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
                        <p className="text-sm text-gray-600 text-center py-4">No batches found</p>
                      ) : (
                        filteredBatches.map((batch) => (
                          <div
                            key={batch.id}
                            onClick={() => setSelectedBatchId(batch.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                              selectedBatchId === batch.id
                                ? "bg-blue-50 border-blue-300"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                            data-testid={`batch-card-${batch.id}`}
                          >
                            <p className="font-semibold text-sm">{batch.batchNumber}</p>
                            <p className="text-xs text-gray-600">{batch.productName}</p>
                            {submittedBatches.has(batch.id) && (
                              <Badge className="mt-2 bg-green-600 text-white">Submitted</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Batch Details & Test Form */}
              <div className="lg:col-span-2">
                {selectedBatch ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Stability Test Results</CardTitle>
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
                          <p className="text-xs text-gray-600">Manufactured Date</p>
                          <p className="font-semibold">{formatDate(selectedBatch.manufacturedDate)}</p>
                        </div>
                      </div>

                      {/* Test Form */}
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                          <h3 className="font-semibold text-gray-900">Storage Conditions</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="temperature"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Temperature (°C)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 25" {...field} data-testid="input-temperature" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="humidity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Humidity (%)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 60" {...field} data-testid="input-humidity" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="storageLocation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Storage Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Stability Chamber A" {...field} data-testid="input-location" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="testInterval"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Test Interval</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 3 months" {...field} data-testid="input-interval" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <h3 className="font-semibold text-gray-900 mt-6">Test Results</h3>

                          <FormField
                            control={form.control}
                            name="physicalAppearance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Physical Appearance</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Describe physical appearance..." {...field} data-testid="input-appearance" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="assayResult"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assay Result (%)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 98.5" {...field} data-testid="input-assay" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="relatedSubstances"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Related Substances (%)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 0.5" {...field} data-testid="input-substances" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="moisture"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Moisture Content (%)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 2.5" {...field} data-testid="input-moisture" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="microbiologicalTests"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Microbiological Tests</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Passed" {...field} data-testid="input-microbiological" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="observations"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Observations & Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Any additional observations or deviations..." {...field} data-testid="input-observations" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={submitTestMutation.isPending}
                            data-testid="button-submit-stability"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {submitTestMutation.isPending ? "Submitting..." : "Submit Test Results"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Select a batch to enter stability test results</p>
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
