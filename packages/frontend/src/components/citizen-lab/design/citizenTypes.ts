import type { LogoStyle } from "src/components/citizen-lab/design/citizenLabOptions";

export type CitizenColors = {
  body: string;
  head: string;
  hair: string;
  deco: string;
  eyes: string;
  nose: string;
  mouth: string;
};
export type CitizenTag = { text: string; fontFamily: string; color: string };
export type CitizenLogo = { style: LogoStyle; color: string };
