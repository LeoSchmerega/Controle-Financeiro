// src/Raiz.tsx
// Decide o que mostrar: aviso de configuração, carregando, login ou o app.
import App from "./App";
import { FinanceProvider } from "./context/FinanceContext";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import { supabaseConfigurado } from "./lib/supabase";

export default function Raiz() {
  const { carregando, usuario } = useAuth();

  if (!supabaseConfigurado) {
    return (
      <div className="h-dvh flex items-center justify-center bg-white p-6 text-center text-slate-700">
        <p>
          Supabase não configurado. Preencha <code>VITE_SUPABASE_URL</code> e{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env.local</code> e
          reinicie o <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  if (carregando) return null;
  if (!usuario) return <LoginPage />;

  // key = id do usuário: ao trocar de conta, o FinanceProvider é recriado do
  // zero, sem misturar dados de uma pessoa com os da outra.
  return (
    <FinanceProvider key={usuario.id} userId={usuario.id}>
      <App />
    </FinanceProvider>
  );
}
