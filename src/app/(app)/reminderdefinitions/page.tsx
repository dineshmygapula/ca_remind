'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';
import {
  getV2ReminderDefinitions,
  deleteV2ReminderDefinition,
} from '../../../services/reminderDefinitionService';
import ReminderDefinitionsTable from '../../../components/reminderdefinitions/ReminderDefinitionsTable';
import ReminderDefinitionsFilter from '../../../components/reminderdefinitions/ReminderDefinitionsFilter';

export default function RemindersPage() {
  const { businessId } = useAuth();

  const [definitions, setDefinitions] = useState<V2ReminderDefinition[]>([]);
  const [filteredDefinitions, setFilteredDefinitions] = useState<V2ReminderDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // ✅ Wrapped in useCallback so it can be a safe useEffect dependency
  const fetchDefinitions = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getV2ReminderDefinitions(businessId);
      setDefinitions(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch reminder definitions');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // ✅ Wrapped in useCallback so it can be a safe useEffect dependency
  const applyFilters = useCallback(() => {
    if (!Array.isArray(definitions)) {
      setFilteredDefinitions([]);
      return;
    }
    let filtered = [...definitions];
    if (searchQuery) {
      filtered = filtered.filter((def) =>
        def.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (channelFilter) {
      filtered = filtered.filter((def) => def.channel === channelFilter);
    }
    if (statusFilter === 'ACTIVE') {
      filtered = filtered.filter((def) => def.isActive);
    } else if (statusFilter === 'INACTIVE') {
      filtered = filtered.filter((def) => !def.isActive);
    }
    setFilteredDefinitions(filtered);
  }, [definitions, searchQuery, channelFilter, statusFilter]);

  useEffect(() => {
    if (businessId) fetchDefinitions();
  }, [businessId, fetchDefinitions]); // ✅ fetchDefinitions added

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // ✅ applyFilters replaces the individual deps list

  const handleView = (definitionId: string) => {
    console.log('View definition:', definitionId);
  };

  const handleEdit = (definitionId: string) => {
    console.log('Edit definition:', definitionId);
  };

  const handleDelete = async (definitionId: string, name: string) => {
    if (!businessId) return;
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      await deleteV2ReminderDefinition(businessId, definitionId);
      fetchDefinitions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete reminder definition');
      }
    }
  };

  if (!businessId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Reminder Definitions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Link task definitions with message templates
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => console.log('Create reminder')}
              size="large"
            >
              Create Reminder
            </Button>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <ReminderDefinitionsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            channelFilter={channelFilter}
            onChannelChange={setChannelFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <Typography variant="body2" color="text.secondary">
            Showing {filteredDefinitions.length} of {definitions.length} reminder definitions
          </Typography>

          <ReminderDefinitionsTable
            definitions={filteredDefinitions}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Stack>
      </Container>
    </Box>
  );
}