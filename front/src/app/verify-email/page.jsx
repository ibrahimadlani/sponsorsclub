"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // "loading", "success", "error"
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Le jeton de vérification est manquant.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/verify-email/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Votre email a été vérifié avec succès ! Redirection...");
          setTimeout(() => router.push("/login"), 3000); // Redirect after 3 seconds
        } else {
          setStatus("error");
          setMessage(data.error || "Échec de la vérification du courriel.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erreur du serveur. Veuillez réessayer plus tard.");
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {status === "loading" && (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-600" />
          <p className="mt-4 text-lg">Vérification en cours...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center text-green-600">
          <CheckCircle className="h-12 w-12 mx-auto" />
          <p className="mt-4 text-lg">{message}</p>
          <p className="text-sm text-gray-500">Redirection en cours...</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center text-red-600">
          <XCircle className="h-12 w-12 mx-auto" />
          <p className="mt-4 text-lg">{message}</p>
          <Link href="/login" className="text-blue-500 hover:underline mt-4 block">
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}