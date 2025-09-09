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
  ClipboardCheck,
  Edit,
  MessageSquare,
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Available' | 'Busy' | 'On Leave';
  skills: string[];
  workload: number; // percentage 0-100
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'Batch Release' | 'Equipment Audit' | 'Location Audit' | 'Custom' | 'QC Testing' | 'Documentation';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  assignedTo: string;
  assignedBy: string;
  relatedBatch?: string;
  relatedOrder?: string;
  estimatedHours: number;
  actualHours?: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  dependencies: string[];
  tags: string[];
  checklist: { id: string; text: string; completed: boolean }[];
  attachments: string[];
  comments: { id: string; author: string; message: string; timestamp: Date }[];
  createdAt: Date;
  updatedAt: Date;
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
  const [selectedOrder, setSelectedOrder] = useState("all-orders");
  const [selectedStage, setSelectedStage] = useState("all-stages");
  const [viewMode, setViewMode] = useState<'gantt' | 'calendar' | 'list'>('gantt');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [showCreateTask, setShowCreateTask] = useState(false);

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

  // Mock team members data
  const teamMembers: TeamMember[] = useMemo(() => [
    {
      id: "tm1", name: "Dr. Sarah Johnson", role: "QA Manager", department: "Quality Assurance",
      email: "sarah.johnson@pharma.com", status: "Available", skills: ["GMP", "Validation", "CAPA"], workload: 75
    },
    {
      id: "tm2", name: "Michael Chen", role: "QC Analyst - Materials", department: "Quality Control",
      email: "michael.chen@pharma.com", status: "Busy", skills: ["HPLC", "UV-Vis", "Material Testing"], workload: 90
    },
    {
      id: "tm3", name: "Dr. Priya Sharma", role: "Senior QC Analyst", department: "Quality Control",
      email: "priya.sharma@pharma.com", status: "Available", skills: ["Assay", "Dissolution", "Stability"], workload: 60
    },
    {
      id: "tm4", name: "James Wilson", role: "QC Analyst - Process", department: "Quality Control",
      email: "james.wilson@pharma.com", status: "Available", skills: ["Process Monitoring", "IPCs", "Validation"], workload: 45
    },
    {
      id: "tm5", name: "Dr. Aisha Patel", role: "Documentation Specialist", department: "Quality Assurance",
      email: "aisha.patel@pharma.com", status: "On Leave", skills: ["BMR Review", "SOPs", "Regulatory"], workload: 0
    },
    {
      id: "tm6", name: "Robert Kim", role: "Production Analyst", department: "Production",
      email: "robert.kim@pharma.com", status: "Available", skills: ["Yield Calculation", "Material Balance", "Production"], workload: 70
    }
  ], []);

  // Mock tasks data
  const tasks: Task[] = useMemo(() => {
    const batchTasks = batchReleases.flatMap((batch) => 
      batch.auditSteps.map((step, index) => ({
        id: `task-${batch.id}-${step.id}`,
        title: step.name,
        description: `${step.category} for Batch ${batch.batchNumber} (${batch.productName})`,
        type: 'Batch Release' as const,
        priority: step.approval_required ? 'High' as const : 'Medium' as const,
        status: step.status === 'Approved' || step.status === 'Completed' ? 'Completed' as const :
                step.status === 'In Progress' ? 'In Progress' as const :
                step.status === 'Rejected' ? 'Cancelled' as const : 'Not Started' as const,
        assignedTo: step.assignedTo,
        assignedBy: batch.qaManager,
        relatedBatch: batch.batchNumber,
        relatedOrder: batch.orderNumber,
        estimatedHours: 4 + (index * 2),
        actualHours: step.completedAt ? 4 + (index * 1.5) : undefined,
        startDate: new Date(Date.now() - (9 - index) * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
        completedDate: step.completedAt,
        dependencies: index > 0 ? [`task-${batch.id}-step-${batch.id}-${index}`] : [],
        tags: [step.category, batch.productName.split(' ')[0]],
        checklist: [
          { id: `check-1-${step.id}`, text: "Review documentation", completed: step.status === 'Approved' || step.status === 'Completed' },
          { id: `check-2-${step.id}`, text: "Complete testing", completed: step.status === 'Approved' || step.status === 'Completed' },
          { id: `check-3-${step.id}`, text: "Get approval", completed: step.status === 'Approved' }
        ],
        attachments: step.evidence,
        comments: [
          { id: `comment-1-${step.id}`, author: step.assignedTo, message: step.findings, timestamp: step.completedAt || new Date() }
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: step.completedAt || new Date()
      }))
    );

    // Add custom tasks
    const customTasks: Task[] = [
      {
        id: "task-custom-1", title: "Equipment Calibration - HPLC System",
        description: "Quarterly calibration of HPLC system in QC Lab A", type: "Equipment Audit", priority: "High",
        status: "In Progress", assignedTo: "Michael Chen", assignedBy: "Dr. Sarah Johnson",
        estimatedHours: 8, actualHours: 6, startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), dependencies: [], tags: ["Equipment", "HPLC"],
        checklist: [
          { id: "check-1-custom-1", text: "System verification", completed: true },
          { id: "check-2-custom-1", text: "Run calibration protocol", completed: false }
        ],
        attachments: ["Calibration_Protocol_HPLC.pdf"], comments: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: "task-custom-2", title: "Clean Room Audit - Production Area B",
        description: "Monthly environmental monitoring and cleanliness audit", type: "Location Audit", priority: "Medium",
        status: "Not Started", assignedTo: "James Wilson", assignedBy: "Dr. Sarah Johnson",
        estimatedHours: 6, startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), dependencies: [], tags: ["Clean Room", "Audit"],
        checklist: [
          { id: "check-1-custom-2", text: "Particle count measurement", completed: false },
          { id: "check-2-custom-2", text: "Microbiological sampling", completed: false }
        ],
        attachments: [], comments: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    return [...batchTasks, ...customTasks];
  }, [batchReleases]);

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

      {/* Tabs for Assignment Tracker and Batch Release */}
      <Tabs defaultValue="assignment-tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignment-tracker" data-testid="tab-assignment-tracker">Assignment Tracker</TabsTrigger>
          <TabsTrigger value="batch-release" data-testid="tab-batch-release">Batch Release</TabsTrigger>
        </TabsList>

        <TabsContent value="assignment-tracker" className="space-y-6">
          {/* Assignment Tracker Header with View Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Assignment Tracker
              </h2>
              <p className="text-muted-foreground">
                Manage QA/QC team tasks with Gantt charts and calendar scheduling
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Team Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all team members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {teamMembers.filter(tm => tm.status === 'Available').length} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.priority === 'Critical').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Editable Calendar View */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <CardTitle>Calendar View</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={calendarView} onValueChange={(value: 'day' | 'week' | 'month') => setCalendarView(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Hourly calendar view with task scheduling - {calendarView === 'day' ? 'Daily' : calendarView === 'week' ? 'Weekly' : 'Monthly'} View
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calendarView === 'day' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {selectedDate.toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                        >
                          Previous Day
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedDate(new Date())}
                        >
                          Today
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                        >
                          Next Day
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hourly Schedule */}
                    <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div key={hour} className="flex border-b">
                          <div className="w-20 py-2 text-sm font-medium text-muted-foreground">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 py-2 px-4 min-h-[60px] border-l">
                            {tasks
                              .filter(task => {
                                const taskDate = new Date(task.startDate);
                                return taskDate.toDateString() === selectedDate.toDateString() && 
                                       taskDate.getHours() === hour;
                              })
                              .map(task => (
                                <div 
                                  key={task.id}
                                  className="bg-blue-100 text-blue-800 p-2 rounded mb-1 text-xs"
                                >
                                  <div className="font-medium truncate">{task.title}</div>
                                  <div className="text-blue-600">{task.assignedTo}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {calendarView === 'week' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-1">
                      <div className="p-2"></div>
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const date = new Date(selectedDate);
                        date.setDate(date.getDate() - date.getDay() + dayIndex);
                        return (
                          <div key={dayIndex} className="p-2 text-center border-b">
                            <div className="text-sm font-medium">
                              {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {date.getDate()}
                            </div>
                          </div>
                        );
                      })}
                      
                      {Array.from({ length: 24 }, (_, hour) => (
                        <>
                          <div key={`hour-${hour}`} className="p-2 text-xs text-muted-foreground border-r">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          {Array.from({ length: 7 }, (_, dayIndex) => {
                            const date = new Date(selectedDate);
                            date.setDate(date.getDate() - date.getDay() + dayIndex);
                            date.setHours(hour);
                            
                            const dayTasks = tasks.filter(task => {
                              const taskDate = new Date(task.startDate);
                              return taskDate.toDateString() === date.toDateString() && 
                                     taskDate.getHours() === hour;
                            });
                            
                            return (
                              <div key={`${hour}-${dayIndex}`} className="p-1 border-b border-r min-h-[40px]">
                                {dayTasks.map(task => (
                                  <div 
                                    key={task.id}
                                    className="bg-blue-100 text-blue-800 p-1 rounded text-xs mb-1 truncate"
                                    title={`${task.title} - ${task.assignedTo}`}
                                  >
                                    {task.title}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                )}

                {calendarView === 'month' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center font-medium border-b">
                          {day}
                        </div>
                      ))}
                      
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                        date.setDate(date.getDate() - date.getDay() + i);
                        
                        const dayTasks = tasks.filter(task => {
                          const taskDate = new Date(task.startDate);
                          return taskDate.toDateString() === date.toDateString();
                        });
                        
                        const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <div 
                            key={i} 
                            className={`p-2 border min-h-[80px] ${
                              !isCurrentMonth ? 'bg-gray-50 text-muted-foreground' : ''
                            } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                          >
                            <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                            <div className="space-y-1">
                              {dayTasks.slice(0, 3).map(task => (
                                <div 
                                  key={task.id}
                                  className="bg-blue-100 text-blue-800 p-1 rounded text-xs truncate"
                                  title={`${task.title} - ${task.assignedTo}`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dayTasks.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayTasks.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Audit Tracking Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Scheduled Audits Tracker
              </CardTitle>
              <CardDescription>
                Comprehensive tracking of all scheduled audits with status monitoring and details management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                          {task.relatedBatch && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {task.relatedBatch}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                            {task.assignedTo.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm">{task.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(task.startDate)}</div>
                          <div className="text-xs text-muted-foreground">
                            Due: {formatDate(task.dueDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            task.priority === 'Critical' ? 'destructive' :
                            task.priority === 'High' ? 'default' :
                            task.priority === 'Medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'Completed' ? 'bg-green-500' :
                            task.status === 'In Progress' ? 'bg-blue-500' :
                            task.status === 'Not Started' ? 'bg-gray-300' :
                            'bg-red-500'
                          }`} />
                          <Badge 
                            variant={
                              task.status === 'Completed' ? 'default' :
                              task.status === 'In Progress' ? 'secondary' :
                              task.status === 'Not Started' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex justify-between text-xs">
                            <span>
                              {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                            </span>
                            <span>
                              {task.checklist.length > 0 
                                ? Math.round((task.checklist.filter(c => c.completed).length / task.checklist.length) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={
                              task.checklist.length > 0 
                                ? (task.checklist.filter(c => c.completed).length / task.checklist.length) * 100 
                                : 0
                            } 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Team Members Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Overview
              </CardTitle>
              <CardDescription>
                Current team capacity and workload distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                      <Badge 
                        variant={
                          member.status === 'Available' ? 'default' :
                          member.status === 'Busy' ? 'secondary' : 'outline'
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Workload</span>
                        <span>{member.workload}%</span>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                      
                      <div className="text-xs">
                        <span className="text-muted-foreground">Skills: </span>
                        <span>{member.skills.join(', ')}</span>
                      </div>
                      
                      <div className="text-xs">
                        <span className="text-muted-foreground">Active Tasks: </span>
                        <span>
                          {tasks.filter(t => t.assignedTo === member.name && t.status === 'In Progress').length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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