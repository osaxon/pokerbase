import {
    RouteParams,
    RouteStrings,
    RoutesWithParams,
    RoutesWithoutParams,
} from "@/types/types";

export function createExtendedRoute<T extends RoutesWithParams>(
    route: T,
    params: RouteParams<T>
): string;
export function createExtendedRoute<T extends RoutesWithoutParams>(
    route: T
): string;
export function createExtendedRoute<T extends RouteStrings>(
    route: T,
    params?: RouteParams<T>
): string {
    if (route.includes(":")) {
        // If path parameters are present but params is undefined, throw error
        if (!params) {
            throw new Error(`Parameters are required for route: ${route}`);
        }
        // Replace path parameters in route with provided params
        for (const key in params) {
            const value = params[key as keyof RouteParams<T>] as string;
            route = route.replace(`:${key}`, value) as T;
        }
    }

    return route;
}
