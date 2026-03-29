import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useCreatePromptWithCache, useUpdatePromptWithCache } from "@/hooks/use-prompts";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@/lib/local-api";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Prompt text is required"),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const PRESET_CATEGORIES = ["Writing", "Coding", "Marketing", "Study", "Creative", "Email"];

interface PromptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptToEdit?: Prompt | null;
}

export function PromptFormModal({ isOpen, onClose, promptToEdit }: PromptFormModalProps) {
  const { toast } = useToast();
  const createMutation = useCreatePromptWithCache();
  const updateMutation = useUpdatePromptWithCache();

  const isEditing = !!promptToEdit;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      text: "",
      category: "",
      note: "",
    },
  });

  const categoryValue = watch("category");

  React.useEffect(() => {
    if (isOpen) {
      if (promptToEdit) {
        reset({
          title: promptToEdit.title,
          text: promptToEdit.text,
          category: promptToEdit.category,
          note: promptToEdit.note || "",
        });
      } else {
        reset({ title: "", text: "", category: "", note: "" });
      }
    }
  }, [isOpen, promptToEdit, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: promptToEdit.id,
          data: {
            title: data.title,
            text: data.text,
            category: data.category,
            note: data.note || null,
          },
        });
        toast({ title: "Prompt updated successfully", className: "bg-card border-border" });
      } else {
        await createMutation.mutateAsync({
          data: {
            title: data.title,
            text: data.text,
            category: data.category,
            note: data.note || null,
          },
        });
        toast({ title: "Prompt created successfully", className: "bg-card border-border" });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error saving prompt",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Prompt" : "Create New Prompt"}
      description={isEditing ? "Modify your saved prompt." : "Add a new prompt to your vault."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <Input placeholder="e.g. Code Review Assistant" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Input placeholder="Enter or select a category..." {...register("category")} />
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={categoryValue === cat ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 hover:text-primary hover:border-primary/50"
                onClick={() => setValue("category", cat, { shouldValidate: true })}
              >
                {cat}
              </Badge>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Prompt Text</label>
          <Textarea
            placeholder="Write your prompt here..."
            className="min-h-[160px]"
            {...register("text")}
          />
          {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Note (Optional)</label>
          <Input placeholder="Any extra context or variables to remember..." {...register("note")} />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
            {isSubmitting || createMutation.isPending || updateMutation.isPending 
              ? "Saving..." 
              : isEditing ? "Save Changes" : "Create Prompt"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
