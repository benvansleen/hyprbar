type Index_<T extends number> = `${T}` extends `-${any}` | `${any}.${any}`
  ? never
  : T;
export type Index = Index_<number>;

type Float_<T extends number> = `${T}` extends `${number}.${number}`
  ? T
  : never;
export type Float = Float_<number>;
