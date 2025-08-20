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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, FlaskConical, Beaker, TestTube, ChevronDown, ChevronRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import type { TestConfig, InsertTestConfig, Material, TestResult } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export default function QCSetupEnhancedPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("materials");
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [newTestConfig, setNewTestConfig] = useState<Partial<InsertTestConfig>>({
    name: "",
    code: "",
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

  // Materials Data
  const { data: allMaterials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["/api/materials"],
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery({
    queryKey: ["/api/test-results"],
  });

  const handleAddTestConfig = async () => {
    if (!newTestConfig.name || !newTestConfig.code || !newTestConfig.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Code, Category)",
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
        code: "",
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

  const handleAssignTest = async (materialId: string, testConfigId: string, assign: boolean) => {
    try {
      if (assign) {
        // Create new test result assignment
        const response = await fetch("/api/test-results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            materialId,
            testConfigId,
            status: "pending",
          }),
        });
        
        if (!response.ok) throw new Error("Failed to assign test");
      } else {
        // Remove test assignment - we'd need an endpoint to delete test results
        // For now, just show a message
        toast({
          title: "Note",
          description: "Test unassignment not implemented yet",
          variant: "default",
        });
        return;
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
      
      toast({
        title: "Success",
        description: assign ? "Test assigned successfully" : "Test unassigned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test assignment",
        variant: "destructive",
      });
    }
  };

  // Group materials by type
  const materialsByType = materialTypes.reduce((acc, type) => {
    acc[type.value] = (allMaterials as Material[]).filter((material: Material) => material.type === type.value);
    return acc;
  }, {} as Record<string, Material[]>);

  const toggleMaterialExpansion = (materialId: string) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const isTestAssigned = (materialId: string, testConfigId: string) => {
    return (testResults as TestResult[]).some((result: TestResult) => 
      result.materialId === materialId && result.testConfigId === testConfigId
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">QC Setup & Instructions</h2>
              <p className="text-gray-600 text-sm mt-1">Manage test configurations and assign tests to materials</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="materials" className="flex items-center space-x-2">
            <FlaskConical className="w-4 h-4" />
            <span>Materials & Test Assignment</span>
          </TabsTrigger>
          <TabsTrigger value="test-configs" className="flex items-center space-x-2">
            <Beaker className="w-4 h-4" />
            <span>Test Configurations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-6">
          <div className="space-y-6">
            <Tabs defaultValue="raw-materials" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {materialTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="text-sm">
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {materialTypes.map((type) => (
                <TabsContent key={type.value} value={type.value} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FlaskConical className="w-5 h-5" />
                        <span>{type.label}</span>
                      </CardTitle>
                      <CardDescription>
                        Manage and assign tests to {type.label.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {materialsLoading ? (
                        <div className="text-center py-8">Loading materials...</div>
                      ) : materialsByType[type.value]?.length > 0 ? (
                        <div className="space-y-2">
                          {materialsByType[type.value].map((material: Material) => {
                            const isExpanded = expandedMaterials.has(material.id);
                            const assignedTests = (testResults as TestResult[]).filter((result: TestResult) => result.materialId === material.id);
                            
                            return (
                              <Collapsible key={material.id} open={isExpanded} onOpenChange={() => toggleMaterialExpansion(material.id)}>
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center">
                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                      </div>
                                      <div>
                                        <div className="font-medium">{material.name}</div>
                                        <div className="text-sm text-gray-500">{material.code} • {material.category}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <Badge className={
                                        material.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        material.status === 'under-testing' ? 'bg-purple-100 text-purple-800' :
                                        material.status === 'ready-for-qc' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                      }>
                                        {material.status === 'ready-for-qc' ? 'Ready for QC' : 
                                         material.status === 'under-testing' ? 'Under Testing' :
                                         material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                                      </Badge>
                                      <Badge variant="outline">
                                        {assignedTests.length} test{assignedTests.length !== 1 ? 's' : ''}
                                      </Badge>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="px-4 pb-4">
                                    <div className="mt-4 border-t pt-4">
                                      <h4 className="font-semibold mb-3">Assign Tests</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(testConfigs as TestConfig[]).map((testConfig: TestConfig) => {
                                          const isAssigned = isTestAssigned(material.id, testConfig.id);
                                          
                                          return (
                                            <div key={testConfig.id} className="flex items-center justify-between p-3 border rounded-lg">
                                              <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                  {testConfig.category === "Chemical" && <FlaskConical className="w-4 h-4 text-blue-600" />}
                                                  {testConfig.category === "Physical" && <Beaker className="w-4 h-4 text-green-600" />}
                                                  {testConfig.category === "Microbiological" && <TestTube className="w-4 h-4 text-purple-600" />}
                                                </div>
                                                <div>
                                                  <div className="font-medium text-sm">{testConfig.name}</div>
                                                  <div className="text-xs text-gray-500">{testConfig.code}</div>
                                                </div>
                                              </div>
                                              <Checkbox
                                                checked={isAssigned}
                                                onCheckedChange={(checked) => handleAssignTest(material.id, testConfig.id, checked as boolean)}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No {type.label.toLowerCase()} found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
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
                        <Label htmlFor="testCode">Test Code *</Label>
                        <Input
                          id="testCode"
                          value={newTestConfig.code}
                          onChange={(e) => setNewTestConfig({...newTestConfig, code: e.target.value})}
                          placeholder="e.g., TC-HPLC-001"
                          data-testid="input-test-code"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-test-config-name-${config.id}`}>
                              {config.name}
                            </CardTitle>
                            <div className="text-sm text-gray-500 font-mono">{config.code}</div>
                          </div>
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
        </main>
      </div>
    </div>
  );
}