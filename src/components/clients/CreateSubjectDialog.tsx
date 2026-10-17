"use client";

import React from "react";
import CreateClientDialog from "./CreateClientDialog";

interface Props {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientId?: string | null;
}

export default function CreateSubjectDialog(props: Props) {
  return <CreateClientDialog {...props} />;
}
