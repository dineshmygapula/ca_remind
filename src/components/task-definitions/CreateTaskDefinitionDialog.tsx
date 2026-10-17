"use client";

import TaskDefinitionFormDrawer from "./TaskDefinitionFormDrawer";

export interface CreateTaskDefinitionDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: () => void;
}

export default function CreateTaskDefinitionDialog(
  props: CreateTaskDefinitionDialogProps
) {
  return <TaskDefinitionFormDrawer {...props} definitionId={null} />;
}