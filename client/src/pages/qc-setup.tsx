import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, FlaskConical, Beaker, TestTube, FileText, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { TestConfig, InsertTestConfig, Material, TestResult, TestInstruction } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const materialTypes = [
  { value: "raw-materials", label: "Raw Materials" },
  { value: "packaging-material", label: "Packaging Material" },
  { value: "final-products", label: "Final Products" },
  { value: "artwork", label: "Artwork" },
];

const testMethods = [
  "HPLC", "UV-Vis Spectrophotometry", "GC", "Titration", "Gravimetric Analysis",
  "Dissolution Test", "Disintegration Test", "pH Test", "Moisture Content",
  "Loss on Drying", "Residue on Ignition", "Heavy Metals Test", "Microbial Limits",
  "Sterility Test", "Endotoxin Test", "Particulate Matter", "Related Substances",
  "Assay", "Content Uniformity", "Weight Variation"
];

const testCategories = ["Chemical", "Physical", "Microbiological", "Stability"];

export default function QCSetupPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("instructions");
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [newTestConfig, setNewTestConfig] = useState<Partial<InsertTestConfig>>({
    name: "",
    category: "",
    testMethod: "",
    expectedRange: "",
    units: "",
    acceptanceCriteria: "",
    isMandatory: true,
  });

  // Test Configurations Data
  const { data: testConfigs = [], isLoading: testConfigsLoading } = useQuery({
    queryKey: ["/api/test-configs"],
  });

  // Instructions & Checklists Data
  const { data: allMaterials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery({
    queryKey: ["/api/test-results"],
  });

  const { data: testInstructions = [], isLoading: testInstructionsLoading } = useQuery({
    queryKey: ["/api/test-instructions"],
  });

  const handleAddTestConfig = async () => {
    if (!newTestConfig.name || !newTestConfig.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/test-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTestConfig),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create test configuration");
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/test-configs"] });
      
      setShowAddTestDialog(false);
      setNewTestConfig({
        name: "",
        category: "",
        testMethod: "",
        expectedRange: "",
        units: "",
        acceptanceCriteria: "",
        isMandatory: true,
      });
      
      toast({
        title: "Success",
        description: "Test configuration added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test configuration",
        variant: "destructive",
      });
    }
  };

  // Group materials by type for instructions
  const materialsByType = materialTypes.reduce((acc, type) => {
    acc[type.value] = (allMaterials as Material[]).filter((material: Material) => material.type === type.value);
    return acc;
  }, {} as Record<string, Material[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QC Setup & Instructions</h1>
          <p className="text-muted-foreground">
            Manage test configurations and quality control instructions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instructions" className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instructions & Checklists</span>
          </TabsTrigger>
          <TabsTrigger value="test-configs" className="flex items-center space-x-2">
            <FlaskConical className="w-4 h-4" />
            <span>Test Configurations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Instructions & Checklists</h2>
            </div>

            <Tabs defaultValue="raw-materials" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {materialTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="instructions-checklists" className="text-xs">
                  Instructions & Checklists
                </TabsTrigger>
              </TabsList>

              {materialTypes.map((type) => (
                <TabsContent key={type.value} value={type.value} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>{type.label}</span>
                      </CardTitle>
                      <CardDescription>
                        Quality control instructions and test assignments for {type.label.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {materialsLoading ? (
                        <div className="text-center py-8">Loading materials...</div>
                      ) : materialsByType[type.value]?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Material Details</TableHead>
                              <TableHead>Type & Code</TableHead>
                              <TableHead>Batch & Supplier</TableHead>
                              <TableHead>Quality Status</TableHead>
                              <TableHead>Stock & Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {materialsByType[type.value].map((material: Material) => {
                              const materialTestResults = (testResults as TestResult[]).filter((result: TestResult) => result.materialId === material.id);
                              const passedTests = materialTestResults.filter((result: TestResult) => result.status === 'passed').length;
                              const totalTests = materialTestResults.length;

                              return (
                                <TableRow key={material.id}>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium" data-testid={`text-material-name-${material.id}`}>
                                        {material.name}
                                      </div>
                                      {material.description && (
                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                          {material.description}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium">{material.category}</div>
                                      <div className="text-sm text-gray-500">{material.code}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {material.batchNumber && (
                                        <div className="text-sm">
                                          <span className="font-medium">Batch:</span> {material.batchNumber}
                                        </div>
                                      )}
                                      {material.supplierName && (
                                        <div className="text-sm">
                                          <span className="font-medium">Supplier:</span> {material.supplierName}
                                        </div>
                                      )}
                                      {!material.batchNumber && !material.supplierName && (
                                        <span className="text-sm text-gray-500">N/A</span>
                                      )}
                                    </div>
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
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        <span className="font-medium">Stock:</span> {material.stock} units
                                      </div>
                                      {material.score !== null && material.score !== undefined ? (
                                        <div className="text-sm">
                                          <span className="font-medium">Score:</span> {material.score}%
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500">Score: N/A</div>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No {type.label.toLowerCase()} found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}

              <TabsContent value="instructions-checklists" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions & Checklists</CardTitle>
                    <CardDescription>
                      Detailed testing instructions and quality control checklists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testInstructionsLoading ? (
                      <div className="text-center py-8">Loading instructions...</div>
                    ) : (testInstructions as TestInstruction[]).length > 0 ? (
                      <div className="space-y-4">
                        {(testInstructions as TestInstruction[]).map((instruction: TestInstruction) => (
                          <Card key={instruction.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Test Instructions</CardTitle>
                                <Badge variant="outline">
                                  {materialTypes.find(type => type.value === instruction.materialType)?.label}
                                </Badge>
                              </div>
                              <CardDescription>Quality control testing procedures</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Test Instructions:</h4>
                                  <p className="text-sm text-gray-600">{instruction.instructions}</p>
                                </div>
                                {instruction.samplingProcedure && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Sampling Procedure:</h4>
                                    <p className="text-sm text-gray-600">{instruction.samplingProcedure}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No instructions available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="test-configs" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Configurations</h2>
              <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2" data-testid="button-add-test-config">
                    <Plus className="w-4 h-4" />
                    <span>Add Test Configuration</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Test Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="testName">Test Name *</Label>
                        <Input
                          id="testName"
                          value={newTestConfig.name}
                          onChange={(e) => setNewTestConfig({...newTestConfig, name: e.target.value})}
                          placeholder="e.g., Assay by HPLC"
                          data-testid="input-test-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newTestConfig.category}
                          onValueChange={(value) => setNewTestConfig({...newTestConfig, category: value})}
                        >
                          <SelectTrigger data-testid="select-test-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {testCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Test Method</Label>
                      <Select
                        value={newTestConfig.testMethod || ""}
                        onValueChange={(value) => setNewTestConfig({...newTestConfig, testMethod: value})}
                      >
                        <SelectTrigger data-testid="select-test-method">
                          <SelectValue placeholder="Select test method" />
                        </SelectTrigger>
                        <SelectContent>
                          {testMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
                      <Textarea
                        id="acceptanceCriteria"
                        value={newTestConfig.acceptanceCriteria || ""}
                        onChange={(e) => setNewTestConfig({...newTestConfig, acceptanceCriteria: e.target.value})}
                        placeholder="Define the criteria for test acceptance"
                        data-testid="textarea-acceptance-criteria"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expectedRange">Expected Range</Label>
                        <Input
                          id="expectedRange"
                          value={newTestConfig.expectedRange || ""}
                          onChange={(e) => setNewTestConfig({...newTestConfig, expectedRange: e.target.value})}
                          placeholder="e.g., 95.0 - 105.0"
                          data-testid="input-test-range"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="units">Units</Label>
                        <Input
                          id="units"
                          value={newTestConfig.units || ""}
                          onChange={(e) => setNewTestConfig({...newTestConfig, units: e.target.value})}
                          placeholder="e.g., %, mg/mL, CFU/g"
                          data-testid="input-test-units"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isMandatory"
                        checked={newTestConfig.isMandatory ?? true}
                        onCheckedChange={(checked) => setNewTestConfig({...newTestConfig, isMandatory: checked})}
                        data-testid="switch-test-mandatory"
                      />
                      <Label htmlFor="isMandatory">Mandatory Test</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddTestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTestConfig} data-testid="button-save-test-config">
                      Add Test Configuration
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {testConfigsLoading ? (
              <div className="text-center py-8">Loading test configurations...</div>
            ) : (testConfigs as TestConfig[]).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(testConfigs as TestConfig[]).map((config: TestConfig) => (
                  <Card key={config.id} className="hover:shadow-md transition-shadow" data-testid={`card-test-config-${config.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {config.category === "Chemical" && <FlaskConical className="w-5 h-5 text-blue-600" />}
                          {config.category === "Physical" && <Beaker className="w-5 h-5 text-green-600" />}
                          {config.category === "Microbiological" && <TestTube className="w-5 h-5 text-purple-600" />}
                          <CardTitle className="text-lg" data-testid={`text-test-config-name-${config.id}`}>
                            {config.name}
                          </CardTitle>
                        </div>
                        <Badge variant={config.isMandatory ? "destructive" : "secondary"}>
                          {config.isMandatory ? "Mandatory" : "Optional"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{config.category}</Badge>
                        {config.testMethod && <Badge variant="outline">{config.testMethod}</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {config.expectedRange && (
                            <div>
                              <span className="font-medium">Range:</span>
                              <div className="text-gray-600">{config.expectedRange} {config.units}</div>
                            </div>
                          )}
                          {config.acceptanceCriteria && (
                            <div className="col-span-2">
                              <span className="font-medium">Acceptance:</span>
                              <div className="text-gray-600 text-xs">{config.acceptanceCriteria}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No test configurations found</p>
                  <Button onClick={() => setShowAddTestDialog(true)} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Test Configuration</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}