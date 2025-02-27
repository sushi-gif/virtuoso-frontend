import { useState } from "react";
import { useAuth } from "../auth/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles

export function useApi() {
  let apiEndpoint = process.env["REACT_APP_API_ENDPOINT"] || "http://localhost:8000";
  if (apiEndpoint.endsWith("/")) apiEndpoint = apiEndpoint.slice(0, -1);

  const auth = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function apiFetch(endpoint: string, init?: RequestInit) {
    if (endpoint.startsWith("/")) endpoint = endpoint.substring(1);
    if (!init) init = {};
    if (!init.headers) init.headers = new Headers();

    if (auth?.token) {
      const authHeader = `Bearer ${auth.token}`;
      if (init.headers instanceof Headers) {
        init.headers.set("Authorization", authHeader);
      } else if (Array.isArray(init.headers)) {
        init.headers.push(["Authorization", authHeader]);
      } else {
        init.headers["Authorization"] = authHeader;
      }
    }

    return fetch(`${apiEndpoint}/${endpoint}`, init);
  }

  async function apiCall<T>(
    method: string,
    endpoint: string,
    query: Record<string, string> = {},
    body?: any
  ): Promise<T | null> {
    const headers = new Headers();
    const init: RequestInit = { method, headers };

    if (body instanceof FormData || body instanceof URLSearchParams) {
      init.body = body;
    } else if (body) {
      init.body = JSON.stringify(body);
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await apiFetch(endpoint + urlEncode(query), init);
      const json = await response.json();

      if (response.ok) {
        return json as T;
      }

      // Extract and display error messages
      let errorMessage = "An unexpected error occurred.";
      if (json.detail && Array.isArray(json.detail)) {
        errorMessage = json.detail.map((err: { msg: string }) => err.msg).join("\n");
      } else if (json.detail) {
        errorMessage = json.detail;
      }

      // Automatically show error in a toast
      setErrorMessage(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });

      return null;
    } catch (e) {
      const networkError = "Network error or server is unreachable.";
      setErrorMessage(networkError);
      toast.error(networkError, { position: "top-right", autoClose: 5000 });
      return null;
    }
  }

  return { apiFetch, apiCall, errorMessage };
}

function urlEncode(query: Record<string, string> = {}) {
  if (Object.keys(query).length === 0) return "";
  return (
    "?" +
    Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value || "")}`)
      .join("&")
  );
}
