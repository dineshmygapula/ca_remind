"use client";

import ReminderFormDrawer from "./ReminderFormDrawer";

export interface EditReminderDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  organizationId: string;
  reminderId: string;
  onSuccess?: () => void;
}

export default function EditReminderDialog({
  open,
  onClose,
  businessId,
  organizationId,
  reminderId,
  onSuccess,
}: EditReminderDialogProps) {
  return (
    <ReminderFormDrawer
      open={open}
      onClose={onClose}
      businessId={businessId}
      organizationId={organizationId}
      reminderId={reminderId}
      onSuccess={onSuccess || (() => {})}
    />
  );
}