export type NavTab = "Dashboard" | "Tasks" | "Taskrules" | "Reminders" | "Clients" | "Staff";

export interface ModuleTabMeta {
  subtitle: string;
  action: string;
}

export type { TaskStatus, TaskSource, TaskPriority, TaskListItem, TaskResponse, TasksListResponse } from "./task.types";
export type { Subject, SubjectProfile, SubjectListItem, CreateSubjectDto, UpdateSubjectDto } from "./subject";
export type { UserProfile } from "./user";
export type { BusinessProfile } from "./business";
export type { Organization } from "./organizations";
export type { Reminder, ReminderDetail, RemindersListResponse } from "./reminders.types";
export type { StaffMember } from "./staff.types";
export type { MessageTemplate, ChannelType, Templates } from "./messageTemplate.types";
export type { TaskDefinition } from "./taskDefinition.types";
export type { V2ReminderDefinition } from "./v2ReminderDefinition.types";
