"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Suspense } from "react";

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
        const response = await fetch(`http://172.20.10.8:8001/api/auth/verify-email/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Email vérifié avec succès !");
          router.push("/login");
        } else {
          toast.error(data.error || "Échec de la vérification.");
          router.push("/login");
        }
      } catch (error) {
        toast.error("Erreur du serveur. Réessayez plus tard.");
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