'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';

interface AppDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
}

export default function AppDialog({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  children,
}: AppDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {children}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}