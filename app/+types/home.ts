export namespace Route {
  export interface MetaArgs {
    data: unknown;
    params: Record<string, string | undefined>;
    location: Location;
    matches: unknown[];
  }
}
