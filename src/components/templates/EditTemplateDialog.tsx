"use client";

import TemplateFormDrawer from "./TemplateFormDrawer";

export interface EditTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  templateId: string;
  onSuccess?: () => void;
}

export default function EditTemplateDialog(props: EditTemplateDialogProps) {
  return <TemplateFormDrawer {...props} />;
}