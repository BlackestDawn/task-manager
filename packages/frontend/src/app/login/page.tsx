import LoginForm from "@/components/auth/loginForm";
import PublicRoute from "@/components/auth/publicRoute";

export default function LoginPage() {
  return (
    <PublicRoute showWhenAuthenticated={false}>
      <LoginForm />
    </PublicRoute>
  );
}
