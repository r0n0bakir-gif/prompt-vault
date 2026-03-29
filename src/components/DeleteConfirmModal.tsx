import * as React from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { useDeletePromptWithCache } from "@/hooks/use-prompts";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@/lib/local-api";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptToDelete: Prompt | null;
}

export function DeleteConfirmModal({ isOpen, onClose, promptToDelete }: DeleteConfirmModalProps) {
  const { toast } = useToast();
  const deleteMutation = useDeletePromptWithCache();

  const handleDelete = async () => {
    if (!promptToDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: promptToDelete.id });
      toast({ title: "Prompt deleted successfully" });
      onClose();
    } catch (error) {
      toast({ title: "Error deleting prompt", variant: "destructive" });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Prompt"
      description="Are you absolutely sure you want to delete this prompt?"
    >
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">
            This action cannot be undone. "{promptToDelete?.title}" will be permanently removed from your vault.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
