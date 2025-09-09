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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Eye,
  CheckSquare,
  FileCheck,
  Shield,
  ClipboardList,
  Download,
  Award,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Package,
  Target,
  Zap,
  Settings,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { ProductionOrder } from "@shared/schema";

interface QAAuditStep {
  id: string;
  name: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Approved' | 'Rejected';
  assignedTo: string;
  reviewedBy?: string;
  completedAt?: Date;
  reviewedAt?: Date;
  findings: string;
  evidence: string[];
  deviations: string[];
  corrective_actions: string[];
  approval_required: boolean;
}

interface BatchRelease {
  id: string;
  batchNumber: string;
  jobId: string;
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  manufacturingDate: Date;
  expiryDate: Date;
  quantity: number;
  status: string;
  qaManager: string;
  releaseDate: Date | null;
  certificateNumber: string | null;
  testResults: Record<string, string>;
  releaseNotes: string;
  auditSteps: QAAuditStep[];
  overallProgress: number;
  yield_reconciliation: {
    material_balance: number;
    wastage_percentage: number;
    packaging_reconciliation: number;
  };
  document_status: {
    bmr_bpr_complete: boolean;
    sop_adherence: boolean;
    deviation_investigations: boolean;
    environmental_monitoring: boolean;
    cleaning_validation: boolean;
  };
  release_criteria: {
    identity_tests: boolean;
    assay_results: boolean;
    impurity_profile: boolean;
    microbial_limits: boolean;
    sterility_testing: boolean;
    endotoxin_testing: boolean;
  };
}

// Helper functions
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short", 
    day: "numeric",
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed': case 'Released': case 'Approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'In Progress': case 'Pending Release': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'Pending': case 'Not Started': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'Rejected': case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Completed': case 'Released': case 'Approved': return "default";
    case 'In Progress': case 'Pending Release': return "secondary";
    case 'Rejected': case 'Failed': return "destructive";
    default: return "outline";
  }
};

// Mock batch release data
const mockBatchReleases: BatchRelease[] = [
  {
    id: 'br1',
    batchNumber: 'BATCH-2024-001',
    jobId: 'JOB-001',
    productionOrderId: 'po1',
    orderNumber: 'PO-2024-001',
    productName: 'Amoxicillin Capsules 500mg',
    manufacturingDate: new Date('2024-01-15'),
    expiryDate: new Date('2027-01-15'),
    quantity: 100000,
    status: 'Pending Release',
    qaManager: 'Dr. Priya Sharma',
    releaseDate: null,
    certificateNumber: null,
    testResults: {
      'Identity': 'Pass',
      'Assay': '99.8%',
      'Dissolution': 'Pass',
      'Microbial Limits': 'Pass'
    },
    releaseNotes: '',
    overallProgress: 85,
    yield_reconciliation: {
      material_balance: 99.2,
      wastage_percentage: 0.8,
      packaging_reconciliation: 100.0
    },
    document_status: {
      bmr_bpr_complete: true,
      sop_adherence: true,
      deviation_investigations: false,
      environmental_monitoring: true,
      cleaning_validation: true
    },
    release_criteria: {
      identity_tests: true,
      assay_results: true,
      impurity_profile: true,
      microbial_limits: true,
      sterility_testing: false,
      endotoxin_testing: false
    },
    auditSteps: [
      {
        id: 'step1',
        name: 'Manufacturing Record Review',
        category: 'Documentation',
        status: 'Completed',
        assignedTo: 'Dr. Priya Sharma',
        reviewedBy: 'QA Manager',
        completedAt: new Date('2024-01-20'),
        reviewedAt: new Date('2024-01-21'),
        findings: 'All manufacturing records complete and compliant',
        evidence: ['BMR-2024-001.pdf', 'Equipment_logs.pdf'],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: 'step2',
        name: 'Quality Control Testing',
        category: 'Testing',
        status: 'In Progress',
        assignedTo: 'Rajesh Kumar',
        findings: 'Testing in progress - preliminary results within specifications',
        evidence: ['QC_results_preliminary.pdf'],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: 'step3',
        name: 'Stability Data Review',
        category: 'Testing',
        status: 'Pending',
        assignedTo: 'Sneha Patel',
        findings: '',
        evidence: [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      }
    ]
  },
  {
    id: 'br2',
    batchNumber: 'BATCH-2024-002',
    jobId: 'JOB-002',
    productionOrderId: 'po2',
    orderNumber: 'PO-2024-002',
    productName: 'Metformin Tablets 500mg',
    manufacturingDate: new Date('2024-01-18'),
    expiryDate: new Date('2027-01-18'),
    quantity: 50000,
    status: 'Released',
    qaManager: 'Dr. Priya Sharma',
    releaseDate: new Date('2024-01-25'),
    certificateNumber: 'COA-2024-002',
    testResults: {
      'Identity': 'Pass',
      'Assay': '100.1%',
      'Dissolution': 'Pass',
      'Uniformity': 'Pass'
    },
    releaseNotes: 'Batch released for distribution on 2024-01-25',
    overallProgress: 100,
    yield_reconciliation: {
      material_balance: 98.9,
      wastage_percentage: 1.1,
      packaging_reconciliation: 100.0
    },
    document_status: {
      bmr_bpr_complete: true,
      sop_adherence: true,
      deviation_investigations: true,
      environmental_monitoring: true,
      cleaning_validation: true
    },
    release_criteria: {
      identity_tests: true,
      assay_results: true,
      impurity_profile: true,
      microbial_limits: true,
      sterility_testing: true,
      endotoxin_testing: true
    },
    auditSteps: [
      {
        id: 'step4',
        name: 'Manufacturing Record Review',
        category: 'Documentation',
        status: 'Approved',
        assignedTo: 'Dr. Priya Sharma',
        reviewedBy: 'QA Manager',
        completedAt: new Date('2024-01-22'),
        reviewedAt: new Date('2024-01-23'),
        findings: 'All documentation complete and approved',
        evidence: ['BMR-2024-002.pdf'],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      }
    ]
  }
];

export default function QABatchRelease() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedBatch, setExpandedBatch] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  // Filter batches based on search and status
  const filteredBatches = useMemo(() => {
    let filtered = mockBatchReleases;

    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(batch => batch.status === selectedStatus);
    }

    return filtered;
  }, [searchTerm, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = mockBatchReleases.length;
    const released = mockBatchReleases.filter(batch => batch.status === "Released").length;
    const pending = mockBatchReleases.filter(batch => batch.status === "Pending Release").length;
    const certificates = mockBatchReleases.filter(batch => batch.certificateNumber).length;

    return { total, released, pending, certificates };
  }, []);

  // Batch approval mutation
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

  // Step approval mutation
  const approveStepMutation = useMutation({
    mutationFn: ({ stepId, approvedBy }: { stepId: string; approvedBy: string }) =>
      Promise.resolve({ success: true }),
    onSuccess: () => {
      toast({ title: "Step approved successfully" });
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">QC & Batch Release</h2>
              <p className="text-gray-600 text-sm mt-1">
                Pharmaceutical batch release workflow with QA approval and certificate generation
              </p>
            </div>
            <Button onClick={() => {/* Add batch creation logic */}} data-testid="button-create-batch">
              <Plus className="h-4 w-4 mr-2" />
              New Batch Release
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-batches">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready for release
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Released Batches</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="released-batches">
                  {stats.released}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved for distribution
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="pending-batches">
                  {stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting QA approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates Generated</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="certificates-generated">
                  {stats.certificates}
                </div>
                <p className="text-xs text-muted-foreground">
                  With COA numbers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search batches, products, or order numbers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                      data-testid="input-search-batches"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending Release">Pending Release</SelectItem>
                    <SelectItem value="Released">Released</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Batch Release Management */}
          <div className="space-y-6">
            {filteredBatches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
                          <CardDescription>
                            Job ID: {batch.jobId} | Order: {batch.orderNumber} | Product: {batch.productName}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Overall Progress</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={batch.overallProgress} className="w-24" />
                          <span className="text-sm font-medium">{batch.overallProgress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(batch.status)}
                        <Badge variant={getStatusVariant(batch.status)} className="text-xs">
                          {batch.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Batch Summary Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Manufacturing Date</div>
                        <div className="text-sm font-medium">{formatDate(batch.manufacturingDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Quantity</div>
                        <div className="text-sm font-medium">{batch.quantity?.toLocaleString() || 'N/A'} units</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">QA Manager</div>
                        <div className="text-sm font-medium">{batch.qaManager}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Certificate</div>
                        <div className="text-sm font-medium">
                          {batch.certificateNumber ? (
                            <Badge variant="outline">{batch.certificateNumber}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Audit Steps Workflow */}
                  <Accordion 
                    type="single" 
                    collapsible 
                    value={expandedBatch === batch.id ? "item-1" : ""} 
                    onValueChange={(value) => setExpandedBatch(value ? batch.id : "")}
                  >
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4" />
                          <span>Audit Steps & Workflow ({batch.auditSteps.filter(step => step.status === 'Completed' || step.status === 'Approved').length}/{batch.auditSteps.length} Complete)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {batch.auditSteps.map((step) => (
                            <div key={step.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(step.status)}
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-muted-foreground">{step.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getStatusVariant(step.status)}>
                                    {step.status}
                                  </Badge>
                                  {step.approval_required && (
                                    <Badge variant="outline" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Approval Required
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <div className="text-xs text-muted-foreground">Assigned To</div>
                                  <div className="text-sm font-medium">{step.assignedTo}</div>
                                </div>
                                {step.reviewedBy && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Reviewed By</div>
                                    <div className="text-sm font-medium">{step.reviewedBy}</div>
                                  </div>
                                )}
                                {step.completedAt && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Completed Date</div>
                                    <div className="text-sm">{formatDate(step.completedAt)}</div>
                                  </div>
                                )}
                                {step.reviewedAt && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Reviewed Date</div>
                                    <div className="text-sm">{formatDate(step.reviewedAt)}</div>
                                  </div>
                                )}
                              </div>

                              {step.findings && (
                                <div className="mb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Findings</div>
                                  <div className="text-sm bg-gray-50 rounded p-2">{step.findings}</div>
                                </div>
                              )}

                              {step.evidence.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-muted-foreground mb-1">Evidence</div>
                                  <div className="flex flex-wrap gap-1">
                                    {step.evidence.map((evidence, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {evidence}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.status === 'Completed' && step.approval_required && (
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
                                    <Eye className="mr-1 h-3 w-3" />
                                    Review Details
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </div>
                    
                    {batch.status === 'Pending Release' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleBatchApproval(batch.id)}
                        disabled={approveBatchMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve & Release Batch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}