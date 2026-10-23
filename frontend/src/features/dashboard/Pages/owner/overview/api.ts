import { api } from "../../../api";


export function fetchOwnerDashboard(signal?: AbortSignal) {
  return api.get<unknown>("/dashboard", undefined, { signal });
}

