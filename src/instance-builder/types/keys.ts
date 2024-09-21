export type UnionOverlap<A, B> = A & B;
type KeyOverlap<A extends object, B extends object> = UnionOverlap<
  keyof A,
  keyof B
>;
export type Overlap<A extends {}, B extends {}> = {
  [PropA in KeyOverlap<A, B>]: A[PropA];
};

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type PickType<T, U> = Pick<
  T,
  {[K in keyof T]: T[K] extends U ? K : never}[keyof T]
>;
type PickNotType<T, U> = Pick<
  T,
  {[K in keyof T]: T[K] extends U ? never : K}[keyof T]
>;

export type MutableKey<T> = {
  [P in keyof T]-?: IfEquals<{[Q in P]: T[P]}, {-readonly [Q in P]: T[P]}, P>;
}[keyof T] &
  string;
export type Mutable<T> = {
  [P in MutableKey<T>]: T[P];
};

export type Collections<T> = PickType<T, Array<unknown>>;
export type MutableCollections<T> = Overlap<Collections<T>, Mutable<T>>;
export type MutableCollectionKey<T> = keyof MutableCollections<T>;
export type NonCollections<T> = PickNotType<T, Array<unknown>>;
export type MutableNonCollections<T> = Overlap<NonCollections<T>, Mutable<T>>;
export type MutableNonCollectionKey<T> = keyof MutableNonCollections<T>;
