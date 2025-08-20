import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type TestResult, type TestConfig, type Material } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Filter, Download, Search, FlaskConical, Beaker, TestTube } from "lucide-react";
import { format } from "date-fns";

interface QCRecord {
  id: string;
  materialName: string;
  materialCode: string;
  materialType: string;
  materialCategory: string;
  batchNumber: string;
  jobId: string;
  testName: string;
  testCode: string;
  testCategory: string;
  testMethod: string;
  expectedRange: string;
  resultValue: string;
  status: string;
  testedBy: string;
  testedDate: Date;
  remarks: string;
  retestCount: number;
}

export function QCRecordsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [materialTypeFilter, setMaterialTypeFilter] = useState("all");
  const [testCategoryFilter, setTestCategoryFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    materialName: true,
    materialCode: true,
    materialType: true,
    batchNumber: true,
    jobId: true,
    testName: true,
    testCategory: true,
    resultValue: true,
    status: true,
    testedBy: true,
    testedDate: true,
    remarks: false,
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery({
    queryKey: ["/api/test-results"],
  });

  const { data: testConfigs = [] } = useQuery({
    queryKey: ["/api/test-configs"],
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["/api/materials"],
  });

  // Transform data into QC Records format
  const qcRecords: QCRecord[] = useMemo(() => {
    const records: QCRecord[] = [];
    
    (testResults as TestResult[]).forEach(result => {
      if (result.testedDate) { // Only include completed tests
        const material = (materials as Material[]).find(m => m.id === result.materialId);
        const testConfig = (testConfigs as TestConfig[]).find(tc => tc.id === result.testConfigId);
        
        if (material && testConfig) {
          records.push({
            id: result.id,
            materialName: material.name,
            materialCode: material.code,
            materialType: material.type,
            materialCategory: material.category,
            batchNumber: material.batchNumber || 'N/A',
            jobId: material.jobId || 'N/A',
            testName: testConfig.name,
            testCode: testConfig.code,
            testCategory: testConfig.category,
            testMethod: testConfig.testMethod || 'N/A',
            expectedRange: testConfig.expectedRange || 'N/A',
            resultValue: result.resultValue || 'N/A',
            status: result.status,
            testedBy: result.testedBy || 'N/A',
            testedDate: new Date(result.testedDate),
            remarks: result.remarks || '',
            retestCount: result.retestCount || 0,
          });
        }
      }
    });
    
    return records.sort((a, b) => new Date(b.testedDate).getTime() - new Date(a.testedDate).getTime());
  }, [testResults, testConfigs, materials]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    let filtered = qcRecords;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.testedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Material type filter
    if (materialTypeFilter !== "all") {
      filtered = filtered.filter(record => record.materialType === materialTypeFilter);
    }

    // Test category filter
    if (testCategoryFilter !== "all") {
      filtered = filtered.filter(record => record.testCategory === testCategoryFilter);
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRangeFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "quarter":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
      }
      
      filtered = filtered.filter(record => record.testedDate >= startDate);
    }

    return filtered;
  }, [qcRecords, searchTerm, statusFilter, materialTypeFilter, testCategoryFilter, dateRangeFilter]);

  const getStatusBadge = (status: string) => {
    const config = {
      passed: { className: "bg-green-100 text-green-800", label: "Passed" },
      failed: { className: "bg-red-100 text-red-800", label: "Failed" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      "in-progress": { className: "bg-purple-100 text-purple-800", label: "In Progress" },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return (
      <Badge className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Chemical": return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case "Physical": return <Beaker className="w-4 h-4 text-green-600" />;
      case "Microbiological": return <TestTube className="w-4 h-4 text-purple-600" />;
      default: return <TestTube className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      // Headers
      Object.keys(visibleColumns).filter(key => visibleColumns[key as keyof typeof visibleColumns]).join(','),
      // Data rows
      ...filteredRecords.map(record => 
        Object.entries(visibleColumns)
          .filter(([_, visible]) => visible)
          .map(([key, _]) => {
            const value = key === 'testedDate' 
              ? format(record[key as keyof QCRecord] as Date, 'yyyy-MM-dd HH:mm')
              : record[key as keyof QCRecord];
            return `"${value}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qc-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (testResultsLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading QC records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200" data-testid="qc-records-table">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">QC Records</h3>
            <p className="text-sm text-gray-500 mt-1">
              Historical quality control test results ({filteredRecords.length} records)
            </p>
          </div>
          <Button 
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search materials, tests, analysts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-records"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="select-status-filter">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select value={materialTypeFilter} onValueChange={setMaterialTypeFilter}>
            <SelectTrigger data-testid="select-material-type-filter">
              <SelectValue placeholder="Filter by Material Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Material Types</SelectItem>
              <SelectItem value="raw-materials">Raw Materials</SelectItem>
              <SelectItem value="packaging-material">Packaging Material</SelectItem>
              <SelectItem value="final-products">Final Products</SelectItem>
              <SelectItem value="artwork">Artwork</SelectItem>
            </SelectContent>
          </Select>
          <Select value={testCategoryFilter} onValueChange={setTestCategoryFilter}>
            <SelectTrigger data-testid="select-test-category-filter">
              <SelectValue placeholder="Filter by Test Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Test Categories</SelectItem>
              <SelectItem value="Chemical">Chemical</SelectItem>
              <SelectItem value="Physical">Physical</SelectItem>
              <SelectItem value="Microbiological">Microbiological</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger data-testid="select-date-range-filter">
                <CalendarDays className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-column-filter">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.entries(visibleColumns).map(([key, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visible}
                    onCheckedChange={(checked) => 
                      setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                    }
                    data-testid={`checkbox-column-${key}`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {visibleColumns.materialName && <TableHead className="font-medium text-gray-700">Material</TableHead>}
              {visibleColumns.materialCode && <TableHead className="font-medium text-gray-700">Code</TableHead>}
              {visibleColumns.materialType && <TableHead className="font-medium text-gray-700">Type</TableHead>}
              {visibleColumns.batchNumber && <TableHead className="font-medium text-gray-700">Batch</TableHead>}
              {visibleColumns.jobId && <TableHead className="font-medium text-gray-700">Job ID</TableHead>}
              {visibleColumns.testName && <TableHead className="font-medium text-gray-700">Test</TableHead>}
              {visibleColumns.testCategory && <TableHead className="font-medium text-gray-700">Category</TableHead>}
              {visibleColumns.resultValue && <TableHead className="font-medium text-gray-700">Result</TableHead>}
              {visibleColumns.status && <TableHead className="font-medium text-gray-700">Status</TableHead>}
              {visibleColumns.testedBy && <TableHead className="font-medium text-gray-700">Tested By</TableHead>}
              {visibleColumns.testedDate && <TableHead className="font-medium text-gray-700">Date & Time</TableHead>}
              {visibleColumns.remarks && <TableHead className="font-medium text-gray-700">Remarks</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={Object.values(visibleColumns).filter(Boolean).length} 
                  className="py-12 text-center text-gray-500"
                >
                  {qcRecords.length === 0 
                    ? "No QC records found. Complete some tests to see records here."
                    : "No records match the current filters."
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="hover:bg-gray-50"
                  data-testid={`row-qc-record-${record.id}`}
                >
                  {visibleColumns.materialName && (
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{record.materialName}</p>
                        <p className="text-xs text-gray-500">{record.materialCategory}</p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.materialCode && (
                    <TableCell className="font-mono text-sm">{record.materialCode}</TableCell>
                  )}
                  {visibleColumns.materialType && (
                    <TableCell>
                      <Badge variant="outline">
                        {record.materialType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.batchNumber && (
                    <TableCell className="font-mono text-sm">{record.batchNumber}</TableCell>
                  )}
                  {visibleColumns.jobId && (
                    <TableCell className="font-mono text-sm">
                      {record.jobId !== 'N/A' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">{record.jobId}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.testName && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(record.testCategory)}
                        <div>
                          <p className="font-medium text-sm">{record.testName}</p>
                          <p className="text-xs text-gray-500">{record.testCode}</p>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.testCategory && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.testCategory}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.resultValue && (
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{record.resultValue}</p>
                        {record.expectedRange !== 'N/A' && (
                          <p className="text-xs text-gray-500">Expected: {record.expectedRange}</p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  )}
                  {visibleColumns.testedBy && (
                    <TableCell className="text-sm">{record.testedBy}</TableCell>
                  )}
                  {visibleColumns.testedDate && (
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{format(record.testedDate, 'MMM dd, yyyy')}</p>
                        <p className="text-gray-500">{format(record.testedDate, 'HH:mm')}</p>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.remarks && (
                    <TableCell className="text-sm max-w-xs truncate">{record.remarks || '-'}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}