import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { materialsApi } from "@/lib/api";
import { insertMaterialSchema, type InsertMaterial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialType: string;
}

const materialTypes = {
  "raw-materials": "Raw Material",
  "packaging-material": "Packaging Material",
  "final-products": "Final Product",
  "artwork": "Artwork",
  "instructions-checklists": "Instructions & Checklists",
};

const materialCategories = {
  "raw-materials": ["Metal", "Plastic", "Chemical", "Component", "Consumable"],
  "packaging-material": ["Box", "Bottle", "Label", "Wrapper", "Container"],
  "final-products": ["Product", "Assembly", "Kit", "Package"],
  "artwork": ["Design", "Logo", "Label Design", "Package Design"],
  "instructions-checklists": ["SOP", "Manual", "Checklist", "Protocol"],
};

export function AddMaterialDialog({ open, onOpenChange, materialType }: AddMaterialDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertMaterial>({
    resolver: zodResolver(insertMaterialSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      type: materialType,
      category: "",
      status: "pending",
      stock: 0,
      score: undefined,
      referenceNumber: "",
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: materialsApi.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material has been created successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create material.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertMaterial) => {
    setIsSubmitting(true);
    try {
      // Generate reference number if not provided
      if (!data.referenceNumber) {
        const prefix = data.type.split('-').map(word => word.charAt(0).toUpperCase()).join('');
        const timestamp = Date.now().toString().slice(-6);
        data.referenceNumber = `${prefix}-${timestamp}`;
      }
      
      await createMaterialMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-4" data-testid="dialog-add-material">
        <DialogHeader>
          <DialogTitle>
            Add {materialTypes[materialType as keyof typeof materialTypes]}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter material name" 
                        {...field}
                        data-testid="input-material-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., RM-AL-001" 
                        {...field}
                        data-testid="input-material-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-material-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materialCategories[materialType as keyof typeof materialCategories]?.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-material-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Score (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0-100" 
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        data-testid="input-material-score"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-generated if empty" 
                        {...field}
                        data-testid="input-material-reference"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter material description" 
                      rows={3}
                      {...field}
                      data-testid="input-material-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? "Creating..." : "Add Material"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
