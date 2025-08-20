import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, Clock, XCircle, FileText, Beaker } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Material, TestConfig, TestResult, TestInstruction } from "@shared/schema";

export default function InstructionsChecklist() {
  const { toast } = useToast();
  const [selectedMaterialType, setSelectedMaterialType] = useState("raw-materials");

  const { data: materials, isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
    queryFn: async (): Promise<Material[]> => {
      const response = await apiRequest("GET", "/api/materials");
      return response.json();
    },
  });

  const { data: testConfigs } = useQuery({
    queryKey: ["/api/test-configs"],
    queryFn: async (): Promise<TestConfig[]> => {
      const response = await apiRequest("GET", "/api/test-configs");
      return response.json();
    },
  });

  const { data: testResults } = useQuery({
    queryKey: ["/api/test-results"],
    queryFn: async (): Promise<TestResult[]> => {
      const response = await apiRequest("GET", "/api/test-results");
      return response.json();
    },
  });

  const { data: testInstructions } = useQuery({
    queryKey: ["/api/test-instructions"],
    queryFn: async (): Promise<TestInstruction[]> => {
      const response = await apiRequest("GET", "/api/test-instructions");
      return response.json();
    },
  });

  const materialTypes = [
    { value: "raw-materials", label: "Raw Materials" },
    { value: "packaging-material", label: "Packaging Material" },
    { value: "final-products", label: "Final Products" },
    { value: "artwork", label: "Artwork" },
  ];

  const statusConfig = {
    passed: { icon: CheckCircle, className: "text-green-600", bgClass: "bg-green-100", label: "Passed" },
    failed: { icon: XCircle, className: "text-red-600", bgClass: "bg-red-100", label: "Failed" },
    pending: { icon: Clock, className: "text-yellow-600", bgClass: "bg-yellow-100", label: "Pending" },
    retest: { icon: Clock, className: "text-purple-600", bgClass: "bg-purple-100", label: "Retest" },
  };

  const getFilteredMaterials = () => {
    return materials?.filter(material => material.type === selectedMaterialType) || [];
  };

  const getTestResultsForMaterial = (materialId: string) => {
    return testResults?.filter(result => result.materialId === materialId) || [];
  };

  const getTestConfigById = (testConfigId: string | null) => {
    return testConfigs?.find(config => config.id === testConfigId);
  };

  const getTestInstructionsForMaterialType = (materialType: string) => {
    return testInstructions?.filter(instruction => instruction.materialType === materialType && instruction.isActive) || [];
  };

  const getMaterialScore = (materialId: string) => {
    const materialTestResults = getTestResultsForMaterial(materialId);
    const passedTests = materialTestResults.filter(result => result.status === 'passed').length;
    const totalTests = materialTestResults.length;
    
    if (totalTests === 0) return null;
    
    return Math.round((passedTests / totalTests) * 100);
  };

  const filteredMaterials = getFilteredMaterials();
  const typeInstructions = getTestInstructionsForMaterialType(selectedMaterialType);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructions & Quality Checklist</h1>
              <p className="text-gray-600 mt-1">Material testing assignments and acceptance criteria</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedMaterialType} onValueChange={setSelectedMaterialType}>
                <SelectTrigger className="w-48" data-testid="select-material-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="materials-tests" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="materials-tests">Materials & Tests</TabsTrigger>
              <TabsTrigger value="test-instructions">Test Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="materials-tests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Beaker className="w-5 h-5 mr-2" />
                    {materialTypes.find(t => t.value === selectedMaterialType)?.label} Testing Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {materialsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredMaterials.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Material Details</TableHead>
                            <TableHead>Batch Info</TableHead>
                            <TableHead>Tests Assigned</TableHead>
                            <TableHead>Test Results</TableHead>
                            <TableHead>Acceptance Score</TableHead>
                            <TableHead>Overall Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMaterials.map((material) => {
                            const materialTestResults = getTestResultsForMaterial(material.id);
                            const acceptanceScore = getMaterialScore(material.id);

                            return (
                              <TableRow key={material.id} data-testid={`row-material-${material.id}`}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-900" data-testid={`text-material-name-${material.id}`}>
                                      {material.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {material.code}
                                    </p>
                                    <Badge variant="outline" className="mt-1">
                                      {material.category}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    {material.batchNumber && (
                                      <p className="text-sm text-gray-900">
                                        <span className="font-medium">Batch:</span> {material.batchNumber}
                                      </p>
                                    )}
                                    {material.supplierName && (
                                      <p className="text-sm text-gray-600">
                                        {material.supplierName}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {materialTestResults.length > 0 ? (
                                      materialTestResults.map((result) => {
                                        const testConfig = getTestConfigById(result.testConfigId);
                                        return (
                                          <div key={result.id} className="text-sm">
                                            <span className="font-medium">{testConfig?.name || 'Unknown Test'}</span>
                                            {testConfig?.testMethod && (
                                              <span className="text-gray-500"> ({testConfig.testMethod})</span>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span className="text-sm text-gray-500">No tests assigned</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {materialTestResults.length > 0 ? (
                                      materialTestResults.map((result) => {
                                        const statusInfo = statusConfig[result.status as keyof typeof statusConfig];
                                        const StatusIcon = statusInfo?.icon || Clock;
                                        return (
                                          <div key={result.id} className="flex items-center space-x-2 text-sm">
                                            <StatusIcon className={`w-4 h-4 ${statusInfo?.className || 'text-gray-400'}`} />
                                            <span>{result.resultValue || 'Pending'}</span>
                                            <Badge className={`${statusInfo?.bgClass} ${statusInfo?.className} text-xs`}>
                                              {statusInfo?.label}
                                            </Badge>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span className="text-sm text-gray-500">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {acceptanceScore !== null ? (
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        acceptanceScore >= 80 ? 'bg-green-100 text-green-800' :
                                        acceptanceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {acceptanceScore}%
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    material.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    material.status === 'under-testing' ? 'bg-purple-100 text-purple-800' :
                                    material.status === 'pending' || material.status === 'ready-for-qc' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {material.status === 'under-testing' ? 'Under Testing' : 
                                     material.status === 'ready-for-qc' ? 'Ready for QC' :
                                     material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {materialTypes.find(t => t.value === selectedMaterialType)?.label} Found
                      </h3>
                      <p className="text-gray-600">Add materials to see their testing assignments here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test-instructions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Test Instructions for {materialTypes.find(t => t.value === selectedMaterialType)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeInstructions.length > 0 ? (
                    <div className="space-y-6">
                      {typeInstructions.map((instruction) => {
                        const testConfig = getTestConfigById(instruction.testConfigId);
                        return (
                          <Card key={instruction.id} className="border-l-4 border-l-blue-500" data-testid={`card-instruction-${instruction.id}`}>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center justify-between">
                                <span>{testConfig?.name || 'Test Instruction'}</span>
                                <Badge variant="outline">
                                  {testConfig?.category || 'General'}
                                </Badge>
                              </CardTitle>
                              {testConfig?.testMethod && (
                                <p className="text-sm text-gray-600">Method: {testConfig.testMethod}</p>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {instruction.instructions}
                                </p>
                              </div>
                              
                              {instruction.samplingProcedure && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Sampling Procedure</h4>
                                  <p className="text-sm text-gray-700">
                                    {instruction.samplingProcedure}
                                  </p>
                                </div>
                              )}

                              {instruction.equipmentRequired && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Equipment Required</h4>
                                  <p className="text-sm text-gray-700">
                                    {instruction.equipmentRequired}
                                  </p>
                                </div>
                              )}

                              {instruction.safetyPrecautions && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Safety Precautions</h4>
                                  <p className="text-sm text-gray-700">
                                    {instruction.safetyPrecautions}
                                  </p>
                                </div>
                              )}

                              {testConfig?.acceptanceCriteria && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <h4 className="font-medium text-blue-900 mb-2">Acceptance Criteria</h4>
                                  <p className="text-sm text-blue-800">
                                    {testConfig.acceptanceCriteria}
                                  </p>
                                  {testConfig.expectedRange && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      Expected Range: {testConfig.expectedRange} {testConfig.units && `(${testConfig.units})`}
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Instructions</h3>
                      <p className="text-gray-600">
                        No test instructions available for {materialTypes.find(t => t.value === selectedMaterialType)?.label.toLowerCase()}.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}