import { AuthBootstrap } from "./auth-bootstrap";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthBootstrap />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
