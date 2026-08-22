"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  EventNote as EventNoteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { getSubjectById } from "@/services/subjectService";
import { Subject } from "@/types/subject";
import { ComplianceService } from "../../types/subject";
import { getStaff } from "@/services/staffService";
import { updateSubject } from "@/services/subjectService";
import type { StaffMember } from "@/types/staff.types";
import { TextField, MenuItem, Button } from "@mui/material";
import { getTasks } from "@/services/taskService";
import type { TaskListItem } from "../../types/task.types";
interface ClientDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
  businessId: string;
  onEdit: (clientId: string) => void;
}

const val = (v?: string | null) => (v && v.trim() ? v : "—");

// Always-visible compliance services list
const COMPLIANCE_KEYS = [
  { key: "gst", label: "GST Filing", icon: "📋" },
  { key: "tds", label: "TDS Returns", icon: "🏦" },
  { key: "itr", label: "Income Tax (ITR)", icon: "📄" },
  { key: "roc", label: "ROC Filings", icon: "🏢" },
  { key: "msme", label: "MSME Filings", icon: "🏭" },
] as const;

export default function ClientDetailsDrawer({
  open,
  onClose,
  clientId,
  businessId,
  onEdit,
}: ClientDetailsDrawerProps) {
  const [client, setClient] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Assign Team states ──────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [savingAssignee, setSavingAssignee] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [upcomingTasks, setUpcomingTasks] = useState<TaskListItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  useEffect(() => {
    if (open && clientId && businessId) {
      fetchClientDetails();
      fetchStaff();
      fetchUpcomingTasks();
      // Reset assign panel state when drawer reopens
      setShowAssignPanel(false);
      setSelectedStaffId("");
      setAssignError("");
    }
  }, [open, clientId, businessId]);

  const fetchUpcomingTasks = async () => {
    if (!clientId || !businessId) return;
    try {
      setLoadingTasks(true);

      // Pass clientId so getTasks can filter server-side if API supports it
      const allTasks = await getTasks(businessId, clientId);

      const now = new Date();

      const upcoming = allTasks
        // ✅ PRIMARY FIX: only tasks belonging to this client
        .filter((t) => t.subject?.id === clientId)
        // not completed or cancelled
        .filter(
          (t) =>
            t.status !== "COMPLETED" &&
            t.status !== "CANCELLED" &&
            t.status !== "CLOSED",
        )
        // due date strictly in the future
        .filter((t) => t.dueDate && new Date(t.dueDate) > now)
        // nearest due date first
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );

      setUpcomingTasks(upcoming);
    } catch (err) {
      console.error("Failed to fetch upcoming tasks", err);
      setUpcomingTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchClientDetails = async () => {
    if (!clientId || !businessId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getSubjectById(businessId, clientId);
      setClient(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load client details",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff list when drawer opens
  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaff(businessId);
      setStaffList(data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId || !clientId) return;

    const selected = staffList.find((s) => s.id === selectedStaffId);
    if (!selected) return;

    const displayName =
      `${selected.firstName ?? ""} ${selected.lastName ?? ""}`.trim() ||
      selected.userName ||
      "";

    try {
      setSavingAssignee(true);
      setAssignError("");

      await updateSubject(businessId, clientId, {
        assignedTeam: {
          primaryAssignee: {
            userId: selected.id,
            name: displayName,
          },
        },
      });

      // Refresh client data to reflect the new assignee
      await fetchClientDetails();
      setShowAssignPanel(false);
      setSelectedStaffId("");
    } catch (err: unknown) {
      setAssignError(
        err instanceof Error ? err.message : "Failed to assign staff",
      );
    } finally {
      setSavingAssignee(false);
    }
  };

  // ── Sub-components (unchanged from original) ───────────────────────────────

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{ color: "primary.main", display: "flex", alignItems: "center" }}
        >
          {icon}
        </Box>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  const InfoRow = ({
    label,
    value,
    mono = false,
  }: {
    label: string;
    value?: string | null;
    mono?: boolean;
  }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontFamily: mono ? "monospace" : "inherit",
          color: value && value.trim() ? "text.primary" : "text.disabled",
        }}
      >
        {val(value)}
      </Typography>
    </Box>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {children}
    </Box>
  );

  function isComplianceService(
    item: ComplianceService,
  ): item is ComplianceService {
    return "internalTargetOffsetDays" in item;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 520 }, borderRadius: 0 },
      }}
    >
      {/* ── Header (unchanged) ───────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: "1px solid #F0F0F0",
          backgroundColor: "#fff",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              backgroundColor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon sx={{ fontSize: 20, color: "#2563EB" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize="1.05rem"
              lineHeight={1.2}
              color="#0F172A"
            >
              {loading
                ? "Loading..."
                : client?.profile?.displayName || "Client Details"}
            </Typography>
            {client?.profile?.businessName && (
              <Typography
                variant="caption"
                color="text.secondary"
                lineHeight={1.2}
              >
                {client.profile.businessName}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          {clientId && (
            <IconButton
              onClick={() => onEdit(clientId)}
              size="small"
              sx={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#EEEEEE" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#EEEEEE" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* ── Scrollable Content ────────────────────────────────────────────────── */}
      <Box
        sx={{ p: 3, overflowY: "auto", flex: 1, bgcolor: "background.default" }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {client && !loading && (
          <Stack spacing={3}>
            {/* Status + Tags (unchanged) */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={client.isActive ? "Active" : "Inactive"}
                color={client.isActive ? "success" : "default"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {client.metadata?.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ bgcolor: "action.selected", fontSize: "0.7rem" }}
                />
              ))}
            </Box>

            <Divider />

            {/* ── 1. Business Profile (unchanged) ─────────────────────────── */}
            {/* <Section
              title="Business Profile"
              icon={<BusinessIcon fontSize="small" />}
            >
              <Card>
                <InfoRow
                  label="Display Name"
                  value={client.profile?.displayName}
                />
                <InfoRow label="Legal Name" value={client.profile?.legalName} />
                <InfoRow
                  label="Business Name"
                  value={client.profile?.businessName}
                />
                <InfoRow
                  label="Constitution"
                  value={client.profile?.constitution}
                />
                <InfoRow label="Industry" value={client.profile?.industry} />
                {client.profile?.businessNature &&
                  client.profile.businessNature.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        Business Nature
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {client.profile.businessNature.map((nature, idx) => (
                          <Chip
                            key={idx}
                            label={nature}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
              </Card>
            </Section> */}

            {/* ── 2. Primary Contact — ENHANCED: added action buttons ──────── */}
            <Section
              title="Primary Contact"
              icon={<PersonIcon fontSize="small" />}
            >
              <Card>
                <InfoRow label="Name" value={client.primaryContact?.name} />

                {/* Phone row with action buttons — NEW */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Phone
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: client.primaryContact?.phone
                          ? "text.primary"
                          : "text.disabled",
                      }}
                    >
                      {val(client.primaryContact?.phone)}
                    </Typography>
                    {client.primaryContact?.phone && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Call">
                          <IconButton
                            size="small"
                            component="a"
                            href={`tel:${client.primaryContact.phone}`}
                            sx={{ color: "primary.main" }}
                          >
                            <PhoneIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="WhatsApp">
                          <IconButton
                            size="small"
                            component="a"
                            href={`https://wa.me/${client.primaryContact.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ color: "#25D366" }}
                          >
                            <WhatsAppIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Email row with action button — NEW */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Email
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: client.primaryContact?.email
                          ? "text.primary"
                          : "text.disabled",
                      }}
                    >
                      {val(client.primaryContact?.email)}
                    </Typography>
                    {client.primaryContact?.email && (
                      <Tooltip title="Send Email">
                        <IconButton
                          size="small"
                          component="a"
                          href={`mailto:${client.primaryContact.email}`}
                          sx={{ color: "primary.main" }}
                        >
                          <EmailIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Card>
            </Section>

            {/* ── 3. Business Identifiers — ENHANCED: always visible, consolidated ── */}
            {/* Mobile shows Company + GST No + PAN + TAN + Udyam all in one block */}
            <Section
              title="Business Identifiers"
              icon={<AssignmentIcon fontSize="small" />}
            >
              <Card>
                <Grid container spacing={2}>
                  {/* Company — from profile, always shown */}
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      label="Company"
                      value={
                        client.profile?.businessName ||
                        client.profile?.legalName
                      }
                    />
                  </Grid>
                  {/* GST No — from gst.gstins[0], always shown */}
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      label="GST No"
                      value={client.gst?.gstins?.[0]?.gstin ?? null}
                      mono
                    />
                  </Grid>
                  {/* PAN — always shown */}
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      label="PAN No"
                      value={client.identifiers?.pan ?? null}
                      mono
                    />
                  </Grid>
                  {/* TAN — always shown */}
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      label="TAN"
                      value={client.identifiers?.tan ?? null}
                      mono
                    />
                  </Grid>
                  {/* Udyam — always shown */}
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      label="Udyam Id"
                      value={client.identifiers?.udyam ?? null}
                      mono
                    />
                  </Grid>
                  {/* CIN + IEC — only when present */}
                  {client.identifiers?.cin && (
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        label="CIN"
                        value={client.identifiers.cin}
                        mono
                      />
                    </Grid>
                  )}
                  {client.identifiers?.iec && (
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        label="IEC"
                        value={client.identifiers.iec}
                        mono
                      />
                    </Grid>
                  )}
                </Grid>
              </Card>
            </Section>

            {/* ── 4. Upcoming Tasks — fetched from Tasks API, filtered + sorted ── */}
            <Section title="Upcoming" icon={<EventNoteIcon fontSize="small" />}>
              {loadingTasks ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : upcomingTasks.length > 0 ? (
                <Stack spacing={1.5}>
                  {upcomingTasks.map((task) => (
                    <Card key={task.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {task.title || "—"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due:{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                            {task.taskType ? ` · ${task.taskType}` : ""}
                          </Typography>
                        </Box>
                        <Chip
                          label={task.status}
                          size="small"
                          variant="outlined"
                          color={
                            task.status === "COMPLETED"
                              ? "success"
                              : task.status === "IN_PROGRESS"
                                ? "warning"
                                : "default"
                          }
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.68rem",
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ textAlign: "center", py: 1 }}
                  >
                    No upcoming tasks
                  </Typography>
                </Card>
              )}
            </Section>
            {/* ── 5. GST Registrations (unchanged — only when multiple GSTINs) */}
            {/*  {client.gst?.gstins && client.gst.gstins.length > 0 && (
              <Section
                title="GST Registrations"
                icon={<GstIcon fontSize="small" />}
              >
                <Stack spacing={1.5}>
                  {client.gst.gstins.map((g, idx) => (
                    <Card key={idx}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          mb: 1.5,
                        }}
                      >
                        {g.gstin}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            State
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {val(g.state)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Type
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {val(g.registrationType)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }} sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            Status
                          </Typography>
                          <Chip
                            label={g.status}
                            size="small"
                            color={
                              g.status === "ACTIVE" ? "success" : "default"
                            }
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: "0.68rem" }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </Section>
            )} */}

            {/* ── 6. Addresses — ENHANCED: always visible with empty state ─── */}
            <Section title="Addresses" icon={<LocationIcon fontSize="small" />}>
              {client.addresses && client.addresses.length > 0 ? (
                <Stack spacing={1.5}>
                  {client.addresses.map((address, idx) => (
                    <Card key={idx}>
                      <Chip
                        label={address.type}
                        size="small"
                        variant="outlined"
                        sx={{
                          mb: 1.5,
                          fontWeight: 600,
                          fontSize: "0.68rem",
                          borderColor: "divider",
                        }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {val(address.line1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[address.city, address.state, address.pincode]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              ) : (
                // NEW: empty state matching mobile "No address on file"
                <Card>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ textAlign: "center", py: 1, fontStyle: "italic" }}
                  >
                    No address on file
                  </Typography>
                </Card>
              )}
            </Section>

            {/* ── 7. Additional Contacts (unchanged) ──────────────────────── */}
            {/* {client.contacts && client.contacts.length > 0 && (
              <Section
                title="Additional Contacts"
                icon={<PersonIcon fontSize="small" />}
              >
                <Stack spacing={1.5}>
                  {client.contacts.map((contact, idx) => (
                    <Card key={idx}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {val(contact.name)}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Chip
                            label={contact.role}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.68rem", borderColor: "divider" }}
                          />
                          {contact.isPrimary && (
                            <Chip
                              label="Primary"
                              size="small"
                              color="primary"
                              sx={{ fontSize: "0.68rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                      {contact.email && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {contact.email}
                        </Typography>
                      )}
                      {contact.phone && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {contact.phone}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Section>
            )} */}

            {/* ── 8. Compliance Profile — ENHANCED: always shows all 5 services ── */}
            <Section
              title="Compliance Profile"
              icon={<AssignmentIcon fontSize="small" />}
            >
              <Stack spacing={1}>
                {COMPLIANCE_KEYS.map(({ key, label, icon }) => {
                  const profile = client.metadata?.complianceProfile?.[key];
                  const isEnabled = profile?.enabled ?? false;
                  return (
                    <Accordion
                      key={key}
                      disableGutters
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px !important",
                        boxShadow: "none",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2, py: 0.5 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            flex: 1,
                            mr: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.9rem",
                            }}
                          >
                            {icon}
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={isEnabled ? "success.main" : "text.disabled"}
                            fontWeight={600}
                            sx={{ ml: "auto" }}
                          >
                            {/* NEW: "Not configured" label for disabled services */}
                            {isEnabled ? "Enabled" : "Not configured"}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Divider sx={{ mb: 1.5 }} />
                        {isEnabled && profile ? (
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 6 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Frequency
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {profile.frequency || "—"}
                              </Typography>
                            </Grid>
                            {isComplianceService(profile) &&
                              profile.internalTargetOffsetDays != null && (
                                <Grid size={{ xs: 6 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Internal Offset
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {profile.internalTargetOffsetDays} days
                                  </Typography>
                                </Grid>
                              )}
                            {isComplianceService(profile) &&
                              profile.customDueDay != null &&
                              profile.customDueDay !== 0 && (
                                <Grid size={{ xs: 6 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Custom Due Day
                                  </Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {profile.customDueDay}
                                    {profile.customDueMonth
                                      ? ` ${profile.customDueMonth}`
                                      : ""}
                                  </Typography>
                                </Grid>
                              )}
                          </Grid>
                        ) : (
                          // NEW: empty state inside the accordion for unconfigured services
                          <Typography
                            variant="body2"
                            color="text.disabled"
                            fontStyle="italic"
                          >
                            This compliance service has not been configured for
                            this client.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </Section>

            {/* ── 9. Assigned Team — ENHANCED: "Assign" CTA when unassigned ── */}
            {/* ── Assigned Team ────────────────────────────────────────────────── */}
            <Section
              title="Assigned Team"
              icon={<GroupIcon fontSize="small" />}
            >
              {client.assignedTeam?.primaryAssignee?.name &&
              !showAssignPanel ? (
                // ── Assigned state ───────────────────────────────────────────────
                <Card>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: "primary.light",
                        color: "primary.dark",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      {client.assignedTeam.primaryAssignee.name
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {client.assignedTeam.primaryAssignee.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primary Assignee
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.68rem" }}
                      />
                      {/* Allow reassigning */}
                      <IconButton
                        size="small"
                        onClick={() => {
                          setShowAssignPanel(true);
                          setSelectedStaffId("");
                          setAssignError("");
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ) : (
                // ── Unassigned state OR reassign panel ───────────────────────────
                <Card>
                  {!showAssignPanel ? (
                    // "Assign Employee" trigger
                    <Box
                      onClick={() => setShowAssignPanel(true)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        color: "primary.main",
                        py: 0.5,
                        width: "fit-content",
                        "&:hover": { opacity: 0.8 },
                      }}
                    >
                      <PersonAddIcon fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        Assign Employee
                      </Typography>
                    </Box>
                  ) : (
                    // Inline staff selection panel
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ mb: 1.5 }}
                      >
                        Select Staff Member
                      </Typography>

                      {loadingStaff ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 1,
                          }}
                        >
                          <CircularProgress size={16} />
                          <Typography variant="caption" color="text.secondary">
                            Loading staff...
                          </Typography>
                        </Box>
                      ) : (
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          placeholder="Select a staff member"
                          sx={{ mb: 1.5 }}
                        >
                          <MenuItem value="" disabled>
                            Select a staff member
                          </MenuItem>
                          {staffList.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.firstName && s.lastName
                                ? `${s.firstName} ${s.lastName}`
                                : (s.userName ?? "Unnamed")}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}

                      {assignError && (
                        <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }}>
                          {assignError}
                        </Alert>
                      )}

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleAssignStaff}
                          disabled={!selectedStaffId || savingAssignee}
                          sx={{ minWidth: 80 }}
                        >
                          {savingAssignee ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Assign"
                          )}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setShowAssignPanel(false);
                            setSelectedStaffId("");
                            setAssignError("");
                          }}
                          disabled={savingAssignee}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Card>
              )}
            </Section>

            {/* ── 10. Notes — ENHANCED: always visible with empty state ────── */}
            <Section title="Notes" icon={<AssignmentIcon fontSize="small" />}>
              {client.notes && client.notes.length > 0 ? (
                <Stack spacing={1.5}>
                  {client.notes.map((note, idx) => (
                    <Card key={idx}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {note.text}
                      </Typography>
                      {note.createdBy && (
                        <Typography variant="caption" color="text.secondary">
                          By {note.createdBy.name || "Unknown"}
                          {note.createdAt
                            ? ` · ${new Date(note.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}`
                            : ""}
                        </Typography>
                      )}
                    </Card>
                  ))}
                </Stack>
              ) : (
                // NEW: empty state matching mobile "No notes available. Tap edit to add notes."
                <Card>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ textAlign: "center", py: 1, fontStyle: "italic" }}
                  >
                    No notes available. Click edit to add notes.
                  </Typography>
                </Card>
              )}
            </Section>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
