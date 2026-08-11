// src/hooks/usePullToRefresh.ts
import { useRef, useState } from "react";
import type { RefObject, TouchEvent } from "react";

interface UsePullToRefreshResult<T extends HTMLElement> {
  containerRef: RefObject<T | null>;
  // Distância atual do puxão, já com a resistência elástica aplicada —
  // usar direto como altura/translateY do indicador visual.
  pullDistance: number;
  isRefreshing: boolean;
  handlers: {
    onTouchStart: (e: TouchEvent<T>) => void;
    onTouchMove: (e: TouchEvent<T>) => void;
    onTouchEnd: () => void;
  };
}

const LIMIAR_PARA_ATUALIZAR = 70; // px de puxão necessários para soltar e recarregar
const PUXAO_MAXIMO = 100; // trava visual do quanto o indicador desce
const RESISTENCIA = 0.5; // elástico — arrastar 2px do dedo move 1px o indicador

// Gesto de "puxar para atualizar" (padrão de apps mobile), pensado para um
// container com scroll próprio (overflow-y-auto) em vez da janela inteira —
// é o caso do nosso <main>, já que <html>/<body> não rolam. Só reage a
// toque (mobile/tablet); mouse não dispara touchstart, então em desktop o
// hook fica inerte sem precisar checar breakpoint.
export function usePullToRefresh<T extends HTMLElement>(
  onRefresh: () => void = () => window.location.reload(),
): UsePullToRefreshResult<T> {
  const containerRef = useRef<T>(null);
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onTouchStart = (e: TouchEvent<T>) => {
    const el = containerRef.current;
    // Só começa a rastrear o puxão se o container já estiver no topo —
    // senão seria apenas um scroll normal para cima.
    if (!el || el.scrollTop > 0 || isRefreshing) {
      touchStartY.current = null;
      return;
    }
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent<T>) => {
    if (touchStartY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    setPullDistance(Math.min(delta * RESISTENCIA, PUXAO_MAXIMO));
  };

  const onTouchEnd = () => {
    if (touchStartY.current === null) return;
    touchStartY.current = null;

    if (pullDistance >= LIMIAR_PARA_ATUALIZAR) {
      setIsRefreshing(true);
      setPullDistance(LIMIAR_PARA_ATUALIZAR);
      onRefresh();
    } else {
      setPullDistance(0);
    }
  };

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
