import { Api } from "./generated/generated";

export const api = new Api({ baseURL: import.meta.env.VITE_API_URL });
