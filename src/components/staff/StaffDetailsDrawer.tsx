"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Work as BriefcaseIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import {
  StaffDetails,
  StaffDashboardResponse,
  StaffWorkSummary,
} from "@/types/staff.types";
import { getStaffById, getStaffDashboard } from "@/services/staffService";

// ── Compute summary from dashboard response ──
function computeWorkSummary(dashboard: StaffDashboardResponse): StaffWorkSummary {
  const tasks = dashboard.tasks.items;
  const now = new Date();
  return {
    totalClients: dashboard.clients.items.length,
    pendingTasks: tasks.filter(
      (t) => t.status === "OPEN" && new Date(t.due_date) >= now
    ).length,
    overdueTasks: tasks.filter(
      (t) => t.status === "OPEN" && new Date(t.due_date) < now
    ).length,
    completedTasks: tasks.filter((t) => t.status === "CLOSED").length,
  };
}

interface StaffDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  membershipId: string | null;
  businessId: string;
  onEdit: (membershipId: string) => void;
}

const getInitials = (name?: string) => {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

// ── Contact Row ──
function ContactRow({
  icon,
  value,
  label,
  actions,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.75,
        px: 2.5,
        borderBottom: "1px solid #E6F4FF",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: "#E6F4FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00A3FF",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          fontWeight={500}
          noWrap
          sx={{ color: "#001C3D" }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: "#4A5568" }}>
          {label}
        </Typography>
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  );
}

// ── Work Summary Row ──
function SummaryRow({
  icon,
  label,
  count,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  badgeColor: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ color: "#4A5568", flexShrink: 0, display: "flex" }}>{icon}</Box>
      <Typography variant="body2" sx={{ flex: 1, color: "#2D3748" }}>
        {label}
      </Typography>
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: badgeColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}
        >
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Action Icon Button ──
function ActionIconButton({
  href,
  target,
  children,
}: {
  href?: string;
  target?: string;
  children: React.ReactNode;
}) {
  return (
    <IconButton
      size="small"
      href={href}
      target={target}
      sx={{
        width: 34,
        height: 34,
        border: "1px solid #CBD5E0",
        borderRadius: 2,
        color: "#4A5568",
        "&:hover": {
          bgcolor: "#E6F4FF",
          borderColor: "#00A3FF",
          color: "#00A3FF",
        },
      }}
    >
      {children}
    </IconButton>
  );
}

export default function StaffDetailsDrawer({
  open,
  onClose,
  membershipId,
  businessId,
  onEdit,
}: StaffDetailsDrawerProps) {
  const [staff, setStaff] = useState<StaffDetails | null>(null);
  const [summary, setSummary] = useState<StaffWorkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const fetchStaff = useCallback(async () => {
  if (!membershipId) return;
  try {
    setLoading(true);
    setError("");
    const [data, dashboard] = await Promise.all([
      getStaffById(businessId, membershipId),
      getStaffDashboard(businessId, membershipId),
    ]);
    console.log("✅ staff data:", data);        // ← check this in console
    console.log("✅ dashboard data:", dashboard); // ← check this too
    setStaff(data);
    setSummary(computeWorkSummary(dashboard));
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to load staff details");
  } finally {
    setLoading(false);
  }
}, [businessId, membershipId]);

  useEffect(() => {
    if (open && membershipId) fetchStaff();
  }, [open, membershipId, fetchStaff]);

  const phoneDisplay = staff?.contact?.phone
    ? staff.contact.phone.startsWith("+")
      ? staff.contact.phone
      : `+${staff.contact.phone}`
    : "—";

  const isActive = staff?.status === "ACTIVE";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 400 },
          bgcolor: "#E6F4FF",   // ✅ matches background.default
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

        {/* ── Top Bar ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            bgcolor: "#FFFFFF",
            borderBottom: "2px solid #00A3FF",  // ✅ theme primary accent
          }}
        >
          <IconButton onClick={onClose} size="small" sx={{ color: "#001C3D" }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#001C3D", fontWeight: 700 }}>
            Staff Details
          </Typography>
          <IconButton size="small" sx={{ color: "#001C3D" }}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* ── Scrollable Body ── */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#00A3FF" }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : staff ? (
            <>
              {/* ── Profile Card ── */}
              <Box
                sx={{
                  mx: 2,
                  mt: 2,
                  p: 2.5,
                  bgcolor: "#FFFFFF",
                  borderRadius: 3,
                  border: "1px solid #E6F4FF",
                  boxShadow: "0 4px 20px rgba(0,28,61,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  src={staff.avatarUrl || undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#E6F4FF",
                    color: "#001C3D",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    border: "2px solid #00A3FF",
                  }}
                >
                  {!staff.avatarUrl && getInitials(staff.userName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    noWrap
                    sx={{ color: "#001C3D" }}
                  >
                    {staff.userName || "Unknown"}
                  </Typography>
                  <Chip
                    label={isActive ? "Active" : "Inactive"}
                    size="small"
                    variant="outlined"
                    onClick={() => onEdit(staff.id)}
                    sx={{
                      mt: 0.5,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "20px",
                      borderColor: isActive ? "#00A3FF" : "#CBD5E0",
                      color: isActive ? "#00A3FF" : "#4A5568",
                      bgcolor: isActive ? "#E6F4FF" : "transparent",
                      cursor: "pointer",
                    }}
                  />
                </Box>
              </Box>

              {/* ── Contact Rows ── */}
              <Box
                sx={{
                  mx: 2,
                  mt: 2,
                  bgcolor: "#FFFFFF",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,28,61,0.06)",
                }}
              >
                <ContactRow
                  icon={<PhoneIcon fontSize="small" />}
                  value={phoneDisplay}
                  label="Phone"
                  actions={
                    <>
                      <ActionIconButton href={`tel:${phoneDisplay}`}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                      </ActionIconButton>
                      <ActionIconButton
                        href={`https://wa.me/${staff.contact?.phone}`}
                        target="_blank"
                      >
                        <WhatsAppIcon sx={{ fontSize: 16 }} />
                      </ActionIconButton>
                    </>
                  }
                />
                <ContactRow
                  icon={<EmailIcon fontSize="small" />}
                  value={staff.contact?.email || "—"}
                  label="Email"
                  actions={
                    <ActionIconButton href={`mailto:${staff.contact?.email}`}>
                      <EmailIcon sx={{ fontSize: 16 }} />
                    </ActionIconButton>
                  }
                />
                <ContactRow
                  icon={<WorkIcon fontSize="small" />}
                  value={staff.role || "No Role"}
                  label="Role"
                />
              </Box>

              {/* ── Service Info ── */}
              <Box sx={{ mt: 3, px: 2 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ color: "#001C3D", mb: 1.5 }}
                >
                  Service Info
                </Typography>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 40,
                    "& .MuiTabs-flexContainer": { gap: 1 },
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      borderRadius: "20px",
                      minHeight: 38,
                      px: 2.5,
                      border: "1px solid #CBD5E0",
                      bgcolor: "#FFFFFF",
                      color: "#4A5568",
                    },
                    "& .Mui-selected": {
                      bgcolor: "#E6F4FF !important",
                      color: "#00A3FF !important",
                      borderColor: "#00A3FF !important",
                      fontWeight: 600,
                    },
                    "& .MuiTabs-indicator": { display: "none" },
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Clients" />
                  <Tab label="Tasks" />
                  <Tab label="Schedule" />
                </Tabs>
              </Box>

              {/* ── Work Summary (Overview tab) ── */}
              {activeTab === 0 && (
                <Box
                  sx={{
                    mx: 2,
                    mt: 2,
                    mb: 3,
                    p: 2.5,
                    bgcolor: "#FFFFFF",
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,28,61,0.06)",
                  }}
                >
                  {/* Card Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        bgcolor: "#E6F4FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BriefcaseIcon sx={{ fontSize: 20, color: "#00A3FF" }} />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ color: "#001C3D" }}
                    >
                      Work Summary
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: "#E6F4FF", mb: 1 }} />

                  <SummaryRow
                    icon={<PeopleIcon fontSize="small" />}
                    label="Clients"
                    count={summary?.totalClients ?? 0}
                    badgeColor="#26a69a"
                  />
                  <SummaryRow
                    icon={<AssignmentIcon fontSize="small" />}
                    label="Pending Tasks"
                    count={summary?.pendingTasks ?? 0}
                    badgeColor="#ffa726"
                  />
                  <SummaryRow
                    icon={<WarningIcon fontSize="small" />}
                    label="Overdue Tasks"
                    count={summary?.overdueTasks ?? 0}
                    badgeColor="#ef5350"
                  />
                  <SummaryRow
                    icon={<CheckCircleIcon fontSize="small" />}
                    label="Completed Tasks"
                    count={summary?.completedTasks ?? 0}
                    badgeColor="#66bb6a"
                  />
                </Box>
              )}
            </>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}