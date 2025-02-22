import { ResetPasswordForm } from "@/components/reset-password-form";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "@/components/logo";

export default function ResetPasswordPage() {
  return (
    (<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">

          <Logo />
        </a>
        <ResetPasswordForm />
      </div>
    </div>)
  );
}
