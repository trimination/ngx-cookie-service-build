import * as i0 from '@angular/core';
import { Injectable, Inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import * as i1 from '@angular/common';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

// This service is based on the `ng2-cookies` package which sadly is not a service and does
class CookieService {
    constructor(
    // The type `Document` may not be used here. Although a fix is on its way,
    // we will go with `any` for now to support Angular 2.4.x projects.
    // Issue: https://github.com/angular/angular/issues/12631
    // Fix: https://github.com/angular/angular/pull/14894
    document, 
    // Get the `PLATFORM_ID` so we can check if we're in a browser.
    platformId) {
        this.document = document;
        this.platformId = platformId;
        this.COOKIE_EXPIRY_DAYS_MAX = 31;
        this.documentIsAccessible = isPlatformBrowser(this.platformId);
    }
    /**
     * Get cookie Regular Expression
     *
     * @param name Cookie name
     * @returns property RegExp
     */
    static getCookieRegExp(name) {
        const escapedName = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');
        return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
    }
    static safeDecodeURIComponent(encodedURIComponent) {
        try {
            return decodeURIComponent(encodedURIComponent);
        }
        catch (_a) {
            // probably it is not uri encoded. return as is
            return encodedURIComponent;
        }
    }
    /**
     * Return `true` if {@link Document} is accessible, otherwise return `false`
     *
     * @param name Cookie name
     * @returns boolean - whether cookie with specified name exists
     */
    check(name) {
        if (!this.documentIsAccessible) {
            return false;
        }
        name = encodeURIComponent(name);
        const regExp = CookieService.getCookieRegExp(name);
        return regExp.test(this.document.cookie);
    }
    /**
     * Get cookies by name
     *
     * @param name Cookie name
     * @returns property value
     */
    get(name) {
        if (this.documentIsAccessible && this.check(name)) {
            name = encodeURIComponent(name);
            const regExp = CookieService.getCookieRegExp(name);
            const result = regExp.exec(this.document.cookie);
            return result[1] ? CookieService.safeDecodeURIComponent(result[1]) : '';
        }
        else {
            return '';
        }
    }
    /**
     * Get all cookies in JSON format
     *
     * @returns all the cookies in json
     */
    getAll() {
        if (!this.documentIsAccessible) {
            return {};
        }
        const cookies = {};
        const document = this.document;
        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach((currentCookie) => {
                const [cookieName, cookieValue] = currentCookie.split('=');
                cookies[CookieService.safeDecodeURIComponent(cookieName.replace(/^ /, ''))] = CookieService.safeDecodeURIComponent(cookieValue);
            });
        }
        return cookies;
    }
    set(name, value, expiresOrOptions, path, domain, secure, sameSite) {
        if (!this.documentIsAccessible) {
            return;
        }
        if (typeof expiresOrOptions === 'number' || expiresOrOptions instanceof Date || path || domain || secure || sameSite) {
            let optionsBody;
            if (typeof expiresOrOptions === 'number' && expiresOrOptions > this.COOKIE_EXPIRY_DAYS_MAX) {
                optionsBody = {
                    expiresSeconds: expiresOrOptions,
                    path,
                    domain,
                    secure,
                    sameSite: sameSite ? sameSite : 'Lax',
                };
            }
            else {
                optionsBody = {
                    expires: expiresOrOptions,
                    path,
                    domain,
                    secure,
                    sameSite: sameSite ? sameSite : 'Lax',
                };
            }
            this.set(name, value, optionsBody);
            return;
        }
        let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
        const options = expiresOrOptions ? expiresOrOptions : {};
        if (options.expires) {
            if (typeof options.expires === 'number') {
                const dateExpires = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
                cookieString += 'expires=' + dateExpires.toUTCString() + ';';
            }
            else {
                cookieString += 'expires=' + options.expires.toUTCString() + ';';
            }
        }
        if (options.expiresSeconds) {
            if (typeof options.expiresSeconds === 'number') {
                const dateExpires = new Date(new Date().getTime() + options.expiresSeconds * 1000);
                cookieString += 'expires=' + dateExpires.toUTCString() + ';';
            }
        }
        if (options.path) {
            cookieString += 'path=' + options.path + ';';
        }
        if (options.domain) {
            cookieString += 'domain=' + options.domain + ';';
        }
        if (options.secure === false && options.sameSite === 'None') {
            options.secure = true;
            console.warn(`[ngx-cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
                `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`);
        }
        if (options.secure) {
            cookieString += 'secure;';
        }
        if (!options.sameSite) {
            options.sameSite = 'Lax';
        }
        cookieString += 'sameSite=' + options.sameSite + ';';
        this.document.cookie = cookieString;
    }
    /**
     * Delete cookie by name
     *
     * @param name   Cookie name
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Cookie secure flag
     * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
     */
    delete(name, path, domain, secure, sameSite = 'Lax') {
        if (!this.documentIsAccessible) {
            return;
        }
        const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
        this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
    }
    /**
     * Delete all cookies
     *
     * @param path   Cookie path
     * @param domain Cookie domain
     * @param secure Is the Cookie secure
     * @param sameSite Is the cookie same site
     */
    deleteAll(path, domain, secure, sameSite = 'Lax') {
        if (!this.documentIsAccessible) {
            return;
        }
        const cookies = this.getAll();
        for (const cookieName in cookies) {
            if (cookies.hasOwnProperty(cookieName)) {
                this.delete(cookieName, path, domain, secure, sameSite);
            }
        }
    }
}
CookieService.??prov = i0.????defineInjectable({ factory: function CookieService_Factory() { return new CookieService(i0.????inject(i1.DOCUMENT), i0.????inject(i0.PLATFORM_ID)); }, token: CookieService, providedIn: "root" });
CookieService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
CookieService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: InjectionToken, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];

/*
 * Public API Surface of ngx-cookie-service
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CookieService };
//# sourceMappingURL=ngx-cookie-service.js.map
