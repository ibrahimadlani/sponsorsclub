"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { resetPassword } from "@/lib/api"; // Import your API function
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 🔹 Define Zod validation schema for email only
const resetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export function ResetPasswordForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetRequestSchema),
  });

  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Call your API function to request a password reset email
      await resetPassword(data.email);
      // Display confirmation message (even if the email doesn't exist, for security reasons)
      setConfirmationMessage("If an account with that email exists, a reset link has been sent.");
    } catch (error) {
      console.error("Password reset request failed:", error.message || "Error");
      // Show the same confirmation to avoid disclosing registration status
      setConfirmationMessage("If an account with that email exists, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="m@example.com" />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
          {confirmationMessage && (
            <p className="mt-4 text-center text-green-600 text-sm">{confirmationMessage}</p>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </div>
  );
}