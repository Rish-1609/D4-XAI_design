import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Material, TestResult, TestConfig } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  BarChart3,
} from "lucide-react";

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

interface QualityStats {
  approved: number;
  pending: number;
  failed: number;
  underTesting: number;
  averageScore: number;
}

export function QualityAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch quality stats
  const { data: stats, isLoading: statsLoading } = useQuery<QualityStats>({
    queryKey: ["/api/quality-stats"],
    queryFn: () => fetch("/api/quality-stats").then(res => res.json()),
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Fetch test results for detailed analytics
  const { data: testResults = [], isLoading: testResultsLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
    queryFn: () => fetch("/api/test-results").then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch test configs for test performance analysis
  const { data: testConfigs = [] } = useQuery<TestConfig[]>({
    queryKey: ["/api/test-configs"],
    queryFn: () => fetch("/api/test-configs").then(res => res.json()),
  });

  // Fetch materials for material type breakdown
  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    queryFn: () => fetch("/api/materials").then(res => res.json()),
    refetchInterval: 30000,
  });

  if (statsLoading || testResultsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Process data for charts
  const totalMaterials = (stats?.approved || 0) + (stats?.pending || 0) + (stats?.failed || 0) + (stats?.underTesting || 0);
  
  // Status distribution for pie chart
  const statusData = [
    { name: 'Approved', value: stats?.approved || 0, color: '#10B981' },
    { name: 'Pending QC', value: stats?.pending || 0, color: '#F59E0B' },
    { name: 'Failed', value: stats?.failed || 0, color: '#EF4444' },
    { name: 'Under Testing', value: stats?.underTesting || 0, color: '#8B5CF6' },
  ];

  // Test performance by category
  const testPerformanceData = testConfigs.map(config => {
    const configResults = testResults.filter(result => result.testConfigId === config.id);
    const passed = configResults.filter(result => result.status === 'passed').length;
    const failed = configResults.filter(result => result.status === 'failed').length;
    const total = configResults.length;
    
    return {
      name: config.name,
      category: config.category,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      passed,
      failed,
      total
    };
  });

  // Material type distribution
  const materialTypeData = [
    'raw-materials',
    'packaging-material',
    'in-process',
    'final-products',
    'artwork'
  ].map(type => {
    const typeMaterials = materials.filter(m => m.type === type);
    return {
      name: type.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()),
      approved: typeMaterials.filter(m => m.status === 'qc-passed' || m.status === 'approved').length,
      pending: typeMaterials.filter(m => m.status === 'ready-for-qc').length,
      failed: typeMaterials.filter(m => m.status === 'qc-failed' || m.status === 'failed').length,
      testing: typeMaterials.filter(m => m.status === 'in-progress' || m.status === 'under-testing').length,
    };
  });

  // Recent test trends (mock trend data based on recent results)
  const recentTrends = testResults
    .slice(0, 10)
    .reverse()
    .map((result, index) => ({
      day: `Day ${index + 1}`,
      qualityScore: result.status === 'passed' ? 95 + Math.random() * 5 : 
                   result.status === 'failed' ? 60 + Math.random() * 20 : 80,
      passRate: result.status === 'passed' ? 95 + Math.random() * 5 : 75 + Math.random() * 15,
    }));

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200" data-testid="card-approved-materials">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                <p className="text-xs text-green-600">
                  {totalMaterials > 0 ? Math.round(((stats?.approved || 0) / totalMaterials) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={totalMaterials > 0 ? ((stats?.approved || 0) / totalMaterials) * 100 : 0} 
                className="h-2 bg-green-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200" data-testid="card-pending-materials">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Ready for QC</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                <p className="text-xs text-yellow-600">
                  {totalMaterials > 0 ? Math.round(((stats?.pending || 0) / totalMaterials) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={totalMaterials > 0 ? ((stats?.pending || 0) / totalMaterials) * 100 : 0} 
                className="h-2 bg-yellow-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200" data-testid="card-failed-materials">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Failed/Action Required</p>
                <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
                <p className="text-xs text-red-600">
                  {totalMaterials > 0 ? Math.round(((stats?.failed || 0) / totalMaterials) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={totalMaterials > 0 ? ((stats?.failed || 0) / totalMaterials) * 100 : 0} 
                className="h-2 bg-red-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200" data-testid="card-under-testing-materials">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Under Testing</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.underTesting || 0}</p>
                <p className="text-xs text-purple-600">
                  {totalMaterials > 0 ? Math.round(((stats?.underTesting || 0) / totalMaterials) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={totalMaterials > 0 ? ((stats?.underTesting || 0) / totalMaterials) * 100 : 0} 
                className="h-2 bg-purple-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200" data-testid="card-quality-score">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Quality Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.averageScore ? `${stats.averageScore}%` : "0%"}
                </p>
                <div className="flex items-center text-xs mt-1">
                  {(stats?.averageScore || 0) > 85 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-600">Excellent</span>
                    </>
                  ) : (stats?.averageScore || 0) > 70 ? (
                    <>
                      <Target className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-yellow-600">Good</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-600">Needs Improvement</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <Progress 
                value={stats?.averageScore || 0} 
                className="h-2 bg-blue-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50">Overview</TabsTrigger>
          <TabsTrigger value="test-performance" className="data-[state=active]:bg-blue-50">Test Performance</TabsTrigger>
          <TabsTrigger value="material-types" className="data-[state=active]:bg-blue-50">Material Types</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-50">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Material Status Distribution
                </CardTitle>
                <CardDescription>Current distribution of materials by QC status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} materials`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Quality Metrics Summary
                </CardTitle>
                <CardDescription>Key quality performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pass Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">
                        {totalMaterials > 0 ? Math.round(((stats?.approved || 0) / totalMaterials) * 100) : 0}%
                      </span>
                      <Badge variant={
                        totalMaterials > 0 && ((stats?.approved || 0) / totalMaterials) > 0.8 ? "default" : "destructive"
                      }>
                        {totalMaterials > 0 && ((stats?.approved || 0) / totalMaterials) > 0.8 ? "Good" : "Review"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Failure Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">
                        {totalMaterials > 0 ? Math.round(((stats?.failed || 0) / totalMaterials) * 100) : 0}%
                      </span>
                      <Badge variant={
                        totalMaterials > 0 && ((stats?.failed || 0) / totalMaterials) < 0.1 ? "default" : "destructive"
                      }>
                        {totalMaterials > 0 && ((stats?.failed || 0) / totalMaterials) < 0.1 ? "Low" : "High"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Processing Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">
                        {totalMaterials > 0 ? Math.round((((stats?.approved || 0) + (stats?.failed || 0)) / totalMaterials) * 100) : 0}%
                      </span>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Workload</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{(stats?.pending || 0) + (stats?.underTesting || 0)}</span>
                      <Badge variant="secondary">Materials</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Performance by Category</CardTitle>
              <CardDescription>Pass rates for different test categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={testPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                    <Bar dataKey="passRate" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material-types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Types Status Breakdown</CardTitle>
              <CardDescription>QC status distribution across different material types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                    <Bar dataKey="testing" stackId="a" fill="#8B5CF6" name="Testing" />
                    <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                    <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>Recent quality score and pass rate trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="qualityScore" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Quality Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="passRate" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Pass Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}