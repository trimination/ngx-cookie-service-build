// This service is based on the `ng2-cookies` package which sadly is not a service and does
// not use `DOCUMENT` injection and therefore doesn't work well with AoT production builds.
// Package: https://github.com/BCJTI/ng2-cookies
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class CookieService {
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
CookieService.ɵprov = i0.ɵɵdefineInjectable({ factory: function CookieService_Factory() { return new CookieService(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i0.PLATFORM_ID)); }, token: CookieService, providedIn: "root" });
CookieService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
CookieService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: InjectionToken, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtY29va2llLXNlcnZpY2Uvc3JjL2xpYi9jb29raWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyRkFBMkY7QUFDM0YsMkZBQTJGO0FBQzNGLGdEQUFnRDtBQUVoRCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7O0FBSzlELE1BQU0sT0FBTyxhQUFhO0lBSXhCO0lBQ0UsMEVBQTBFO0lBQzFFLG1FQUFtRTtJQUNuRSx5REFBeUQ7SUFDekQscURBQXFEO0lBQzNCLFFBQWE7SUFDdkMsK0RBQStEO0lBQ2xDLFVBQWtDO1FBRnJDLGFBQVEsR0FBUixRQUFRLENBQUs7UUFFVixlQUFVLEdBQVYsVUFBVSxDQUF3QjtRQVZoRCwyQkFBc0IsR0FBVyxFQUFFLENBQUM7UUFZbkQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQVk7UUFDekMsTUFBTSxXQUFXLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3Q0FBd0MsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzRixPQUFPLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxXQUFXLEdBQUcsUUFBUSxHQUFHLFdBQVcsR0FBRyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLG1CQUEyQjtRQUMvRCxJQUFJO1lBQ0YsT0FBTyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2hE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QU87U0FDUjtRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxDQUFDLElBQWEsRUFBRSxNQUFlLEVBQUUsTUFBZ0IsRUFBRSxXQUFzQyxLQUFLO1FBQ3JHLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsT0FBTztTQUNSO1FBRUQsTUFBTSxPQUFPLEdBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRW5DLEtBQUssTUFBTSxVQUFVLElBQUksT0FBTyxFQUFFO1lBQ2hDLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDekQ7U0FDRjtJQUNILENBQUM7Ozs7WUFyUUYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7NENBVUksTUFBTSxTQUFDLFFBQVE7WUFmUyxjQUFjLHVCQWlCdEMsTUFBTSxTQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIHNlcnZpY2UgaXMgYmFzZWQgb24gdGhlIGBuZzItY29va2llc2AgcGFja2FnZSB3aGljaCBzYWRseSBpcyBub3QgYSBzZXJ2aWNlIGFuZCBkb2VzXG4vLyBub3QgdXNlIGBET0NVTUVOVGAgaW5qZWN0aW9uIGFuZCB0aGVyZWZvcmUgZG9lc24ndCB3b3JrIHdlbGwgd2l0aCBBb1QgcHJvZHVjdGlvbiBidWlsZHMuXG4vLyBQYWNrYWdlOiBodHRwczovL2dpdGh1Yi5jb20vQkNKVEkvbmcyLWNvb2tpZXNcblxuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5ULCBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBDb29raWVTZXJ2aWNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBDT09LSUVfRVhQSVJZX0RBWVNfTUFYOiBudW1iZXIgPSAzMTtcbiAgcHJpdmF0ZSByZWFkb25seSBkb2N1bWVudElzQWNjZXNzaWJsZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBUaGUgdHlwZSBgRG9jdW1lbnRgIG1heSBub3QgYmUgdXNlZCBoZXJlLiBBbHRob3VnaCBhIGZpeCBpcyBvbiBpdHMgd2F5LFxuICAgIC8vIHdlIHdpbGwgZ28gd2l0aCBgYW55YCBmb3Igbm93IHRvIHN1cHBvcnQgQW5ndWxhciAyLjQueCBwcm9qZWN0cy5cbiAgICAvLyBJc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTI2MzFcbiAgICAvLyBGaXg6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC8xNDg5NFxuICAgIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jdW1lbnQ6IGFueSxcbiAgICAvLyBHZXQgdGhlIGBQTEFURk9STV9JRGAgc28gd2UgY2FuIGNoZWNrIGlmIHdlJ3JlIGluIGEgYnJvd3Nlci5cbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IEluamVjdGlvblRva2VuPG9iamVjdD5cbiAgKSB7XG4gICAgdGhpcy5kb2N1bWVudElzQWNjZXNzaWJsZSA9IGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvb2tpZSBSZWd1bGFyIEV4cHJlc3Npb25cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgQ29va2llIG5hbWVcbiAgICogQHJldHVybnMgcHJvcGVydHkgUmVnRXhwXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRDb29raWVSZWdFeHAobmFtZTogc3RyaW5nKTogUmVnRXhwIHtcbiAgICBjb25zdCBlc2NhcGVkTmFtZTogc3RyaW5nID0gbmFtZS5yZXBsYWNlKC8oW1xcW1xcXVxce1xcfVxcKFxcKVxcfFxcPVxcO1xcK1xcP1xcLFxcLlxcKlxcXlxcJF0pL2dpLCAnXFxcXCQxJyk7XG5cbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnKD86XicgKyBlc2NhcGVkTmFtZSArICd8O1xcXFxzKicgKyBlc2NhcGVkTmFtZSArICcpPSguKj8pKD86O3wkKScsICdnJyk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBzYWZlRGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUklDb21wb25lbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSUNvbXBvbmVudCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcm9iYWJseSBpdCBpcyBub3QgdXJpIGVuY29kZWQuIHJldHVybiBhcyBpc1xuICAgICAgcmV0dXJuIGVuY29kZWRVUklDb21wb25lbnQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBgdHJ1ZWAgaWYge0BsaW5rIERvY3VtZW50fSBpcyBhY2Nlc3NpYmxlLCBvdGhlcndpc2UgcmV0dXJuIGBmYWxzZWBcbiAgICpcbiAgICogQHBhcmFtIG5hbWUgQ29va2llIG5hbWVcbiAgICogQHJldHVybnMgYm9vbGVhbiAtIHdoZXRoZXIgY29va2llIHdpdGggc3BlY2lmaWVkIG5hbWUgZXhpc3RzXG4gICAqL1xuICBjaGVjayhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuZG9jdW1lbnRJc0FjY2Vzc2libGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbmFtZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcbiAgICBjb25zdCByZWdFeHA6IFJlZ0V4cCA9IENvb2tpZVNlcnZpY2UuZ2V0Q29va2llUmVnRXhwKG5hbWUpO1xuICAgIHJldHVybiByZWdFeHAudGVzdCh0aGlzLmRvY3VtZW50LmNvb2tpZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvb2tpZXMgYnkgbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSBDb29raWUgbmFtZVxuICAgKiBAcmV0dXJucyBwcm9wZXJ0eSB2YWx1ZVxuICAgKi9cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZG9jdW1lbnRJc0FjY2Vzc2libGUgJiYgdGhpcy5jaGVjayhuYW1lKSkge1xuICAgICAgbmFtZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKTtcblxuICAgICAgY29uc3QgcmVnRXhwOiBSZWdFeHAgPSBDb29raWVTZXJ2aWNlLmdldENvb2tpZVJlZ0V4cChuYW1lKTtcbiAgICAgIGNvbnN0IHJlc3VsdDogUmVnRXhwRXhlY0FycmF5ID0gcmVnRXhwLmV4ZWModGhpcy5kb2N1bWVudC5jb29raWUpO1xuXG4gICAgICByZXR1cm4gcmVzdWx0WzFdID8gQ29va2llU2VydmljZS5zYWZlRGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdFsxXSkgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGNvb2tpZXMgaW4gSlNPTiBmb3JtYXRcbiAgICpcbiAgICogQHJldHVybnMgYWxsIHRoZSBjb29raWVzIGluIGpzb25cbiAgICovXG4gIGdldEFsbCgpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgICBpZiAoIXRoaXMuZG9jdW1lbnRJc0FjY2Vzc2libGUpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBjb25zdCBjb29raWVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgY29uc3QgZG9jdW1lbnQ6IGFueSA9IHRoaXMuZG9jdW1lbnQ7XG5cbiAgICBpZiAoZG9jdW1lbnQuY29va2llICYmIGRvY3VtZW50LmNvb2tpZSAhPT0gJycpIHtcbiAgICAgIGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpLmZvckVhY2goKGN1cnJlbnRDb29raWUpID0+IHtcbiAgICAgICAgY29uc3QgW2Nvb2tpZU5hbWUsIGNvb2tpZVZhbHVlXSA9IGN1cnJlbnRDb29raWUuc3BsaXQoJz0nKTtcbiAgICAgICAgY29va2llc1tDb29raWVTZXJ2aWNlLnNhZmVEZWNvZGVVUklDb21wb25lbnQoY29va2llTmFtZS5yZXBsYWNlKC9eIC8sICcnKSldID0gQ29va2llU2VydmljZS5zYWZlRGVjb2RlVVJJQ29tcG9uZW50KGNvb2tpZVZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjb29raWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBjb29raWUgYmFzZWQgb24gcHJvdmlkZWQgaW5mb3JtYXRpb25cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgICAgIENvb2tpZSBuYW1lXG4gICAqIEBwYXJhbSB2YWx1ZSAgICBDb29raWUgdmFsdWVcbiAgICogQHBhcmFtIGV4cGlyZXMgIE51bWJlciBvZiBkYXlzIHVudGlsIHRoZSBjb29raWVzIGV4cGlyZXMgb3IgYW4gYWN0dWFsIGBEYXRlYFxuICAgKiBAcGFyYW0gcGF0aCAgICAgQ29va2llIHBhdGhcbiAgICogQHBhcmFtIGRvbWFpbiAgIENvb2tpZSBkb21haW5cbiAgICogQHBhcmFtIHNlY3VyZSAgIFNlY3VyZSBmbGFnXG4gICAqIEBwYXJhbSBzYW1lU2l0ZSBPV0FTUCBzYW1lc2l0ZSB0b2tlbiBgTGF4YCwgYE5vbmVgLCBvciBgU3RyaWN0YC4gRGVmYXVsdHMgdG8gYExheGBcbiAgICovXG4gIHNldChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGV4cGlyZXM/OiBudW1iZXIgfCBEYXRlLCBwYXRoPzogc3RyaW5nLCBkb21haW4/OiBzdHJpbmcsIHNlY3VyZT86IGJvb2xlYW4sIHNhbWVTaXRlPzogJ0xheCcgfCAnTm9uZScgfCAnU3RyaWN0Jyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNldCBjb29raWUgYmFzZWQgb24gcHJvdmlkZWQgaW5mb3JtYXRpb25cbiAgICpcbiAgICogQ29va2llJ3MgcGFyYW1ldGVyczpcbiAgICogPHByZT5cbiAgICogZXhwaXJlcyAgTnVtYmVyIG9mIGRheXMgdW50aWwgdGhlIGNvb2tpZXMgZXhwaXJlcyBvciBhbiBhY3R1YWwgYERhdGVgXG4gICAqIHBhdGggICAgIENvb2tpZSBwYXRoXG4gICAqIGRvbWFpbiAgIENvb2tpZSBkb21haW5cbiAgICogc2VjdXJlICAgU2VjdXJlIGZsYWdcbiAgICogc2FtZVNpdGUgT1dBU1Agc2FtZXNpdGUgdG9rZW4gYExheGAsIGBOb25lYCwgb3IgYFN0cmljdGAuIERlZmF1bHRzIHRvIGBMYXhgXG4gICAqIDwvcHJlPlxuICAgKiBAcGFyYW0gbmFtZSAgICAgQ29va2llIG5hbWVcbiAgICogQHBhcmFtIHZhbHVlICAgIENvb2tpZSB2YWx1ZVxuICAgKiBAcGFyYW0gb3B0aW9ucyAgQm9keSB3aXRoIGNvb2tpZSdzIHBhcmFtc1xuICAgKi9cbiAgc2V0KFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7XG4gICAgICBleHBpcmVzPzogbnVtYmVyIHwgRGF0ZTtcbiAgICAgIHBhdGg/OiBzdHJpbmc7XG4gICAgICBkb21haW4/OiBzdHJpbmc7XG4gICAgICBzZWN1cmU/OiBib29sZWFuO1xuICAgICAgc2FtZVNpdGU/OiAnTGF4JyB8ICdOb25lJyB8ICdTdHJpY3QnO1xuICAgIH1cbiAgKTogdm9pZDtcblxuICBzZXQoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgZXhwaXJlc09yT3B0aW9ucz86IG51bWJlciB8IERhdGUgfCBhbnksXG4gICAgcGF0aD86IHN0cmluZyxcbiAgICBkb21haW4/OiBzdHJpbmcsXG4gICAgc2VjdXJlPzogYm9vbGVhbixcbiAgICBzYW1lU2l0ZT86ICdMYXgnIHwgJ05vbmUnIHwgJ1N0cmljdCdcbiAgKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRvY3VtZW50SXNBY2Nlc3NpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBleHBpcmVzT3JPcHRpb25zID09PSAnbnVtYmVyJyB8fCBleHBpcmVzT3JPcHRpb25zIGluc3RhbmNlb2YgRGF0ZSB8fCBwYXRoIHx8IGRvbWFpbiB8fCBzZWN1cmUgfHwgc2FtZVNpdGUpIHtcbiAgICAgIGxldCBvcHRpb25zQm9keTtcbiAgICAgIGlmICh0eXBlb2YgZXhwaXJlc09yT3B0aW9ucyA9PT0gJ251bWJlcicgJiYgZXhwaXJlc09yT3B0aW9ucyA+IHRoaXMuQ09PS0lFX0VYUElSWV9EQVlTX01BWCkge1xuICAgICAgICBvcHRpb25zQm9keSA9IHtcbiAgICAgICAgICBleHBpcmVzU2Vjb25kczogZXhwaXJlc09yT3B0aW9ucyxcbiAgICAgICAgICBwYXRoLFxuICAgICAgICAgIGRvbWFpbixcbiAgICAgICAgICBzZWN1cmUsXG4gICAgICAgICAgc2FtZVNpdGU6IHNhbWVTaXRlID8gc2FtZVNpdGUgOiAnTGF4JyxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdGlvbnNCb2R5ID0ge1xuICAgICAgICAgIGV4cGlyZXM6IGV4cGlyZXNPck9wdGlvbnMsXG4gICAgICAgICAgcGF0aCxcbiAgICAgICAgICBkb21haW4sXG4gICAgICAgICAgc2VjdXJlLFxuICAgICAgICAgIHNhbWVTaXRlOiBzYW1lU2l0ZSA/IHNhbWVTaXRlIDogJ0xheCcsXG4gICAgICAgIH07XG4gICAgICB9XG5cblxuICAgICAgdGhpcy5zZXQobmFtZSwgdmFsdWUsIG9wdGlvbnNCb2R5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgY29va2llU3RyaW5nOiBzdHJpbmcgPSBlbmNvZGVVUklDb21wb25lbnQobmFtZSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgJzsnO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IGV4cGlyZXNPck9wdGlvbnMgPyBleHBpcmVzT3JPcHRpb25zIDoge307XG5cbiAgICBpZiAob3B0aW9ucy5leHBpcmVzKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgZGF0ZUV4cGlyZXM6IERhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLmdldFRpbWUoKSArIG9wdGlvbnMuZXhwaXJlcyAqIDEwMDAgKiA2MCAqIDYwICogMjQpO1xuXG4gICAgICAgIGNvb2tpZVN0cmluZyArPSAnZXhwaXJlcz0nICsgZGF0ZUV4cGlyZXMudG9VVENTdHJpbmcoKSArICc7JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvb2tpZVN0cmluZyArPSAnZXhwaXJlcz0nICsgb3B0aW9ucy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgKyAnOyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZXhwaXJlc1NlY29uZHMpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5leHBpcmVzU2Vjb25kcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgZGF0ZUV4cGlyZXM6IERhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLmdldFRpbWUoKSArIG9wdGlvbnMuZXhwaXJlc1NlY29uZHMgKiAxMDAwKTtcbiAgICAgICAgY29va2llU3RyaW5nICs9ICdleHBpcmVzPScgKyBkYXRlRXhwaXJlcy50b1VUQ1N0cmluZygpICsgJzsnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnBhdGgpIHtcbiAgICAgIGNvb2tpZVN0cmluZyArPSAncGF0aD0nICsgb3B0aW9ucy5wYXRoICsgJzsnO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRvbWFpbikge1xuICAgICAgY29va2llU3RyaW5nICs9ICdkb21haW49JyArIG9wdGlvbnMuZG9tYWluICsgJzsnO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnNlY3VyZSA9PT0gZmFsc2UgJiYgb3B0aW9ucy5zYW1lU2l0ZSA9PT0gJ05vbmUnKSB7XG4gICAgICBvcHRpb25zLnNlY3VyZSA9IHRydWU7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBbbmd4LWNvb2tpZS1zZXJ2aWNlXSBDb29raWUgJHtuYW1lfSB3YXMgZm9yY2VkIHdpdGggc2VjdXJlIGZsYWcgYmVjYXVzZSBzYW1lU2l0ZT1Ob25lLmAgK1xuICAgICAgICBgTW9yZSBkZXRhaWxzIDogaHR0cHM6Ly9naXRodWIuY29tL3N0ZXZlcm1laXN0ZXIvbmd4LWNvb2tpZS1zZXJ2aWNlL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtNTk3NzIwMTMwYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2VjdXJlKSB7XG4gICAgICBjb29raWVTdHJpbmcgKz0gJ3NlY3VyZTsnO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5zYW1lU2l0ZSkge1xuICAgICAgb3B0aW9ucy5zYW1lU2l0ZSA9ICdMYXgnO1xuICAgIH1cblxuICAgIGNvb2tpZVN0cmluZyArPSAnc2FtZVNpdGU9JyArIG9wdGlvbnMuc2FtZVNpdGUgKyAnOyc7XG5cbiAgICB0aGlzLmRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZVN0cmluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgY29va2llIGJ5IG5hbWVcbiAgICpcbiAgICogQHBhcmFtIG5hbWUgICBDb29raWUgbmFtZVxuICAgKiBAcGFyYW0gcGF0aCAgIENvb2tpZSBwYXRoXG4gICAqIEBwYXJhbSBkb21haW4gQ29va2llIGRvbWFpblxuICAgKiBAcGFyYW0gc2VjdXJlIENvb2tpZSBzZWN1cmUgZmxhZ1xuICAgKiBAcGFyYW0gc2FtZVNpdGUgQ29va2llIHNhbWVTaXRlIGZsYWcgLSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvU2V0LUNvb2tpZS9TYW1lU2l0ZVxuICAgKi9cbiAgZGVsZXRlKG5hbWU6IHN0cmluZywgcGF0aD86IHN0cmluZywgZG9tYWluPzogc3RyaW5nLCBzZWN1cmU/OiBib29sZWFuLCBzYW1lU2l0ZTogJ0xheCcgfCAnTm9uZScgfCAnU3RyaWN0JyA9ICdMYXgnKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRvY3VtZW50SXNBY2Nlc3NpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGV4cGlyZXNEYXRlID0gbmV3IERhdGUoJ1RodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDEgR01UJyk7XG4gICAgdGhpcy5zZXQobmFtZSwgJycsIHsgZXhwaXJlczogZXhwaXJlc0RhdGUsIHBhdGgsIGRvbWFpbiwgc2VjdXJlLCBzYW1lU2l0ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYWxsIGNvb2tpZXNcbiAgICpcbiAgICogQHBhcmFtIHBhdGggICBDb29raWUgcGF0aFxuICAgKiBAcGFyYW0gZG9tYWluIENvb2tpZSBkb21haW5cbiAgICogQHBhcmFtIHNlY3VyZSBJcyB0aGUgQ29va2llIHNlY3VyZVxuICAgKiBAcGFyYW0gc2FtZVNpdGUgSXMgdGhlIGNvb2tpZSBzYW1lIHNpdGVcbiAgICovXG4gIGRlbGV0ZUFsbChwYXRoPzogc3RyaW5nLCBkb21haW4/OiBzdHJpbmcsIHNlY3VyZT86IGJvb2xlYW4sIHNhbWVTaXRlOiAnTGF4JyB8ICdOb25lJyB8ICdTdHJpY3QnID0gJ0xheCcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZG9jdW1lbnRJc0FjY2Vzc2libGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb29raWVzOiBhbnkgPSB0aGlzLmdldEFsbCgpO1xuXG4gICAgZm9yIChjb25zdCBjb29raWVOYW1lIGluIGNvb2tpZXMpIHtcbiAgICAgIGlmIChjb29raWVzLmhhc093blByb3BlcnR5KGNvb2tpZU5hbWUpKSB7XG4gICAgICAgIHRoaXMuZGVsZXRlKGNvb2tpZU5hbWUsIHBhdGgsIGRvbWFpbiwgc2VjdXJlLCBzYW1lU2l0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=