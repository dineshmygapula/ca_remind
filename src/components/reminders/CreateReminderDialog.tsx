"use client";

import ReminderFormDrawer from "./ReminderFormDrawer";

export interface CreateReminderDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  organizationId: string;
  onSuccess?: () => void;
  initialDate?: string;
  preSelectedTaskId?: string;
}

export default function CreateReminderDialog({
  open,
  onClose,
  businessId,
  organizationId,
  onSuccess,
}: CreateReminderDialogProps) {
  return (
    <ReminderFormDrawer
      open={open}
      onClose={onClose}
      businessId={businessId}
      organizationId={organizationId}
      onSuccess={onSuccess || (() => {})}
    />
  );
}
