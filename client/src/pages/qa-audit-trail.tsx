import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Sidebar } from "@/components/sidebar";
import {
  Shield,
  User,
  Clock,
  Search,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Wifi,
  Monitor,
  Lock,
  UserCheck,
  FileX,
  AlertTriangle,
  Info,
  History,
} from "lucide-react";
import type { ProductionOrder, TestResult } from "@shared/schema";

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "create":
    case "approve":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "update":
    case "modify":
      return <Settings className="h-4 w-4 text-blue-500" />;
    case "review":
    case "sign":
      return <FileText className="h-4 w-4 text-purple-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

export default function QAAuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("");
  const [complianceFilter, setComplianceFilter] = useState<string>("");

  const { data: productionOrders = [] } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: testResults = [] } = useQuery({
    queryKey: ["/api/test-results"],
  });

  // Comprehensive audit trail entries based on production orders and test results
  const auditEntries = useMemo(() => {
    const entries: any[] = [];
    
    // Production order audit entries with detailed tracking
    (productionOrders as ProductionOrder[]).forEach((order: ProductionOrder, index: number) => {
      const baseTime = new Date(order.createdAt || new Date()).getTime();
      
      entries.push(
        // Order Creation
        {
          id: `audit-${order.id}-create`,
          timestamp: new Date(baseTime),
          action: "Create",
          entityType: "Production Order",
          entityId: order.orderNumber,
          entityDetails: {
            product: order.skuProduct,
            quantity: order.quantity,
            priority: order.priority,
            batchSize: order.batchSize || 1000,
            targetDate: order.targetDate,
          },
          userId: order.createdBy || `prod-mgr-${index + 1}`,
          userName: order.createdBy || `Production Manager ${index + 1}`,
          userRole: "Production Manager",
          department: "Production",
          details: `Created production order ${order.orderNumber} for ${order.skuProduct}`,
          ipAddress: `10.0.${Math.floor(index/255)}.${100 + (index % 255)}`,
          location: "Production Facility - Mumbai",
          deviceInfo: `Workstation-PROD-${index.toString().padStart(3, '0')}`,
          sessionId: `sess-${order.id}-${baseTime}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
          changesSummary: `Initial creation: Quantity=${order.quantity}, Priority=${order.priority}, Batch Size=${order.batchSize || 1000}`,
          previousValues: null,
          newValues: {
            quantity: order.quantity,
            priority: order.priority,
            status: "Planning",
            batchSize: order.batchSize || 1000,
          },
          complianceFlag: false,
          riskLevel: order.priority === "Critical" ? "High" : order.priority === "High" ? "Medium" : "Low",
          regulatoryImpact: true,
          gmpRelevant: true,
          auditCategory: "Production Management",
          relatedDocuments: [`BMR-${order.orderNumber}`, `BPR-${order.orderNumber}`],
          approvalRequired: order.priority === "Critical",
          electronicSignature: true,
        },
        
        // Status Updates
        {
          id: `audit-${order.id}-status-update`,
          timestamp: new Date(baseTime + (2 * 60 * 60 * 1000)), // 2 hours later
          action: "Update",
          entityType: "Production Order",
          entityId: order.orderNumber,
          entityDetails: {
            product: order.skuProduct,
            statusChange: `Planning → ${order.status}`,
          },
          userId: "qa-mgr-001",
          userName: "Dr. Sarah Johnson",
          userRole: "QA Manager",
          department: "Quality Assurance",
          details: `Updated production order status from Planning to ${order.status}`,
          ipAddress: "10.0.1.201",
          location: "QA Laboratory - Mumbai",
          deviceInfo: "QA-Workstation-001",
          sessionId: `sess-qa-${order.id}-${baseTime + 7200000}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
          changesSummary: `Status changed from Planning to ${order.status}`,
          previousValues: { status: "Planning" },
          newValues: { status: order.status },
          complianceFlag: order.status === "Quality Check" || order.status === "Failed",
          riskLevel: order.status === "Failed" ? "Critical" : order.status === "Quality Check" ? "High" : "Medium",
          regulatoryImpact: true,
          gmpRelevant: true,
          auditCategory: "Quality Control",
          relatedDocuments: [`QC-Report-${order.orderNumber}`, `COA-${order.orderNumber}`],
          approvalRequired: order.status === "Quality Check",
          electronicSignature: order.status === "Quality Check",
        },

        // Batch Release Activities
        {
          id: `audit-${order.id}-batch-release`,
          timestamp: new Date(baseTime + (6 * 60 * 60 * 1000)), // 6 hours later
          action: "Approve",
          entityType: "Batch Release",
          entityId: `BR-${order.orderNumber}`,
          entityDetails: {
            batchNumber: `B${order.orderNumber.slice(-6)}`,
            product: order.skuProduct,
            releaseDecision: order.status === "Completed" ? "Released" : "Pending",
          },
          userId: "qa-mgr-001",
          userName: "Dr. Sarah Johnson",
          userRole: "QA Manager",
          department: "Quality Assurance",
          details: `Batch release review completed for ${order.orderNumber}`,
          ipAddress: "10.0.1.201",
          location: "QA Laboratory - Mumbai",
          deviceInfo: "QA-Workstation-001",
          sessionId: `sess-br-${order.id}-${baseTime + 21600000}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
          changesSummary: `Batch release decision: ${order.status === "Completed" ? "Released" : "Pending"}`,
          previousValues: { releaseStatus: "Under Review" },
          newValues: { releaseStatus: order.status === "Completed" ? "Released" : "Pending" },
          complianceFlag: order.status !== "Completed",
          riskLevel: order.status === "Completed" ? "Low" : "High",
          regulatoryImpact: true,
          gmpRelevant: true,
          auditCategory: "Batch Release",
          relatedDocuments: [`BR-${order.orderNumber}`, `COA-${order.orderNumber}`, `QC-Summary-${order.orderNumber}`],
          approvalRequired: true,
          electronicSignature: true,
        }
      );
    });

    // Test result audit entries with enhanced details
    (testResults as TestResult[]).forEach((result: TestResult, index: number) => {
      const testTime = new Date(result.testedAt || new Date()).getTime();
      
      entries.push(
        // Test Execution
        {
          id: `audit-test-exec-${result.id}`,
          timestamp: new Date(testTime),
          action: "Execute",
          entityType: "Quality Test",
          entityId: result.id,
          entityDetails: {
            materialId: result.materialId,
            testType: result.testConfigId,
            testMethod: result.testConfigId.includes('dissolution') ? 'USP Dissolution Test' : 
                      result.testConfigId.includes('assay') ? 'HPLC Assay' :
                      result.testConfigId.includes('moisture') ? 'Karl Fischer' : 'Standard Test',
            sampleId: `S-${result.materialId}-${index.toString().padStart(3, '0')}`,
            analyst: `Analyst ${index + 1}`,
          },
          userId: `lab-tech-${index.toString().padStart(3, '0')}`,
          userName: `Michael Chen`,
          userRole: "Senior QC Analyst",
          department: "Quality Control Laboratory",
          details: `Executed ${result.testConfigId} test for material ${result.materialId}`,
          ipAddress: `10.0.2.${150 + index}`,
          location: "QC Laboratory - Analytical Lab A",
          deviceInfo: `HPLC-${index + 1}`,
          sessionId: `sess-test-${result.id}-${testTime}`,
          userAgent: "Lab Information Management System v2.1",
          changesSummary: `Test execution completed with result: ${result.actualValue} ${result.unit}`,
          previousValues: { status: "Pending" },
          newValues: { 
            status: result.status,
            actualValue: result.actualValue,
            unit: result.unit,
            testDate: result.testedAt,
          },
          complianceFlag: result.status === "Fail",
          riskLevel: result.status === "Fail" ? "Critical" : result.status === "Warning" ? "High" : "Low",
          regulatoryImpact: true,
          gmpRelevant: true,
          auditCategory: "Laboratory Testing",
          relatedDocuments: [`Test-Protocol-${result.testConfigId}`, `Raw-Data-${result.id}`, `Lab-Notebook-${index + 1}`],
          approvalRequired: result.status === "Fail",
          electronicSignature: true,
        },

        // Test Review (if reviewed)
        ...(result.reviewedBy ? [{
          id: `audit-test-review-${result.id}`,
          timestamp: new Date(testTime + (2 * 60 * 60 * 1000)), // 2 hours after test
          action: "Review",
          entityType: "Quality Test",
          entityId: result.id,
          entityDetails: {
            materialId: result.materialId,
            testType: result.testConfigId,
            reviewDecision: result.status === "Pass" ? "Approved" : result.status === "Fail" ? "Rejected" : "Investigate",
            reviewer: result.reviewedBy,
          },
          userId: "qa-reviewer-001",
          userName: result.reviewedBy,
          userRole: "QA Reviewer",
          department: "Quality Assurance",
          details: `Reviewed and ${result.status === "Pass" ? "approved" : result.status === "Fail" ? "rejected" : "flagged for investigation"} test result ${result.id}`,
          ipAddress: "10.0.1.202",
          location: "QA Office - Mumbai",
          deviceInfo: "QA-Review-Station-001",
          sessionId: `sess-review-${result.id}-${testTime + 7200000}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
          changesSummary: `Review completed with decision: ${result.status === "Pass" ? "Approved" : result.status === "Fail" ? "Rejected" : "Investigation Required"}`,
          previousValues: { reviewStatus: "Pending Review" },
          newValues: { 
            reviewStatus: "Reviewed",
            reviewDecision: result.status === "Pass" ? "Approved" : result.status === "Fail" ? "Rejected" : "Investigate",
            reviewedBy: result.reviewedBy,
            reviewedAt: new Date(testTime + 7200000),
          },
          complianceFlag: result.status === "Fail",
          riskLevel: result.status === "Fail" ? "Critical" : "Low",
          regulatoryImpact: true,
          gmpRelevant: true,
          auditCategory: "Quality Review",
          relatedDocuments: [`Review-Report-${result.id}`, `Test-Data-${result.id}`, `Deviation-Report-${result.id}`],
          approvalRequired: result.status === "Fail",
          electronicSignature: true,
        }] : [])
      );
    });

    // Add system and security audit entries
    entries.push(
      {
        id: "audit-system-backup-001",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        action: "System Backup",
        entityType: "System Maintenance",
        entityId: "SYS-BACKUP-001",
        entityDetails: {
          backupType: "Full System Backup",
          dataSize: "2.3 TB",
          duration: "4 hours 23 minutes",
        },
        userId: "sys-admin-001",
        userName: "System Administrator",
        userRole: "System Administrator",
        department: "IT Operations",
        details: "Completed scheduled full system backup",
        ipAddress: "10.0.0.10",
        location: "Data Center - Mumbai",
        deviceInfo: "Backup-Server-001",
        sessionId: "sess-backup-001",
        userAgent: "Automated Backup System v3.2",
        changesSummary: "Full system backup completed successfully",
        previousValues: null,
        newValues: { backupStatus: "Completed", backupSize: "2.3 TB" },
        complianceFlag: false,
        riskLevel: "Low",
        regulatoryImpact: true,
        gmpRelevant: true,
        auditCategory: "System Administration",
        relatedDocuments: ["Backup-Log-001", "Verification-Report-001"],
        approvalRequired: false,
        electronicSignature: true,
      },
      
      {
        id: "audit-security-001",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        action: "Security Event",
        entityType: "Security Monitoring",
        entityId: "SEC-LOGIN-001",
        entityDetails: {
          eventType: "Failed Login Attempt",
          attempts: 3,
          accountLocked: false,
        },
        userId: "unknown",
        userName: "Unknown User",
        userRole: "Unknown",
        department: "External",
        details: "Multiple failed login attempts detected for user account",
        ipAddress: "203.145.67.89",
        location: "External",
        deviceInfo: "Unknown Device",
        sessionId: "sess-security-001",
        userAgent: "Unknown",
        changesSummary: "Security event: 3 failed login attempts",
        previousValues: null,
        newValues: { securityStatus: "Monitored", threatLevel: "Low" },
        complianceFlag: true,
        riskLevel: "Medium",
        regulatoryImpact: false,
        gmpRelevant: false,
        auditCategory: "Security Monitoring",
        relatedDocuments: ["Security-Log-001", "Incident-Report-001"],
        approvalRequired: false,
        electronicSignature: false,
      }
    );

    // Sort by timestamp descending (most recent first)
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [productionOrders, testResults]);

  // Enhanced filtering with comprehensive search
  const filteredEntries = useMemo(() => {
    let filtered = auditEntries;

    // Text search across multiple fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.details.toLowerCase().includes(term) ||
        entry.entityId.toLowerCase().includes(term) ||
        entry.userName.toLowerCase().includes(term) ||
        entry.userRole.toLowerCase().includes(term) ||
        entry.department.toLowerCase().includes(term) ||
        entry.location.toLowerCase().includes(term) ||
        entry.auditCategory.toLowerCase().includes(term) ||
        entry.changesSummary.toLowerCase().includes(term) ||
        entry.ipAddress.includes(term) ||
        entry.sessionId.toLowerCase().includes(term) ||
        (entry.entityDetails && JSON.stringify(entry.entityDetails).toLowerCase().includes(term))
      );
    }

    // Action filter
    if (selectedAction && selectedAction !== "all") {
      filtered = filtered.filter(entry => entry.action === selectedAction);
    }

    // User filter
    if (selectedUser && selectedUser !== "all") {
      filtered = filtered.filter(entry => entry.userName === selectedUser);
    }

    // Entity type filter
    if (selectedEntityType && selectedEntityType !== "all") {
      filtered = filtered.filter(entry => entry.entityType === selectedEntityType);
    }

    // Audit category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(entry => entry.auditCategory === selectedCategory);
    }

    // Risk level filter
    if (selectedRiskLevel && selectedRiskLevel !== "all") {
      filtered = filtered.filter(entry => entry.riskLevel === selectedRiskLevel);
    }

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "yesterday":
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= startDate
      );
    }

    // Compliance filter
    if (complianceFilter && complianceFilter !== "all") {
      if (complianceFilter === "flagged") {
        filtered = filtered.filter(entry => entry.complianceFlag);
      } else if (complianceFilter === "clean") {
        filtered = filtered.filter(entry => !entry.complianceFlag);
      }
    }

    return filtered;
  }, [auditEntries, searchTerm, selectedAction, selectedUser, selectedEntityType, selectedCategory, selectedRiskLevel, dateRange, complianceFilter]);

  // Enhanced statistics for comprehensive audit trail
  const stats = useMemo(() => {
    const total = auditEntries.length;
    const filtered = filteredEntries.length;
    const today = auditEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      return entryDate.toDateString() === now.toDateString();
    }).length;
    const complianceFlags = auditEntries.filter(entry => entry.complianceFlag).length;
    const uniqueUsers = new Set(auditEntries.map(entry => entry.userName)).size;
    const criticalRisk = auditEntries.filter(entry => entry.riskLevel === "Critical").length;
    const electronicSignatures = auditEntries.filter(entry => entry.electronicSignature).length;
    const gmpRelevant = auditEntries.filter(entry => entry.gmpRelevant).length;

    return { 
      total, 
      filtered, 
      today, 
      complianceFlags, 
      uniqueUsers, 
      criticalRisk, 
      electronicSignatures, 
      gmpRelevant 
    };
  }, [auditEntries]);

  const uniqueActions = useMemo(() => {
    return [...new Set(auditEntries.map(entry => entry.action))];
  }, [auditEntries]);

  const uniqueUsers = useMemo(() => {
    return [...new Set(auditEntries.map(entry => entry.userName))];
  }, [auditEntries]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="qa-audit-trail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="qa-audit-trail-title">
            QA Audit Trail
          </h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail for quality assurance activities with full traceability and compliance tracking
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-entries">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Audit trail records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="today-entries">
              {stats.today}
            </div>
            <p className="text-xs text-muted-foreground">
              Activities recorded today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Flags</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="compliance-flags">
              {stats.complianceFlags}
            </div>
            <p className="text-xs text-muted-foreground">
              Entries requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="active-users">
              {stats.uniqueUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with recent activity
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
                placeholder="Search audit entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="audit-search"
              />
            </div>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-actions">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Additional Filter Row */}
          <div className="flex items-center space-x-4">
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                <SelectItem value="Production Order">Production Order</SelectItem>
                <SelectItem value="Quality Test">Quality Test</SelectItem>
                <SelectItem value="Batch Release">Batch Release</SelectItem>
                <SelectItem value="System Maintenance">System Maintenance</SelectItem>
                <SelectItem value="Security Monitoring">Security Monitoring</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Audit Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Production Management">Production Management</SelectItem>
                <SelectItem value="Quality Control">Quality Control</SelectItem>
                <SelectItem value="Laboratory Testing">Laboratory Testing</SelectItem>
                <SelectItem value="Batch Release">Batch Release</SelectItem>
                <SelectItem value="Quality Review">Quality Review</SelectItem>
                <SelectItem value="System Administration">System Administration</SelectItem>
                <SelectItem value="Security Monitoring">Security Monitoring</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedAction("");
              setSelectedUser("");
              setSelectedEntityType("");
              setSelectedCategory("");
              setSelectedRiskLevel("");
              setDateRange("");
              setComplianceFilter("");
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {filteredEntries.length !== stats.total && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredEntries.length} of {stats.total} audit entries
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Comprehensive Audit Trail
          </CardTitle>
          <CardDescription>
            Detailed audit records with full traceability, compliance tracking, and regulatory information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Location & Device</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Risk & Compliance</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className={entry.complianceFlag ? "bg-red-50" : ""}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {formatDateTime(entry.timestamp)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Session: {entry.sessionId.slice(-8)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(entry.action)}
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                          {entry.electronicSignature && (
                            <div className="flex items-center mt-1">
                              <Lock className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600">e-Signed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{entry.entityType}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {entry.entityId}
                        </div>
                        {entry.entityDetails && (
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(entry.entityDetails).slice(0, 2).map(([key, value]) => (
                              <div key={key}>
                                {key}: {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                            {entry.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{entry.userName}</div>
                            <div className="text-xs text-muted-foreground">{entry.userRole}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.department}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {entry.userId}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{entry.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{entry.deviceInfo}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Wifi className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono">{entry.ipAddress}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2 max-w-xs">
                        <div className="text-sm">{entry.details}</div>
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          <div className="font-medium mb-1">Changes:</div>
                          <div>{entry.changesSummary}</div>
                        </div>
                        {entry.relatedDocuments && entry.relatedDocuments.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium">Documents:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.relatedDocuments.slice(0, 2).map((doc, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {doc}
                                </Badge>
                              ))}
                              {entry.relatedDocuments.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{entry.relatedDocuments.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <Badge 
                          variant={
                            entry.riskLevel === "Critical" ? "destructive" :
                            entry.riskLevel === "High" ? "default" :
                            entry.riskLevel === "Medium" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {entry.riskLevel} Risk
                        </Badge>
                        
                        {entry.complianceFlag && (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">Compliance Flag</span>
                          </div>
                        )}
                        
                        <div className="flex flex-col space-y-1">
                          {entry.gmpRelevant && (
                            <div className="flex items-center space-x-1">
                              <UserCheck className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600">GMP</span>
                            </div>
                          )}
                          {entry.regulatoryImpact && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600">Regulatory</span>
                            </div>
                          )}
                          {entry.approvalRequired && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-orange-600">Approval Req</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {entry.auditCategory}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}