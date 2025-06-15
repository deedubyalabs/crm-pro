"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaxRateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTaxRate: (taxRate: number) => void;
  initialTaxRate: number;
}

export function TaxRateDialog({
  isOpen,
  onClose,
  onApplyTaxRate,
  initialTaxRate,
}: TaxRateDialogProps) {
  const [taxRate, setTaxRate] = useState(initialTaxRate);

  useEffect(() => {
    setTaxRate(initialTaxRate);
  }, [initialTaxRate]);

  const handleApply = () => {
    onApplyTaxRate(taxRate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Tax Rate</DialogTitle>
          <DialogDescription>
            Enter the tax rate percentage to be applied to the estimate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taxRate" className="text-right">
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              className="col-span-3"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Tax Rate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
