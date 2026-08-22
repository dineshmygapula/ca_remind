"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { SubHeader } from "@/components/layout/SubHeader";
import { RemindersView } from "@/components/modules/RemindersView";
import { TasksView } from "@/components/modules/TasksView";
import { GenericModuleView } from "@/components/modules/GenericModuleView";
import { NavTab, ModuleTabMeta } from "@/types";

const TAB_META: Record<NavTab, ModuleTabMeta> = {
  Dashboard: {
    subtitle: "Overview of compliance deadlines, pending filings, and system activity",
    action: "New Overview",
  },
  Tasks: {
    subtitle: "View, assign, and track client CA audit & GST tax tasks",
    action: "Create Task",
  },
  Taskrules: {
    subtitle: "Automated recurrence rules, statutory trigger dates, and schedules",
    action: "Add Rule",
  },
  Reminders: {
    subtitle: "Manage and monitor all automated reminder notifications and SMS/Email alerts",
    action: "Create Reminder",
  },
  Clients: {
    subtitle: "Client master directory, PAN/GSTIN profiles, and contact details",
    action: "Add Client",
  },
  Staff: {
    subtitle: "Staff team members, audit roles, and module access permissions",
    action: "Invite Staff",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("Reminders");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeMeta = TAB_META[activeTab];

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300">
      {/* Main Layout Header Component */}
      {/* <Header activeTab={activeTab} onSelectTab={setActiveTab} /> */}

      {/* SubHeader Action Toolbar Component */}
      <SubHeader
        activeTab={activeTab}
        subtitle={activeMeta.subtitle}
        actionText={activeMeta.action}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Active Module View */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {activeTab === "Reminders" && <RemindersView />}
        {activeTab === "Tasks" && <TasksView />}
        {activeTab !== "Reminders" && activeTab !== "Tasks" && (
          <GenericModuleView activeTab={activeTab} subtitle={activeMeta.subtitle} />
        )}
      </main>
    </div>
  );
}
