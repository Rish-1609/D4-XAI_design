import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Calendar,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  Users,
  ClipboardCheck,
  FileX,
  Settings,
  Shield
} from "lucide-react";
import { format } from "date-fns";

// CAPA interfaces
interface CAPA {
  id: string;
  capaNumber: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  source: string;
  detectedBy: string;
  detectedDate: Date;
  reportedBy: string;
  reportedDate: Date;
  assignedTo: string;
  department: string;
  priority: string;
  severity: string;
  status: string;
  rootCauseAnalysis: string;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  effectivenessVerification: string;
  targetCloseDate: Date;
  actualCloseDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  relatedDocuments: string[];
  costImpact: number;
  riskLevel: string;
  gmpImpact: boolean;
  regulatoryReporting: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  targetDate: Date;
  actualDate?: Date;
  status: string;
  evidence: string;
  verifiedBy?: string;
  verificationDate?: Date;
}

interface PreventiveAction {
  id: string;
  description: string;
  assignedTo: string;
  targetDate: Date;
  actualDate?: Date;
  status: string;
  evidence: string;
  verifiedBy?: string;
  verificationDate?: Date;
}

interface Deviation {
  id: string;
  deviationNumber: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  detectedBy: string;
  detectedDate: Date;
  reportedBy: string;
  reportedDate: Date;
  department: string;
  priority: string;
  severity: string;
  status: string;
  immediate_action: string;
  investigationRequired: boolean;
  gmpImpact: boolean;
  productImpact: boolean;
  capaRequired: boolean;
  capaId?: string;
  closedBy?: string;
  closedDate?: Date;
}

export default function QACAPAManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewCAPADialog, setShowNewCAPADialog] = useState(false);
  const [showNewDeviationDialog, setShowNewDeviationDialog] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<CAPA | null>(null);

  // Generate comprehensive CAPA data
  const capaData: CAPA[] = useMemo(() => [
    {
      id: "CAPA-001",
      capaNumber: "CAPA-2024-001",
      title: "Temperature Excursion in Cold Storage",
      description: "Temperature exceeded acceptable range (2-8°C) during weekend shift, reaching 12°C for 4 hours",
      category: "Equipment",
      subcategory: "Cold Storage",
      source: "Deviation Report",
      detectedBy: "Sarah Johnson",
      detectedDate: new Date("2024-01-15"),
      reportedBy: "Mike Chen",
      reportedDate: new Date("2024-01-16"),
      assignedTo: "Alex Thompson",
      department: "Warehouse Operations",
      priority: "High",
      severity: "Major",
      status: "Investigation",
      rootCauseAnalysis: "HVAC system failure due to worn compressor belt. Weekend maintenance schedule inadequate.",
      correctiveActions: [
        {
          id: "CA-001-01",
          description: "Replace HVAC compressor belt",
          assignedTo: "Maintenance Team",
          targetDate: new Date("2024-01-20"),
          actualDate: new Date("2024-01-19"),
          status: "Completed",
          evidence: "Work order #WO-2024-0123, Parts receipt",
          verifiedBy: "John Smith",
          verificationDate: new Date("2024-01-19")
        },
        {
          id: "CA-001-02",
          description: "Implement temperature monitoring alerts",
          assignedTo: "IT Team",
          targetDate: new Date("2024-01-25"),
          status: "In Progress",
          evidence: "System configuration in progress",
        }
      ],
      preventiveActions: [
        {
          id: "PA-001-01",
          description: "Establish preventive maintenance schedule for HVAC systems",
          assignedTo: "Maintenance Manager",
          targetDate: new Date("2024-02-01"),
          status: "Planned",
          evidence: "",
        },
        {
          id: "PA-001-02",
          description: "Install backup temperature monitoring system",
          assignedTo: "Facilities Team",
          targetDate: new Date("2024-02-15"),
          status: "Planned",
          evidence: "",
        }
      ],
      effectivenessVerification: "Monitor temperature stability for 30 days post-implementation",
      targetCloseDate: new Date("2024-02-20"),
      relatedDocuments: ["DEV-2024-001", "WO-2024-0123", "TR-TEMP-001"],
      costImpact: 12500,
      riskLevel: "High",
      gmpImpact: true,
      regulatoryReporting: true,
      createdAt: new Date("2024-01-16"),
      updatedAt: new Date("2024-01-19")
    },
    {
      id: "CAPA-002",
      capaNumber: "CAPA-2024-002",
      title: "Label Mix-up in Packaging",
      description: "Incorrect labels applied to finished product batch ABC-123, detected during final inspection",
      category: "Human Error",
      subcategory: "Packaging Operations",
      source: "Quality Inspection",
      detectedBy: "Emma Rodriguez",
      detectedDate: new Date("2024-01-18"),
      reportedBy: "Emma Rodriguez",
      reportedDate: new Date("2024-01-18"),
      assignedTo: "Lisa Wang",
      department: "Packaging",
      priority: "Critical",
      severity: "Major",
      status: "Corrective Actions",
      rootCauseAnalysis: "Inadequate verification process during label changeover. Operator training insufficient on new label verification procedure.",
      correctiveActions: [
        {
          id: "CA-002-01",
          description: "Quarantine affected batch and conduct full investigation",
          assignedTo: "QA Team",
          targetDate: new Date("2024-01-19"),
          actualDate: new Date("2024-01-18"),
          status: "Completed",
          evidence: "Quarantine notice QN-2024-001",
          verifiedBy: "QA Manager",
          verificationDate: new Date("2024-01-18")
        },
        {
          id: "CA-002-02",
          description: "Re-label affected batch with correct labels",
          assignedTo: "Packaging Team",
          targetDate: new Date("2024-01-22"),
          status: "In Progress",
          evidence: "Work in progress",
        }
      ],
      preventiveActions: [
        {
          id: "PA-002-01",
          description: "Implement double-verification system for label changeovers",
          assignedTo: "Packaging Supervisor",
          targetDate: new Date("2024-02-05"),
          status: "Planned",
          evidence: "",
        },
        {
          id: "PA-002-02",
          description: "Enhanced operator training on label verification",
          assignedTo: "Training Coordinator",
          targetDate: new Date("2024-02-10"),
          status: "Planned",
          evidence: "",
        }
      ],
      effectivenessVerification: "Monitor label changeover process for next 10 batches",
      targetCloseDate: new Date("2024-02-25"),
      relatedDocuments: ["QN-2024-001", "DEV-2024-002", "SOP-PKG-001"],
      costImpact: 8750,
      riskLevel: "Critical",
      gmpImpact: true,
      regulatoryReporting: true,
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-01-20")
    },
    {
      id: "CAPA-003",
      capaNumber: "CAPA-2024-003",
      title: "Out-of-Specification Test Results",
      description: "API assay results consistently below specification (98.5% vs 99.0-101.0% spec)",
      category: "Process",
      subcategory: "Manufacturing",
      source: "QC Testing",
      detectedBy: "Robert Kim",
      detectedDate: new Date("2024-01-20"),
      reportedBy: "Anna Martinez",
      reportedDate: new Date("2024-01-21"),
      assignedTo: "David Brown",
      department: "Manufacturing",
      priority: "High",
      severity: "Major",
      status: "Root Cause Analysis",
      rootCauseAnalysis: "In progress: investigating raw material variability and mixing parameters",
      correctiveActions: [],
      preventiveActions: [],
      effectivenessVerification: "",
      targetCloseDate: new Date("2024-03-15"),
      relatedDocuments: ["TR-API-2024-001", "DEV-2024-003"],
      costImpact: 0,
      riskLevel: "High",
      gmpImpact: true,
      regulatoryReporting: false,
      createdAt: new Date("2024-01-21"),
      updatedAt: new Date("2024-01-21")
    }
  ], []);

  // Generate deviation data
  const deviationData: Deviation[] = useMemo(() => [
    {
      id: "DEV-001",
      deviationNumber: "DEV-2024-001",
      title: "Temperature Excursion in Cold Storage",
      description: "Temperature exceeded acceptable range during weekend shift",
      category: "Equipment",
      subcategory: "Cold Storage",
      detectedBy: "Sarah Johnson",
      detectedDate: new Date("2024-01-15"),
      reportedBy: "Mike Chen",
      reportedDate: new Date("2024-01-16"),
      department: "Warehouse Operations",
      priority: "High",
      severity: "Major",
      status: "CAPA Required",
      immediate_action: "Moved products to backup cold storage, contacted maintenance",
      investigationRequired: true,
      gmpImpact: true,
      productImpact: false,
      capaRequired: true,
      capaId: "CAPA-001"
    },
    {
      id: "DEV-002",
      deviationNumber: "DEV-2024-002",
      title: "Label Mix-up in Packaging",
      description: "Incorrect labels applied to finished product batch",
      category: "Human Error",
      subcategory: "Packaging Operations",
      detectedBy: "Emma Rodriguez",
      detectedDate: new Date("2024-01-18"),
      reportedBy: "Emma Rodriguez",
      reportedDate: new Date("2024-01-18"),
      department: "Packaging",
      priority: "Critical",
      severity: "Major",
      status: "CAPA Initiated",
      immediate_action: "Quarantined affected batch, stopped production line",
      investigationRequired: true,
      gmpImpact: true,
      productImpact: true,
      capaRequired: true,
      capaId: "CAPA-002"
    },
    {
      id: "DEV-003",
      deviationNumber: "DEV-2024-003",
      title: "Equipment Malfunction - Tablet Press",
      description: "Tablet press stopped during production, weight variation detected",
      category: "Equipment",
      subcategory: "Manufacturing Equipment",
      detectedBy: "James Wilson",
      detectedDate: new Date("2024-01-22"),
      reportedBy: "Production Supervisor",
      reportedDate: new Date("2024-01-22"),
      department: "Manufacturing",
      priority: "Medium",
      severity: "Minor",
      status: "Investigation",
      immediate_action: "Stopped production, initiated equipment inspection",
      investigationRequired: true,
      gmpImpact: false,
      productImpact: true,
      capaRequired: false
    }
  ], []);

  // Filter and search functionality
  const filteredCapas = useMemo(() => {
    return capaData.filter(capa => {
      const matchesSearch = capa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          capa.capaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          capa.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || capa.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || capa.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || capa.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [capaData, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const filteredDeviations = useMemo(() => {
    return deviationData.filter(deviation => {
      const matchesSearch = deviation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deviation.deviationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || deviation.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || deviation.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || deviation.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [deviationData, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Statistics calculations
  const capaStats = useMemo(() => {
    const total = capaData.length;
    const open = capaData.filter(c => !["Closed", "Cancelled"].includes(c.status)).length;
    const overdue = capaData.filter(c => new Date() > c.targetCloseDate && !["Closed", "Cancelled"].includes(c.status)).length;
    const critical = capaData.filter(c => c.priority === "Critical").length;
    const avgClosureTime = 14; // Days - calculated from historical data
    
    return { total, open, overdue, critical, avgClosureTime };
  }, [capaData]);

  const deviationStats = useMemo(() => {
    const total = deviationData.length;
    const capaRequired = deviationData.filter(d => d.capaRequired).length;
    const gmpImpact = deviationData.filter(d => d.gmpImpact).length;
    const thisMonth = deviationData.filter(d => {
      const now = new Date();
      const devDate = d.detectedDate;
      return devDate.getMonth() === now.getMonth() && devDate.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, capaRequired, gmpImpact, thisMonth };
  }, [deviationData]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Closed": return "default";
      case "Cancelled": return "secondary";
      case "Investigation": return "destructive";
      case "Root Cause Analysis": return "destructive";
      case "Corrective Actions": return "outline";
      case "Preventive Actions": return "outline";
      case "Effectiveness Verification": return "outline";
      case "Open": return "destructive";
      case "CAPA Required": return "destructive";
      case "CAPA Initiated": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "outline";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">CAPA Management</h1>
              <p className="text-gray-600 mt-1">Corrective and Preventive Actions System</p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showNewDeviationDialog} onOpenChange={setShowNewDeviationDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-new-deviation">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Deviation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Report New Deviation</DialogTitle>
                    <DialogDescription>
                      Document a deviation or non-conformance that requires investigation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Brief description of deviation" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="human-error">Human Error</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="environmental">Environmental</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea id="description" placeholder="Detailed description of what happened..." rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="quality">Quality</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="immediate-action">Immediate Action Taken</Label>
                      <Textarea id="immediate-action" placeholder="Describe immediate actions taken to address the issue..." rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewDeviationDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowNewDeviationDialog(false)} data-testid="button-submit-deviation">
                      Submit Deviation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showNewCAPADialog} onOpenChange={setShowNewCAPADialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-capa">
                    <Plus className="w-4 h-4 mr-2" />
                    New CAPA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New CAPA</DialogTitle>
                    <DialogDescription>
                      Initiate a new Corrective and Preventive Action
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capa-title">CAPA Title</Label>
                        <Input id="capa-title" placeholder="Brief title for CAPA" />
                      </div>
                      <div>
                        <Label htmlFor="capa-category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="human-error">Human Error</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="environmental">Environmental</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="capa-description">Problem Description</Label>
                      <Textarea id="capa-description" placeholder="Detailed description of the problem..." rows={3} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="capa-priority">Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="capa-severity">Severity</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="capa-assigned">Assigned To</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alex-thompson">Alex Thompson</SelectItem>
                            <SelectItem value="lisa-wang">Lisa Wang</SelectItem>
                            <SelectItem value="david-brown">David Brown</SelectItem>
                            <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="root-cause">Root Cause Analysis</Label>
                      <Textarea id="root-cause" placeholder="Identify and describe the root cause..." rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="corrective-actions">Corrective Actions</Label>
                      <Textarea id="corrective-actions" placeholder="Describe actions to fix the immediate problem..." rows={2} />
                    </div>
                    <div>
                      <Label htmlFor="preventive-actions">Preventive Actions</Label>
                      <Textarea id="preventive-actions" placeholder="Describe actions to prevent recurrence..." rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target-date">Target Close Date</Label>
                        <Input id="target-date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="cost-impact">Estimated Cost Impact</Label>
                        <Input id="cost-impact" type="number" placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewCAPADialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowNewCAPADialog(false)} data-testid="button-submit-capa">
                      Create CAPA
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capa-list">CAPA List</TabsTrigger>
              <TabsTrigger value="deviations">Deviations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total CAPAs</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-capas">{capaStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {capaStats.open} currently open
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open CAPAs</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600" data-testid="text-open-capas">{capaStats.open}</div>
                    <p className="text-xs text-muted-foreground">
                      {capaStats.overdue} overdue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical CAPAs</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-critical-capas">{capaStats.critical}</div>
                    <p className="text-xs text-muted-foreground">
                      Require immediate attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Closure Time</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-avg-closure">{capaStats.avgClosureTime}</div>
                    <p className="text-xs text-muted-foreground">
                      days to closure
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Deviations</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-deviations">{deviationStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {deviationStats.thisMonth} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CAPA Required</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600" data-testid="text-capa-required">{deviationStats.capaRequired}</div>
                    <p className="text-xs text-muted-foreground">
                      Deviations requiring CAPA
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GMP Impact</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-gmp-impact">{deviationStats.gmpImpact}</div>
                    <p className="text-xs text-muted-foreground">
                      GMP-impacting deviations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-month-deviations">{deviationStats.thisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                      New deviations
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent CAPAs</CardTitle>
                    <CardDescription>Latest CAPA activities requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {capaData.slice(0, 3).map(capa => (
                        <div key={capa.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{capa.title}</p>
                            <p className="text-xs text-gray-500">{capa.capaNumber} • {capa.assignedTo}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(capa.status)} className="text-xs">
                              {capa.status}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(capa.priority)} className="text-xs">
                              {capa.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Deviations</CardTitle>
                    <CardDescription>Latest deviation reports and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deviationData.slice(0, 3).map(deviation => (
                        <div key={deviation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{deviation.title}</p>
                            <p className="text-xs text-gray-500">{deviation.deviationNumber} • {deviation.detectedBy}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(deviation.status)} className="text-xs">
                              {deviation.status}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(deviation.priority)} className="text-xs">
                              {deviation.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="capa-list" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">CAPA List</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search CAPAs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-capa-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Investigation">Investigation</SelectItem>
                      <SelectItem value="Root Cause Analysis">Root Cause Analysis</SelectItem>
                      <SelectItem value="Corrective Actions">Corrective Actions</SelectItem>
                      <SelectItem value="Preventive Actions">Preventive Actions</SelectItem>
                      <SelectItem value="Effectiveness Verification">Effectiveness Verification</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CAPA Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Target Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCapas.map(capa => (
                        <TableRow key={capa.id} data-testid={`row-capa-${capa.id}`}>
                          <TableCell className="font-medium">{capa.capaNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{capa.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{capa.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{capa.category}</Badge>
                          </TableCell>
                          <TableCell>{capa.assignedTo}</TableCell>
                          <TableCell>
                            <Badge variant={getPriorityBadgeVariant(capa.priority)}>
                              {capa.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(capa.status)}>
                              {capa.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(capa.targetCloseDate, "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${capa.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedCapa(capa)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit CAPA</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem>Add Comment</DropdownMenuItem>
                                <DropdownMenuItem>Generate Report</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deviations" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Deviation Reports</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search deviations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-deviation-search"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Investigation">Investigation</SelectItem>
                      <SelectItem value="CAPA Required">CAPA Required</SelectItem>
                      <SelectItem value="CAPA Initiated">CAPA Initiated</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deviation Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Detected By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>CAPA ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeviations.map(deviation => (
                        <TableRow key={deviation.id} data-testid={`row-deviation-${deviation.id}`}>
                          <TableCell className="font-medium">{deviation.deviationNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deviation.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{deviation.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{deviation.category}</Badge>
                          </TableCell>
                          <TableCell>{deviation.detectedBy}</TableCell>
                          <TableCell>{deviation.department}</TableCell>
                          <TableCell>
                            <Badge variant={getPriorityBadgeVariant(deviation.priority)}>
                              {deviation.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(deviation.status)}>
                              {deviation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deviation.capaId ? (
                              <Badge variant="outline" className="text-xs">
                                {deviation.capaId}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-deviation-actions-${deviation.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Deviation</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                {deviation.capaRequired && !deviation.capaId && (
                                  <DropdownMenuItem>Initiate CAPA</DropdownMenuItem>
                                )}
                                <DropdownMenuItem>Generate Report</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CAPA Status Distribution</CardTitle>
                    <CardDescription>Breakdown of CAPAs by current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { status: "Investigation", count: 1, color: "bg-red-500" },
                        { status: "Root Cause Analysis", count: 1, color: "bg-red-400" },
                        { status: "Corrective Actions", count: 1, color: "bg-yellow-500" },
                        { status: "Preventive Actions", count: 0, color: "bg-yellow-400" },
                        { status: "Effectiveness Verification", count: 0, color: "bg-blue-500" },
                        { status: "Closed", count: 0, color: "bg-green-500" }
                      ].map(item => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded ${item.color}`}></div>
                            <span className="text-sm">{item.status}</span>
                          </div>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Analysis</CardTitle>
                    <CardDescription>Most common deviation categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: "Equipment", count: 2, percentage: 67 },
                        { category: "Human Error", count: 1, percentage: 33 },
                        { category: "Process", count: 0, percentage: 0 },
                        { category: "Material", count: 0, percentage: 0 }
                      ].map(item => (
                        <div key={item.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{item.category}</span>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Key performance indicators for CAPA management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <div className="text-sm text-gray-500">On-time Closure Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">14</div>
                        <div className="text-sm text-gray-500">Avg. Days to Close</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">8%</div>
                        <div className="text-sm text-gray-500">Repeat Deviations</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">95%</div>
                        <div className="text-sm text-gray-500">Effectiveness Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trend</CardTitle>
                    <CardDescription>CAPA and deviation trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>January 2024</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-600">3 CAPAs</span>
                          <span className="text-orange-600">5 Deviations</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>December 2023</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-600">2 CAPAs</span>
                          <span className="text-orange-600">3 Deviations</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>November 2023</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-600">1 CAPA</span>
                          <span className="text-orange-600">2 Deviations</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* CAPA Details Dialog */}
      {selectedCapa && (
        <Dialog open={!!selectedCapa} onOpenChange={() => setSelectedCapa(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCapa.capaNumber}: {selectedCapa.title}</DialogTitle>
              <DialogDescription>Complete CAPA details and progress tracking</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">CAPA Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Category:</span> {selectedCapa.category}</div>
                    <div><span className="font-medium">Assigned To:</span> {selectedCapa.assignedTo}</div>
                    <div><span className="font-medium">Department:</span> {selectedCapa.department}</div>
                    <div><span className="font-medium">Priority:</span> 
                      <Badge variant={getPriorityBadgeVariant(selectedCapa.priority)} className="ml-2">
                        {selectedCapa.priority}
                      </Badge>
                    </div>
                    <div><span className="font-medium">Status:</span> 
                      <Badge variant={getStatusBadgeVariant(selectedCapa.status)} className="ml-2">
                        {selectedCapa.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Detected:</span> {format(selectedCapa.detectedDate, "MMM dd, yyyy")}</div>
                    <div><span className="font-medium">Reported:</span> {format(selectedCapa.reportedDate, "MMM dd, yyyy")}</div>
                    <div><span className="font-medium">Target Close:</span> {format(selectedCapa.targetCloseDate, "MMM dd, yyyy")}</div>
                    <div><span className="font-medium">Cost Impact:</span> ${selectedCapa.costImpact.toLocaleString()}</div>
                    <div><span className="font-medium">Risk Level:</span> 
                      <Badge variant={selectedCapa.riskLevel === "Critical" ? "destructive" : "outline"} className="ml-2">
                        {selectedCapa.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Problem Description</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{selectedCapa.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Root Cause Analysis</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{selectedCapa.rootCauseAnalysis}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Corrective Actions</h4>
                <div className="space-y-3">
                  {selectedCapa.correctiveActions.map(action => (
                    <div key={action.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{action.description}</h5>
                        <Badge variant={action.status === "Completed" ? "default" : action.status === "In Progress" ? "outline" : "secondary"}>
                          {action.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div><span className="font-medium">Assigned To:</span> {action.assignedTo}</div>
                        <div><span className="font-medium">Target Date:</span> {format(action.targetDate, "MMM dd, yyyy")}</div>
                        {action.actualDate && (
                          <div><span className="font-medium">Completed:</span> {format(action.actualDate, "MMM dd, yyyy")}</div>
                        )}
                        {action.verifiedBy && (
                          <div><span className="font-medium">Verified By:</span> {action.verifiedBy}</div>
                        )}
                      </div>
                      {action.evidence && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Evidence:</span> {action.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Preventive Actions</h4>
                <div className="space-y-3">
                  {selectedCapa.preventiveActions.map(action => (
                    <div key={action.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{action.description}</h5>
                        <Badge variant={action.status === "Completed" ? "default" : action.status === "In Progress" ? "outline" : "secondary"}>
                          {action.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div><span className="font-medium">Assigned To:</span> {action.assignedTo}</div>
                        <div><span className="font-medium">Target Date:</span> {format(action.targetDate, "MMM dd, yyyy")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCapa(null)}>Close</Button>
              <Button>Update CAPA</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}