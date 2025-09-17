"use client";

/**
 * VerifyEmailPage
 *
 * Reads the `token` query param and calls the backend to verify the user's email.
 * On success or error, shows a toast and redirects to the login page.
 */
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";
import { verifyEmail as verifyEmailAPI } from "@/lib/api";

// Suspense-friendly inner component to access search params
function VerifyEmailComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Le jeton de vérification est manquant.");
      router.push("/login");
      return;
    }

    async function verifyEmail() {
      try {
        await verifyEmailAPI(token);
        toast.success("Email vérifié avec succès !");
        router.push("/login");
      } catch (error) {
        if (error?.status === 400) {
          toast.error("Jeton invalide ou expiré.");
        } else {
          toast.error("Erreur du serveur. Réessayez plus tard.");
        }
        router.push("/login");
      }
    }

    verifyEmail();
  }, [token, router]);

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  );
}
