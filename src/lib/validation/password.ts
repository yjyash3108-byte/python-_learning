import { z } from "zod";

const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/;

export const passwordStrengthSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long (max 72 characters)")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/\d/, "Include at least one number")
  .regex(specialCharRegex, "Include at least one special character");

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Reset link is invalid or expired"),
    password: passwordStrengthSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { id: "lower", label: "One lowercase letter", met: /[a-z]/.test(password) },
    { id: "number", label: "One number", met: /\d/.test(password) },
    { id: "special", label: "One special character", met: specialCharRegex.test(password) },
  ];
}

export function getPasswordStrengthScore(password: string): number {
  const requirements = getPasswordRequirements(password);
  const met = requirements.filter((r) => r.met).length;
  if (!password) return 0;
  if (met <= 2) return 1;
  if (met <= 4) return 2;
  return 3;
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return "";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    default:
      return "Strong";
  }
}
