// src/hooks/useCategorias.ts
import { useState, useEffect } from "react";
import type { Categoria, TipoCategoria } from "../types/categoria";
import { CATEGORIAS_PADRAO } from "../constants/categoriasPadrao";

const STORAGE_KEY = "@meu-app:categorias-v1";

export function useCategorias() {
  // Inicializa o estado lendo do localStorage ou usando o seed padrão
  const [categorias, setCategorias] = useState<Categoria[]>(() => {
    try {
      const salvas = localStorage.getItem(STORAGE_KEY);
      if (salvas) {
        return JSON.parse(salvas);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias do localStorage:", error);
    }
    return CATEGORIAS_PADRAO;
  });

  // Salva no localStorage sempre que a lista de categorias mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
    } catch (error) {
      console.error("Erro ao salvar categorias no localStorage:", error);
    }
  }, [categorias]);

  // Adiciona uma nova categoria
  const adicionarCategoria = (nome: string, tipo: TipoCategoria) => {
    const novaCategoria: Categoria = {
      id: `cat-${Date.now()}`,
      nome: nome.trim(),
      tipo,
      isPadrao: false,
    };

    setCategorias((prev) => [...prev, novaCategoria]);
  };

  // Edita uma categoria existente
  const editarCategoria = (id: string, novoNome: string) => {
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, nome: novoNome.trim() } : cat,
      ),
    );
  };

  // Remove uma categoria pelo ID
  const removerCategoria = (id: string) => {
    setCategorias((prev) => prev.filter((cat) => cat.id !== id));
  };

  return {
    categorias,
    adicionarCategoria,
    editarCategoria,
    removerCategoria,
  };
}
