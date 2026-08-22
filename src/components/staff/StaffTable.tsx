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
  Box,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as InactiveIcon,
} from "@mui/icons-material";
import { StaffMember } from "@/types/staff.types";

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  onView: (membershipId: string) => void;
  onEdit: (membershipId: string) => void;
  onDelete: (membershipId: string, staffName: string) => void;
}

export default function StaffTable({
  staff,
  loading,
  onView,
  onEdit,
  onDelete,
}: StaffTableProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading staff members...
        </Typography>
      </Paper>
    );
  }

  if (staff.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No staff members found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add staff members to get started
        </Typography>
      </Paper>
    );
  }

  // ✅ Helper: full name
  // ✅ Full name helper
  const getFullName = (member: StaffMember) => {
    return (
      member.userName ||
      `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
      member.email ||
      "Unknown User"
    );
  };

  // ✅ Initials helper
  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#F8FAFC",
            }}
          >
            {[
              "Staff Member",
              "Email",
              "Phone",
              "Role",
              "Status",
              "Actions",
            ].map((h) => (
              <TableCell
                key={h}
                sx={{
                  borderBottom: "1px solid #E2E8F0",
                  py: 1.8,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                  }}
                >
                  {h}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((member, index) => {
            const fullName = getFullName(member);
            const role = (member.roles?.[0] || "N/A").toUpperCase() || "N/A";

            return (
              <TableRow
                key={member.id || index}
                hover
                sx={{
                  cursor: "pointer",

                  "&:hover": {
                    backgroundColor: "#F8FAFC",
                  },
                }}
                onClick={() => onView(member.id)}
              >
                {/* ✅ Staff Name + Avatar */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor:
                          member.status === "ACTIVE" ? "#DBEAFE" : "#F1F5F9",
                        color:
                          member.status === "ACTIVE" ? "#2563EB" : "#94A3B8",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {member.status === "ACTIVE" ? (
                        getInitials(fullName)
                      ) : (
                        <InactiveIcon fontSize="small" />
                      )}
                    </Avatar>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1E293B",
                        fontWeight: 600,
                      }}
                    >
                      {fullName}
                    </Typography>
                  </Box>
                </TableCell>

                {/* ✅ Email */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                    }}
                  >
                    {member.email || "—"}
                  </Typography>
                </TableCell>

                {/* ✅ Phone */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {member.phone || member.phoneMasked || "—"}
                  </Typography>
                </TableCell>

                {/* ✅ Role (FIXED) */}
                <TableCell>
                  <Chip
                    label={role}
                    size="small"
                    sx={{
                      bgcolor: "#EFF6FF",
                      color: "#2563EB",

                      border: "1px solid #DBEAFE",

                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  />
                </TableCell>

                {/* ✅ Status */}
                <TableCell>
                  <Chip
                    label={member.status === "ACTIVE" ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor:
                        member.status === "ACTIVE" ? "#E8F5E9" : "#F1F5F9",

                      color: member.status === "ACTIVE" ? "#2E7D32" : "#64748B",

                      border: "1px solid",
                      borderColor: "divider",

                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  />
                </TableCell>

                {/* ✅ Actions */}
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onView(member.id)}
                      sx={{
                        color: "text.secondary",

                        "&:hover": {
                          color: "primary.main",
                          backgroundColor: "#F1F5F9",
                        },
                      }}
                    >
                      {" "}
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit Role">
                    <IconButton size="small" onClick={() => onEdit(member.id)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Remove Staff">
                    <IconButton
                      size="small"
                      sx={{
                        color: "#94A3B8",

                        "&:hover": {
                          color: "#DC2626",
                          backgroundColor: "#FEF2F2",
                        },
                      }}
                      onClick={() => onDelete(member.id, fullName)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
