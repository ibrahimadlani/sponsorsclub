import Logo from "@/components/ui/logo";
import { LoginForm } from "@/components/forms/login-form";


/**
 * LoginPage Component
 *
 * This component represents the login page of the application.
 * It uses a flexbox layout to center its content both vertically and horizontally.
 * The page consists of a header displaying the company logo (which links to the homepage)
 * and a login form for user authentication.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 items-center">
        <Logo />
        <LoginForm />
      </div>
    </div>
  );
}