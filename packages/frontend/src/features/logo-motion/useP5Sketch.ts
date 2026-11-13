import { useEffect, type RefObject } from "react";
import p5 from "p5";

export type Sketch = (p: p5, container: HTMLElement) => void;

export function useP5Sketch(ref: RefObject<HTMLElement | null>, sketch: Sketch) {
  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }
    const instance = new p5((p) => sketch(p, container), container);
    return () => instance.remove();
  }, [ref, sketch]);
}
