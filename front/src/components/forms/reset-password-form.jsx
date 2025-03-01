"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner"; // Import Sonner for toast notifications
import { resetPassword } from "@/lib/api"; // Import your API function
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 🔹 Define Zod validation schema for email
const resetRequestSchema = z.object({
  email: z.string().email("Format d'email invalide"),
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Call API to request password reset
      await resetPassword(data.email);

      // ✅ Show a success toast notification
      toast.success("Un email de réinitialisation a été envoyé !");
    } catch (error) {
      console.error("Échec de la demande de réinitialisation:", error.message || "Erreur");

      // ✅ Always show the same toast message for security reasons
      toast.success("Un email de réinitialisation a été envoyé !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Réinitialiser votre mot de passe</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
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
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm">
        Vous connaissez votre mot de passe ?{" "}
        <a href="/login" className="underline underline-offset-4">
          Se connecter ici
        </a>
      </div>
    </div>
  );
}