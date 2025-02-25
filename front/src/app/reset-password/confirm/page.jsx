import Logo from "@/components/ui/logo";
import { ResetPasswordConfirmForm } from "@/components/forms/reset-password-confirm-form";

/**
 * ResetPasswordConfirmPage Component
 *
 * This component renders the reset password confirmation page.
 * It centers the content vertically and horizontally while displaying
 * the company logo and a form for confirming the password reset.
 *
 * @returns {JSX.Element} The rendered reset password confirmation page.
 */
export default function ResetPasswordConfirmPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 items-center">
        <Logo />
        <ResetPasswordConfirmForm />
      </div>
    </div>
  );
}