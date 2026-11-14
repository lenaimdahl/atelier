import { useEffect, type RefObject } from "react";
import p5 from "p5";

export type Sketch = (p: p5, container: HTMLElement) => void;

export function useP5Sketch(ref: RefObject<HTMLElement | null>, sketch: Sketch) {
  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }
    const cleanup = new AbortController();
    const instance = new p5((p) => {
      sketch(p, container);
      const userSetup = p.setup;
      p.setup = () => {
        userSetup?.();
        if (cleanup.signal.aborted) {
          void p.remove();
        }
      };
    }, container);
    return () => {
      cleanup.abort();
      void instance.remove();
    };
  }, [ref, sketch]);
}
