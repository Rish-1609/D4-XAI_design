import React, { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Shield,
  Edit,
  Save,
  X,
  Upload,
  Download,
  CheckSquare,
  AlertOctagon,
  UserCheck,
  FileCheck,
  Zap
} from "lucide-react";
import { format } from "date-fns";

// Enhanced CAPA interfaces with editing capabilities
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
  closureDetails?: ClosureDetails;
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

interface ClosureDetails {
  effectivenessConfirmed: boolean;
  allActionsCompleted: boolean;
  documentationComplete: boolean;
  rootCauseAddressed: boolean;
  preventiveMeasuresImplemented: boolean;
  closureJustification: string;
  lessons_learned: string;
  followUpRequired: boolean;
  followUpDetails?: string;
  closedBy: string;
  closedDate: Date;
  finalApprover: string;
  finalApprovalDate: Date;
  regulatoryNotificationComplete: boolean;
}

interface EditableCell {
  id: string;
  field: string;
  isEditing: boolean;
  originalValue: string;
  newValue: string;
}

export default function QACAPAEnhanced() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewCAPADialog, setShowNewCAPADialog] = useState(false);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<CAPA | null>(null);
  const [editingCells, setEditingCells] = useState<EditableCell[]>([]);
  const [closureData, setClosureData] = useState<Partial<ClosureDetails>>({});

  // Generate comprehensive CAPA data with enhanced editing capabilities
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
      status: "Effectiveness Verification",
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
          actualDate: new Date("2024-01-24"),
          status: "Completed",
          evidence: "System configuration documentation",
          verifiedBy: "Tech Lead",
          verificationDate: new Date("2024-01-24")
        }
      ],
      preventiveActions: [
        {
          id: "PA-001-01",
          description: "Establish preventive maintenance schedule for HVAC systems",
          assignedTo: "Maintenance Manager",
          targetDate: new Date("2024-02-01"),
          actualDate: new Date("2024-01-30"),
          status: "Completed",
          evidence: "Maintenance schedule document MS-2024-001",
          verifiedBy: "Operations Manager",
          verificationDate: new Date("2024-01-30")
        },
        {
          id: "PA-001-02",
          description: "Install backup temperature monitoring system",
          assignedTo: "Facilities Team",
          targetDate: new Date("2024-02-15"),
          actualDate: new Date("2024-02-10"),
          status: "Completed",
          evidence: "Installation certificate and test results",
          verifiedBy: "QA Manager",
          verificationDate: new Date("2024-02-10")
        }
      ],
      effectivenessVerification: "Temperature monitoring for 30 days shows consistent performance within specifications. No further excursions detected.",
      targetCloseDate: new Date("2024-02-20"),
      relatedDocuments: ["DEV-2024-001", "WO-2024-0123", "TR-TEMP-001"],
      costImpact: 12500,
      riskLevel: "High",
      gmpImpact: true,
      regulatoryReporting: true,
      createdAt: new Date("2024-01-16"),
      updatedAt: new Date("2024-02-12")
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
      status: "Preventive Actions",
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
          actualDate: new Date("2024-01-21"),
          status: "Completed",
          evidence: "Batch record update and photographic evidence",
          verifiedBy: "Production Manager",
          verificationDate: new Date("2024-01-21")
        }
      ],
      preventiveActions: [
        {
          id: "PA-002-01",
          description: "Implement double-verification system for label changeovers",
          assignedTo: "Packaging Supervisor",
          targetDate: new Date("2024-02-05"),
          status: "In Progress",
          evidence: "Procedure draft under review",
        },
        {
          id: "PA-002-02",
          description: "Enhanced operator training on label verification",
          assignedTo: "Training Coordinator",
          targetDate: new Date("2024-02-10"),
          status: "In Progress",
          evidence: "Training materials being developed",
        }
      ],
      effectivenessVerification: "Pending completion of preventive actions",
      targetCloseDate: new Date("2024-02-25"),
      relatedDocuments: ["QN-2024-001", "DEV-2024-002", "SOP-PKG-001"],
      costImpact: 8750,
      riskLevel: "Critical",
      gmpImpact: true,
      regulatoryReporting: true,
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-02-08")
    }
  ], []);

  // Enhanced editing functions
  const startEditing = (id: string, field: string, currentValue: string) => {
    const newEditableCell: EditableCell = {
      id,
      field,
      isEditing: true,
      originalValue: currentValue,
      newValue: currentValue
    };
    setEditingCells(prev => [...prev.filter(cell => !(cell.id === id && cell.field === field)), newEditableCell]);
  };

  const updateEditingValue = (id: string, field: string, newValue: string) => {
    setEditingCells(prev => 
      prev.map(cell => 
        cell.id === id && cell.field === field 
          ? { ...cell, newValue }
          : cell
      )
    );
  };

  const saveEdit = (id: string, field: string) => {
    const editingCell = editingCells.find(cell => cell.id === id && cell.field === field);
    if (editingCell && editingCell.newValue !== editingCell.originalValue) {
      // Here you would typically make an API call to update the data
      toast({
        title: "Updated Successfully",
        description: `${field} has been updated.`,
      });
    }
    setEditingCells(prev => prev.filter(cell => !(cell.id === id && cell.field === field)));
  };

  const cancelEdit = (id: string, field: string) => {
    setEditingCells(prev => prev.filter(cell => !(cell.id === id && cell.field === field)));
  };

  const isEditing = (id: string, field: string) => {
    return editingCells.some(cell => cell.id === id && cell.field === field);
  };

  const getEditingValue = (id: string, field: string) => {
    const editingCell = editingCells.find(cell => cell.id === id && cell.field === field);
    return editingCell?.newValue || "";
  };

  // CAPA Closure workflow
  const initiateClosure = (capa: CAPA) => {
    setSelectedCapa(capa);
    setClosureData({
      effectivenessConfirmed: false,
      allActionsCompleted: false,
      documentationComplete: false,
      rootCauseAddressed: false,
      preventiveMeasuresImplemented: false,
      followUpRequired: false,
      regulatoryNotificationComplete: false
    });
    setShowClosureDialog(true);
  };

  const completeClosure = () => {
    if (!selectedCapa) return;

    const requiredFields = [
      'effectivenessConfirmed',
      'allActionsCompleted', 
      'documentationComplete',
      'rootCauseAddressed',
      'preventiveMeasuresImplemented'
    ];

    const allRequiredComplete = requiredFields.every(field => closureData[field as keyof ClosureDetails]);

    if (!allRequiredComplete) {
      toast({
        title: "Closure Incomplete",
        description: "All required closure criteria must be confirmed before closing the CAPA.",
        variant: "destructive"
      });
      return;
    }

    if (!closureData.closureJustification || !closureData.lessons_learned) {
      toast({
        title: "Missing Information",
        description: "Closure justification and lessons learned are required.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically make an API call to close the CAPA
    toast({
      title: "CAPA Closed Successfully",
      description: `${selectedCapa.capaNumber} has been closed and archived.`,
    });

    setShowClosureDialog(false);
    setSelectedCapa(null);
    setClosureData({});
  };

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Closed": return "default";
      case "Cancelled": return "secondary";
      case "Investigation": return "destructive";
      case "Root Cause Analysis": return "destructive";
      case "Corrective Actions": return "outline";
      case "Preventive Actions": return "outline";
      case "Effectiveness Verification": return "outline";
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
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Enhanced CAPA Management</h1>
              <p className="text-gray-600 mt-1">Comprehensive Corrective and Preventive Actions with Editing & Closure Workflow</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" data-testid="button-export-data">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button data-testid="button-new-capa">
                <Plus className="w-4 h-4 mr-2" />
                New CAPA
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capa-management">CAPA Management</TabsTrigger>
              <TabsTrigger value="closure-workflow">Closure Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total CAPAs</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-capas">{capaData.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Active and closed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ready to Close</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-ready-close">1</div>
                    <p className="text-xs text-muted-foreground">
                      Effectiveness verified
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-in-progress">1</div>
                    <p className="text-xs text-muted-foreground">
                      Actions being implemented
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical CAPAs</CardTitle>
                    <AlertOctagon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-critical">1</div>
                    <p className="text-xs text-muted-foreground">
                      Require immediate attention
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="capa-management" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">CAPA Management - Editable View</h2>
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
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CAPA Number</TableHead>
                        <TableHead>Title</TableHead>
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
                            {isEditing(capa.id, "title") ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={getEditingValue(capa.id, "title")}
                                  onChange={(e) => updateEditingValue(capa.id, "title", e.target.value)}
                                  className="h-8"
                                />
                                <Button size="sm" variant="ghost" onClick={() => saveEdit(capa.id, "title")}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => cancelEdit(capa.id, "title")}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>{capa.title}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditing(capa.id, "title", capa.title)}
                                  data-testid={`button-edit-title-${capa.id}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing(capa.id, "assignedTo") ? (
                              <div className="flex items-center space-x-2">
                                <Select 
                                  value={getEditingValue(capa.id, "assignedTo")} 
                                  onValueChange={(value) => updateEditingValue(capa.id, "assignedTo", value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Alex Thompson">Alex Thompson</SelectItem>
                                    <SelectItem value="Lisa Wang">Lisa Wang</SelectItem>
                                    <SelectItem value="David Brown">David Brown</SelectItem>
                                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button size="sm" variant="ghost" onClick={() => saveEdit(capa.id, "assignedTo")}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => cancelEdit(capa.id, "assignedTo")}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>{capa.assignedTo}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditing(capa.id, "assignedTo", capa.assignedTo)}
                                  data-testid={`button-edit-assigned-${capa.id}`}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityBadgeVariant(capa.priority)}>
                              {capa.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(capa.status)}>
                                {capa.status}
                              </Badge>
                              {capa.status === "Effectiveness Verification" && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => initiateClosure(capa)}
                                  data-testid={`button-close-${capa.id}`}
                                >
                                  <CheckSquare className="h-3 w-3 mr-1" />
                                  Close CAPA
                                </Button>
                              )}
                            </div>
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
                                <DropdownMenuItem>Edit Full CAPA</DropdownMenuItem>
                                <DropdownMenuItem>Update Actions</DropdownMenuItem>
                                <DropdownMenuItem>Add Evidence</DropdownMenuItem>
                                <DropdownMenuItem>Generate Report</DropdownMenuItem>
                                {capa.status === "Effectiveness Verification" && (
                                  <DropdownMenuItem onClick={() => initiateClosure(capa)}>
                                    Initiate Closure
                                  </DropdownMenuItem>
                                )}
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

            <TabsContent value="closure-workflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CAPA Closure Workflow</CardTitle>
                  <CardDescription>CAPAs ready for closure with detailed verification requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {capaData.filter(capa => capa.status === "Effectiveness Verification").map(capa => (
                      <div key={capa.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{capa.capaNumber}: {capa.title}</h3>
                            <p className="text-sm text-gray-600">All corrective and preventive actions completed</p>
                          </div>
                          <Button onClick={() => initiateClosure(capa)} data-testid={`button-start-closure-${capa.id}`}>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Start Closure Process
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Corrective Actions:</span> {capa.correctiveActions.filter(a => a.status === "Completed").length}/{capa.correctiveActions.length} Complete
                          </div>
                          <div>
                            <span className="font-medium">Preventive Actions:</span> {capa.preventiveActions.filter(a => a.status === "Completed").length}/{capa.preventiveActions.length} Complete
                          </div>
                          <div>
                            <span className="font-medium">Effectiveness Check:</span> {capa.effectivenessVerification ? "Completed" : "Pending"}
                          </div>
                          <div>
                            <span className="font-medium">Target Close Date:</span> {format(capa.targetCloseDate, "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* CAPA Closure Dialog */}
      <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CAPA Closure Workflow</DialogTitle>
            <DialogDescription>
              Complete all closure requirements for {selectedCapa?.capaNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <h4 className="font-semibold">Closure Verification Checklist</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="effectiveness"
                    checked={closureData.effectivenessConfirmed}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, effectivenessConfirmed: checked as boolean}))
                    }
                  />
                  <Label htmlFor="effectiveness">Effectiveness of corrective actions confirmed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="actions-complete"
                    checked={closureData.allActionsCompleted}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, allActionsCompleted: checked as boolean}))
                    }
                  />
                  <Label htmlFor="actions-complete">All corrective and preventive actions completed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="documentation"
                    checked={closureData.documentationComplete}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, documentationComplete: checked as boolean}))
                    }
                  />
                  <Label htmlFor="documentation">Documentation complete and filed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="root-cause"
                    checked={closureData.rootCauseAddressed}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, rootCauseAddressed: checked as boolean}))
                    }
                  />
                  <Label htmlFor="root-cause">Root cause adequately addressed</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="preventive-measures"
                    checked={closureData.preventiveMeasuresImplemented}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, preventiveMeasuresImplemented: checked as boolean}))
                    }
                  />
                  <Label htmlFor="preventive-measures">Preventive measures implemented and verified</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="regulatory"
                    checked={closureData.regulatoryNotificationComplete}
                    onCheckedChange={(checked) => 
                      setClosureData(prev => ({...prev, regulatoryNotificationComplete: checked as boolean}))
                    }
                  />
                  <Label htmlFor="regulatory">Regulatory notification completed (if required)</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="closure-justification">Closure Justification *</Label>
                <Textarea 
                  id="closure-justification"
                  placeholder="Provide detailed justification for closing this CAPA..."
                  value={closureData.closureJustification || ""}
                  onChange={(e) => setClosureData(prev => ({...prev, closureJustification: e.target.value}))}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="lessons-learned">Lessons Learned *</Label>
                <Textarea 
                  id="lessons-learned"
                  placeholder="Document key lessons learned and knowledge transfer..."
                  value={closureData.lessons_learned || ""}
                  onChange={(e) => setClosureData(prev => ({...prev, lessons_learned: e.target.value}))}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="follow-up"
                  checked={closureData.followUpRequired}
                  onCheckedChange={(checked) => 
                    setClosureData(prev => ({...prev, followUpRequired: checked as boolean}))
                  }
                />
                <Label htmlFor="follow-up">Follow-up actions required</Label>
              </div>
              
              {closureData.followUpRequired && (
                <div>
                  <Label htmlFor="follow-up-details">Follow-up Details</Label>
                  <Textarea 
                    id="follow-up-details"
                    placeholder="Describe required follow-up actions and timeline..."
                    value={closureData.followUpDetails || ""}
                    onChange={(e) => setClosureData(prev => ({...prev, followUpDetails: e.target.value}))}
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="closed-by">Closed By</Label>
                <Select onValueChange={(value) => setClosureData(prev => ({...prev, closedBy: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person closing CAPA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qa-manager">QA Manager</SelectItem>
                    <SelectItem value="production-manager">Production Manager</SelectItem>
                    <SelectItem value="quality-director">Quality Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="final-approver">Final Approver</Label>
                <Select onValueChange={(value) => setClosureData(prev => ({...prev, finalApprover: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select final approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality-director">Quality Director</SelectItem>
                    <SelectItem value="plant-manager">Plant Manager</SelectItem>
                    <SelectItem value="coo">Chief Operating Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClosureDialog(false)}>Cancel</Button>
            <Button onClick={completeClosure} data-testid="button-complete-closure">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Closure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}