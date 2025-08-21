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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
import type { ProductionOrder, TestResult } from "@shared/schema";

interface QCCheckpoint {
  id: string;
  name: string;
  stage: string;
  productionOrderId: string;
  orderNumber: string;
  productName: string;
  status: string;
  assignedTo: string;
  dueDate: Date;
  completedAt: Date | null;
  criteria: string[];
  results: Record<string, string>;
  notes: string;
}

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
    calibration_records: boolean;
    logbooks_complete: boolean;
  };
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
    case "completed":
    case "approved":
    case "pass":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "in progress":
    case "pending":
    case "under review":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "rejected":
    case "fail":
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "completed":
    case "approved":
    case "pass":
      return "default";
    case "in progress":
    case "pending":
    case "under review":
      return "secondary";
    case "rejected":
    case "fail":
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

export default function QACheckpoints() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("checkpoints");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: testResults = [] } = useQuery({
    queryKey: ["/api/test-results"],
  });

  // Mock QC checkpoints based on production orders and test results
  const qcCheckpoints = useMemo(() => {
    return (productionOrders as ProductionOrder[]).flatMap((order: ProductionOrder) => [
      {
        id: `cp-${order.id}-1`,
        name: "Raw Material Inspection",
        stage: "Pre-Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: "Completed",
        assignedTo: "QC Inspector A",
        dueDate: new Date(order.createdAt || new Date()),
        completedAt: new Date(order.createdAt || new Date()),
        criteria: ["Visual Inspection", "Identity Test", "Purity Check"],
        results: { visual: "Pass", identity: "Pass", purity: "Pass" },
        notes: "All raw materials meet specification requirements",
      },
      {
        id: `cp-${order.id}-2`,
        name: "In-Process Controls",
        stage: "Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: order.status === "Completed" ? "Completed" : "In Progress",
        assignedTo: "QC Inspector B",
        dueDate: new Date(order.dueDate),
        completedAt: order.status === "Completed" ? new Date(order.dueDate) : null,
        criteria: ["Blend Uniformity", "Tablet Weight", "Hardness", "Friability"],
        results: order.status === "Completed" 
          ? { blend: "Pass", weight: "Pass", hardness: "Pass", friability: "Pass" }
          : { blend: "Pending", weight: "Pending", hardness: "Pending", friability: "Pending" },
        notes: order.status === "Completed" ? "All in-process parameters within limits" : "Testing in progress",
      },
      {
        id: `cp-${order.id}-3`,
        name: "Final Product Testing",
        stage: "Post-Production",
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        status: order.status === "Completed" ? "Completed" : "Pending",
        assignedTo: "QC Inspector C",
        dueDate: new Date(order.dueDate),
        completedAt: order.status === "Completed" ? new Date(order.dueDate) : null,
        criteria: ["Assay", "Dissolution", "Content Uniformity", "Microbial Limits"],
        results: order.status === "Completed" 
          ? { assay: "Pass", dissolution: "Pass", uniformity: "Pass", microbial: "Pass" }
          : { assay: "Pending", dissolution: "Pending", uniformity: "Pending", microbial: "Pending" },
        notes: order.status === "Completed" ? "Product meets all quality specifications" : "Awaiting production completion",
      },
    ]);
  }, [productionOrders]);

  // Generate QA audit steps for batch release
  const generateQAAuditSteps = (batchIndex: number): QAAuditStep[] => {
    const isFirstBatch = batchIndex === 0;
    return [
      {
        id: `step-${batchIndex}-1`,
        name: "Verification of Raw Materials (RM) & Packing Materials (PM)",
        category: "Materials Verification",
        status: isFirstBatch ? "Approved" : "In Progress",
        assignedTo: "QC Analyst - Materials",
        reviewedBy: isFirstBatch ? "Senior QC Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "All approved lots verified. AR traceability confirmed. No expired materials used." : "Currently verifying lot numbers and expiry dates.",
        evidence: isFirstBatch ? ["AR-2024-001.pdf", "Lot_verification_report.xlsx", "Expiry_check_log.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-2`,
        name: "In-process Quality Checks",
        category: "Process Controls",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "QC Analyst - Process",
        reviewedBy: isFirstBatch ? "Process QC Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "All stage results within specifications: Granulation (Pass), Compression (Pass), Coating (Pass), Filling/FG (Pass)" : "Awaiting production completion",
        evidence: isFirstBatch ? ["Granulation_report.pdf", "Compression_data.xlsx", "Coating_parameters.pdf", "Filling_results.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-3`,
        name: "Finished Goods Testing",
        category: "Final Testing",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "Senior QC Analyst",
        reviewedBy: isFirstBatch ? "QA Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "Assay: 99.2%, Dissolution: Pass, Stability: Pass, Packaging integrity: Pass" : "Awaiting sample testing",
        evidence: isFirstBatch ? ["Assay_certificate.pdf", "Dissolution_report.pdf", "Stability_data.xlsx", "Package_integrity.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-4`,
        name: "Compliance of BMR/BPR",
        category: "Documentation Review",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "Documentation Specialist",
        reviewedBy: isFirstBatch ? "QA Documentation Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "BMR/BPR complete and accurate. All deviations properly recorded and justified." : "Awaiting documentation review",
        evidence: isFirstBatch ? ["BMR_complete.pdf", "BPR_review.pdf", "Deviation_log.xlsx"] : [],
        deviations: isFirstBatch ? ["Minor deviation in tablet weight - within acceptable limits"] : [],
        corrective_actions: isFirstBatch ? ["Process parameter adjustment documented"] : [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-5`,
        name: "Deviations / OOS / CAPA Review",
        category: "Quality Review",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "QA Specialist - CAPA",
        reviewedBy: isFirstBatch ? "Head of Quality" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 12 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "1 minor deviation identified and closed. No OOS results. CAPA system up to date." : "Pending deviation review",
        evidence: isFirstBatch ? ["Deviation_investigation.pdf", "CAPA_report.xlsx", "OOS_review.pdf"] : [],
        deviations: isFirstBatch ? ["DEV-2024-001: Minor tablet weight variation"] : [],
        corrective_actions: isFirstBatch ? ["Process monitoring increased", "Equipment calibration verified"] : [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-6`,
        name: "Yield & Reconciliation",
        category: "Material Balance",
        status: isFirstBatch ? "Approved" : "In Progress",
        assignedTo: "Production Analyst",
        reviewedBy: isFirstBatch ? "Production Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 12 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 6 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "Yield: 97.8%, Material balance: 99.2%, Wastage: 0.8%, Packaging reconciliation: 100%" : "Calculating material balance",
        evidence: isFirstBatch ? ["Yield_calculation.xlsx", "Material_balance.pdf", "Waste_reconciliation.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-7`,
        name: "Document Review",
        category: "Compliance Check",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "Compliance Officer",
        reviewedBy: isFirstBatch ? "Regulatory Affairs Manager" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 6 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 3 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "SOP adherence confirmed. Logbooks complete. Instrument calibrations current." : "Reviewing SOP compliance",
        evidence: isFirstBatch ? ["SOP_checklist.pdf", "Logbook_review.pdf", "Calibration_certificates.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-8`,
        name: "Approval Sign-offs",
        category: "Final Approval",
        status: isFirstBatch ? "Approved" : "Pending",
        assignedTo: "QA Manager",
        reviewedBy: isFirstBatch ? "Authorized Person" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 2 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date(Date.now() - 1 * 60 * 60 * 1000) : undefined,
        findings: isFirstBatch ? "All QA reviews completed. Digital signatures obtained. Ready for release." : "Awaiting final approvals",
        evidence: isFirstBatch ? ["QA_signoff.pdf", "Digital_signatures.pdf", "Release_authorization.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      },
      {
        id: `step-${batchIndex}-9`,
        name: "Certificate of Analysis (CoA) / Batch Release Note",
        category: "Certificate Generation",
        status: isFirstBatch ? "Completed" : "Pending",
        assignedTo: "QA Documentation",
        reviewedBy: isFirstBatch ? "Authorized Person" : undefined,
        completedAt: isFirstBatch ? new Date(Date.now() - 1 * 60 * 60 * 1000) : undefined,
        reviewedAt: isFirstBatch ? new Date() : undefined,
        findings: isFirstBatch ? "CoA generated and issued. Batch release note prepared. Distribution authorized." : "Awaiting batch release authorization",
        evidence: isFirstBatch ? ["COA_final.pdf", "Batch_release_note.pdf", "Distribution_authorization.pdf"] : [],
        deviations: [],
        corrective_actions: [],
        approval_required: true
      }
    ];
  };

  // Mock batch releases based on production orders
  const batchReleases = useMemo(() => {
    return (productionOrders as ProductionOrder[]).map((order: ProductionOrder, index: number) => {
      const auditSteps = generateQAAuditSteps(index);
      const completedSteps = auditSteps.filter(step => step.status === "Approved" || step.status === "Completed").length;
      const overallProgress = Math.round((completedSteps / auditSteps.length) * 100);
      
      return {
        id: `br-${order.id}`,
        batchNumber: `BT-${new Date(order.createdAt || new Date()).getFullYear()}-${String(index + 1).padStart(4, '0')}`,
        jobId: `JOB-${String(index + 1).padStart(6, '0')}`,
        productionOrderId: order.id,
        orderNumber: order.orderNumber,
        productName: order.skuProduct,
        manufacturingDate: new Date(order.createdAt || new Date()),
        expiryDate: new Date(new Date(order.createdAt || new Date()).getTime() + (2 * 365 * 24 * 60 * 60 * 1000)), // 2 years
        quantity: order.skuQty,
        status: index === 0 ? "Released" : overallProgress === 100 ? "Ready for Release" : "In QA Review",
        qaManager: "Dr. Sarah Johnson",
        releaseDate: index === 0 ? new Date() : null,
        certificateNumber: index === 0 ? `COA-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}` : null,
        testResults: {
          assay: "99.2%",
          dissolution: "Pass",
          uniformity: "Pass",
          microbial: "Pass",
          heavyMetals: "Pass",
          residualSolvents: "Pass"
        },
        releaseNotes: index === 0 ? "All quality parameters meet specifications. Batch approved for commercial distribution." : `QA review in progress - ${overallProgress}% complete`,
        auditSteps,
        overallProgress,
        yield_reconciliation: {
          material_balance: index === 0 ? 99.2 : 0,
          wastage_percentage: index === 0 ? 0.8 : 0,
          packaging_reconciliation: index === 0 ? 100 : 0
        },
        document_status: {
          bmr_bpr_complete: index === 0 ? true : false,
          sop_adherence: index === 0 ? true : false,
          calibration_records: index === 0 ? true : false,
          logbooks_complete: index === 0 ? true : false
        }
      };
    });
  }, [productionOrders]);

  // Filtering
  const filteredCheckpoints = useMemo(() => {
    let filtered = qcCheckpoints;

    if (searchTerm) {
      filtered = filtered.filter((cp: QCCheckpoint) =>
        cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cp.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedOrder && selectedOrder !== "all-orders") {
      filtered = filtered.filter((cp: QCCheckpoint) => cp.productionOrderId === selectedOrder);
    }

    if (selectedStage && selectedStage !== "all-stages") {
      filtered = filtered.filter((cp: QCCheckpoint) => cp.stage === selectedStage);
    }

    return filtered;
  }, [qcCheckpoints, searchTerm, selectedOrder, selectedStage]);

  // Statistics
  const stats = useMemo(() => {
    const total = qcCheckpoints.length;
    const completed = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "Completed").length;
    const inProgress = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "In Progress").length;
    const pending = qcCheckpoints.filter((cp: QCCheckpoint) => cp.status === "Pending").length;

    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [qcCheckpoints]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="qc-checkpoints-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="qc-batch-title">
            QC & Batch Release
          </h1>
          <p className="text-muted-foreground">
            Comprehensive quality control checkpoints and batch release management
          </p>
        </div>
      </div>

      {/* Tabs for QC Checkpoints and Batch Release */}
      <Tabs defaultValue="checkpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="checkpoints" data-testid="tab-checkpoints">QC Checkpoints</TabsTrigger>
          <TabsTrigger value="batch-release" data-testid="tab-batch-release">Batch Release</TabsTrigger>
        </TabsList>

        <TabsContent value="checkpoints" className="space-y-6">
          {/* QC Checkpoints Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checkpoints</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-checkpoints">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all production orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="completed-checkpoints">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="inprogress-checkpoints">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="pending-checkpoints">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting execution
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
                placeholder="Search checkpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="checkpoint-search"
              />
            </div>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by production order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-orders">All Orders</SelectItem>
                {(productionOrders as ProductionOrder[]).map((order: ProductionOrder) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.orderNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-stages">All Stages</SelectItem>
                <SelectItem value="Pre-Production">Pre-Production</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Post-Production">Post-Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>QC Checkpoints</CardTitle>
          <CardDescription>
            Stage-wise quality control checkpoints with detailed criteria and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Checkpoint</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Production Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckpoints.map((checkpoint) => (
                <TableRow key={checkpoint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{checkpoint.name}</div>
                      <div className="text-sm text-muted-foreground">{checkpoint.productName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{checkpoint.stage}</Badge>
                  </TableCell>
                  <TableCell>{checkpoint.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(checkpoint.status)}
                      <Badge variant={getStatusVariant(checkpoint.status)}>
                        {checkpoint.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{checkpoint.assignedTo}</TableCell>
                  <TableCell>{formatDate(checkpoint.dueDate)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="batch-release" className="space-y-6">
          {/* Batch Release Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-batches">
                  {batchReleases.length}
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
                  {batchReleases.filter(batch => batch.status === "Released").length}
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
                  {batchReleases.filter(batch => batch.status === "Pending Release").length}
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
                  {batchReleases.filter(batch => batch.certificateNumber).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  With COA numbers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Batch Release Workflow Management */}
          <div className="space-y-6">
            {batchReleases.map((batch) => (
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
                
                <CardContent className="space-y-4">
                  {/* QA Audit Steps Workflow */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      QA Audit Workflow Steps
                    </h4>
                    <Accordion type="single" collapsible className="w-full">
                      {batch.auditSteps.map((step, stepIndex) => (
                        <AccordionItem key={step.id} value={step.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                    step.status === 'Approved' || step.status === 'Completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : step.status === 'In Progress' 
                                      ? 'bg-blue-100 text-blue-700'
                                      : step.status === 'Rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {stepIndex + 1}
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium text-sm">{step.name}</div>
                                    <div className="text-xs text-muted-foreground">{step.category}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={
                                    step.status === 'Approved' || step.status === 'Completed' ? 'default' :
                                    step.status === 'In Progress' ? 'secondary' :
                                    step.status === 'Rejected' ? 'destructive' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {step.status}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-11 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm font-medium mb-1">Assigned To</div>
                                  <div className="text-sm text-muted-foreground">{step.assignedTo}</div>
                                </div>
                                {step.reviewedBy && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Reviewed By</div>
                                    <div className="text-sm text-muted-foreground">{step.reviewedBy}</div>
                                  </div>
                                )}
                                {step.completedAt && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Completed At</div>
                                    <div className="text-sm text-muted-foreground">{formatDate(step.completedAt)}</div>
                                  </div>
                                )}
                                {step.reviewedAt && (
                                  <div>
                                    <div className="text-sm font-medium mb-1">Reviewed At</div>
                                    <div className="text-sm text-muted-foreground">{formatDate(step.reviewedAt)}</div>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-2">Findings</div>
                                <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                  {step.findings}
                                </div>
                              </div>
                              
                              {step.evidence.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Evidence Documents</div>
                                  <div className="flex flex-wrap gap-2">
                                    {step.evidence.map((doc, docIndex) => (
                                      <Badge key={docIndex} variant="outline" className="text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {doc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {step.deviations.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2 text-orange-700">Deviations</div>
                                  <div className="space-y-1">
                                    {step.deviations.map((deviation, devIndex) => (
                                      <div key={devIndex} className="text-sm text-orange-700 bg-orange-50 p-2 rounded flex items-start">
                                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                        {deviation}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {step.corrective_actions.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2 text-blue-700">Corrective Actions</div>
                                  <div className="space-y-1">
                                    {step.corrective_actions.map((action, actionIndex) => (
                                      <div key={actionIndex} className="text-sm text-blue-700 bg-blue-50 p-2 rounded flex items-start">
                                        <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                        {action}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex space-x-2 pt-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="mr-1 h-3 w-3" />
                                  View Details
                                </Button>
                                {step.evidence.length > 0 && (
                                  <Button size="sm" variant="outline">
                                    <Download className="mr-1 h-3 w-3" />
                                    Download Evidence
                                  </Button>
                                )}
                                {step.status === 'In Progress' && (
                                  <Button size="sm">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Complete Step
                                  </Button>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  {/* Yield & Reconciliation Summary */}
                  {batch.yield_reconciliation.material_balance > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Yield & Reconciliation Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-700">{batch.yield_reconciliation.material_balance}%</div>
                          <div className="text-xs text-green-600">Material Balance</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded">
                          <div className="text-lg font-bold text-red-700">{batch.yield_reconciliation.wastage_percentage}%</div>
                          <div className="text-xs text-red-600">Wastage</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-700">{batch.yield_reconciliation.packaging_reconciliation}%</div>
                          <div className="text-xs text-blue-600">Packaging Reconciliation</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Final Actions */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {batch.releaseNotes}
                    </div>
                    <div className="flex space-x-2">
                      {batch.certificateNumber && (
                        <Button size="sm" variant="outline">
                          <Download className="mr-1 h-3 w-3" />
                          Download COA
                        </Button>
                      )}
                      {batch.status === 'Ready for Release' && (
                        <Button size="sm">
                          <Award className="mr-1 h-3 w-3" />
                          Release Batch
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Full Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}