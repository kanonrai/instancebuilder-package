import {
  Mutable,
  MutableCollectionKey,
  MutableKey,
  MutableNonCollectionKey,
} from './types/keys';
import {TupleDefinedAnyRequiredAnyOptional} from './types/tuple';

const ADD_TO_COLLECTION_PREFIX = 'addTo' as const;
const SET_FIELD_PREFIX = 'set' as const;

type SetFieldFunction<
  T extends {},
  P extends keyof T,
  Args extends unknown[],
> = (value: T[P]) => InstanceBuilderType<T, Args>;
type AddToCollectionFunction<
  T extends {},
  P extends keyof T,
  Args extends unknown[],
> =
  T[P] extends Array<unknown>
    ? (...values: T[P]) => InstanceBuilderType<T, Args>
    : never;
type InstanceBuilderSetFields<T extends {}, Args extends unknown[]> = {
  [P in MutableKey<T> as `${typeof SET_FIELD_PREFIX}${Capitalize<string & P>}`]: SetFieldFunction<
    T,
    P,
    Args
  >;
};
type InstanceBuilderAddToCollections<T extends {}, Args extends unknown[]> = {
  [P in MutableCollectionKey<T> as `${typeof ADD_TO_COLLECTION_PREFIX}${Capitalize<string & P>}`]: T[P] extends Array<unknown>
    ? AddToCollectionFunction<T, P, Args>
    : never;
};
type InstanceBuilderReflections<
  T extends {},
  Args extends unknown[],
> = InstanceBuilderSetFields<T, Args> &
  InstanceBuilderAddToCollections<T, Args>;
interface IInstanceBuilder<Type, Args extends unknown[]> {
  build: (...args: TupleDefinedAnyRequiredAnyOptional<Args>) => Type;
}
export type InstanceBuilderType<
  T extends {},
  Args extends unknown[],
> = InstanceBuilder<T, Args> &
  IInstanceBuilder<T, Args> &
  InstanceBuilderReflections<T, Args>;

export class InstanceBuilder<Class extends {}, Args extends unknown[]> {
  private readonly fields: Partial<Mutable<Class>> = {};

  private constructor(
    private readonly cnstrctr: new (...args: Args) => Class
  ) {}

  static create<Class extends {}, Args extends unknown[]>(
    cnstrctr: new (...args: Args) => Class
  ): InstanceBuilderType<Class, Args> {
    const instance = new InstanceBuilder<Class, Args>(cnstrctr);
    const proxyHandler: ProxyHandler<typeof instance> = {
      get: (target, propertyKey, receiver) => {
        if (typeof propertyKey !== 'string')
          throw new Error('What is this?' + propertyKey.toString()); // Should be impossible

        if (propertyKey.startsWith(SET_FIELD_PREFIX)) {
          const fieldName = InstanceBuilder.getFieldName(
            propertyKey,
            SET_FIELD_PREFIX
          ) as MutableNonCollectionKey<Class>;
          return instance.getSetFieldFunction(fieldName, receiver);
        }

        if (propertyKey.startsWith(ADD_TO_COLLECTION_PREFIX)) {
          const fieldName = InstanceBuilder.getFieldName(
            propertyKey,
            ADD_TO_COLLECTION_PREFIX
          ) as MutableCollectionKey<Class>;
          return instance.getAddToCollectionFunction(fieldName, receiver);
        }

        return Reflect.get(target, propertyKey, receiver);
      },
    };
    return new Proxy(instance, proxyHandler) as unknown as InstanceBuilderType<
      Class,
      Args
    >;
  }

  public build(...args: TupleDefinedAnyRequiredAnyOptional<Args>) {
    const instance = new this.cnstrctr(...(args as Args));
    this.applyFields(instance);
    return instance;
  }

  private applyFields(instance: Class) {
    Object.assign(instance, this.fields);
  }

  private getSetFieldFunction(
    fieldName: MutableNonCollectionKey<Class>,
    proxy: InstanceBuilderType<Class, Args>
  ): SetFieldFunction<Class, typeof fieldName, Args> {
    return (value: (typeof this.fields)[typeof fieldName]) => {
      this.putField(fieldName, value);
      return proxy;
    };
  }

  private getAddToCollectionFunction(
    collectionName: MutableCollectionKey<Class>,
    proxy: InstanceBuilderType<Class, Args>
  ): AddToCollectionFunction<Class, typeof collectionName, Args> {
    return ((...newEntries: unknown[]) => {
      const val =
        (this.fields[collectionName] as Array<unknown> | undefined) ?? [];
      const fullVal = [
        ...val,
        ...newEntries,
      ] as InstanceBuilderFieldValue<Class>;
      this.putField(collectionName, fullVal);
      return proxy;
    }) as unknown as AddToCollectionFunction<
      Class,
      typeof collectionName,
      Args
    >;
  }

  private putField<FieldName extends InstanceBuilderFieldName<Class>>(
    field: FieldName,
    value: Partial<Mutable<Class>>[FieldName]
  ) {
    this.fields[field] = value;
  }

  private static getFieldName<Class extends {}>(
    propertyKey: string,
    withPrefix: string
  ): InstanceBuilderFieldName<Class> {
    const capitalizedFieldName = propertyKey.slice(withPrefix.length);
    const fieldName = [
      capitalizedFieldName[0].toLowerCase(),
      ...capitalizedFieldName.slice(1),
    ].join('');
    return fieldName as InstanceBuilderFieldName<Class>;
  }
}
type InstanceBuilderFields<Class extends {}> = InstanceBuilder<
  Class,
  unknown[]
>['fields'];
type InstanceBuilderFieldName<Class extends {}> =
  keyof InstanceBuilderFields<Class>;
type InstanceBuilderFieldValue<Class extends {}> =
  InstanceBuilderFields<Class>[InstanceBuilderFieldName<Class>];
