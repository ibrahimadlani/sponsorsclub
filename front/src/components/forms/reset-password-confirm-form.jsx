"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"; // Import Sonner for toast notifications
import { confirmPasswordReset } from "@/lib/api"; // Import the confirm API function

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";

// 🔹 Define Zod validation schema for confirming the password reset
const resetPasswordConfirmSchema = z
  .object({
    new_password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirm_password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm_password"],
  });

function ResetPasswordConfirmFormContent({ className, ...props }) {
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

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Le jeton de réinitialisation est manquant.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(token, data.new_password);

      // ✅ Show success toast & redirect to login
      toast.success("Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error("Échec de la réinitialisation du mot de passe:", error.message || "Erreur");
      toast.error("Échec de la réinitialisation du mot de passe. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Réinitialisation du mot de passe</CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* New Password Input */}
              <div className="grid gap-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  type="password"
                  {...register("new_password")}
                  placeholder="Entrez un nouveau mot de passe"
                />
                {errors.new_password && (
                  <p className="text-red-500 text-sm">{errors.new_password.message}</p>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...register("confirm_password")}
                  placeholder="Confirmez votre mot de passe"
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm">
        Vous vous souvenez de votre mot de passe ?{" "}
        <a href="/login" className="underline underline-offset-4">
          Se connecter
        </a>
      </div>
    </div>
  );
}

export function ResetPasswordConfirmForm(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordConfirmFormContent {...props} />
    </Suspense>
  );
}