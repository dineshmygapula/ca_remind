'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSubjects } from '@/services/subjectService';
import { SubjectListItem } from '@/types/subject';
import { getStaff } from '@/services/staffService';
import { StaffMember } from '@/types/staff.types';
import { getMessageTemplates } from '@/services/messageTemplateService';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { getTaskDefinitions } from '@/services/taskDefinitionService';
import { TaskDefinitionListItem } from '@/types/taskDefinition.types';
import { getBusinessById } from '@/services/businessService';
import { getOrganizations } from '@/services/organizationService';
import { Business } from '@/types/business';

export interface UseTaskFormDataResult {
    clients: SubjectListItem[];
    clientsLoading: boolean;
    staff: StaffMember[];
    staffLoading: boolean;
    templates: MessageTemplateListItem[];
    templatesLoading: boolean;
    taskDefinitions: TaskDefinitionListItem[];
    taskDefsLoading: boolean;
    business: Business | null;
    error: string;
    setError: (message: string) => void;
}

/**
 * Loads every piece of reference data the task form needs — clients, staff,
 * message templates, task definitions, and the business's own profile (for
 * template placeholder replacement). Replaces 5 separate
 * useCallback+useEffect blocks that used to live in the dialog component.
 * Fetches whenever the dialog opens.
 */
export function useTaskFormData(businessId: string, open: boolean): UseTaskFormDataResult {
    const [clients, setClients] = useState<SubjectListItem[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [templates, setTemplates] = useState<MessageTemplateListItem[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [taskDefinitions, setTaskDefinitions] = useState<TaskDefinitionListItem[]>([]);
    const [taskDefsLoading, setTaskDefsLoading] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);
    const [error, setError] = useState('');

    const fetchClients = useCallback(async () => {
        try {
            setClientsLoading(true);
            const data = await getSubjects(businessId);
            setClients(data.filter((s) => s.subjectType === 'CLIENT' && s.isActive));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load clients');
        } finally {
            setClientsLoading(false);
        }
    }, [businessId]);

    const fetchStaff = useCallback(async () => {
        try {
            setStaffLoading(true);
            const data = await getStaff(businessId);
            setStaff(data.filter((s) => s.status === 'ACTIVE'));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load staff');
        } finally {
            setStaffLoading(false);
        }
    }, [businessId]);

    const fetchTemplates = useCallback(async () => {
        try {
            setTemplatesLoading(true);
            const data = await getMessageTemplates(businessId);
            setTemplates(data.filter((t) => t.isActive !== false));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        } finally {
            setTemplatesLoading(false);
        }
    }, [businessId]);

    const fetchTaskDefinitions = useCallback(async () => {
        try {
            setTaskDefsLoading(true);
            const data = await getTaskDefinitions(businessId);
            const items: TaskDefinitionListItem[] = Array.isArray(data)
                ? data
                : (data as { items: TaskDefinitionListItem[] }).items || [];
            setTaskDefinitions(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load task definitions');
        } finally {
            setTaskDefsLoading(false);
        }
    }, [businessId]);

    const fetchBusinessDetails = useCallback(async () => {
        try {
            const orgs = await getOrganizations();
            if (!orgs.length) return;
            const data = await getBusinessById(orgs[0].id, businessId);
            setBusiness(data);
        } catch (err) {
            // Non-fatal — placeholder replacement just falls back to bracket tokens.
            console.error('Failed to load business details:', err);
        }
    }, [businessId]);

    useEffect(() => {
        if (!open || !businessId) return;
        fetchClients();
        fetchStaff();
        fetchTemplates();
        fetchTaskDefinitions();
        fetchBusinessDetails();
    }, [
        open,
        businessId,
        fetchClients,
        fetchStaff,
        fetchTemplates,
        fetchTaskDefinitions,
        fetchBusinessDetails,
    ]);

    return {
        clients,
        clientsLoading,
        staff,
        staffLoading,
        templates,
        templatesLoading,
        taskDefinitions,
        taskDefsLoading,
        business,
        error,
        setError,
    };
}