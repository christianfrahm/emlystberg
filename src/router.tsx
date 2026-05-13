import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const normalizeBasepath = (value: string): string => {
  if (!value || value === "/") return "/";
  const trimmed = value.startsWith("/") ? value : `/${value}`;
  const withoutTrailing = trimmed.replace(/\/+$/, "");
  return `${withoutTrailing}/`;
};

const inferBasepath = (): string => {
  if (typeof window === "undefined") return "/";
  const [, firstSegment] = window.location.pathname.split("/");
  if (!firstSegment) return "/";
  return normalizeBasepath(firstSegment);
};

export const getRouter = () => {
  const queryClient = new QueryClient();
  const basepath = inferBasepath();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    basepath,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
