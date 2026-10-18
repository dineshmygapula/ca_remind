'use client';

import { useEffect, useMemo, useState } from 'react';
import { TaskPriority, DeliveryChannel } from '@/types/task.types';
import { TASK_TYPES, DAYS_BEFORE_OPTIONS } from '@/constants/taskConstants';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { TaskDefinitionListItem } from '@/types/taskDefinition.types';
import { SubjectListItem } from '@/types/subject';
import { Business } from '@/types/business';

export interface ReminderForm {
    deliveryChannel: DeliveryChannel;
    daysBeforeDueDate: number;
}

export interface TaskFormData {
    subjectId: string;
    taskDefinitionId: string;
    taskType: string;
    taskPriority: TaskPriority;
    frequency: string;
    dueDate: string;
    assignedStaffId: string;
    templateId: string;
    notes: string;
    remindersEnabled: boolean;
    reminder: ReminderForm;
}

export const DEFAULT_TASK_FORM: TaskFormData = {
    subjectId: '',
    taskDefinitionId: '',
    taskType: '',
    taskPriority: 'MEDIUM',
    frequency: 'one_time',
    dueDate: '',
    assignedStaffId: '',
    templateId: '',
    notes: '',
    remindersEnabled: true,
    reminder: { deliveryChannel: 'EMAIL', daysBeforeDueDate: 1 },
};

interface UseTaskFormArgs {
    /** Pass an existing task's form data for edit mode; omit for create. */
    initialForm?: TaskFormData;
    templates: MessageTemplateListItem[];
    taskDefinitions: TaskDefinitionListItem[];
    selectedClient: SubjectListItem | null;
    business: Business | null;
}

export function useTaskForm({
    initialForm,
    templates,
    taskDefinitions,
    selectedClient,
    business,
}: UseTaskFormArgs) {
    const [form, setForm] = useState<TaskFormData>(initialForm ?? DEFAULT_TASK_FORM);

    // Re-sync if the dialog is reused for a different task (edit -> edit) or
    // reopened in create mode after being in edit mode.
    useEffect(() => {
        setForm(initialForm ?? DEFAULT_TASK_FORM);
    }, [initialForm]);

    const set = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const setReminder = <K extends keyof ReminderForm>(field: K, value: ReminderForm[K]) =>
        setForm((prev) => ({ ...prev, reminder: { ...prev.reminder, [field]: value } }));

    // Auto-match task definition (priority + schedule) whenever task type changes.
    useEffect(() => {
        if (!form.taskType || taskDefinitions.length === 0) return;
        const matched = taskDefinitions.find(
            (def) => String(def.taskType).trim().toUpperCase() === form.taskType.trim().toUpperCase(),
        );
        if (matched && matched.id !== form.taskDefinitionId) {
            setForm((prev) => ({
                ...prev,
                taskDefinitionId: matched.id,
                taskPriority: (matched.priority as TaskPriority) || 'MEDIUM',
                frequency: matched.schedulePattern || prev.frequency,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.taskType, taskDefinitions]);

    // Auto-suggest a message template by task type — only while nothing has
    // been picked yet, so it never fights a manual selection.
    useEffect(() => {
        if (!form.taskType || templates.length === 0 || form.templateId) return;
        const q = form.taskType.split('_')[0].toLowerCase();
        const matched = templates.find((t) => t.name?.toLowerCase().includes(q));
        if (matched) set('templateId', matched.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.taskType, templates]);

    const generatedTaskTitle = useMemo(() => {
        if (!form.taskType || !form.dueDate) return '';
        const label = TASK_TYPES.find((t) => t.value === form.taskType)?.label ?? form.taskType;
        const dateStr = new Date(form.dueDate).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
        });
        return `${label} – ${dateStr}`;
    }, [form.taskType, form.dueDate]);

    const getValidDaysBeforeOptions = (dueDateStr: string) => {
        if (!dueDateStr) return DAYS_BEFORE_OPTIONS;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDateStr);
        due.setHours(0, 0, 0, 0);
        const maxDays = Math.floor((due.getTime() - today.getTime()) / 86_400_000);
        if (maxDays <= 0) return [];
        return DAYS_BEFORE_OPTIONS.filter((o) => o.value <= maxDays);
    };

    const replaceTemplatePlaceholders = (text: string) => {
        if (!text) return '';
        const clientName = selectedClient?.displayName ?? '[CLIENTNAME]';
        const clientBusinessName =
            selectedClient?.businessName || selectedClient?.displayName || '[BUSINESSNAME]';
        const formattedDueDate = form.dueDate
            ? new Date(form.dueDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            : '[DUEDATE]';
        const serviceType =
            TASK_TYPES.find((t) => t.value === form.taskType)?.label || form.taskType || '[SERVICETYPE]';
        const yourFirmName = business?.name || '[YOURFIRMNAME]';
        const yourContactNumber = business?.phone || '[YOURCONTACTNUMBER]';

        return text
            .replace(/\[CLIENTNAME\]/gi, clientName)
            .replace(/\[BUSINESSNAME\]/gi, clientBusinessName)
            .replace(/\[DUEDATE\]/gi, formattedDueDate)
            .replace(/\[SERVICETYPE\]/gi, serviceType)
            .replace(/\[YOURFIRMNAME\]/gi, yourFirmName)
            .replace(/\[YOURCONTACTNUMBER\]/gi, yourContactNumber)
            .replace(/{{clientName}}/g, clientName)
            .replace(/{{businessName}}/g, clientBusinessName)
            .replace(/{{dueDate}}/g, formattedDueDate)
            .replace(/{{taskType}}/g, serviceType)
            .replace(/{{yourFirmName}}/g, yourFirmName)
            .replace(/{{yourContactNumber}}/g, yourContactNumber);
    };

    const validate = (): string | null => {
        if (!form.subjectId.trim()) return 'Please select a client';
        if (!form.taskType) return 'Please select a task type';
        if (!form.dueDate) return 'Please select a due date';
        if (form.remindersEnabled && !form.templateId) {
            return 'Please select a message template for reminders';
        }
        return null;
    };

    const toDto = () => {
        const selectedTaskType = TASK_TYPES.find((t) => t.value === form.taskType);
        return {
            title: generatedTaskTitle || form.taskType,
            taskName: generatedTaskTitle || form.taskType,
            subjectId: form.subjectId,
            taskDefinitionId: form.taskDefinitionId || undefined,
            taskType: selectedTaskType?.apiValue || form.taskType,
            dueDate: form.dueDate,
            category: 'COMPLIANCE',
            status: 'OPEN' as const,
            priority: form.taskPriority,
            notes: form.notes.trim() || undefined,
            description: form.notes.trim() || undefined,
            assignedStaffId: form.assignedStaffId.trim() || undefined,
            frequency: form.frequency,
            remindersScheduled:
                form.remindersEnabled && form.templateId
                    ? [
                        {
                            deliveryChannel: form.reminder.deliveryChannel,
                            daysBeforeDueDate: form.reminder.daysBeforeDueDate,
                            messageTemplateId: form.templateId,
                        },
                    ]
                    : [],
        };
    };

    const reset = () => setForm(initialForm ?? DEFAULT_TASK_FORM);

    return {
        form,
        set,
        setReminder,
        generatedTaskTitle,
        getValidDaysBeforeOptions,
        replaceTemplatePlaceholders,
        validate,
        toDto,
        reset,
    };
}