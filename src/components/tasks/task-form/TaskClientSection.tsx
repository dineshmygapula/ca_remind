"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import ClientSelector from "@/components/common/ClientSelector";
import { SubjectListItem } from "@/types/subject";
import { TaskFormValues } from "@/utils/schema";

interface TaskClientSectionProps {
  clients: SubjectListItem[];
  clientsLoading: boolean;
  selectedClient: SubjectListItem | null;
  onSelectClient: (client: SubjectListItem | null) => void;
}

export default function TaskClientSection({
  clients,
  clientsLoading,
  selectedClient,
  onSelectClient,
}: TaskClientSectionProps) {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<TaskFormValues>();

  const handleClientChange = (client: SubjectListItem | null) => {
    onSelectClient(client);
    setValue("subjectId", client?.id ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <DrawerSection step={1} title="Client" required>
      <ClientSelector
        clients={clients}
        value={selectedClient}
        onChange={handleClientChange}
        loading={clientsLoading}
        error={errors.subjectId?.message}
        required
      />
    </DrawerSection>
  );
}
