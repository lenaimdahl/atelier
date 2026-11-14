import { useEffect, type RefObject } from "react";
import p5 from "p5";
import iconSvg from "src/assets/40c3-creator/Logos/Logo.svg?raw";

type Size = { width: number; height: number };

export type Sketch = (p: p5, container: HTMLElement) => void;

export function parseLogo(svg: string) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) {
    throw new Error("Logo SVG has no viewBox");
  }
  const [, , width, height] = viewBox.split(" ").map(Number);
  const paths = Array.from(svg.matchAll(/\sd="([^"]+)"/g), (match) => match[1]);
  return { width, height, paths };
}

export const LOGO_ICON = parseLogo(iconSvg);

export function fitLogo(logo: Size, box: Size) {
  const scale = Math.min(box.width / logo.width, box.height / logo.height) * 0.8;
  return {
    scale,
    x: (box.width - logo.width * scale) / 2,
    y: (box.height - logo.height * scale) / 2,
  };
}

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
