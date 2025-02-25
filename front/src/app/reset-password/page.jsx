import Logo from "@/components/ui/logo";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

/**
 * ResetPasswordPage Component
 *
 * This component renders the reset password page.
 * It features a centered layout that includes the company logo and
 * a form for users to reset their password with their email address.
 *
 * @returns {JSX.Element} The rendered reset password page.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 items-center">
        <Logo />
        <ResetPasswordForm />
      </div>
    </div>
  );
}