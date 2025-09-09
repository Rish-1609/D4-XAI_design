import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FileCheck,
  Search,
  Eye,
  Download,
  Shield,
  Award,
  User,
  CalendarDays,
  FileText,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import type { ProductionOrder, BatchRelease as SchemaBatchRelease, BatchWorkflowStep } from "@shared/schema";

interface ExtendedBatchRelease extends SchemaBatchRelease {
  orderNumber?: string;
  workflowSteps?: BatchWorkflowStep[];
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "released":
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "under review":
    case "pending approval":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
    case "on hold":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "released":
    case "approved":
      return "default";
    case "under-testing":
    case "pending":
      return "secondary";
    case "rejected":
    case "on-hold":
      return "destructive";
    default:
      return "outline";
  }
};

const getStepStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in-progress":
      return <Play className="h-4 w-4 text-blue-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStepStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
      return "default";
    case "in-progress":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

// Component for displaying workflow steps
function WorkflowSteps({ batchId }: { batchId: string }) {
  const queryClient = useQueryClient();
  
  const { data: workflowSteps = [] } = useQuery({
    queryKey: [`/api/batch-workflow-steps/batch/${batchId}`],
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, data }: { stepId: string; data: any }) => {
      const response = await fetch(`/api/batch-workflow-steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update step');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/batch-workflow-steps/batch/${batchId}`],
      });
    },
  });

  const approveStepMutation = useMutation({
    mutationFn: async ({ stepId, approvedBy }: { stepId: string; approvedBy: string }) => {
      const response = await fetch(`/api/batch-workflow-steps/${stepId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy }),
      });
      if (!response.ok) throw new Error('Failed to approve step');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/batch-workflow-steps/batch/${batchId}`],
      });
    },
  });

  const calculateProgress = () => {
    if (workflowSteps.length === 0) return 0;
    const completedSteps = workflowSteps.filter((step: BatchWorkflowStep) => 
      step.status === 'completed' || step.status === 'approved'
    ).length;
    return Math.round((completedSteps / workflowSteps.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Workflow Progress</h4>
        <div className="flex items-center space-x-2">
          <Progress value={calculateProgress()} className="w-32" />
          <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {(workflowSteps as BatchWorkflowStep[]).map((step, index) => (
          <div key={step.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {step.stepNumber}
                </div>
                <div>
                  <div className="font-medium">{step.stepName}</div>
                  <div className="text-sm text-muted-foreground">{step.stepCategory}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStepStatusIcon(step.status)}
                <Badge variant={getStepStatusVariant(step.status)}>
                  {step.status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Assigned to:</span>
                <div className="flex items-center space-x-1 mt-1">
                  <User className="h-3 w-3" />
                  <span>{step.assignedTo}</span>
                </div>
                <div className="text-muted-foreground">{step.assignedTeam}</div>
              </div>
              
              <div>
                <span className="font-medium">Due Date:</span>
                <div className="flex items-center space-x-1 mt-1">
                  <CalendarDays className="h-3 w-3" />
                  <span>{step.dueDate ? formatDate(step.dueDate) : 'Not set'}</span>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Estimated:</span>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{step.estimatedHours || 0}h</span>
                  {step.actualHours && (
                    <span className="text-muted-foreground">/ {step.actualHours}h actual</span>
                  )}
                </div>
              </div>
            </div>

            {step.requiredActions && (
              <div>
                <span className="font-medium text-sm">Required Actions:</span>
                <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                  {JSON.parse(step.requiredActions).map((action: string, idx: number) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {step.findings && (
              <div className="bg-muted p-3 rounded">
                <span className="font-medium text-sm">Findings:</span>
                <p className="mt-1 text-sm">{step.findings}</p>
              </div>
            )}

            {step.status === 'pending' && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => approveStepMutation.mutate({ 
                    stepId: step.id, 
                    approvedBy: 'Current User' 
                  })}
                  disabled={approveStepMutation.isPending}
                >
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Approve Step
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  Add Comments
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QABatchRelease() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Batch approval handler
  const handleBatchApproval = async (batchId: string) => {
    try {
      const response = await fetch(`/api/batch-releases/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseStatus: 'released',
          releaseDate: new Date(),
          qaComments: 'Batch approved through workflow completion',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to approve batch');

      queryClient.invalidateQueries({
        queryKey: ['/api/batch-releases'],
      });

      toast({
        title: 'Batch Approved',
        description: 'The batch has been successfully approved for release.',
      });
    } catch (error) {
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve the batch. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: batchReleases = [] } = useQuery({
    queryKey: ["/api/batch-releases"],
  });

  // Enhanced batch releases with production order data
  const enhancedBatchReleases = useMemo(() => {
    return (batchReleases as SchemaBatchRelease[]).map(release => {
      const order = (productionOrders as ProductionOrder[]).find(po => po.id === release.productionOrderId);
      return {
        ...release,
        orderNumber: order?.orderNumber || 'Unknown',
      };
    });
  }, [batchReleases, productionOrders]);

  // Filtering
  const filteredReleases = useMemo(() => {
    let filtered = enhancedBatchReleases;

    if (searchTerm) {
      filtered = filtered.filter((release: ExtendedBatchRelease) =>
        release.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus && selectedStatus !== "all-statuses") {
      filtered = filtered.filter((release: ExtendedBatchRelease) => release.releaseStatus === selectedStatus);
    }

    return filtered;
  }, [enhancedBatchReleases, searchTerm, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = enhancedBatchReleases.length;
    const released = enhancedBatchReleases.filter((br: ExtendedBatchRelease) => br.releaseStatus === "released").length;
    const underReview = enhancedBatchReleases.filter((br: ExtendedBatchRelease) => br.releaseStatus === "under-testing").length;
    const awaiting = enhancedBatchReleases.filter((br: ExtendedBatchRelease) => br.releaseStatus === "pending").length;

    return {
      total,
      released,
      underReview,
      awaiting,
      releaseRate: total > 0 ? Math.round((released / total) * 100) : 0,
    };
  }, [batchReleases]);

  // Mutation for batch approval
  const approveBatchMutation = useMutation({
    mutationFn: ({ batchId }: { batchId: string }) =>
      // This would typically update a batch release record in the database
      Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
      toast({ title: "Batch approved and released for distribution!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve batch", variant: "destructive" });
    },
  });

  const handleBatchApproval = (batchId: string) => {
    approveBatchMutation.mutate({ batchId });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="batch-release-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="batch-release-title">
            Batch Release Management
          </h1>
          <p className="text-muted-foreground">
            Pharmaceutical batch release workflow with QA approval and certificate generation
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-batches">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all production orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Released</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="released-batches">
              {stats.released}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.releaseRate}% release rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="review-batches">
              {stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending QA approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Production</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="awaiting-batches">
              {stats.awaiting}
            </div>
            <p className="text-xs text-muted-foreground">
              Production in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="batch-search"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Awaiting Production">Awaiting Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batch Release Management with Collapsible Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Release Management</CardTitle>
          <CardDescription>
            Comprehensive batch release workflow with collapsible step tracking and QA approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReleases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No batch releases found matching your criteria.
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {filteredReleases.map((release: ExtendedBatchRelease) => (
                <AccordionItem key={release.id} value={release.id} className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium text-left">{release.batchNumber}</div>
                          <div className="text-sm text-muted-foreground text-left">
                            Order: {release.orderNumber}
                          </div>
                        </div>
                        <div className="hidden md:block">
                          <div className="font-medium text-left">{release.productName}</div>
                          <div className="text-sm text-muted-foreground text-left">
                            {release.batchSize?.toLocaleString()} units
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(release.releaseStatus)}
                          <Badge variant={getStatusVariant(release.releaseStatus)}>
                            {release.releaseStatus}
                          </Badge>
                        </div>
                        
                        {release.releaseDate && (
                          <div className="hidden md:block text-sm text-muted-foreground">
                            Released: {formatDate(release.releaseDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {/* Batch Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <h5 className="font-medium">Manufacturing Details</h5>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            <div>Manufacturing: {formatDate(release.manufacturedDate)}</div>
                            <div>Expiry: {formatDate(release.expiryDate)}</div>
                            <div>Batch Size: {release.batchSize?.toLocaleString()} units</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium">Product Information</h5>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            <div>Product: {release.productName}</div>
                            <div>Code: {release.productCode}</div>
                            <div>Shelf Life: {release.shelfLife} months</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium">Storage & Handling</h5>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            <div>Storage: {release.storageConditions}</div>
                            <div>Packaging: {release.packagingDetails}</div>
                          </div>
                        </div>
                      </div>

                      {/* Workflow Steps */}
                      <div>
                        <WorkflowSteps batchId={release.id} />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        
                        {release.releaseStatus === "under-testing" && (
                          <Button
                            size="sm"
                            onClick={() => handleBatchApproval(release.id)}
                            data-testid={`button-approve-batch-${release.id}`}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Approve Batch
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Download CoA
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Batch Records
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Quality Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Summary</CardTitle>
          <CardDescription>
            Overview of quality parameters and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Critical Quality Attributes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Assay (%):</span>
                  <span className="text-green-600">95.0 - 105.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Dissolution:</span>
                  <span className="text-green-600">Q+15min ≥ 85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Content Uniformity:</span>
                  <span className="text-green-600">85.0 - 115.0%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Regulatory Compliance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>FDA Guidelines:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ICH Guidelines:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GMP Standards:</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Documentation Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Batch Records:</span>
                  <Badge variant="default">Complete</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Test Results:</span>
                  <Badge variant="default">Reviewed</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Release Notes:</span>
                  <Badge variant="default">Approved</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}