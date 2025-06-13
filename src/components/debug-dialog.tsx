import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DebugDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: any;
}

export function DebugDialog({ isOpen, onClose, bookings }: DebugDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Debug Bookings Data</DialogTitle>
          <DialogDescription>
            This shows your current bookings data structure
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-auto">
          <pre className="text-xs">
            {JSON.stringify(bookings, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
