export namespace Route {
  export interface MetaArgs {
    data: unknown;
    params: Record<string, string | undefined>;
    location: Location;
    matches: unknown[];
  }

  export interface LinksFunctionArgs {
    data: unknown;
    params: Record<string, string | undefined>;
    location: Location;
    matches: unknown[];
  }

  export type LinksFunction = (
    args: LinksFunctionArgs
  ) => Array<{ rel: string; href: string; crossOrigin?: string }>;

  export interface ErrorBoundaryProps {
    error: unknown;
  }
}
