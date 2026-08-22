'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Pencil } from 'lucide-react';
import Modal from '@/components/common/Modal';
import SearchableSelect from '@/components/common/SearchableSelect';

import { createTask, updateTask } from '@/services/taskService';
import { SubjectListItem } from '@/types/subject';
import { StaffMember } from '@/types/staff.types';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { TASK_TYPES, FREQUENCY_OPTIONS, DELIVERY_CHANNELS } from '@/constants/taskConstants';
import { useTaskFormData } from '@/hooks/tasks/useTasksFormData';
import { TaskFormData, useTaskForm } from '@/hooks/tasks/useTaskForm';

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
    open: boolean;
    onClose: () => void;
    businessId: string;
    onSuccess?: () => void;
    /** Create a new task when omitted; edit the given task when provided. */
    taskId?: string;
}

// ─── Shared field styling — matches FilterBar's FIELD_CLASS for consistency ──

const FIELD_CLASS =
    'h-9 w-full rounded-lg border border-divider bg-surface px-3 text-sm text-txt-main outline-none transition-colors focus:border-navy';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="mb-1.5 block text-sm font-semibold text-txt-main">
            {children}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}

function FieldHelper({ children }: { children: React.ReactNode }) {
    return <p className="mb-1.5 text-xs text-txt-sub">{children}</p>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskFormDialog({ open, onClose, businessId, onSuccess, taskId }: Props) {
    const mode: 'create' | 'edit' = taskId ? 'edit' : 'create';

    const [submitting, setSubmitting] = useState(false);
    const [error, setLocalError] = useState('');
    const [loadingTask, setLoadingTask] = useState(false);
    const [initialForm, setInitialForm] = useState<TaskFormData | undefined>(undefined);

    const [selectedClient, setSelectedClient] = useState<SubjectListItem | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateListItem | null>(null);

    const {
        clients,
        clientsLoading,
        staff,
        staffLoading,
        templates,
        templatesLoading,
        taskDefinitions,
        business,
        error: fetchError,
        setError: setFetchError,
    } = useTaskFormData(businessId, open);

    const {
        form,
        set,
        setReminder,
        generatedTaskTitle,
        getValidDaysBeforeOptions,
        replaceTemplatePlaceholders,
        validate,
        toDto,
        reset,

    } = useTaskForm({
        initialForm,
        templates,
        taskDefinitions,
        selectedClient,
        business,
    });

    // ─── Edit mode: fetch the existing task once the dialog opens ────────────
    useEffect(() => {
        if (!open) return;

        if (mode === 'create') {
            setInitialForm(undefined);
            return;
        }

        if (!taskId) return;

        (async () => {
            try {
                setLoadingTask(true);
                const task = await getTask(businessId, taskId);
                setInitialForm({
                    subjectId: task.subjectId ?? '',
                    taskDefinitionId: task.taskDefinitionId ?? '',
                    taskType: task.taskType ?? '',
                    taskPriority: task.priority ?? 'MEDIUM',
                    frequency: task.frequency ?? 'ONETIME',
                    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
                    assignedStaffId: task.assignedStaffId ?? '',
                    templateId: task.remindersScheduled?.[0]?.messageTemplateId ?? '',
                    notes: task.notes ?? '',
                    remindersEnabled: (task.remindersScheduled?.length ?? 0) > 0,
                    reminder: {
                        deliveryChannel: task.remindersScheduled?.[0]?.deliveryChannel ?? 'EMAIL',
                        daysBeforeDueDate: task.remindersScheduled?.[0]?.daysBeforeDueDate ?? 1,
                    },
                });
            } catch (err) {
                setLocalError(err instanceof Error ? err.message : 'Failed to load task');
            } finally {
                setLoadingTask(false);
            }
        })();
    }, [open, mode, taskId, businessId]);

    // ─── Prefill the searchable-select objects once their option lists + the
    //     initial form values are both available (edit mode) ─────────────────
    useEffect(() => {
        if (!initialForm) return;
        if (initialForm.subjectId && clients.length) {
            setSelectedClient(clients.find((c) => c.id === initialForm.subjectId) ?? null);
        }
        if (initialForm.assignedStaffId && staff.length) {
            setSelectedStaff(staff.find((s) => s.id === initialForm.assignedStaffId) ?? null);
        }
        if (initialForm.templateId && templates.length) {
            setSelectedTemplate(templates.find((t) => t.id === initialForm.templateId) ?? null);
        }
    }, [initialForm, clients, staff, templates]);

    const combinedError = error || fetchError;

    const handleClose = () => {
        if (submitting) return;
        setLocalError('');
        setFetchError('');
        setSelectedClient(null);
        setSelectedStaff(null);
        setSelectedTemplate(null);
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setLocalError(validationError);
            return;
        }

        setSubmitting(true);
        setLocalError('');

        try {
            const dto = toDto();
            if (mode === 'edit' && taskId) {
                await updateTask(businessId, taskId, dto);
            } else {
                await createTask(businessId, dto);
            }
            handleClose();
            onSuccess?.();
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : `Failed to ${mode} task`);
        } finally {
            setSubmitting(false);
        }
    };

    const validDaysBeforeOptions = getValidDaysBeforeOptions(form.dueDate);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            icon={mode === 'edit' ? <Pencil className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            eyebrow={mode === 'edit' ? 'Edit Task' : 'New Task'}
            title={mode === 'edit' ? 'Update Task' : 'Add Task'}
            onCancel={handleClose}
            onSubmit={handleSubmit}
            submitLabel={mode === 'edit' ? 'Update Task' : 'Save Task'}
            submitting={submitting || loadingTask}
            submitVariant="success"
        >
            <div className="space-y-5">
                {combinedError && (
                    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                        <span>{combinedError}</span>
                        <button
                            type="button"
                            onClick={() => {
                                setLocalError('');
                                setFetchError('');
                            }}
                            className="text-orange-700/70 hover:text-orange-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Client */}
                <div>
                    <FieldLabel required>Select Client</FieldLabel>
                    <SearchableSelect
                        options={clients}
                        value={selectedClient}
                        onChange={(client) => {
                            setSelectedClient(client);
                            set('subjectId', client?.id ?? '');
                        }}
                        getOptionLabel={(c) => c.displayName}
                        getOptionKey={(c) => c.id}
                        loading={clientsLoading}
                        placeholder="Search and select client..."
                        emptyMessage={clients.length === 0 ? 'No clients found. Create a client first.' : 'No matching clients'}
                    />
                </div>

                {/* Task Type */}
                <div>
                    <FieldLabel required>Task Type</FieldLabel>
                    <select
                        value={form.taskType}
                        onChange={(e) => set('taskType', e.target.value)}
                        className={`${FIELD_CLASS} pl-3 pr-3`}
                    >
                        <option value="" disabled>
                            Select Task Type
                        </option>
                        {TASK_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Frequency */}
                <div>
                    <FieldLabel required>Frequency</FieldLabel>
                    <select
                        value={form.frequency}
                        onChange={(e) => set('frequency', e.target.value)}
                        className={`${FIELD_CLASS} pl-3 pr-3`}
                    >
                        {FREQUENCY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Auto-generated title (read-only) */}
                <div>
                    <FieldLabel>Task title</FieldLabel>
                    <input
                        readOnly
                        value={generatedTaskTitle}
                        placeholder="Select a due date to generate the task title"
                        className={`${FIELD_CLASS} px-3 ${generatedTaskTitle ? '' : 'text-txt-sub/60'}`}
                    />
                </div>

                {/* Due Date */}
                <div>
                    <FieldLabel required>Due Date</FieldLabel>
                    <input
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => {
                            const newDueDate = e.target.value;
                            set('dueDate', newDueDate);
                            const validOptions = getValidDaysBeforeOptions(newDueDate);
                            const stillValid = validOptions.some((o) => o.value === form.reminder.daysBeforeDueDate);
                            if (!stillValid && validOptions.length > 0) {
                                setReminder('daysBeforeDueDate', validOptions[0].value);
                            }
                        }}
                        className={`${FIELD_CLASS} px-3`}
                    />
                </div>

                {/* Assigned To */}
                <div>
                    <FieldLabel>Assigned to</FieldLabel>
                    <SearchableSelect
                        options={staff}
                        value={selectedStaff}
                        onChange={(member) => {
                            setSelectedStaff(member);
                            set('assignedStaffId', member?.id ?? '');
                        }}
                        getOptionLabel={(m) => [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || m.id}
                        getOptionKey={(m) => m.id}
                        loading={staffLoading}
                        placeholder="Search and select employee..."
                        emptyMessage={staff.length === 0 ? 'No staff found. Add a staff member first.' : 'No matching staff'}
                    />
                </div>

                {/* Notes */}
                <div>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        placeholder="Add Notes"
                        className="w-full resize-none rounded-lg border border-divider bg-surface px-3 py-2 text-sm text-txt-main outline-none transition-colors focus:border-navy"
                    />
                </div>

                {/* Reminders section */}
                <div className="overflow-hidden rounded-xl border border-divider bg-surface">
                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-semibold text-txt-main">Reminders</span>
                        <input
                            type="checkbox"
                            checked={form.remindersEnabled}
                            onChange={(e) => set('remindersEnabled', e.target.checked)}
                            className="toggle toggle-success"
                        />
                    </div>

                    {form.remindersEnabled && (
                        <div className="space-y-4 border-t border-divider px-4 py-4">
                            {/* Delivery channel */}
                            <div>
                                <FieldLabel>Delivery channel</FieldLabel>
                                <FieldHelper>One channel per task; default is Email.</FieldHelper>
                                <select
                                    value={form.reminder.deliveryChannel}
                                    onChange={(e) => setReminder('deliveryChannel', e.target.value as never)}
                                    className={`${FIELD_CLASS} pl-3 pr-3`}
                                >
                                    {DELIVERY_CHANNELS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Days before due */}
                            <div>
                                <FieldLabel>Day Before Due</FieldLabel>
                                <FieldHelper>
                                    {form.dueDate ? 'Select the days to send reminder before due date' : 'Select a due date first'}
                                </FieldHelper>
                                <select
                                    value={form.reminder.daysBeforeDueDate}
                                    onChange={(e) => setReminder('daysBeforeDueDate', Number(e.target.value))}
                                    disabled={!form.dueDate}
                                    className={`${FIELD_CLASS} pl-3 pr-3 disabled:opacity-60`}
                                >
                                    {validDaysBeforeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Template */}
                            <div>
                                <FieldLabel required>Message template</FieldLabel>
                                <FieldHelper>
                                    We pick the matching template from your task type and delivery channel.
                                </FieldHelper>
                                <SearchableSelect
                                    options={templates}
                                    value={selectedTemplate}
                                    onChange={(template) => {
                                        setSelectedTemplate(template);
                                        set('templateId', template?.id ?? '');
                                    }}
                                    getOptionLabel={(t) => t.name}
                                    getOptionKey={(t) => t.id}
                                    loading={templatesLoading}
                                    placeholder="Search and select template..."
                                    emptyMessage={
                                        templates.length === 0 ? 'No templates found. Create a template first.' : 'No matching templates'
                                    }
                                    renderOption={(t) => (
                                        <div>
                                            <p className="font-semibold text-txt-main">{t.name}</p>
                                            <p className="text-xs text-txt-sub">
                                                {t.businessCategory}
                                                {t.channels?.length ? ` · ${t.channels.join(', ')}` : ''}
                                            </p>
                                        </div>
                                    )}
                                />

                                {selectedTemplate && (
                                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-xs font-bold text-blue-700">Template Preview</p>

                                        {form.reminder.deliveryChannel === 'EMAIL' && selectedTemplate.templates?.email && (
                                            <div className="mt-1.5">
                                                <p className="text-xs font-semibold text-txt-sub">
                                                    {replaceTemplatePlaceholders(selectedTemplate.templates.email.subject)}
                                                </p>
                                                <p className="mt-1 whitespace-pre-line text-xs text-txt-sub">
                                                    {replaceTemplatePlaceholders(selectedTemplate.templates.email.body)}
                                                </p>
                                            </div>
                                        )}
                                        {form.reminder.deliveryChannel === 'EMAIL' && !selectedTemplate.templates?.email && (
                                            <p className="mt-1.5 text-xs text-txt-sub/60">This template has no Email content</p>
                                        )}

                                        {form.reminder.deliveryChannel === 'WHATSAPP' && selectedTemplate.templates?.whatsapp && (
                                            <p className="mt-1.5 whitespace-pre-line text-xs text-txt-sub">
                                                💬 {replaceTemplatePlaceholders(selectedTemplate.templates.whatsapp.body)}
                                            </p>
                                        )}
                                        {form.reminder.deliveryChannel === 'WHATSAPP' && !selectedTemplate.templates?.whatsapp && (
                                            <p className="mt-1.5 text-xs text-txt-sub/60">This template has no WhatsApp content</p>
                                        )}

                                        {form.reminder.deliveryChannel !== 'EMAIL' && form.reminder.deliveryChannel !== 'WHATSAPP' && (
                                            <p className="mt-1.5 text-xs text-txt-sub/60">
                                                No preview available for {form.reminder.deliveryChannel}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function getTask(businessId: string, taskId: string) {
    throw new Error('Function not implemented.');
}
