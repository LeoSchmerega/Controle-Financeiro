// src/lib/supabase.ts
// Cliente único do Supabase para todo o app. URL e chave vêm do .env.local
// (variáveis VITE_* são embutidas no build e ficam visíveis no navegador —
// por isso só a chave PÚBLICA vai aqui; quem protege os dados é o RLS).
import { createClient } from "@supabase/supabase-js";

// Usa só a origem (https://xxxx.supabase.co) — se a URL vier com caminho
// colado junto (ex: /rest/v1/), o Supabase monta endereços inválidos.
const urlBruta = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const url = urlBruta?.match(/^https?:\/\/[^/]+/)?.[0];
const chavePublica = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Falso enquanto o .env.local não estiver preenchido — o app mostra um
// aviso em vez de quebrar.
export const supabaseConfigurado = Boolean(
  url && chavePublica && !url.includes("SEU-PROJETO"),
);

// Endereço do app para onde os links de email devem voltar. Inclui o
// "base" do Vite (/Controle-Financeiro/ no GitHub Pages, / no localhost).
export const URL_DO_APP = `${window.location.origin}${import.meta.env.BASE_URL}`;

export const supabase = createClient(
  supabaseConfigurado ? url! : "https://placeholder.supabase.co",
  supabaseConfigurado ? chavePublica! : "placeholder",
);
