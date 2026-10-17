"use client";

import TaskDefinitionFormDrawer from "./TaskDefinitionFormDrawer";

export interface EditTaskDefinitionDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  definitionId: string;
  onSuccess?: () => void;
}

export default function EditTaskDefinitionDialog(
  props: EditTaskDefinitionDialogProps
) {
  return <TaskDefinitionFormDrawer {...props} />;
}