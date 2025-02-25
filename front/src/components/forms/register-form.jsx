"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api"; // Import de la fonction API pour l'inscription
import { toast } from "sonner"; // Pour les notifications toast
import { motion, AnimatePresence } from "framer-motion"; // Pour animer les erreurs
import { XCircle } from "lucide-react"; // Icône d'erreur

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 🔹 Définir le schéma de validation avec Zod
const registerSchema = z
  .object({
    first_name: z.string().min(2, "Le prénom est requis"),
    last_name: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Format d'email invalide"),
    phone_country_code: z.string().min(2, "Veuillez sélectionner un indicatif"),
    phone_number: z.string().min(8, "Numéro de téléphone invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre")
      .regex(/[@$!%*?&]/, "Doit contenir au moins un caractère spécial"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

export function RegisterForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_country_code: data.phone_country_code,
        phone_number: data.phone_number,
        password: data.password,
      };

      await registerUser(userData);
      toast.success("Inscription réussie ! Un email de vérification vous a été envoyé.");
      console.log("Registration Successful");
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue lors de l'inscription.");
      console.error("Registration Failed:", error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour afficher une icône d'erreur animée
  const ErrorIcon = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -5 }}
        transition={{ duration: 0.3 }}
        className="ml-2"
      >
        <XCircle className="text-red-500 w-4 h-4" />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>S'inscrire avec Apple ou Google</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  {/* Bouton d'inscription avec Apple */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  S'inscrire avec Apple
                </Button>
                <Button variant="outline" className="w-full">
                  {/* Bouton d'inscription avec Google */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  S'inscrire avec Google
                </Button>
              </div>

              <div className="relative text-center text-sm mb-6 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Ou s'inscrire ici
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="first_name">Prénom</Label>
                  <AnimatePresence>
                    {errors.first_name && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                      <XCircle className="text-red-500 w-4 h-4" />
                    </motion.div>}
                  </AnimatePresence>
                </div>
                <Input id="first_name" {...register("first_name")} />
              </div>

              {/* Last Name */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="last_name">Nom</Label>
                  <AnimatePresence>
                    {errors.last_name && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                      <XCircle className="text-red-500 w-4 h-4" />
                    </motion.div>}
                  </AnimatePresence>
                </div>
                <Input id="last_name" {...register("last_name")} />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2 mt-4">
              <div className="flex items-center">
                <Label htmlFor="email">Email</Label>
                <AnimatePresence>
                  {errors.email && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                    <XCircle className="text-red-500 w-4 h-4" />
                  </motion.div>}
                </AnimatePresence>
              </div>
              <Input id="email" type="email" {...register("email")} />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-8 gap-3 mt-4">
              <div className="grid col-span-3 gap-2">
                <div className="flex items-center">
                  <Label htmlFor="phone_country_code">Indicatif</Label>
                  <AnimatePresence>
                    {errors.phone_country_code && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                      <XCircle className="text-red-500 w-4 h-4" />
                    </motion.div>}
                  </AnimatePresence>
                </div>
                <Select onValueChange={(val) => setValue("phone_country_code", val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="🇫🇷 +33" defaultValue="+33" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid col-span-5 gap-2">
                <div className="flex items-center">
                  <Label htmlFor="phone_number">Numéro de téléphone</Label>
                  <AnimatePresence>
                    {errors.phone_number && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                      <XCircle className="text-red-500 w-4 h-4" />
                    </motion.div>}
                  </AnimatePresence>
                </div>
                <Input id="phone_number" {...register("phone_number")} />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-2 mt-4">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <AnimatePresence>
                  {errors.password && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                    <XCircle className="text-red-500 w-4 h-4" />
                  </motion.div>}
                </AnimatePresence>
              </div>
              <Input id="password" type="password" {...register("password")} />
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2 mt-4">
              <div className="flex items-center">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                <AnimatePresence>
                  {errors.confirm_password && <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }} className="ml-2">
                    <XCircle className="text-red-500 w-4 h-4" />
                  </motion.div>}
                </AnimatePresence>
              </div>
              <Input id="confirm_password" type="password" {...register("confirm_password")} />
            </div>

            {/* Bouton de soumission */}
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm">
        Vous avez déjà un compte?{" "}
        <a href="/login" className="underline underline-offset-4">
          Se connecter
        </a>
      </div>

      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 ">
        En vous inscrivant, vous confirmez avoir lu et accepté nos{" "}
        <a href="/terms-of-service" className="hover:text-primary">
          Conditions Générales d’Utilisation
        </a>{" "}
        ainsi que notre{" "}
        <a href="/privacy-policy" className="hover:text-primary">
          Politique de Confidentialité
        </a>.
      </div>
    </div>
  );
}