import type { LogoStyle, Part } from "src/features/citizen-lab/design/citizenLabOptions";

export type CitizenColors = Record<Part, string>;
export type CitizenTag = { text: string; fontFamily: string; color: string };
export type CitizenLogo = { style: LogoStyle; color: string };
