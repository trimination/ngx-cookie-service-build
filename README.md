# NgxCookieService

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.5.

This is a modified build of the [ngx-cookie-service](https://github.com/stevermeister/ngx-cookie-service) npm
package, to allow seconds as input on the expiry time of cookies when calling set()

Any number greater than 31 will be interpreted as seconds.

This fork can be found [here](https://github.com/trimination/ngx-cookie-service)

For inclusion in package.json:
```js
  "dependencies": {
      "ngx-cookie-service": "git+https://github.com/trimination/ngx-cookie-service-build.git#main",
  }
```

```js
npm install
```
    

## Code scaffolding

Run `ng generate component component-name --project ngx-cookie-service` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-cookie-service`.
> Note: Don't forget to add `--project ngx-cookie-service` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ngx-cookie-service` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ngx-cookie-service`, go to the dist folder `cd dist/ngx-cookie-service` and run `npm publish`.

## Running unit tests

Run `ng test ngx-cookie-service` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
