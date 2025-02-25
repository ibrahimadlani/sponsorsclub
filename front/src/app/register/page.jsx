import Logo from "@/components/ui/logo";
import { RegisterForm } from "@/components/forms/register-form";

/**
 * RegisterPage Component
 *
 * This component renders the registration page.
 * It centers the content and displays the company logo along with the registration form.
 *
 * @returns {JSX.Element} The rendered registration page.
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 items-center">
        <Logo />
        <RegisterForm />
      </div>
    </div>
  );
}