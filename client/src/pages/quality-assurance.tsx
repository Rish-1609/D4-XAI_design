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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  TestTube,
  Package,
  Settings,
  Factory,
  Eye,
  Search,
  ShieldCheck,
  Award,
  TrendingUp,
} from "lucide-react";
import type {
  ProductionOrder,
  Material,
  TestConfig,
  TestResult,
} from "@shared/schema";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

export default function QualityAssurance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching queries
  const { data: productionOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/production-orders"],
  });

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: testConfigs = [], isLoading: testConfigsLoading } = useQuery({
    queryKey: ["/api/test-configs"],
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery({
    queryKey: ["/api/test-results"],
  });

  // Filtering based on existing data
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return productionOrders;
    return productionOrders.filter((order: ProductionOrder) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.skuProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productionOrders, searchTerm]);

  // Get test results for materials
  const getTestResultsForMaterial = (materialId: string) => {
    return testResults.filter((result: TestResult) => result.materialId === materialId);
  };

  // Calculate quality metrics based on test results
  const getQualityMetrics = (materialId: string) => {
    const materialTests = getTestResultsForMaterial(materialId);
    const passedTests = materialTests.filter((test: TestResult) => test.status === 'Pass');
    const passRate = materialTests.length > 0 ? Math.round((passedTests.length / materialTests.length) * 100) : 0;
    
    return {
      totalTests: materialTests.length,
      passedTests: passedTests.length,
      passRate,
      status: passRate >= 95 ? 'Excellent' : passRate >= 80 ? 'Good' : passRate >= 60 ? 'Acceptable' : 'Needs Review'
    };
  };

  // QA Statistics based on existing data
  const qaStats = useMemo(() => {
    const totalOrders = productionOrders.length;
    const completedOrders = productionOrders.filter((order: ProductionOrder) => order.status === 'Completed').length;
    const inProgressOrders = productionOrders.filter((order: ProductionOrder) => 
      order.status === 'In Progress' || order.status === 'Quality Check'
    ).length;
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter((test: TestResult) => test.status === 'Pass').length;
    const failedTests = testResults.filter((test: TestResult) => test.status === 'Fail').length;
    
    const totalMaterials = materials.length;
    const approvedMaterials = materials.filter((material: Material) => material.status === 'approved').length;
    
    const totalTestConfigs = testConfigs.length;
    const activeTestConfigs = testConfigs.filter((config: TestConfig) => config.isActive).length;

    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      totalTests,
      passedTests,
      failedTests,
      testPassRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      totalMaterials,
      approvedMaterials,
      materialApprovalRate: totalMaterials > 0 ? Math.round((approvedMaterials / totalMaterials) * 100) : 0,
      totalTestConfigs,
      activeTestConfigs,
    };
  }, [productionOrders, testResults, materials, testConfigs]);

  // Handle test result status updates
  const updateTestResultMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestResult> }) =>
      apiRequest(`/api/test-results/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
      toast({ title: "Test result updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update test result", variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/production-orders/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
      toast({ title: "Production order status updated!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    },
  });

  const handleTestResultApproval = (testId: string, status: 'Pass' | 'Fail') => {
    updateTestResultMutation.mutate({ 
      id: testId, 
      data: { 
        status,
        testedAt: new Date(),
        reviewedBy: 'QA Manager'
      } 
    });
  };

  const handleOrderQualityApproval = (orderId: string) => {
    updateOrderStatusMutation.mutate({ 
      id: orderId, 
      status: 'Quality Approved' 
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="qa-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="qa-title">
            Quality Assurance
          </h1>
          <p className="text-muted-foreground">
            Comprehensive quality control management with testing, approval workflows, and compliance tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="qa-search"
            />
          </div>
        </div>
      </div>

      {/* QA Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Completion Rate</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="order-completion-rate">
              {qaStats.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {qaStats.completedOrders} of {qaStats.totalOrders} orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Pass Rate</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="test-pass-rate">
              {qaStats.testPassRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {qaStats.passedTests} of {qaStats.totalTests} tests passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Approval Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="material-approval-rate">
              {qaStats.materialApprovalRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {qaStats.approvedMaterials} of {qaStats.totalMaterials} materials approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Test Standards</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-test-configs">
              {qaStats.activeTestConfigs}
            </div>
            <p className="text-xs text-muted-foreground">
              of {qaStats.totalTestConfigs} total configurations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">QA Overview</TabsTrigger>
          <TabsTrigger value="production-orders" data-testid="tab-production-orders">Production QA</TabsTrigger>
          <TabsTrigger value="test-results" data-testid="tab-test-results">Test Results</TabsTrigger>
          <TabsTrigger value="materials" data-testid="tab-materials">Material QA</TabsTrigger>
          <TabsTrigger value="test-configs" data-testid="tab-test-configs">Test Standards</TabsTrigger>
        </TabsList>

        {/* QA Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Quality Trends</span>
                </CardTitle>
                <CardDescription>Recent quality performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Test Pass Rate Trend</span>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-green-600">+2.3%</div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Material Approval Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-green-600">+1.8%</div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order Completion Time</span>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-green-600">-0.5 days</div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span>Compliance Status</span>
                </CardTitle>
                <CardDescription>Regulatory compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">FDA Compliance</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ISO 9001:2015</span>
                  <Badge variant="default">Certified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">GMP Guidelines</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Audit</span>
                  <span className="text-sm font-medium">Dec 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quality Activities</CardTitle>
              <CardDescription>Latest quality control activities and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.slice(0, 5).map((result: TestResult) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.testConfigId}</p>
                        <p className="text-sm text-muted-foreground">
                          Material ID: {result.materialId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(result.status)}>{result.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.testedAt ? formatDate(result.testedAt) : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Orders QA Tab */}
        <TabsContent value="production-orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedOrder || ""} onValueChange={setSelectedOrder}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by order status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Orders</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Quality Check">Quality Check</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredOrders.map((order: ProductionOrder) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span>{order.orderNumber}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                      {order.status === 'Quality Check' && (
                        <Button
                          size="sm"
                          onClick={() => handleOrderQualityApproval(order.id)}
                          data-testid={`button-approve-order-${order.id}`}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {order.skuProduct} | Customer: {order.customerName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p>{order.quantity.toLocaleString()} units</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p>{formatDate(order.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <Badge variant="outline">{order.priority}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="test-results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Management</CardTitle>
              <CardDescription>
                Review and approve test results for quality control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tested At</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((result: TestResult) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.testConfigId}</TableCell>
                      <TableCell>{result.materialId}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.testedAt ? formatDate(result.testedAt) : 'Pending'}
                      </TableCell>
                      <TableCell>{result.reviewedBy || 'Unassigned'}</TableCell>
                      <TableCell>
                        {result.status === 'Pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => handleTestResultApproval(result.id, 'Pass')}
                              data-testid={`button-pass-test-${result.id}`}
                            >
                              Pass
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTestResultApproval(result.id, 'Fail')}
                              data-testid={`button-fail-test-${result.id}`}
                            >
                              Fail
                            </Button>
                          </div>
                        )}
                        {result.status !== 'Pending' && (
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials QA Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="grid gap-4">
            {materials.map((material: Material) => {
              const metrics = getQualityMetrics(material.id);
              return (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(material.status)}
                        <span>{material.name}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(material.status)}>
                          {material.status}
                        </Badge>
                        <Badge variant="outline">{metrics.status}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {material.category} | Code: {material.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quality Score</p>
                        <p className="text-lg font-bold">{material.qualityScore || 0}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Test Pass Rate</p>
                        <p className="text-lg font-bold">{metrics.passRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tests Completed</p>
                        <p>{metrics.totalTests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock Level</p>
                        <p>{material.stock} units</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Test Configurations Tab */}
        <TabsContent value="test-configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Standards & Configurations</CardTitle>
              <CardDescription>
                Quality control test standards and configuration management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testConfigs.map((config: TestConfig) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>{config.code}</TableCell>
                      <TableCell>{config.testMethod}</TableCell>
                      <TableCell>{config.frequency}</TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}