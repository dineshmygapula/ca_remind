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