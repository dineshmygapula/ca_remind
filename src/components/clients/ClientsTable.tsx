"use client";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Stack,
  CircularProgress,
  //TablePagination,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { SubjectListItem } from "@/types/subject";
import TablePaginationBar from "@/components/common/TablePaginationBar";
interface ClientsTableProps {
  clients: SubjectListItem[];
  loading: boolean;
  onView: (clientId: string) => void;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string, clientName: string) => void;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ClientsTable({
  clients,
  loading,
  onView,
  onEdit,
  onDelete,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: ClientsTableProps) {
  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <Paper
        sx={{
          p: 8,
          textAlign: "center",
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider", // ✅ theme token
        }}
      >
        <CircularProgress size={32} thickness={4} />{" "}
        {/* ✅ removed hardcoded color */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading clients...
        </Typography>
      </Paper>
    );
  }

  // ── Empty State────────────────────────────────────────────
  if (clients.length === 0) {
    return (
      <Paper
        sx={{
          p: 8,
          textAlign: "center",
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider", // ✅ theme token
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No clients found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add your first client to get started
        </Typography>
      </Paper>
    );
  }
  // added this part on 25/04/26
  // ─── Helper Functions ─────────────────────────────────────────────────────
  const getComplianceChips = (activeCompliances: string[] | undefined) => {
    if (!activeCompliances || activeCompliances.length === 0) {
      return (
        <Typography variant="caption" color="text.disabled">
          None
        </Typography>
      );
    }

    const complianceStyles: Record<string, { bg: string; color: string }> = {
      gst: {
        bg: "#E8F5E9",
        color: "#2E7D32",
      },

      tds: {
        bg: "#F1F5F9",
        color: "#475569",
      },

      itr: {
        bg: "#E3F2FD",
        color: "#1565C0",
      },

      roc: {
        bg: "#F3E8FF",
        color: "#7E22CE",
      },
    };
    return (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {activeCompliances.map((comp) => (
          <Chip
            key={comp}
            label={comp.toUpperCase()}
            size="small"
            sx={{
              bgcolor: complianceStyles[comp.toLowerCase()]?.bg || "#F1F5F9",

              color: complianceStyles[comp.toLowerCase()]?.color || "#475569",

              fontWeight: 600,
              fontSize: "0.72rem",
              height: "24px",
              borderRadius: "6px",

              border: "1px solid",
              borderColor: "divider",
            }}
          />
        ))}
      </Stack>
    );
  };

  // ── Table ────────────────────────────────────────────
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client Name</TableCell>
            <TableCell>Business Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>GSTIN</TableCell>
            <TableCell>Compliances</TableCell>
            {/*  <TableCell>Assigned Team</TableCell> */}
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {clients.map((client) => (
            <TableRow
              key={client.id}
              hover
              onClick={() => onView(client.id)}
              sx={{ cursor: "pointer" }}
            >
              {/* Client Name */}
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {client.displayName || "—"}
                </Typography>
              </TableCell>

              {/* Business Name */}
              <TableCell>
                <Typography variant="body2" color="text.primary">
                  {client.businessName || "—"}
                </Typography>
              </TableCell>

              {/* Email */}
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {client.email || "—"}
                </Typography>
              </TableCell>

              {/* Phone */}
              <TableCell>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace" }}
                >
                  {client.phone || "—"}
                </Typography>
              </TableCell>

              {/* GSTIN */}
              <TableCell>
                {client.gstin ? (
                  <Chip
                    label={client.gstin}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      borderColor: "divider", // ✅ theme token
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>
              {/* Active Compliances */}
              <TableCell>
                {getComplianceChips(client.activeCompliances)}
              </TableCell>

              {/* Assigned Team — backend must return assignedTeam field */}
              {/* Assigned Team */}
              {/*   <TableCell>
                {client.assignedTeam?.primaryAssignee?.name ? (
                  <Chip
                    label={client.assignedTeam.primaryAssignee.name} // ✅ drill into the object
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    Unassigned
                  </Typography>
                )}
              </TableCell>
           */}

              {/* Status */}
              <TableCell>
                {/* ✅ color prop uses theme — no hardcoded colors */}
                <Chip
                  label={client.isActive ? "Active" : "Inactive"}
                  size="small"
                  color={client.isActive ? "success" : "default"}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                />
              </TableCell>

              {/* Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onView(client.id)}
                    sx={{
                      color: "text.secondary", // ✅ theme token
                      "&:hover": {
                        color: "text.primary", // ✅ theme token
                        bgcolor: "action.hover", // ✅ theme token
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit Client">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(client.id)}
                    sx={{
                      color: "text.secondary", // ✅ theme token
                      "&:hover": {
                        color: "text.primary", // ✅ theme token
                        bgcolor: "action.hover", // ✅ theme token
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Client">
                  {/* ✅ color prop on IconButton — correct way */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(client.id, client.displayName)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      /> */}

     <TablePaginationBar
  totalCount={totalCount}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={onPageChange}
  onRowsPerPageChange={onRowsPerPageChange}
/>
    </TableContainer>
  );
}
