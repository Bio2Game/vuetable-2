# Vuetable-2 - data table simplify

[![npm](https://img.shields.io/npm/v/vuetable-2/next.svg)](https://www.npmjs.com/package/vuetable-2)
[![npm](https://img.shields.io/npm/dt/vuetable-2.svg)](https://www.npmjs.com/package/vuetable-2)
[![npm](https://img.shields.io/npm/l/vuetable-2.svg?maxAge=2592000)](https://github.com/ratiw/vuetable-2/blob/master/LICENSE)

## Documentation and Tutorial

You can find documentation for v2.0 of Vuetable-2 [here](https://vuetable.com)

The tutorial for v2.0 is in the work, so you'll have to wait until I can find the time to finish it, sorry.

## Sample Codes

I've created a bunch of examples in the [CodeSandbox](https://codesandbox.io/u/ratiw/sandboxes), please have a look.

If you any question, please post your questions in the "Issues" section of [this Q&A repo](https://github.com/vuetable/Q-and-A/issues). Be sure to put the link to the appropriate CodeSandbox in question, or the one that you forked.

## Usage

### NPM

```shell
npm install vuetable-2@next --save-dev
```

### Javascript via CDN

> Note
>
> This has not been test thoroughly in this beta version, and any help would be much appreciated.

```html
// vuetable-2 dependencies
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.16/vue.min.js"></script>
// vuetable-2
<script src="https://unpkg.com/vuetable-2@next"></script>
Vue.use(Vuetable)
```

The `.use` from above will register all the components globally.

```javascript
function install(Vue) {
  Vue.component("vuetable", Vuetable);
  Vue.component("vuetable-pagination", VuetablePagination);
  Vue.component("vuetable-pagination-dropdown", VuetablePaginationDropDown);
  Vue.component("vuetable-pagination-info", VuetablePaginationInfo);
}
```

Also you have the ability to access certain components if you need them:

```javascript
Vuetable: Vuetable.default/Vuetable.Vuetable,
VuetablePagination: Vuetable.VuetablePagination,
VuetablePaginationInfo: Vuetable.VuetablePaginationInfo,
VuetablePaginationDropdown: Vuetable.VuetablePaginationDropdown
```

## Contributions

Any contribution to the code must be done to the `next` branch.

## License

Vuetable is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
