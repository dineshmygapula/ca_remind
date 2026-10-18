import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email address is required")
        .email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional().default(false),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const resetEmailSchema = z.object({
    email: z
        .string()
        .min(1, "Email address is required")
        .email("Please enter a valid email address"),
});
export type ResetEmailForm = z.infer<typeof resetEmailSchema>;

export const signupSchema = z
    .object({
        firstName: z.string().trim().min(2, "First Name must be at least 2 characters"),
        lastName: z.string().trim().min(1, "Last Name is required"),
        email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain an uppercase letter")
            .regex(/[a-z]/, "Password must contain a lowercase letter")
            .regex(/[0-9]/, "Password must contain a number")
            .regex(/[!@#$%^&*]/, "Password must contain a special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"], // attaches the error to confirmPassword field specifically
    });

export type SignupForm = z.infer<typeof signupSchema>;

export const taskFormSchema = z
    .object({
        subjectId: z.string().min(1, "Please select a client"),
        taskDefinitionId: z.string().optional().default(""),
        taskType: z.string().min(1, "Please select a task type"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        frequency: z.string().min(1, "Please select a frequency").default("one_time"),
        dueDate: z.string().min(1, "Please select a due date"),
assignedStaffId: z.string().min(1, "Please select an assigned staff member"),
        notes: z.string().optional().default(""),
        remindersEnabled: z.boolean().default(true),
        templateId: z.string().optional().default(""),
        deliveryChannel: z.enum(["EMAIL", "WHATSAPP", "SMS"]).default("EMAIL"),
        daysBeforeDueDate: z.coerce.number().default(1),
    })
    .refine(
        (data) => !data.remindersEnabled || Boolean(data.templateId?.trim()),
        {
            message: "Please select a message template for reminders",
            path: ["templateId"],
        }
    );

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskDefinitionSchema = z
    .object({
        name: z.string().trim().min(1, "Rule name is required"),
        taskType: z.string().trim().min(1, "Task type is required"),
        description: z.string().max(240, "Description cannot exceed 240 characters").optional().default(""),
        category: z.string().optional().default(""),
        subjectType: z.string().min(1, "Applies to is required").default("CLIENT"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        schedulePattern: z
            .enum(["monthly", "quarterly", "half_yearly", "yearly", "one_time"])
            .default("monthly"),
        monthlyDay: z.coerce.number().min(1).max(31).default(10),
        q1Month: z.coerce.number().min(1).max(12).default(4),
        q1Day: z.coerce.number().min(1).max(31).default(30),
        q2Month: z.coerce.number().min(1).max(12).default(7),
        q2Day: z.coerce.number().min(1).max(31).default(31),
        q3Month: z.coerce.number().min(1).max(12).default(10),
        q3Day: z.coerce.number().min(1).max(31).default(31),
        q4Month: z.coerce.number().min(1).max(12).default(1),
        q4Day: z.coerce.number().min(1).max(31).default(31),
        h1Month: z.coerce.number().min(1).max(12).default(4),
        h1Day: z.coerce.number().min(1).max(31).default(30),
        h2Month: z.coerce.number().min(1).max(12).default(10),
        h2Day: z.coerce.number().min(1).max(31).default(31),
        yearlyMonth: z.coerce.number().min(1).max(12).default(7),
        yearlyDay: z.coerce.number().min(1).max(31).default(31),
        oneTimeDueDate: z.string().optional().default(""),
        targetOffsetDays: z.coerce.number().default(0),
        isActive: z.boolean().default(true),
        autoCreateTasks: z.boolean().default(true),
        autoCreateReminders: z.boolean().default(true),
    })
    .refine(
        (data) => data.schedulePattern !== "one_time" || Boolean(data.oneTimeDueDate?.trim()),
        {
            message: "Due date is required for one-time tasks",
            path: ["oneTimeDueDate"],
        }
    );

export type TaskDefinitionFormValues = z.infer<typeof taskDefinitionSchema>;

export const staffFormSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    userName: z.string().trim().optional().default(""),
    email: z
        .string()
        .trim()
        .min(1, "Email address is required")
        .email("Invalid email address format"),
    phone: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .refine(
            (val) => val.replace(/[^0-9]/g, "").length >= 10,
            "Please enter a valid 10-digit mobile number"
        ),
    role: z.string().min(1, "Please select a role").default("Accountant"),
    department: z.string().optional().default(""),
    sendInvite: z.boolean().default(true),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

export const templateFormSchema = z
    .object({
        name: z.string().trim().min(1, "Template name is required"),
        reminderType: z.string().min(1, "Please select a reminder type").default("GST"),
        businessCategory: z.string().min(1, "Please select a business category").default("COMPLIANCE"),
        isActive: z.boolean().default(true),
        channels: z
            .array(z.enum(["email", "whatsapp", "sms", "in_app"]))
            .min(1, "Select at least one delivery channel"),
        selectedPlaceholders: z.array(z.string()).default([]),
        emailSubject: z.string().optional().default(""),
        emailBody: z.string().optional().default(""),
        whatsappBody: z.string().optional().default(""),
        smsBody: z.string().optional().default(""),
        inAppBody: z.string().optional().default(""),
    })
    .refine(
        (data) => !data.channels.includes("email") || Boolean(data.emailSubject?.trim()),
        {
            message: "Email subject is required for email delivery",
            path: ["emailSubject"],
        }
    );

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

export const clientFormSchema = z.object({
    fullName: z.string().trim().min(1, "Please enter full name"),
    phone: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .refine(
            (val) => val.replace(/[^0-9]/g, "").length === 10,
            "Phone number must be exactly 10 digits"
        ),
    email: z
        .string()
        .trim()
        .min(1, "Please enter email address")
        .email("Please enter a valid email address"),
    companyName: z.string().trim().min(1, "Please enter business name"),

    // Identifiers
    pan: z.string().trim().max(10, "PAN cannot exceed 10 characters").optional().default(""),
    gstin: z.string().trim().max(15, "GSTIN cannot exceed 15 characters").optional().default(""),
    tan: z.string().trim().max(10, "TAN cannot exceed 10 characters").optional().default(""),

    // Compliance Services
    complianceGstEnabled: z.boolean().default(false),
    complianceGstFrequency: z.string().default("QUARTERLY"),
    complianceTdsEnabled: z.boolean().default(false),
    complianceTdsFrequency: z.string().default("QUARTERLY"),
    complianceItrEnabled: z.boolean().default(false),
    complianceItrFrequency: z.string().default("ANNUAL"),
    complianceRocEnabled: z.boolean().default(false),
    complianceRocFrequency: z.string().default("ANNUAL"),
    complianceMsmeEnabled: z.boolean().default(false),
    complianceMsmeFrequency: z.string().default("ANNUAL"),

    // Addresses
    addressType: z.enum(["REGISTERED", "COMMUNICATION", "BRANCH"]).default("REGISTERED"),
    line1: z.string().trim().optional().default(""),
    city: z.string().trim().optional().default(""),
    state: z.string().trim().optional().default(""),
    pincode: z
        .string()
        .trim()
        .refine((val) => !val || /^\d{6}$/.test(val), "Pincode must be 6 digits")
        .optional()
        .default(""),

    // Notification Preferences
    notifChannels: z.array(z.string()).default(["WHATSAPP", "EMAIL"]),

    // Assign Team
    assignedStaffId: z.string().optional().default(""),

    // Internal Notes
    notes: z.string().optional().default(""),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;


