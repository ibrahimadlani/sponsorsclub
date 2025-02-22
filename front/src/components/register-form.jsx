"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api"; // Import API function

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 🔹 Define Zod validation schema
const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone_country_code: z.string().min(2, "Select a country code"),
    phone_number: z.string().min(8, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[@$!%*?&]/, "Must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
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

      console.log("Registration Successful: A verification email has been sent.");

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration Failed:", error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" {...register("first_name")} />
                {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
              </div>

              {/* Last Name */}
              <div className="grid gap-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2 mt-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-8 gap-3 mt-4 ">
              <div className="grid col-span-3 gap-2">
                <Label htmlFor="phone_country_code">Indicatif</Label>
                <Select onValueChange={(val) => setValue("phone_country_code", val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="🇫🇷 +33" defaultValue="+33" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                    <SelectItem value="+1">🇺🇸  +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid col-span-5 gap-2">
                <Label htmlFor="phone_number">Numéro de téléphone</Label>
                <Input id="phone_number" {...register("phone_number")} />

              </div>
            </div>
            {errors.phone_country_code && <p className="text-red-500 text-sm">{errors.phone_country_code.message}</p>}
            {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}
            {/* Passwords */}
            <div className="grid gap-2 mt-4">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2 mt-4">
              <Label htmlFor="confirm_password">Confirmer le mot de passe </Label>
              <Input id="confirm_password" type="password" {...register("confirm_password")} />
              {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>}
            </div>

            {/* Submit Button */}
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
        En vous inscrivant, vous confirmez avoir lu et accepté nos <a href="/terms-of-service" className="hover:text-primary">Conditions Générales d’Utilisation</a> ainsi que notre <a href="/privacy-policy" className="hover:text-primary">Politique de Confidentialité</a>.
      </div>
    </div>
  );
}