// Ambient types for CSS Modules, so `import styles from './X.module.css'`
// typechecks. Every `*.module.css` import resolves to a class-name map.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
