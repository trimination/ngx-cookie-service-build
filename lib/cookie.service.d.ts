import { InjectionToken } from '@angular/core';
export declare class CookieService {
    private document;
    private platformId;
    private readonly COOKIE_EXPIRY_DAYS_MAX;
    private readonly documentIsAccessible;
    constructor(document: any, platformId: InjectionToken<object>);
    /**
     * Get cookie Regular Expression
     *
     * @param name Cookie name
     * @returns property RegExp
     */
    private static getCookieRegExp;
    private static safeDecodeURIComponent;
    /**
     * Return `true` if {@link Document} is accessible, otherwise return `false`
     *
     * @param name Cookie name
     * @returns boolean - whether cookie with specified name exists
     */
    check(name: string): boolean;
    /**
     * Get cookies by name
     *
     * @param name Cookie name
     * @returns property value
     */
    get(name: string): string;
    /**
     * Get all cookies in JSON format
     *
     * @returns all the cookies in json
     */
    getAll(): {
        [key: string]: string;
    };
    /**
     * Set cookie based on provided information
     *
     * @param name     Cookie name
     * @param value    Cookie value
     * @param expires  Number of days until the cookies expires or an actual `Date`
     * @param path     Cookie path
     * @param domain   Cookie domain
     * @param secure   Secure flag
     * @param sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
     */
    set(name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void;
    /**
     * Set cookie based on provided information
     *
     * Cookie's parameters:
     * <pre>
     * expires  Number of days until the cookies expires or an actual `Date`
     * path     Cookie path
     * domain   Cookie domain
     * secure   Secure flag
     * sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
     * </pre>
     * @param name     Cookie name
     * @param value    Cookie value
     * @param options  Body with cookie's params
     */
    set(name: string, value: string, options?: {
        expires?: number | Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'Lax' | 'None' | 'Strict';
    }): void;
    /**
     * Delete cookie by name
     *
     * @param name   Cookie name
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Cookie secure flag
     * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
     */
    delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void;
    /**
     * Delete all cookies
     *
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Is the Cookie secure
     * @param sameSite Is the cookie same site
     */
    deleteAll(path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void;
}
