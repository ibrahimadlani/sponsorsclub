"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deleteAccount, logout } from "@/lib/api";

export default function DeleteAccount() {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (confirm !== "SUPPRIMER") {
      toast.error("Tapez SUPPRIMER pour confirmer.");
      return;
    }
    setLoading(true);
    try {
      await deleteAccount();
      toast.success("Compte supprimé.");
      // Clear tokens and redirect to home/login
      logout();
    } catch (e) {
      toast.error(e?.message || "Échec de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-destructive/5">
      <h4 className="font-semibold text-destructive">Supprimer le compte</h4>
      <p className="text-sm text-muted-foreground mb-3">Action irréversible. Toutes vos données personnelles seront supprimées ou anonymisées.</p>
      <div className="flex items-center gap-3 max-w-sm">
        <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Tapez SUPPRIMER" />
        <Button variant="destructive" disabled={loading} onClick={onDelete}>
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

