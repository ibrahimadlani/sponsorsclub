"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "@/lib/api"; // Import the confirm API function

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 🔹 Define Zod validation schema for confirming the password reset with two password fields
const resetPasswordConfirmSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters long"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export function ResetPasswordConfirmForm({ className, ...props }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordConfirmSchema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const onSubmit = async (data) => {
    if (!token) {
      setConfirmationMessage("Reset token is missing from the URL.");
      return;
    }
    setLoading(true);
    try {
      const response = await confirmPasswordReset(token, data.new_password);
      console.log("Password reset confirmed:", response);
      setConfirmationMessage("Your password has been reset successfully. Please login with your new password.");
      // Optionally redirect after a delay:
      // router.push("/login");
    } catch (error) {
      console.error("Password reset confirmation failed:", error.message || "Error");
      setConfirmationMessage("Failed to reset password. Please try again.");
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
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* New Password Input */}
              <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...register("new_password")}
                  placeholder="Enter new password"
                />
                {errors.new_password && (
                  <p className="text-red-500 text-sm">{errors.new_password.message}</p>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...register("confirm_password")}
                  placeholder="Confirm new password"
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting Password..." : "Reset Password"}
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