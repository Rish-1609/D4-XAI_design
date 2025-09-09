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
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Activity,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Info
} from "lucide-react";
import { format } from "date-fns";

// Risk Management interfaces
interface Risk {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  identifiedBy: string;
  identifiedDate: Date;
  department: string;
  process: string;
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  riskScore: number; // probability * impact
  riskLevel: string; // Low, Medium, High, Critical
  status: string;
  owner: string;
  reviewDate: Date;
  nextReviewDate: Date;
  mitigationStrategies: MitigationStrategy[];
  controls: RiskControl[];
  assessments: RiskAssessment[];
  gmpRelevant: boolean;
  regulatoryImpact: boolean;
  businessImpact: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MitigationStrategy {
  id: string;
  description: string;
  type: string; // Accept, Mitigate, Transfer, Avoid
  assignedTo: string;
  targetDate: Date;
  actualDate?: Date;
  status: string;
  effectiveness: number; // 1-5 scale
  costEstimate: number;
  evidence: string;
  verifiedBy?: string;
  verificationDate?: Date;
}

interface RiskControl {
  id: string;
  description: string;
  type: string; // Preventive, Detective, Corrective
  frequency: string; // Daily, Weekly, Monthly, Quarterly, Annual
  owner: string;
  effectiveness: number; // 1-5 scale
  lastPerformed: Date;
  nextDue: Date;
  status: string;
  evidence: string;
}

interface RiskAssessment {
  id: string;
  assessedBy: string;
  assessmentDate: Date;
  probability: number;
  impact: number;
  riskScore: number;
  comments: string;
  recommendations: string;
  approvedBy?: string;
  approvalDate?: Date;
}

export default function QARiskManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewRiskDialog, setShowNewRiskDialog] = useState(false);
  const [showMitigationDialog, setShowMitigationDialog] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // Generate comprehensive risk data
  const riskData: Risk[] = useMemo(() => [
    {
      id: "RISK-001",
      riskId: "RISK-2024-001",
      title: "Cross-contamination in Manufacturing",
      description: "Risk of product cross-contamination between different product lines due to shared equipment and insufficient cleaning validation",
      category: "Product Quality",
      subcategory: "Cross-contamination",
      identifiedBy: "Sarah Johnson",
      identifiedDate: new Date("2024-01-10"),
      department: "Manufacturing",
      process: "Tablet Manufacturing",
      probability: 3,
      impact: 5,
      riskScore: 15,
      riskLevel: "High",
      status: "Active",
      owner: "Manufacturing Manager",
      reviewDate: new Date("2024-01-15"),
      nextReviewDate: new Date("2024-04-15"),
      mitigationStrategies: [
        {
          id: "MIT-001-01",
          description: "Implement enhanced cleaning validation protocol",
          type: "Mitigate",
          assignedTo: "QA Team",
          targetDate: new Date("2024-02-15"),
          status: "In Progress",
          effectiveness: 4,
          costEstimate: 25000,
          evidence: "Draft protocol under review"
        },
        {
          id: "MIT-001-02",
          description: "Install dedicated equipment for high-risk products",
          type: "Mitigate",
          assignedTo: "Engineering",
          targetDate: new Date("2024-06-30"),
          status: "Planned",
          effectiveness: 5,
          costEstimate: 150000,
          evidence: ""
        }
      ],
      controls: [
        {
          id: "CTRL-001-01",
          description: "Daily visual inspection of equipment cleanliness",
          type: "Detective",
          frequency: "Daily",
          owner: "Production Operator",
          effectiveness: 3,
          lastPerformed: new Date("2024-01-22"),
          nextDue: new Date("2024-01-23"),
          status: "Active",
          evidence: "Daily inspection logs"
        },
        {
          id: "CTRL-001-02",
          description: "Weekly cleaning validation sampling",
          type: "Detective",
          frequency: "Weekly",
          owner: "QC Analyst",
          effectiveness: 4,
          lastPerformed: new Date("2024-01-20"),
          nextDue: new Date("2024-01-27"),
          status: "Active",
          evidence: "Analytical test results"
        }
      ],
      assessments: [
        {
          id: "ASSESS-001-01",
          assessedBy: "Risk Assessment Team",
          assessmentDate: new Date("2024-01-15"),
          probability: 3,
          impact: 5,
          riskScore: 15,
          comments: "High impact due to potential product recalls and regulatory action",
          recommendations: "Prioritize cleaning validation improvements and consider dedicated lines",
          approvedBy: "QA Director",
          approvalDate: new Date("2024-01-16")
        }
      ],
      gmpRelevant: true,
      regulatoryImpact: true,
      businessImpact: "High - Potential product recalls, regulatory penalties, reputation damage",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-22")
    },
    {
      id: "RISK-002",
      riskId: "RISK-2024-002",
      title: "Data Integrity Breach",
      description: "Risk of data integrity issues in electronic records due to insufficient access controls and audit trails",
      category: "Data Integrity",
      subcategory: "Electronic Records",
      identifiedBy: "IT Security Team",
      identifiedDate: new Date("2024-01-12"),
      department: "Quality",
      process: "Laboratory Testing",
      probability: 2,
      impact: 4,
      riskScore: 8,
      riskLevel: "Medium",
      status: "Active",
      owner: "IT Manager",
      reviewDate: new Date("2024-01-20"),
      nextReviewDate: new Date("2024-04-20"),
      mitigationStrategies: [
        {
          id: "MIT-002-01",
          description: "Implement role-based access control system",
          type: "Mitigate",
          assignedTo: "IT Team",
          targetDate: new Date("2024-03-01"),
          status: "In Progress",
          effectiveness: 4,
          costEstimate: 45000,
          evidence: "System implementation 60% complete"
        },
        {
          id: "MIT-002-02",
          description: "Enhanced audit trail monitoring and alerts",
          type: "Mitigate",
          assignedTo: "QA Systems",
          targetDate: new Date("2024-02-28"),
          status: "Planned",
          effectiveness: 3,
          costEstimate: 15000,
          evidence: ""
        }
      ],
      controls: [
        {
          id: "CTRL-002-01",
          description: "Monthly access rights review",
          type: "Detective",
          frequency: "Monthly",
          owner: "IT Security",
          effectiveness: 3,
          lastPerformed: new Date("2024-01-15"),
          nextDue: new Date("2024-02-15"),
          status: "Active",
          evidence: "Access review reports"
        },
        {
          id: "CTRL-002-02",
          description: "Quarterly data integrity assessment",
          type: "Detective",
          frequency: "Quarterly",
          owner: "QA Auditor",
          effectiveness: 4,
          lastPerformed: new Date("2024-01-01"),
          nextDue: new Date("2024-04-01"),
          status: "Active",
          evidence: "Assessment reports"
        }
      ],
      assessments: [
        {
          id: "ASSESS-002-01",
          assessedBy: "Data Integrity Committee",
          assessmentDate: new Date("2024-01-20"),
          probability: 2,
          impact: 4,
          riskScore: 8,
          comments: "Moderate probability but significant regulatory and business impact",
          recommendations: "Accelerate access control implementation and increase monitoring frequency",
          approvedBy: "QA Director",
          approvalDate: new Date("2024-01-21")
        }
      ],
      gmpRelevant: true,
      regulatoryImpact: true,
      businessImpact: "Medium - Regulatory warnings, data investigation costs",
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-21")
    },
    {
      id: "RISK-003",
      riskId: "RISK-2024-003",
      title: "Supply Chain Disruption",
      description: "Risk of critical raw material shortage due to single-source supplier dependency and geopolitical uncertainties",
      category: "Supply Chain",
      subcategory: "Supplier Dependency",
      identifiedBy: "Procurement Team",
      identifiedDate: new Date("2024-01-18"),
      department: "Supply Chain",
      process: "Raw Material Procurement",
      probability: 4,
      impact: 3,
      riskScore: 12,
      riskLevel: "High",
      status: "Active",
      owner: "Supply Chain Director",
      reviewDate: new Date("2024-01-25"),
      nextReviewDate: new Date("2024-04-25"),
      mitigationStrategies: [
        {
          id: "MIT-003-01",
          description: "Qualify secondary supplier for critical materials",
          type: "Mitigate",
          assignedTo: "Procurement",
          targetDate: new Date("2024-05-01"),
          status: "Planned",
          effectiveness: 4,
          costEstimate: 75000,
          evidence: ""
        },
        {
          id: "MIT-003-02",
          description: "Increase strategic inventory levels",
          type: "Mitigate",
          assignedTo: "Inventory Management",
          targetDate: new Date("2024-03-15"),
          status: "In Progress",
          effectiveness: 3,
          costEstimate: 200000,
          evidence: "Inventory analysis in progress"
        }
      ],
      controls: [
        {
          id: "CTRL-003-01",
          description: "Monthly supplier performance review",
          type: "Detective",
          frequency: "Monthly",
          owner: "Procurement",
          effectiveness: 3,
          lastPerformed: new Date("2024-01-20"),
          nextDue: new Date("2024-02-20"),
          status: "Active",
          evidence: "Supplier scorecards"
        },
        {
          id: "CTRL-003-02",
          description: "Weekly inventory level monitoring",
          type: "Detective",
          frequency: "Weekly",
          owner: "Inventory Manager",
          effectiveness: 4,
          lastPerformed: new Date("2024-01-22"),
          nextDue: new Date("2024-01-29"),
          status: "Active",
          evidence: "Inventory reports"
        }
      ],
      assessments: [
        {
          id: "ASSESS-003-01",
          assessedBy: "Supply Chain Risk Team",
          assessmentDate: new Date("2024-01-25"),
          probability: 4,
          impact: 3,
          riskScore: 12,
          comments: "High probability due to current geopolitical situation and supplier concentration",
          recommendations: "Accelerate supplier diversification and increase safety stock",
          approvedBy: "COO",
          approvalDate: new Date("2024-01-26")
        }
      ],
      gmpRelevant: false,
      regulatoryImpact: false,
      businessImpact: "High - Production delays, increased costs, customer impact",
      createdAt: new Date("2024-01-18"),
      updatedAt: new Date("2024-01-26")
    },
    {
      id: "RISK-004",
      riskId: "RISK-2024-004",
      title: "Equipment Failure During Critical Production",
      description: "Risk of catastrophic failure of key manufacturing equipment during critical production campaigns",
      category: "Equipment",
      subcategory: "Critical Equipment",
      identifiedBy: "Maintenance Team",
      identifiedDate: new Date("2024-01-20"),
      department: "Manufacturing",
      process: "API Manufacturing",
      probability: 2,
      impact: 5,
      riskScore: 10,
      riskLevel: "Medium",
      status: "Active",
      owner: "Maintenance Manager",
      reviewDate: new Date("2024-01-25"),
      nextReviewDate: new Date("2024-04-25"),
      mitigationStrategies: [
        {
          id: "MIT-004-01",
          description: "Implement predictive maintenance program",
          type: "Mitigate",
          assignedTo: "Maintenance",
          targetDate: new Date("2024-04-30"),
          status: "Planned",
          effectiveness: 4,
          costEstimate: 80000,
          evidence: ""
        }
      ],
      controls: [
        {
          id: "CTRL-004-01",
          description: "Daily equipment performance monitoring",
          type: "Detective",
          frequency: "Daily",
          owner: "Production Operator",
          effectiveness: 3,
          lastPerformed: new Date("2024-01-22"),
          nextDue: new Date("2024-01-23"),
          status: "Active",
          evidence: "Daily logs"
        }
      ],
      assessments: [
        {
          id: "ASSESS-004-01",
          assessedBy: "Engineering Team",
          assessmentDate: new Date("2024-01-25"),
          probability: 2,
          impact: 5,
          riskScore: 10,
          comments: "Low probability but very high impact on production and compliance",
          recommendations: "Invest in predictive maintenance and spare parts inventory",
        }
      ],
      gmpRelevant: true,
      regulatoryImpact: true,
      businessImpact: "High - Production shutdown, batch loss, delivery delays",
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-25")
    }
  ], []);

  // Filter and search functionality
  const filteredRisks = useMemo(() => {
    return riskData.filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          risk.riskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          risk.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRiskLevel = riskLevelFilter === "all" || risk.riskLevel === riskLevelFilter;
      const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
      
      return matchesSearch && matchesRiskLevel && matchesStatus && matchesCategory;
    });
  }, [riskData, searchTerm, riskLevelFilter, statusFilter, categoryFilter]);

  // Statistics calculations
  const riskStats = useMemo(() => {
    const total = riskData.length;
    const critical = riskData.filter(r => r.riskLevel === "Critical").length;
    const high = riskData.filter(r => r.riskLevel === "High").length;
    const medium = riskData.filter(r => r.riskLevel === "Medium").length;
    const low = riskData.filter(r => r.riskLevel === "Low").length;
    const activeControls = riskData.reduce((sum, r) => sum + r.controls.filter(c => c.status === "Active").length, 0);
    const mitigationsInProgress = riskData.reduce((sum, r) => sum + r.mitigationStrategies.filter(m => m.status === "In Progress").length, 0);
    const avgRiskScore = riskData.reduce((sum, r) => sum + r.riskScore, 0) / riskData.length;
    
    return { total, critical, high, medium, low, activeControls, mitigationsInProgress, avgRiskScore: avgRiskScore.toFixed(1) };
  }, [riskData]);

  const getRiskLevelBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "outline";
      case "Low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Mitigated": return "secondary";
      case "Closed": return "secondary";
      case "Under Review": return "outline";
      default: return "secondary";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600";
    if (score >= 9) return "text-orange-600";
    if (score >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  const getProbabilityImpactMatrix = () => {
    const matrix = [];
    for (let impact = 5; impact >= 1; impact--) {
      const row = [];
      for (let probability = 1; probability <= 5; probability++) {
        const score = probability * impact;
        const risks = riskData.filter(r => r.probability === probability && r.impact === impact);
        row.push({ probability, impact, score, risks: risks.length });
      }
      matrix.push(row);
    }
    return matrix;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Risk Management</h1>
              <p className="text-gray-600 mt-1">Quality Assurance Risk Assessment & Mitigation</p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showNewRiskDialog} onOpenChange={setShowNewRiskDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-risk">
                    <Plus className="w-4 h-4 mr-2" />
                    Identify Risk
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Identify New Risk</DialogTitle>
                    <DialogDescription>
                      Document a new risk for assessment and mitigation planning
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="risk-title">Risk Title</Label>
                        <Input id="risk-title" placeholder="Brief description of the risk" />
                      </div>
                      <div>
                        <Label htmlFor="risk-category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product-quality">Product Quality</SelectItem>
                            <SelectItem value="data-integrity">Data Integrity</SelectItem>
                            <SelectItem value="supply-chain">Supply Chain</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="personnel">Personnel</SelectItem>
                            <SelectItem value="regulatory">Regulatory</SelectItem>
                            <SelectItem value="environmental">Environmental</SelectItem>
                            <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="risk-description">Risk Description</Label>
                      <Textarea id="risk-description" placeholder="Detailed description of the risk..." rows={3} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="probability">Probability (1-5)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Low</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Very High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="impact">Impact (1-5)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Negligible</SelectItem>
                            <SelectItem value="2">2 - Minor</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - Major</SelectItem>
                            <SelectItem value="5">5 - Catastrophic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="owner">Risk Owner</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign owner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing-manager">Manufacturing Manager</SelectItem>
                            <SelectItem value="qa-director">QA Director</SelectItem>
                            <SelectItem value="supply-chain-director">Supply Chain Director</SelectItem>
                            <SelectItem value="it-manager">IT Manager</SelectItem>
                            <SelectItem value="maintenance-manager">Maintenance Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="quality">Quality</SelectItem>
                            <SelectItem value="supply-chain">Supply Chain</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="it">IT</SelectItem>
                            <SelectItem value="regulatory">Regulatory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="process">Process/Area</Label>
                        <Input id="process" placeholder="Specific process or area affected" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="business-impact">Business Impact</Label>
                      <Textarea id="business-impact" placeholder="Describe potential business consequences..." rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewRiskDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowNewRiskDialog(false)} data-testid="button-submit-risk">
                      Submit Risk
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" data-testid="button-risk-register">
                <FileText className="w-4 h-4 mr-2" />
                Risk Register
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="risk-register">Risk Register</TabsTrigger>
              <TabsTrigger value="risk-matrix">Risk Matrix</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-risks">{riskStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Identified and assessed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical & High</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-critical-high">{riskStats.critical + riskStats.high}</div>
                    <p className="text-xs text-muted-foreground">
                      Require priority attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Controls</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-active-controls">{riskStats.activeControls}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently implemented
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Risk Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-avg-risk-score">{riskStats.avgRiskScore}</div>
                    <p className="text-xs text-muted-foreground">
                      Out of 25 maximum
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Level Distribution</CardTitle>
                    <CardDescription>Breakdown of risks by severity level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { level: "Critical", count: riskStats.critical, color: "bg-red-600", textColor: "text-red-600" },
                        { level: "High", count: riskStats.high, color: "bg-red-400", textColor: "text-red-400" },
                        { level: "Medium", count: riskStats.medium, color: "bg-yellow-500", textColor: "text-yellow-600" },
                        { level: "Low", count: riskStats.low, color: "bg-green-500", textColor: "text-green-600" }
                      ].map(item => (
                        <div key={item.level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded ${item.color}`}></div>
                            <span className="text-sm">{item.level}</span>
                          </div>
                          <span className={`font-medium ${item.textColor}`}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Categories</CardTitle>
                    <CardDescription>Distribution by risk category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: "Product Quality", count: 1, percentage: 25 },
                        { category: "Data Integrity", count: 1, percentage: 25 },
                        { category: "Supply Chain", count: 1, percentage: 25 },
                        { category: "Equipment", count: 1, percentage: 25 }
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
                    <CardTitle>Mitigation Progress</CardTitle>
                    <CardDescription>Current status of mitigation strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { status: "In Progress", count: riskStats.mitigationsInProgress, color: "bg-blue-500" },
                        { status: "Planned", count: 3, color: "bg-yellow-500" },
                        { status: "Completed", count: 0, color: "bg-green-500" },
                        { status: "Overdue", count: 0, color: "bg-red-500" }
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
                    <CardTitle>Recent Risk Activities</CardTitle>
                    <CardDescription>Latest risk management activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-2 border rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New risk identified</p>
                          <p className="text-xs text-gray-500">Equipment Failure Risk - 2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 border rounded">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Control updated</p>
                          <p className="text-xs text-gray-500">Data integrity monitoring - 3 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Assessment completed</p>
                          <p className="text-xs text-gray-500">Supply chain risk review - 5 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risk-register" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Risk Register</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search risks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-risk-search"
                    />
                  </div>
                  <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Product Quality">Product Quality</SelectItem>
                      <SelectItem value="Data Integrity">Data Integrity</SelectItem>
                      <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Probability</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRisks.map(risk => (
                        <TableRow key={risk.id} data-testid={`row-risk-${risk.id}`}>
                          <TableCell className="font-medium">{risk.riskId}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{risk.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{risk.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{risk.category}</Badge>
                          </TableCell>
                          <TableCell>{risk.owner}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-sm">{risk.probability}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-sm">{risk.impact}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                              {risk.riskScore}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRiskLevelBadgeVariant(risk.riskLevel)}>
                              {risk.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(risk.status)}>
                              {risk.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-risk-actions-${risk.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedRisk(risk)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Risk</DropdownMenuItem>
                                <DropdownMenuItem>Update Assessment</DropdownMenuItem>
                                <DropdownMenuItem>Add Mitigation</DropdownMenuItem>
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

            <TabsContent value="risk-matrix" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Probability vs Impact Matrix</CardTitle>
                  <CardDescription>Visual representation of risk distribution based on probability and impact assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-6 gap-1 min-w-[600px]">
                      {/* Header */}
                      <div className="p-3"></div>
                      <div className="p-3 text-center text-sm font-medium">Very Low (1)</div>
                      <div className="p-3 text-center text-sm font-medium">Low (2)</div>
                      <div className="p-3 text-center text-sm font-medium">Medium (3)</div>
                      <div className="p-3 text-center text-sm font-medium">High (4)</div>
                      <div className="p-3 text-center text-sm font-medium">Very High (5)</div>
                      
                      {/* Matrix */}
                      {getProbabilityImpactMatrix().map((row, rowIndex) => (
                        <>
                          <div key={`impact-${5-rowIndex}`} className="p-3 text-center text-sm font-medium">
                            {5-rowIndex === 5 ? "Catastrophic (5)" : 
                             5-rowIndex === 4 ? "Major (4)" :
                             5-rowIndex === 3 ? "Moderate (3)" :
                             5-rowIndex === 2 ? "Minor (2)" : "Negligible (1)"}
                          </div>
                          {row.map((cell, colIndex) => {
                            const bgColor = cell.score >= 15 ? "bg-red-200 border-red-300" :
                                           cell.score >= 9 ? "bg-orange-200 border-orange-300" :
                                           cell.score >= 5 ? "bg-yellow-200 border-yellow-300" :
                                           "bg-green-200 border-green-300";
                            return (
                              <div key={`${rowIndex}-${colIndex}`} className={`p-3 border-2 rounded text-center ${bgColor}`}>
                                <div className="text-sm font-bold">{cell.score}</div>
                                {cell.risks > 0 && <div className="text-xs">{cell.risks} risk{cell.risks > 1 ? 's' : ''}</div>}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                        <span>Critical (15-25)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
                        <span>High (9-14)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                        <span>Medium (5-8)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                        <span>Low (1-4)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Controls Overview</CardTitle>
                  <CardDescription>Summary of all risk controls and their effectiveness</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Control Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Effectiveness</TableHead>
                        <TableHead>Last Performed</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskData.flatMap(risk => 
                        risk.controls.map(control => (
                          <TableRow key={control.id}>
                            <TableCell>{control.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{control.type}</Badge>
                            </TableCell>
                            <TableCell>{control.frequency}</TableCell>
                            <TableCell>{control.owner}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">{control.effectiveness}/5</span>
                              </div>
                            </TableCell>
                            <TableCell>{format(control.lastPerformed, "MMM dd, yyyy")}</TableCell>
                            <TableCell>{format(control.nextDue, "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant={control.status === "Active" ? "default" : "secondary"}>
                                {control.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Trend Analysis</CardTitle>
                    <CardDescription>Risk levels over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>January 2024</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-red-600">0 Critical</span>
                          <span className="text-orange-600">2 High</span>
                          <span className="text-yellow-600">1 Medium</span>
                          <span className="text-green-600">1 Low</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>December 2023</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-red-600">0 Critical</span>
                          <span className="text-orange-600">1 High</span>
                          <span className="text-yellow-600">2 Medium</span>
                          <span className="text-green-600">0 Low</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>November 2023</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-red-600">1 Critical</span>
                          <span className="text-orange-600">1 High</span>
                          <span className="text-yellow-600">1 Medium</span>
                          <span className="text-green-600">0 Low</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Control Effectiveness</CardTitle>
                    <CardDescription>Average effectiveness by control type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: "Detective", effectiveness: 3.5, count: 6 },
                        { type: "Preventive", effectiveness: 4.0, count: 2 },
                        { type: "Corrective", effectiveness: 3.0, count: 1 }
                      ].map(item => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{item.type} ({item.count} controls)</span>
                            <span className="text-sm font-medium">{item.effectiveness}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.effectiveness / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mitigation Cost Analysis</CardTitle>
                    <CardDescription>Investment in risk mitigation by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: "Product Quality", cost: 175000 },
                        { category: "Data Integrity", cost: 60000 },
                        { category: "Supply Chain", cost: 275000 },
                        { category: "Equipment", cost: 80000 }
                      ].map(item => (
                        <div key={item.category} className="flex items-center justify-between">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-medium">${item.cost.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total Investment</span>
                          <span>$590,000</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Maturity</CardTitle>
                    <CardDescription>Quality metrics for risk management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-sm text-gray-500">Risks with Controls</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">88%</div>
                        <div className="text-sm text-gray-500">Controls Effectiveness</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">75%</div>
                        <div className="text-sm text-gray-500">Mitigations On Track</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">92%</div>
                        <div className="text-sm text-gray-500">Review Compliance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Risk Details Dialog */}
      {selectedRisk && (
        <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRisk.riskId}: {selectedRisk.title}</DialogTitle>
              <DialogDescription>Complete risk details and mitigation status</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Risk Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Category:</span> {selectedRisk.category}</div>
                    <div><span className="font-medium">Owner:</span> {selectedRisk.owner}</div>
                    <div><span className="font-medium">Department:</span> {selectedRisk.department}</div>
                    <div><span className="font-medium">Process:</span> {selectedRisk.process}</div>
                    <div><span className="font-medium">Risk Level:</span> 
                      <Badge variant={getRiskLevelBadgeVariant(selectedRisk.riskLevel)} className="ml-2">
                        {selectedRisk.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Probability:</span> {selectedRisk.probability}/5</div>
                    <div><span className="font-medium">Impact:</span> {selectedRisk.impact}/5</div>
                    <div><span className="font-medium">Risk Score:</span> 
                      <span className={`font-bold ml-2 ${getRiskScoreColor(selectedRisk.riskScore)}`}>
                        {selectedRisk.riskScore}
                      </span>
                    </div>
                    <div><span className="font-medium">Next Review:</span> {format(selectedRisk.nextReviewDate, "MMM dd, yyyy")}</div>
                    <div><span className="font-medium">GMP Relevant:</span> {selectedRisk.gmpRelevant ? "Yes" : "No"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risk Description</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{selectedRisk.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Business Impact</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{selectedRisk.businessImpact}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mitigation Strategies</h4>
                <div className="space-y-3">
                  {selectedRisk.mitigationStrategies.map(strategy => (
                    <div key={strategy.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{strategy.description}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{strategy.type}</Badge>
                          <Badge variant={strategy.status === "Completed" ? "default" : strategy.status === "In Progress" ? "outline" : "secondary"}>
                            {strategy.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div><span className="font-medium">Assigned To:</span> {strategy.assignedTo}</div>
                        <div><span className="font-medium">Target Date:</span> {format(strategy.targetDate, "MMM dd, yyyy")}</div>
                        <div><span className="font-medium">Effectiveness:</span> {strategy.effectiveness}/5</div>
                        <div><span className="font-medium">Cost:</span> ${strategy.costEstimate.toLocaleString()}</div>
                      </div>
                      {strategy.evidence && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Evidence:</span> {strategy.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risk Controls</h4>
                <div className="space-y-3">
                  {selectedRisk.controls.map(control => (
                    <div key={control.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{control.description}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{control.type}</Badge>
                          <Badge variant={control.status === "Active" ? "default" : "secondary"}>
                            {control.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div><span className="font-medium">Owner:</span> {control.owner}</div>
                        <div><span className="font-medium">Frequency:</span> {control.frequency}</div>
                        <div><span className="font-medium">Effectiveness:</span> {control.effectiveness}/5</div>
                        <div><span className="font-medium">Next Due:</span> {format(control.nextDue, "MMM dd, yyyy")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRisk(null)}>Close</Button>
              <Button>Update Risk</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}