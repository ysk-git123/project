declare module '*.vue' {
  import type { DefineComponent } from '@vue/runtime-core';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}