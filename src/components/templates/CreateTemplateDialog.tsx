"use client";

import TemplateFormDrawer from "./TemplateFormDrawer";

export interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: () => void;
}

export default function CreateTemplateDialog(props: CreateTemplateDialogProps) {
  return <TemplateFormDrawer {...props} templateId={null} />;
}