"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/userApi"; // Mise à jour de l'import depuis le module userApi
import { toast } from "sonner"; // Import de sonner pour les notifications
import { motion, AnimatePresence } from "framer-motion"; // Pour animer les erreurs
import { Loader, XCircle } from "lucide-react"; // Icones Lucide
import { Suspense } from "react";

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

// 🔹 Définir le schéma de validation avec Zod
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Hashmap pour traduire les codes d'erreur en messages (pour les notifications)
const errorMessages = {
  INVALID_CREDENTIALS: "Identifiants invalides.",
  USER_NOT_FOUND: "Utilisateur introuvable.",
  ACCOUNT_LOCKED: "Compte verrouillé, veuillez contacter l'assistance.",
  UNKNOWN_ERROR: "Une erreur inconnue est survenue.",
};

export function LoginFormContent({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Vérifie l'URL pour afficher un toast en cas de déconnexion et supprimer le paramètre.
  useEffect(() => {
    
    if (searchParams.get("origin") === "logout") {
      toast.success("Déconnexion réussie !");
      router.replace("/login");
    }
  }, [searchParams, router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data.email, data.password);
      toast.success("Connexion réussie !");
      console.log("Login Successful:", response);
      router.push("/");
    } catch (error) {
      // Montre le message précis renvoyé par l'API (detail/error/message) sinon fallback FR
      const msg = error?.message || "Identifiants invalides.";
      toast.error(msg);
      console.error("Login Failed:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Accéder à votre compte</CardTitle>
          <CardDescription>
            Se connecter avec Apple ou Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  {/* Bouton de connexion avec Apple */}
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
                  Se connecter avec Apple
                </Button>
                <Button variant="outline" className="w-full">
                  {/* Bouton de connexion avec Google */}
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
                  Se connecter avec Google
                </Button>
              </div>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Ou se connecter ici
                </span>
              </div>

              {/* Email Input */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="email">Email</Label>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.3 }}
                        className="ml-2"
                      >
                        <XCircle className="text-red-500 w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="m@example.com"
                />
              </div>

              {/* Password Input */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.3 }}
                        className="ml-2"
                      >
                        <XCircle className="text-red-500 w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <a
                    href="/reset-password"
                    tabIndex={-1}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
              </div>

              {/* Bouton de soumission */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader className={cn("w-5 h-5 ml-2 animate-spin")} />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm">
        Vous n&apos;avez pas d&apos;identifiants?{" "}
        <a href="/register" className="underline underline-offset-4">
          S&apos;inscrire ici
        </a>
      </div>

      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 ">
        En vous connectant, vous confirmez avoir lu et accepté nos{" "}
        <a href="/terms-of-service" className="hover:text-primary">
          Conditions Générales d&apos;Utilisation
        </a>{" "}
        ainsi que notre{" "}
        <a href="/privacy-policy" className="hover:text-primary">
          Politique de Confidentialité
        </a>.
      </div>
    </div>
  );
}

// Wrapper component with Suspense
export function LoginForm(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
