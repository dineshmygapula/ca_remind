"use client";

import React from "react";
import CreateClientDialog from "./CreateClientDialog";

export interface EditClientDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
  businessId: string;
  onSuccess?: () => void;
}

export default function EditClientDialog(props: EditClientDialogProps) {
  return <CreateClientDialog {...props} />;
}
