"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { changePassword } from "@/lib/api";

const schema = z.object({
  old_password: z.string().min(6, "Mot de passe requis"),
  new_password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[0-9]/, "Un chiffre requis")
    .regex(/[@$!%*?&]/, "Un caractère spécial requis"),
  confirm_new_password: z.string(),
}).refine((d) => d.new_password === d.confirm_new_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_new_password"],
});

export default function ChangePasswordForm() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { old_password: "", new_password: "", confirm_new_password: "" } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await changePassword(data.old_password, data.new_password, data.confirm_new_password);
      toast.success("Mot de passe mis à jour.");
      form.reset({ old_password: "", new_password: "", confirm_new_password: "" });
    } catch (e) {
      toast.error(e?.message || "Échec du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="old_password" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Ancien mot de passe</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="new_password" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Nouveau mot de passe</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="confirm_new_password" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Changer le mot de passe"}</Button>
      </form>
    </Form>
  );
}
