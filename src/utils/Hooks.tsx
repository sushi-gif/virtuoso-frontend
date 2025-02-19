import {DependencyList, useContext, useEffect, useState} from "react";
import { useAuth } from "../auth/auth";

export function useGlobalListener<E extends keyof WindowEventMap>(event: E, handler: (this: Window, ev: WindowEventMap[E]) => void, deps: DependencyList = []) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, handler, ...deps]);
}

export function useLocalStorage<T>(key: string, defaultValue: T) {

  let savedData = localStorage.getItem(key);
  if (savedData !== null) defaultValue = JSON.parse(savedData);

  const state = useState<T>(defaultValue);
  const [data, setData] = state;

  useEffect(() => {
    if (!document.hasFocus()) return;
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);

  useGlobalListener("storage", (event) => {
    if (event.key !== key) return;
    if (!event.newValue) return;
    setData(JSON.parse(event.newValue));
  }, [key, setData]);

  return state;

}


export function useIsFirstRender() {
  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => { setIsFirst(false) }, []);
  return isFirst;
}

export function useFirstRender() {
  return useState(Date.now())[0];
}

export function useInterval(callback: () => void, interval: number, deps: DependencyList = []) {
  useEffect(() => {
    const ref = setInterval(callback, interval);
    return () => clearInterval(ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, callback, deps]);
}

export function useApi() {

  let apiEndpoint = process.env["REACT_APP_API_ENDPOINT"] || "http://localhost:8000";
  if (apiEndpoint.endsWith("/")) apiEndpoint = apiEndpoint.substring(0, apiEndpoint.length - 1);

  const auth = useAuth();

  async function apiFetch(endpoint: string, init?: RequestInit) {

    if (endpoint.startsWith("/")) endpoint = endpoint.substring(1);
    if (!init) init = {};
    if (!init.headers) init.headers = new Headers();

    if (auth?.token) {

      const authHeader = `Bearer ${auth.token}`;

      if (init.headers instanceof Headers) {
        init.headers.set("Authorization", authHeader);
      } else if (Array.isArray(init.headers)) {
        init.headers.push(["Authorization", authHeader])
      } else {
        init.headers["Authorization"] = authHeader;
      }

    }

    return fetch(`${apiEndpoint}/${endpoint}`, init);

  }

  async function apiCall<T>(method: string, endpoint: string, query: NodeJS.Dict<string> = {}, body?: any) {

    const headers = new Headers();
    const init: RequestInit = {method, headers};

    if (body instanceof FormData || body instanceof URLSearchParams) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      headers.set("Content-Type", "application/json");
    }

    const response = await apiFetch(endpoint + urlEncode(query), init);
    if (response.status >= 100 && response.status < 400) {
      if (response.status === 204) return;
      return response.json().then((res) => res as T);
    }

    throw new Error("API returned an error", {cause: response});
    
  }

  return {apiFetch, apiCall};

}

function urlEncode(query: NodeJS.Dict<string> = {}) {
  if (Object.keys(query).length === 0) return "";
  return "?" + Object.entries(query)
    .map((values) => values
      .map((v) => v || "")
      .map(encodeURIComponent)
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}
