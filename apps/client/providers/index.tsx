import { AuthBootstrap } from "./auth-bootstrap";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Resolves the persisted session before anything waits on it being initialized. */}
      <AuthBootstrap />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return <ToastProvider>{children}</ToastProvider>;
// }
