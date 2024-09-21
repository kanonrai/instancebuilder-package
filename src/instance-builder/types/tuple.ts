export type TupleAny<T extends unknown[]> = T extends [...infer R, unknown]
  ? T | TupleAny<R>
  : T;

export type _TupleDefined<
  T extends unknown[],
  U extends unknown[] = [],
> = undefined extends T[0]
  ? U
  : T extends [infer F, ...infer R]
    ? _TupleDefined<R, [...U, F]>
    : U;
export type TupleDefined<T extends unknown[]> = TupleIntersectLeft<
  T,
  _TupleDefined<T>
>;

export type _TupleRequired<T extends unknown[], U extends unknown[] = []> =
  Partial<T> extends T
    ? U
    : T extends [infer F, ...infer R]
      ? _TupleRequired<R, [...U, F]>
      : U;
export type TupleRequired<T extends unknown[]> = TupleIntersectLeft<
  T,
  _TupleRequired<T>
>;

export type MaxLength<T extends unknown[]> = Required<T>['length'];
export type TuplesHaveEqualLength<L extends unknown[], R extends unknown[]> =
  MaxLength<R> extends MaxLength<L> ? true : false;

export type GetLast<T extends unknown[]> = T extends [...unknown[], infer S]
  ? S
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends [...infer U, (infer S)?]
    ? [S?][0]
    : never;

export type TupleIntersectLeft<
  L extends unknown[],
  R extends unknown[],
  OL extends unknown[] = L,
  OR extends unknown[] = R,
> =
  TuplesHaveEqualLength<L, R> extends true
    ? OL
    : R extends [...infer RRest, unknown?]
      ? unknown extends GetLast<R>
        ? L extends [...infer LRest, unknown?]
          ? TupleIntersectLeft<LRest, OR, LRest, OR>
          : never
        : TupleIntersectLeft<L, RRest, OL, OR>
      : never;

export type TupleAnyDefined<T extends unknown[]> = TupleAny<TupleDefined<T>>;
export type TupleAnyRequired<T extends unknown[]> = TupleAny<TupleRequired<T>>;

export type TupleLeftover<
  T extends unknown[],
  U extends unknown[],
> = T extends [unknown, ...infer TRest]
  ? U extends [unknown, ...infer URest]
    ? TupleLeftover<TRest, URest>
    : T
  : U;
export type TupleAnyLeftover<
  T extends unknown[],
  U extends unknown[],
> = TupleAny<TupleLeftover<T, U>>;

export type TupleDefinedAnyRequired<T extends unknown[]> =
  | TupleDefined<T>
  | [
      ...TupleDefined<T>,
      ...TupleAnyLeftover<TupleDefined<T>, TupleRequired<T>>,
    ];
export type TupleDefinedAnyRequiredAnyOptional<T extends unknown[]> =
  | TupleDefinedAnyRequired<T>
  | [...TupleRequired<T>, ...TupleAnyLeftover<TupleRequired<T>, T>];
