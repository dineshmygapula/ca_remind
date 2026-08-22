"use client";

import { useState } from "react";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import AddTask from "../../../components/tasks/AddTask";

// import your auth hook correctly
import { useAuth } from "@/context/AuthContext";
export default function TestingPage() {
  const { businessId } = useAuth();

  // ─── State ─────────────────────────────────────────────
  const [loading] = useState(false);
  const [error, setError] = useState("");

  // Dialog State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // ─── Loading Guard ─────────────────────────────────────
  if (!businessId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ─── Render ────────────────────────────────────────────
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>

          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Tasks
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Manage all compliance tasks
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create Task
            </Button>
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Temporary Loading */}
          {loading && <CircularProgress />}

          {/* Create Task Dialog */}
         <AddTask
  open={openCreateDialog}
  onClose={() => setOpenCreateDialog(false)}
  businessId={businessId}
/>

        </Stack>
      </Container>
    </Box>
  );
}