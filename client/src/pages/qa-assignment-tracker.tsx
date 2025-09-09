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
  Users,
  Calendar,
  TrendingUp,
  FileCheck,
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
  User,
  CalendarDays,
  Filter,
  Download,
  Beaker,
  ShieldCheck,
  Microscope,
  Building2,
  Wrench,
  FileText,
  Database,
  FlaskConical,
  Thermometer,
  Wind,
  DropletIcon as Droplet,
  TestTube,
  ClipboardList,
} from "lucide-react";

// Comprehensive QA Task Categories and Types
export const QA_TASK_CATEGORIES = {
  'equipment-qualification': {
    name: 'Equipment Qualification & Maintenance',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-800',
    tasks: [
      'Installation Qualification (IQ)',
      'Operational Qualification (OQ)',
      'Performance Qualification (PQ)',
      'Preventive Maintenance',
      'Calibration Activities',
      'Equipment Cleaning Validation',
      'Equipment Requalification',
      'Computerized System Validation'
    ]
  },
  'batch-release': {
    name: 'Batch Release Activities',
    icon: Package,
    color: 'bg-green-100 text-green-800',
    tasks: [
      'Raw Material Testing',
      'In-Process Controls',
      'Finished Product Testing',
      'Batch Record Review',
      'Certificate of Analysis (CoA) Generation',
      'Stability Testing',
      'Microbiological Testing',
      'Release Documentation Review'
    ]
  },
  'environmental-monitoring': {
    name: 'Environmental Monitoring',
    icon: Thermometer,
    color: 'bg-yellow-100 text-yellow-800',
    tasks: [
      'Cleanroom Monitoring',
      'Water System Testing',
      'Air Quality Monitoring',
      'Surface Monitoring',
      'Personnel Monitoring',
      'HVAC System Validation',
      'Compressed Air Testing',
      'Environmental Alarm Testing'
    ]
  },
  'validation-activities': {
    name: 'Validation Activities',
    icon: ShieldCheck,
    color: 'bg-purple-100 text-purple-800',
    tasks: [
      'Process Validation',
      'Cleaning Validation',
      'Method Validation',
      'Computer System Validation',
      'Analytical Method Transfer',
      'Validation Master Plan Review',
      'Validation Protocol Execution',
      'Validation Report Generation'
    ]
  },
  'compliance-documentation': {
    name: 'Compliance & Documentation',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800',
    tasks: [
      'SOP Reviews',
      'Training Records Review',
      'Audit Preparations',
      'CAPA Investigations',
      'Change Control Reviews',
      'Regulatory Submission Review',
      'Quality Manual Updates',
      'Validation Documentation Review'
    ]
  },
  'sample-management': {
    name: 'Sample Management',
    icon: TestTube,
    color: 'bg-pink-100 text-pink-800',
    tasks: [
      'Sample Receipt',
      'Sample Storage',
      'Sample Testing',
      'Sample Disposal',
      'Reference Standard Management',
      'Stability Sample Management',
      'Retain Sample Management',
      'Sample Chain of Custody'
    ]
  },
  'laboratory-operations': {
    name: 'Laboratory Operations',
    icon: FlaskConical,
    color: 'bg-orange-100 text-orange-800',
    tasks: [
      'Instrument Maintenance',
      'Reference Standard Qualification',
      'Laboratory Investigation',
      'Out of Specification (OOS) Investigation',
      'Laboratory Method Development',
      'Instrument Calibration',
      'Laboratory Equipment Qualification',
      'Laboratory Safety Compliance'
    ]
  },
  'quality-systems': {
    name: 'Quality Systems',
    icon: Database,
    color: 'bg-gray-100 text-gray-800',
    tasks: [
      'Quality System Audit',
      'Document Control Review',
      'Supplier Quality Assessment',
      'Quality Risk Management',
      'Quality Metrics Review',
      'Complaint Investigation',
      'Product Quality Review',
      'Quality Agreement Review'
    ]
  }
};

// Employee interface with comprehensive QA skills
interface QAEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Available' | 'Busy' | 'On Leave' | 'Training';
  skills: string[];
  certifications: string[];
  workload: number; // percentage 0-100
  currentTasks: number;
  completedTasks: number;
  experience: string; // Junior, Senior, Expert
  shift: string; // Day, Night, Rotating
  location: string;
  phoneExtension: string;
  supervisor: string;
  hireDate: string;
  lastTrainingDate: string;
  nextTrainingDue: string;
}

// Comprehensive QA Task interface
interface QATask {
  id: string;
  title: string;
  description: string;
  category: keyof typeof QA_TASK_CATEGORIES;
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Under Review';
  assignedTo: string;
  assignedBy: string;
  department: string;
  location: string;
  equipment?: string;
  batchNumber?: string;
  productionOrderId?: string;
  estimatedHours: number;
  actualHours?: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  reviewedDate?: Date;
  reviewedBy?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  dependencies: string[];
  tags: string[];
  checklist: { id: string; text: string; completed: boolean; evidence?: string }[];
  attachments: string[];
  comments: { id: string; author: string; message: string; timestamp: Date }[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceRequirement: string;
  regulatoryReference?: string;
  training?: string[];
  qualificationRequired?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for QA employees with pharmaceutical industry roles
const mockQAEmployees: QAEmployee[] = [
  {
    id: 'emp1',
    name: 'Dr. Priya Sharma',
    role: 'QA Manager',
    department: 'Quality Assurance',
    email: 'priya.sharma@company.com',
    status: 'Available',
    skills: ['GMP Compliance', 'Validation', 'Audit Management', 'CAPA Investigation', 'Risk Assessment'],
    certifications: ['Certified Quality Auditor', 'Pharmaceutical Quality Professional'],
    workload: 75,
    currentTasks: 8,
    completedTasks: 156,
    experience: 'Expert',
    shift: 'Day',
    location: 'Mumbai - Main Lab',
    phoneExtension: '2001',
    supervisor: 'Head of Quality',
    hireDate: '2018-03-15',
    lastTrainingDate: '2024-11-01',
    nextTrainingDue: '2025-05-01'
  },
  {
    id: 'emp2',
    name: 'Rajesh Kumar',
    role: 'QC Analyst Sr.',
    department: 'Quality Control',
    email: 'rajesh.kumar@company.com',
    status: 'Busy',
    skills: ['HPLC Analysis', 'Method Validation', 'Stability Testing', 'Microbial Testing', 'OOS Investigation'],
    certifications: ['Analytical Chemistry Certificate', 'Good Laboratory Practices'],
    workload: 90,
    currentTasks: 12,
    completedTasks: 89,
    experience: 'Senior',
    shift: 'Day',
    location: 'Mumbai - Analytical Lab',
    phoneExtension: '2102',
    supervisor: 'Dr. Priya Sharma',
    hireDate: '2020-07-20',
    lastTrainingDate: '2024-10-15',
    nextTrainingDue: '2025-04-15'
  },
  {
    id: 'emp3',
    name: 'Sneha Patel',
    role: 'Validation Specialist',
    department: 'Quality Assurance',
    email: 'sneha.patel@company.com',
    status: 'Available',
    skills: ['Process Validation', 'Equipment Qualification', 'CSV', 'Protocol Writing', 'Statistical Analysis'],
    certifications: ['Validation Professional Certificate', 'Six Sigma Green Belt'],
    workload: 60,
    currentTasks: 5,
    completedTasks: 67,
    experience: 'Senior',
    shift: 'Day',
    location: 'Mumbai - Validation Lab',
    phoneExtension: '2203',
    supervisor: 'Dr. Priya Sharma',
    hireDate: '2019-11-10',
    lastTrainingDate: '2024-09-20',
    nextTrainingDue: '2025-03-20'
  },
  {
    id: 'emp4',
    name: 'Amit Singh',
    role: 'Microbiologist',
    department: 'Quality Control',
    email: 'amit.singh@company.com',
    status: 'Available',
    skills: ['Sterility Testing', 'Environmental Monitoring', 'Bioburden Testing', 'Water Testing', 'Cleanroom Monitoring'],
    certifications: ['Clinical Microbiology Certification', 'Environmental Monitoring Certificate'],
    workload: 70,
    currentTasks: 7,
    completedTasks: 134,
    experience: 'Expert',
    shift: 'Day',
    location: 'Mumbai - Microbiology Lab',
    phoneExtension: '2304',
    supervisor: 'Dr. Priya Sharma',
    hireDate: '2017-09-05',
    lastTrainingDate: '2024-12-01',
    nextTrainingDue: '2025-06-01'
  },
  {
    id: 'emp5',
    name: 'Kavya Menon',
    role: 'QC Analyst Jr.',
    department: 'Quality Control',
    email: 'kavya.menon@company.com',
    status: 'Training',
    skills: ['Basic Analysis', 'Sample Preparation', 'Documentation', 'Laboratory Safety', 'Instrument Operation'],
    certifications: ['Good Laboratory Practices'],
    workload: 40,
    currentTasks: 3,
    completedTasks: 23,
    experience: 'Junior',
    shift: 'Day',
    location: 'Mumbai - Analytical Lab',
    phoneExtension: '2405',
    supervisor: 'Rajesh Kumar',
    hireDate: '2023-06-01',
    lastTrainingDate: '2024-12-15',
    nextTrainingDue: '2025-03-15'
  },
  {
    id: 'emp6',
    name: 'Mohammed Ali',
    role: 'Compliance Officer',
    department: 'Regulatory Affairs',
    email: 'mohammed.ali@company.com',
    status: 'Available',
    skills: ['Regulatory Compliance', 'Audit Preparation', 'Documentation Review', 'Change Control', 'Training Management'],
    certifications: ['Regulatory Affairs Professional Certificate', 'Internal Auditor Certificate'],
    workload: 85,
    currentTasks: 9,
    completedTasks: 78,
    experience: 'Senior',
    shift: 'Day',
    location: 'Mumbai - QA Office',
    phoneExtension: '2506',
    supervisor: 'Dr. Priya Sharma',
    hireDate: '2021-01-18',
    lastTrainingDate: '2024-11-10',
    nextTrainingDue: '2025-05-10'
  }
];

// Generate mock QA tasks based on the categories
const generateMockQATasks = (): QATask[] => {
  const tasks: QATask[] = [];
  let taskId = 1;

  Object.entries(QA_TASK_CATEGORIES).forEach(([categoryKey, category]) => {
    category.tasks.forEach((taskName, index) => {
      const employee = mockQAEmployees[Math.floor(Math.random() * mockQAEmployees.length)];
      const priority = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as QATask['priority'];
      const status = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Under Review'][Math.floor(Math.random() * 5)] as QATask['status'];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);

      tasks.push({
        id: `task-${taskId++}`,
        title: taskName,
        description: `Complete ${taskName.toLowerCase()} as per SOP and regulatory requirements. Ensure all documentation is properly maintained and reviewed.`,
        category: categoryKey as keyof typeof QA_TASK_CATEGORIES,
        type: taskName,
        priority,
        status,
        assignedTo: employee.name,
        assignedBy: 'Dr. Priya Sharma',
        department: employee.department,
        location: employee.location,
        equipment: categoryKey === 'equipment-qualification' ? `Equipment-${Math.floor(Math.random() * 100)}` : undefined,
        batchNumber: categoryKey === 'batch-release' ? `BATCH-${Math.floor(Math.random() * 1000)}` : undefined,
        estimatedHours: Math.floor(Math.random() * 16) + 4,
        actualHours: status === 'Completed' ? Math.floor(Math.random() * 20) + 2 : undefined,
        startDate: new Date(),
        dueDate,
        completedDate: status === 'Completed' ? new Date() : undefined,
        approvalRequired: priority === 'Critical' || priority === 'High',
        dependencies: [],
        tags: [categoryKey, priority.toLowerCase()],
        checklist: [
          { id: '1', text: 'Review applicable SOPs and procedures', completed: Math.random() > 0.5 },
          { id: '2', text: 'Complete required documentation', completed: Math.random() > 0.5 },
          { id: '3', text: 'Perform required testing/verification', completed: Math.random() > 0.5 },
          { id: '4', text: 'Submit for review and approval', completed: Math.random() > 0.5 }
        ],
        attachments: [],
        comments: [],
        riskLevel: priority,
        complianceRequirement: 'GMP, FDA 21 CFR Part 211',
        regulatoryReference: categoryKey === 'validation-activities' ? 'ICH Q9, Q10' : 'FDA Guidance',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });

  return tasks;
};

const mockQATasks = generateMockQATasks();

export default function QAAssignmentTracker() {
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { toast } = useToast();

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    let filtered = mockQAEmployees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, departmentFilter]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = mockQATasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter]);

  // Statistics for employees
  const employeeStats = useMemo(() => {
    const totalEmployees = mockQAEmployees.length;
    const available = mockQAEmployees.filter(emp => emp.status === 'Available').length;
    const busy = mockQAEmployees.filter(emp => emp.status === 'Busy').length;
    const onLeave = mockQAEmployees.filter(emp => emp.status === 'On Leave').length;
    const avgWorkload = Math.round(mockQAEmployees.reduce((sum, emp) => sum + emp.workload, 0) / totalEmployees);

    return { totalEmployees, available, busy, onLeave, avgWorkload };
  }, []);

  // Statistics for tasks
  const taskStats = useMemo(() => {
    const totalTasks = mockQATasks.length;
    const notStarted = mockQATasks.filter(task => task.status === 'Not Started').length;
    const inProgress = mockQATasks.filter(task => task.status === 'In Progress').length;
    const completed = mockQATasks.filter(task => task.status === 'Completed').length;
    const critical = mockQATasks.filter(task => task.priority === 'Critical').length;

    return { totalTasks, notStarted, inProgress, completed, critical };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Busy': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'On Leave': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Training': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Not Started': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'On Hold': return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'Under Review': return <Eye className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Available': case 'Completed': return "default";
      case 'Busy': case 'In Progress': case 'Training': return "secondary";
      case 'On Leave': case 'On Hold': return "destructive";
      default: return "outline";
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'Critical': return "destructive";
      case 'High': return "default";
      case 'Medium': return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">QA Assignment Tracker</h2>
              <p className="text-gray-600 text-sm mt-1">
                Comprehensive quality assurance team assignments and task management
              </p>
            </div>
            <Button onClick={() => setShowCreateTask(true)} data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employees">Employee Assignments</TabsTrigger>
              <TabsTrigger value="tasks">QA Tasks</TabsTrigger>
            </TabsList>

            {/* Employee Assignments Tab */}
            <TabsContent value="employees" className="space-y-6">
              {/* Employee Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employeeStats.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      QA/QC team members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{employeeStats.available}</div>
                    <p className="text-xs text-muted-foreground">
                      Ready for assignment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Busy</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{employeeStats.busy}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently assigned
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{employeeStats.avgWorkload}%</div>
                    <p className="text-xs text-muted-foreground">
                      Team capacity
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Search & Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search employees, roles, or skills..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                          data-testid="input-search-employees"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Busy">Busy</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                        <SelectItem value="Quality Control">Quality Control</SelectItem>
                        <SelectItem value="Regulatory Affairs">Regulatory Affairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Assignments Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Assignments</CardTitle>
                  <CardDescription>
                    Comprehensive view of QA team members and their current assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Role & Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Workload</TableHead>
                        <TableHead>Current Tasks</TableHead>
                        <TableHead>Skills & Certifications</TableHead>
                        <TableHead>Next Training</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">{employee.email}</div>
                              <div className="text-xs text-muted-foreground">
                                {employee.location} • Ext: {employee.phoneExtension}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.role}</div>
                              <div className="text-sm text-muted-foreground">{employee.department}</div>
                              <div className="text-xs text-muted-foreground">
                                {employee.shift} Shift • {employee.experience}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(employee.status)}
                              <Badge variant={getStatusVariant(employee.status)}>
                                {employee.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{employee.workload}%</span>
                              </div>
                              <Progress value={employee.workload} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{employee.currentTasks}</span> active
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {employee.completedTasks} completed
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs font-medium">Skills:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {employee.skills.slice(0, 3).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {employee.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{employee.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium">Certifications:</div>
                                <div className="text-xs text-muted-foreground">
                                  {employee.certifications.join(', ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div className="text-muted-foreground">Due:</div>
                              <div>{employee.nextTrainingDue}</div>
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
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QA Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              {/* Task Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{taskStats.totalTasks}</div>
                    <p className="text-xs text-muted-foreground">
                      All QA activities
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                    <p className="text-xs text-muted-foreground">
                      Currently active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                    <p className="text-xs text-muted-foreground">
                      Successfully finished
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{taskStats.critical}</div>
                    <p className="text-xs text-muted-foreground">
                      High priority tasks
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Task Categories Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>QA Task Categories</CardTitle>
                  <CardDescription>
                    Comprehensive overview of all quality assurance task categories and types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(QA_TASK_CATEGORIES).map(([key, category]) => {
                      const categoryTasks = mockQATasks.filter(task => task.category === key);
                      const IconComponent = category.icon;
                      
                      return (
                        <div key={key} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <IconComponent className="h-5 w-5" />
                            <h4 className="font-medium text-sm">{category.name}</h4>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg font-bold">{categoryTasks.length}</div>
                            <div className="text-xs text-muted-foreground">
                              {categoryTasks.filter(t => t.status === 'Completed').length} completed
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {categoryTasks.filter(t => t.status === 'In Progress').length} in progress
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Task Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Search & Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tasks, assignees, or descriptions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                          data-testid="input-search-tasks"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(QA_TASK_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full md:w-[130px]">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* QA Tasks Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assurance Tasks</CardTitle>
                  <CardDescription>
                    Comprehensive listing of all QA activities including equipment, batch release, environmental, and compliance tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task Details</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => {
                        const category = QA_TASK_CATEGORIES[task.category];
                        const IconComponent = category.icon;
                        const completedItems = task.checklist.filter(item => item.completed).length;
                        const totalItems = task.checklist.length;
                        const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {task.description}
                                </div>
                                <div className="flex space-x-2 mt-1">
                                  {task.batchNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.batchNumber}
                                    </Badge>
                                  )}
                                  {task.equipment && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.equipment}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {task.department}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <div>
                                  <Badge variant="secondary" className={`text-xs ${category.color}`}>
                                    {category.name}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{task.assignedTo}</div>
                                <div className="text-xs text-muted-foreground">{task.location}</div>
                                <div className="text-xs text-muted-foreground">
                                  Est: {task.estimatedHours}h
                                  {task.actualHours && ` | Actual: ${task.actualHours}h`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(task.status)}
                                <Badge variant={getStatusVariant(task.status)}>
                                  {task.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 min-w-[120px]">
                                <div className="flex justify-between text-xs">
                                  <span>{completedItems}/{totalItems}</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{task.dueDate.toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground">
                                  {task.dueDate < new Date() ? (
                                    <span className="text-red-600">Overdue</span>
                                  ) : (
                                    `${Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                                  )}
                                </div>
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}