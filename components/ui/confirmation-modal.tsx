"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
}: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-turf-dark border border-white/10 text-white max-w-md shadow-neon-blue/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertTriangle className="text-red-500 w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-heading">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex gap-3 justify-end">
          <NeonButton
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </NeonButton>
          <NeonButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            glow
          >
            {confirmLabel}
          </NeonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
