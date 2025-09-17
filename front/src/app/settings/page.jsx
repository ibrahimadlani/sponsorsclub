"use client";
/**
 * Settings > Profile
 * Basic profile information form within the Settings layout.
 */
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/forms/profile-form"
import ChangePasswordForm from "@/components/forms/change-password-form"
import DeleteAccount from "@/components/forms/delete-account"

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <ProfileForm />

      <div className="mt-10 space-y-3">
        <h3 className="text-lg font-medium">Changer le mot de passe</h3>
        <p className="text-sm text-muted-foreground">Mettez à jour votre mot de passe pour sécuriser votre compte.</p>
        <ChangePasswordForm />
      </div>

      <div className="mt-10 space-y-3">
        <h3 className="text-lg font-medium text-destructive">Supprimer le compte</h3>
        <DeleteAccount />
      </div>
    </div>
  )
}
