"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AddressCombobox from "@/components/address-combobox";
import { fetchUserProfile, updateProfile } from "@/lib/api";

const profileFormSchema = z.object({
  first_name: z.string().min(2, { message: "Prénom trop court." }).max(100),
  last_name: z.string().min(2, { message: "Nom trop court." }).max(100),
  email: z.string().email({ message: "Email invalide." }),
  phone_country_code: z.string().min(1, { message: "Indicatif requis." }).max(5),
  phone_number: z.string().min(6, { message: "Numéro invalide." }).max(20),
  bio: z.string().max(160).optional().or(z.literal("")).default(""),
  raw_address: z.string().max(255).optional().or(z.literal("")).default(""),
});

export function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_country_code: "+33",
      phone_number: "",
      bio: "",
      raw_address: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await fetchUserProfile();
        if (!mounted) return;
        form.reset({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone_country_code: user.phone_country_code || "+33",
          phone_number: user.phone_number || "",
          bio: user.bio || "",
          raw_address: "",
        });
        setAddressText(user.address || "");
        setOriginalEmail(user.email || "");
      } catch (e) {
        toast.error("Impossible de charger votre profil.");
      }
    })();
    return () => { mounted = false; };
  }, [form]);

  async function onSubmit(data) {
    setLoading(true);
    try {
      const emailChanged = originalEmail && data.email && data.email !== originalEmail;
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_country_code: data.phone_country_code,
        phone_number: data.phone_number,
        bio: data.bio || "",
        // Le backend vérifiera l'adresse via Google et mettra à jour Address si reconnue
        ...(data.raw_address ? { raw_address: data.raw_address } : {}),
      };
      await updateProfile(undefined, payload);
      // Rafraîchir l'adresse vérifiée
      const updated = await fetchUserProfile();
      setAddressText(updated.address || "");
      // Nettoyer le champ adresse brute pour éviter une nouvelle vérification inutile
      form.setValue("raw_address", "");
      if (emailChanged) {
        toast.success(`Nous vous avons envoyé un e‑mail de vérification à ${data.email}.`);
        setOriginalEmail(data.email);
      } else {
        toast.success("Profil mis à jour.");
      }
    } catch (e) {
      toast.error(e?.message || "Échec de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse e‑mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="votre@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="phone_country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indicatif</FormLabel>
                <FormControl>
                  <Input placeholder="+33" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Numéro</FormLabel>
                <FormControl>
                  <Input placeholder="6XXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez-vous en quelques mots" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Adresse (vérifiée via Google côté backend) */}
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="raw_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <AddressCombobox
                    id="raw_address"
                    placeholder="Saisissez votre adresse complète (numéro, rue, ville)"
                    value={field.value}
                    onChange={field.onChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {addressText ? (
            <p className="text-sm text-muted-foreground">
              Adresse enregistrée: <span className="font-medium text-foreground">{addressText}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune adresse enregistrée pour l’instant.</p>
          )}
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Mettre à jour"}</Button>
      </form>
    </Form>
  );
}
