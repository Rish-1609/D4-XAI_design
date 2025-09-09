import { useState, useMemo, useCallback } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  CalendarIcon,
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
  Save,
  X,
  Copy,
  RefreshCw,
  ChevronDown,
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
  dateCreated: Date;
  lastModified: Date;
}

// Historical data interface for tracking changes
interface HistoricalEntry<T> {
  date: Date;
  data: T[];
  modifiedBy: string;
  changes: string[];
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
    nextTrainingDue: '2025-05-01',
    dateCreated: new Date('2018-03-15'),
    lastModified: new Date()
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
    nextTrainingDue: '2025-04-15',
    dateCreated: new Date('2020-07-20'),
    lastModified: new Date()
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
    nextTrainingDue: '2025-03-20',
    dateCreated: new Date('2019-11-10'),
    lastModified: new Date()
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
    nextTrainingDue: '2025-06-01',
    dateCreated: new Date('2017-09-05'),
    lastModified: new Date()
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
    nextTrainingDue: '2025-03-15',
    dateCreated: new Date('2023-06-01'),
    lastModified: new Date()
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
    nextTrainingDue: '2025-05-10',
    dateCreated: new Date('2021-01-18'),
    lastModified: new Date()
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
  
  // Date filtering states
  const [creationDateFilter, setCreationDateFilter] = useState<string>("");
  const [dueDateFilter, setDueDateFilter] = useState<string>("");
  const [dateFilterType, setDateFilterType] = useState<"all" | "today" | "this_week" | "this_month" | "overdue" | "custom">("all");
  
  // Table column filters for QA Tasks
  const [taskColumnFilters, setTaskColumnFilters] = useState({
    title: [] as string[],
    category: [] as string[],
    assignedTo: [] as string[],
    priority: [] as string[],
    status: [] as string[],
    department: [] as string[]
  });
  
  // Table column filters for Employee Assignments
  const [employeeColumnFilters, setEmployeeColumnFilters] = useState({
    name: [] as string[],
    role: [] as string[],
    department: [] as string[],
    status: [] as string[],
    shift: [] as string[]
  });
  
  // Date tracking states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Edit mode states
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingEmployeeData, setEditingEmployeeData] = useState<QAEmployee | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<QATask | null>(null);
  
  // Historical data states
  const [employees, setEmployees] = useState<QAEmployee[]>(mockQAEmployees);
  const [tasks, setTasks] = useState<QATask[]>(mockQATasks);
  const [employeeHistory, setEmployeeHistory] = useState<HistoricalEntry<QAEmployee>[]>([]);
  const [taskHistory, setTaskHistory] = useState<HistoricalEntry<QATask>[]>([]);

  const { toast } = useToast();

  // Helper functions for table column filters
  const getUniqueValues = (data: any[], key: string) => {
    return Array.from(new Set(data.map(item => item[key]))).filter(Boolean).sort();
  };

  const toggleColumnFilter = (column: string, value: string, isTask: boolean = true) => {
    if (isTask) {
      setTaskColumnFilters(prev => ({
        ...prev,
        [column]: prev[column as keyof typeof prev].includes(value)
          ? prev[column as keyof typeof prev].filter((v: string) => v !== value)
          : [...prev[column as keyof typeof prev], value]
      }));
    } else {
      setEmployeeColumnFilters(prev => ({
        ...prev,
        [column]: prev[column as keyof typeof prev].includes(value)
          ? prev[column as keyof typeof prev].filter((v: string) => v !== value)
          : [...prev[column as keyof typeof prev], value]
      }));
    }
  };

  const clearColumnFilter = (column: string, isTask: boolean = true) => {
    if (isTask) {
      setTaskColumnFilters(prev => ({ ...prev, [column]: [] }));
    } else {
      setEmployeeColumnFilters(prev => ({ ...prev, [column]: [] }));
    }
  };

  // Column Filter Component
  const ColumnFilter = ({ 
    column, 
    data, 
    currentFilters, 
    isTask = true,
    keyExtractor = (item) => item 
  }: {
    column: string;
    data: any[];
    currentFilters: string[];
    isTask?: boolean;
    keyExtractor?: (item: any) => string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const uniqueValues = getUniqueValues(data, column);
    
    return (
      <div className="relative inline-block">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          data-testid={`filter-${column}-${isTask ? 'task' : 'employee'}`}
        >
          <ChevronDown className={`h-3 w-3 ${currentFilters.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
        </Button>
        {isOpen && (
          <div className="absolute top-8 right-0 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-700">Filter by {column}</span>
                {currentFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => clearColumnFilter(column, isTask)}
                    data-testid={`clear-filter-${column}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {uniqueValues.map((value) => (
                  <label key={value} className="flex items-center space-x-2 text-xs hover:bg-gray-50 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentFilters.includes(value)}
                      onChange={() => toggleColumnFilter(column, value, isTask)}
                      className="h-3 w-3 text-blue-600 rounded border-gray-300"
                      data-testid={`filter-option-${value}`}
                    />
                    <span className="truncate">{value}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Save historical data function
  const saveToHistory = useCallback((type: 'employees' | 'tasks', changes: string[]) => {
    const now = new Date();
    if (type === 'employees') {
      setEmployeeHistory(prev => [...prev, {
        date: now,
        data: [...employees],
        modifiedBy: 'Current User',
        changes
      }]);
    } else {
      setTaskHistory(prev => [...prev, {
        date: now,
        data: [...tasks],
        modifiedBy: 'Current User',
        changes
      }]);
    }
  }, [employees, tasks]);

  // Edit functions for employees
  const startEditingEmployee = (employee: QAEmployee) => {
    setEditingEmployeeId(employee.id);
    setEditingEmployeeData({...employee});
  };

  const saveEmployeeEdit = () => {
    if (!editingEmployeeData || !editingEmployeeId) return;
    
    const updatedEmployees = employees.map(emp => 
      emp.id === editingEmployeeId ? 
      {...editingEmployeeData, lastModified: new Date()} : emp
    );
    
    setEmployees(updatedEmployees);
    saveToHistory('employees', [`Updated employee: ${editingEmployeeData.name}`]);
    setEditingEmployeeId(null);
    setEditingEmployeeData(null);
    
    toast({
      title: "Employee Updated",
      description: `Successfully updated ${editingEmployeeData.name}'s information.`,
    });
  };

  const cancelEmployeeEdit = () => {
    setEditingEmployeeId(null);
    setEditingEmployeeData(null);
  };

  // Edit functions for tasks
  const startEditingTask = (task: QATask) => {
    setEditingTaskId(task.id);
    setEditingTaskData({...task});
  };

  const saveTaskEdit = () => {
    if (!editingTaskData || !editingTaskId) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === editingTaskId ? 
      {...editingTaskData, updatedAt: new Date()} : task
    );
    
    setTasks(updatedTasks);
    saveToHistory('tasks', [`Updated task: ${editingTaskData.title}`]);
    setEditingTaskId(null);
    setEditingTaskData(null);
    
    toast({
      title: "Task Updated",
      description: `Successfully updated task: ${editingTaskData.title}`,
    });
  };

  const cancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskData(null);
  };

  // Pull tasks from previous date
  const pullTasksFromDate = (fromDate: Date) => {
    // Find historical data for the selected date
    const historicalData = taskHistory.find(entry => 
      entry.date.toDateString() === fromDate.toDateString()
    );
    
    if (historicalData) {
      // Create new tasks based on historical data with updated dates
      const newTasks = historicalData.data.map(task => ({
        ...task,
        id: `${task.id}-copy-${Date.now()}`,
        status: 'Not Started' as const,
        startDate: selectedDate,
        dueDate: new Date(selectedDate.getTime() + (task.dueDate.getTime() - task.startDate.getTime())),
        createdAt: new Date(),
        updatedAt: new Date(),
        completedDate: undefined,
        reviewedDate: undefined,
        actualHours: undefined,
      }));
      
      setTasks(prev => [...prev, ...newTasks]);
      saveToHistory('tasks', [`Pulled ${newTasks.length} tasks from ${fromDate.toDateString()}`]);
      
      toast({
        title: "Tasks Pulled Successfully",
        description: `Added ${newTasks.length} tasks from ${fromDate.toDateString()}`,
      });
    } else {
      toast({
        title: "No Data Found",
        description: `No task data found for ${fromDate.toDateString()}`,
        variant: "destructive",
      });
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

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

    // Apply table column filters for employees
    if (employeeColumnFilters.name.length > 0) {
      filtered = filtered.filter(emp => 
        employeeColumnFilters.name.some(filterValue => 
          emp.name.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    
    if (employeeColumnFilters.role.length > 0) {
      filtered = filtered.filter(emp => employeeColumnFilters.role.includes(emp.role));
    }
    
    if (employeeColumnFilters.department.length > 0) {
      filtered = filtered.filter(emp => employeeColumnFilters.department.includes(emp.department));
    }
    
    if (employeeColumnFilters.status.length > 0) {
      filtered = filtered.filter(emp => employeeColumnFilters.status.includes(emp.status));
    }
    
    if (employeeColumnFilters.shift.length > 0) {
      filtered = filtered.filter(emp => employeeColumnFilters.shift.includes(emp.shift));
    }

    return filtered;
  }, [searchTerm, statusFilter, departmentFilter, employeeColumnFilters]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

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

    // Apply table column filters
    if (taskColumnFilters.title.length > 0) {
      filtered = filtered.filter(task => 
        taskColumnFilters.title.some(filterValue => 
          task.title.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }
    
    if (taskColumnFilters.category.length > 0) {
      filtered = filtered.filter(task => taskColumnFilters.category.includes(task.category));
    }
    
    if (taskColumnFilters.assignedTo.length > 0) {
      filtered = filtered.filter(task => taskColumnFilters.assignedTo.includes(task.assignedTo));
    }
    
    if (taskColumnFilters.priority.length > 0) {
      filtered = filtered.filter(task => taskColumnFilters.priority.includes(task.priority));
    }
    
    if (taskColumnFilters.status.length > 0) {
      filtered = filtered.filter(task => taskColumnFilters.status.includes(task.status));
    }
    
    if (taskColumnFilters.department.length > 0) {
      filtered = filtered.filter(task => taskColumnFilters.department.includes(task.department));
    }

    // Date filtering logic
    if (dateFilterType !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
        switch (dateFilterType) {
          case "today":
            return task.createdAt.toDateString() === today.toDateString();
          case "this_week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return task.createdAt >= weekStart;
          case "this_month":
            return task.createdAt.getMonth() === now.getMonth() && 
                   task.createdAt.getFullYear() === now.getFullYear();
          case "overdue":
            return task.dueDate < now && task.status !== 'Completed';
          case "custom":
            let matchesFilter = true;
            if (creationDateFilter) {
              const filterDate = new Date(creationDateFilter);
              matchesFilter = matchesFilter && task.createdAt.toDateString() === filterDate.toDateString();
            }
            if (dueDateFilter) {
              const filterDate = new Date(dueDateFilter);
              matchesFilter = matchesFilter && task.dueDate.toDateString() === filterDate.toDateString();
            }
            return matchesFilter;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, dateFilterType, creationDateFilter, dueDateFilter, taskColumnFilters]);

  // Statistics for employees
  const employeeStats = useMemo(() => {
    const totalEmployees = employees.length;
    const available = employees.filter(emp => emp.status === 'Available').length;
    const busy = employees.filter(emp => emp.status === 'Busy').length;
    const onLeave = employees.filter(emp => emp.status === 'On Leave').length;
    const avgWorkload = totalEmployees > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.workload, 0) / totalEmployees) : 0;

    return { totalEmployees, available, busy, onLeave, avgWorkload };
  }, [employees]);

  // Statistics for tasks
  const taskStats = useMemo(() => {
    const totalTasks = tasks.length;
    const notStarted = tasks.filter(task => task.status === 'Not Started').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const critical = tasks.filter(task => task.priority === 'Critical').length;

    return { totalTasks, notStarted, inProgress, completed, critical };
  }, [tasks]);

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
                Comprehensive quality assurance team assignments and task management with date tracking
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Date Picker */}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" data-testid="button-date-picker">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {selectedDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        pullTasksFromDate(yesterday);
                        setShowDatePicker(false);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Pull Tasks from Yesterday
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button onClick={() => setShowCreateTask(true)} data-testid="button-create-task">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
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
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Employee</span>
                            <ColumnFilter 
                              column="name" 
                              data={employees} 
                              currentFilters={employeeColumnFilters.name}
                              isTask={false}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Role & Department</span>
                            <ColumnFilter 
                              column="role" 
                              data={employees} 
                              currentFilters={employeeColumnFilters.role}
                              isTask={false}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Status</span>
                            <ColumnFilter 
                              column="status" 
                              data={employees} 
                              currentFilters={employeeColumnFilters.status}
                              isTask={false}
                            />
                          </div>
                        </TableHead>
                        <TableHead>Workload</TableHead>
                        <TableHead>Current Tasks</TableHead>
                        <TableHead>Skills & Certifications</TableHead>
                        <TableHead>Next Training</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => {
                        const isEditing = editingEmployeeId === employee.id;
                        const editData = isEditing ? editingEmployeeData : employee;
                        
                        return (
                          <TableRow key={employee.id} className={isEditing ? "bg-blue-50" : ""}>
                            <TableCell>
                              <div>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editData?.name || ''}
                                      onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, name: e.target.value} : null)}
                                      className="h-8"
                                      data-testid={`input-edit-name-${employee.id}`}
                                    />
                                    <Input
                                      value={editData?.email || ''}
                                      onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, email: e.target.value} : null)}
                                      className="h-8 text-sm"
                                      data-testid={`input-edit-email-${employee.id}`}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {employee.location} • Ext: {employee.phoneExtension}
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editData?.role || ''}
                                      onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, role: e.target.value} : null)}
                                      className="h-8"
                                      data-testid={`input-edit-role-${employee.id}`}
                                    />
                                    <Select 
                                      value={editData?.department || ''}
                                      onValueChange={(value) => setEditingEmployeeData(prev => prev ? {...prev, department: value} : null)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                                        <SelectItem value="Quality Control">Quality Control</SelectItem>
                                        <SelectItem value="Regulatory Affairs">Regulatory Affairs</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  <>
                                    <div className="font-medium">{employee.role}</div>
                                    <div className="text-sm text-muted-foreground">{employee.department}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {employee.shift} Shift • {employee.experience}
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Select 
                                  value={editData?.status || ''}
                                  onValueChange={(value) => setEditingEmployeeData(prev => prev ? {...prev, status: value as QAEmployee['status']} : null)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Busy">Busy</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                    <SelectItem value="Training">Training</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(employee.status)}
                                  <Badge variant={getStatusVariant(employee.status)}>
                                    {employee.status}
                                  </Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editData?.workload || 0}
                                    onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, workload: parseInt(e.target.value)} : null)}
                                    className="h-8"
                                    data-testid={`input-edit-workload-${employee.id}`}
                                  />
                                ) : (
                                  <>
                                    <div className="flex justify-between text-sm">
                                      <span>{employee.workload}%</span>
                                    </div>
                                    <Progress value={employee.workload} className="h-2" />
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editData?.currentTasks || 0}
                                    onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, currentTasks: parseInt(e.target.value)} : null)}
                                    className="h-8"
                                    placeholder="Current tasks"
                                    data-testid={`input-edit-current-tasks-${employee.id}`}
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editData?.completedTasks || 0}
                                    onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, completedTasks: parseInt(e.target.value)} : null)}
                                    className="h-8"
                                    placeholder="Completed tasks"
                                    data-testid={`input-edit-completed-tasks-${employee.id}`}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <span className="font-medium">{employee.currentTasks}</span> active
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.completedTasks} completed
                                  </div>
                                </div>
                              )}
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
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editData?.nextTrainingDue || ''}
                                  onChange={(e) => setEditingEmployeeData(prev => prev ? {...prev, nextTrainingDue: e.target.value} : null)}
                                  className="h-8"
                                  data-testid={`input-edit-training-due-${employee.id}`}
                                />
                              ) : (
                                <div className="text-xs">
                                  <div className="text-muted-foreground">Due:</div>
                                  <div>{employee.nextTrainingDue}</div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {isEditing ? (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="default" 
                                      className="h-8 w-8 p-0"
                                      onClick={saveEmployeeEdit}
                                      data-testid={`button-save-employee-${employee.id}`}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0"
                                      onClick={cancelEmployeeEdit}
                                      data-testid={`button-cancel-employee-${employee.id}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => startEditingEmployee(employee)}
                                      data-testid={`button-edit-employee-${employee.id}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
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
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Task Details</span>
                            <ColumnFilter 
                              column="title" 
                              data={tasks} 
                              currentFilters={taskColumnFilters.title}
                              isTask={true}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Category</span>
                            <ColumnFilter 
                              column="category" 
                              data={tasks} 
                              currentFilters={taskColumnFilters.category}
                              isTask={true}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Assigned To</span>
                            <ColumnFilter 
                              column="assignedTo" 
                              data={tasks} 
                              currentFilters={taskColumnFilters.assignedTo}
                              isTask={true}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Priority</span>
                            <ColumnFilter 
                              column="priority" 
                              data={tasks} 
                              currentFilters={taskColumnFilters.priority}
                              isTask={true}
                            />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center justify-between">
                            <span>Status</span>
                            <ColumnFilter 
                              column="status" 
                              data={tasks} 
                              currentFilters={taskColumnFilters.status}
                              isTask={true}
                            />
                          </div>
                        </TableHead>
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
                        const isEditing = editingTaskId === task.id;
                        const editData = isEditing ? editingTaskData : task;

                        return (
                          <TableRow key={task.id} className={isEditing ? "bg-blue-50" : ""}>
                            <TableCell>
                              <div>
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editData?.title || ''}
                                      onChange={(e) => setEditingTaskData(prev => prev ? {...prev, title: e.target.value} : null)}
                                      className="h-8"
                                      data-testid={`input-edit-task-title-${task.id}`}
                                    />
                                    <Input
                                      value={editData?.description || ''}
                                      onChange={(e) => setEditingTaskData(prev => prev ? {...prev, description: e.target.value} : null)}
                                      className="h-8 text-sm"
                                      placeholder="Description"
                                      data-testid={`input-edit-task-description-${task.id}`}
                                    />
                                  </div>
                                ) : (
                                  <>
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
                                  </>
                                )}
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
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Select 
                                      value={editData?.assignedTo || ''}
                                      onValueChange={(value) => setEditingTaskData(prev => prev ? {...prev, assignedTo: value} : null)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Assign to..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {employees.map(emp => (
                                          <SelectItem key={emp.id} value={emp.name}>
                                            {emp.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editData?.estimatedHours || 0}
                                      onChange={(e) => setEditingTaskData(prev => prev ? {...prev, estimatedHours: parseInt(e.target.value)} : null)}
                                      className="h-8"
                                      placeholder="Estimated hours"
                                      data-testid={`input-edit-estimated-hours-${task.id}`}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="font-medium text-sm">{task.assignedTo}</div>
                                    <div className="text-xs text-muted-foreground">{task.location}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Est: {task.estimatedHours}h
                                      {task.actualHours && ` | Actual: ${task.actualHours}h`}
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Select 
                                  value={editData?.priority || ''}
                                  onValueChange={(value) => setEditingTaskData(prev => prev ? {...prev, priority: value as QATask['priority']} : null)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                                  {task.priority}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Select 
                                  value={editData?.status || ''}
                                  onValueChange={(value) => setEditingTaskData(prev => prev ? {...prev, status: value as QATask['status']} : null)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(task.status)}
                                  <Badge variant={getStatusVariant(task.status)}>
                                    {task.status}
                                  </Badge>
                                </div>
                              )}
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
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editData?.dueDate ? editData.dueDate.toISOString().split('T')[0] : ''}
                                  onChange={(e) => setEditingTaskData(prev => prev ? {...prev, dueDate: new Date(e.target.value)} : null)}
                                  className="h-8"
                                  data-testid={`input-edit-due-date-${task.id}`}
                                />
                              ) : (
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
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {isEditing ? (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="default" 
                                      className="h-8 w-8 p-0"
                                      onClick={saveTaskEdit}
                                      data-testid={`button-save-task-${task.id}`}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0"
                                      onClick={cancelTaskEdit}
                                      data-testid={`button-cancel-task-${task.id}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0"
                                      onClick={() => startEditingTask(task)}
                                      data-testid={`button-edit-task-${task.id}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
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

        {/* Create Task Dialog */}
        {showCreateTask && (
          <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New QA Task
                </DialogTitle>
                <DialogDescription>
                  Create a new quality assurance task and assign it to a team member
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Task Title *</label>
                    <Input 
                      placeholder="Enter task title"
                      data-testid="input-task-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <Select>
                      <SelectTrigger data-testid="select-task-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(QA_TASK_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full min-h-[80px] p-2 border rounded-md resize-y"
                    placeholder="Detailed task description..."
                    data-testid="textarea-task-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority *</label>
                    <Select>
                      <SelectTrigger data-testid="select-task-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned To *</label>
                    <Select>
                      <SelectTrigger data-testid="select-task-assignee">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center space-x-2">
                              <span>{employee.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Due Date *</label>
                    <Input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-task-due-date"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Hours</label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Hours"
                      data-testid="input-estimated-hours"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Select>
                      <SelectTrigger data-testid="select-task-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                        <SelectItem value="Quality Control">Quality Control</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Regulatory Affairs">Regulatory Affairs</SelectItem>
                        <SelectItem value="Research & Development">Research & Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <Select>
                    <SelectTrigger data-testid="select-risk-level">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Checklist</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    <div className="flex items-center space-x-2">
                      <Input 
                        placeholder="Add checklist item..."
                        className="h-8"
                        data-testid="input-checklist-item"
                      />
                      <Button size="sm" className="h-8">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <p><strong>Creation Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Created By:</strong> Current User</p>
                    <p><strong>Task ID:</strong> Will be auto-generated</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: Implement task creation logic
                    toast({
                      title: "Task Created",
                      description: "New QA task has been successfully created and assigned.",
                    });
                    setShowCreateTask(false);
                  }}
                  data-testid="button-submit-task"
                >
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}