"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Users,
  LoaderCircle,
  AlertCircle,
  X,
} from "lucide-react";

import { useWorkspace } from "@/context/WorkspaceContext";
import AddStaffDialog from "@/components/staff/AddStaffDialog";
import StaffTable from "@/components/staff/StaffTable";
import StaffFilter from "@/components/staff/StaffFilter";
import StaffDetailsDrawer from "@/components/staff/StaffDetailsDrawer";
import EditStaffDialog from "@/components/staff/EditStaffDialog";

import { getStaff, deleteStaff } from "@/services/staffService";
import { StaffMember, StaffDetails } from "@/types/staff.types";
import { StaffStatusFilter } from "@/constants/staffConstants";

export default function StaffPage() {
  const { businessId } = useWorkspace();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedMembershipId, setSelectedMembershipId] =
    useState<string | null>(null);

  const [editStaffData, setEditStaffData] =
    useState<StaffDetails | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StaffStatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchStaff = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getStaff(businessId);
      setStaff(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Fetch staff error:", err);
      setStaff([]);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load staff members"
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchStaff();
    }
  }, [businessId, fetchStaff]);

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return [];

    let filtered = [...staff];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (member) =>
          member.userName?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.phone?.includes(query)
      );
    }

    if (statusFilter === "ACTIVE") {
      filtered = filtered.filter(
        (member) => member.status === "ACTIVE"
      );
    }

    if (statusFilter === "INACTIVE") {
      filtered = filtered.filter(
        (member) => member.status === "INACTIVE"
      );
    }

    if (roleFilter.trim()) {
      filtered = filtered.filter((member) =>
        member.roles?.[0]
          ?.toLowerCase()
          .includes(roleFilter.toLowerCase())
      );
    }

    return filtered;
  }, [staff, searchQuery, statusFilter, roleFilter]);

  const handleView = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setDrawerOpen(true);
  };

  const handleEdit = (membershipId: string) => {
    const member = staff.find(
      (item) => item.id === membershipId
    );

    if (member) {
      const details: StaffDetails = {
        id: member.id,
        userId: member.userId,
        userName: member.userName,
        status: member.status,
        role: member.role ?? "",
        avatarUrl: null,
        lastActiveAt: null,
        contact: {
          email: member.email,
          phone: member.phone,
          phoneMasked: member.phoneMasked,
          firstName: member.firstName ?? "",
          lastName: member.lastName ?? "",
        },
      };

      setEditStaffData(details);
    }

    setSelectedMembershipId(membershipId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };

  const handleDelete = async (
    membershipId: string,
    staffName: string
  ) => {
    if (!businessId) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${staffName}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteStaff(businessId, membershipId);

      setStaff((previous) =>
        previous.filter((member) => member.id !== membershipId)
      );
    } catch (err: unknown) {
      console.error("Delete staff error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove staff member"
      );
    }
  };

  if (!businessId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle
          className="h-8 w-8 animate-spin text-primary"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/50 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-base-content">
                    Staff Members
                  </h1>
                  <p className="mt-1 text-sm text-base-content/60">
                    Manage your team and assign roles
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={() => setOpenAddDialog(true)}
            >
              <Plus className="h-5 w-5" />
              Add Staff
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="alert alert-error flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
            <StaffFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              roleFilter={roleFilter}
              onRoleChange={setRoleFilter}
            />
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/60">
                Showing{" "}
                <span className="font-semibold text-base-content">
                  {filteredStaff.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-base-content">
                  {staff.length}
                </span>{" "}
                staff members
              </p>
            </div>
          )}

          {/* Staff Table */}
          <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <StaffTable
              staff={filteredStaff}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Add Staff Dialog */}
          <AddStaffDialog
            open={openAddDialog}
            onClose={() => setOpenAddDialog(false)}
            businessId={businessId}
            onSuccess={fetchStaff}
          />

          {/* Staff Details Drawer */}
          <StaffDetailsDrawer
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedMembershipId(null);
            }}
            membershipId={selectedMembershipId}
            businessId={businessId}
            onEdit={handleEdit}
          />

          {/* Edit Staff Dialog */}
          <EditStaffDialog
            open={openEditDialog}
            onClose={() => {
              setOpenEditDialog(false);
              setSelectedMembershipId(null);
              setEditStaffData(null);
            }}
            membershipId={selectedMembershipId}
            businessId={businessId}
            onSuccess={fetchStaff}
            staffData={editStaffData}
          />

        </div>
      </div>
    </div>
  );
}
