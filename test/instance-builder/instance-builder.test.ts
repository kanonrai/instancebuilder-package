import {InstanceBuilder} from '../../src';
import {InstanceBuilderType} from '../../src/instance-builder';

class TestClass {
  public collection: string[] = [];

  public dates: Date[] = [];

  public testField = '';

  constructor(
    public arg1: number,
    public arg2: Array<number>,
    public readonly arg3: number | undefined,
    private readonly arg4?: Date
  ) {}

  getArg4() {
    return this.arg4;
  }
}

describe('InstanceBuilder', () => {
  const date = new Date();
  const defaultArgs: ConstructorParameters<typeof TestClass> = [
    1,
    [2],
    3,
    date,
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sut: InstanceBuilderType<
    TestClass,
    ConstructorParameters<typeof TestClass>
  >;
  beforeEach(() => {
    sut = InstanceBuilder.create(TestClass);
  });
  describe('create', () => {
    it('should return an object with build function', () => {
      expect(sut.build).toBeInstanceOf(Function);
    });
  });
  describe('build', () => {
    it('should build instance using parameters', () => {
      const instance = sut.build(...defaultArgs);
      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.arg1).toBe(defaultArgs[0]);
      expect(instance.arg2).toBe(defaultArgs[1]);
      expect(instance.arg3).toBe(defaultArgs[2]);
      expect(instance.getArg4()).toBe(defaultArgs[3]);
    });
    it('should keep returning instances', () => {
      sut.setArg1(10);
      const result = [
        sut.build(...defaultArgs),
        sut.build(...defaultArgs),
        sut.build(...defaultArgs),
        sut.build(...defaultArgs),
      ];
      result.forEach(instance => {
        expect(instance).toBeInstanceOf(TestClass);
        expect(instance.arg1).toBe(10);
      });
      expect(new Set(result).size).toEqual(result.length);
    });
  });
  describe('reflections', () => {
    it('should reflect setArg1 function', () => {
      expect(sut.setArg1).toBeInstanceOf(Function);
    });
    it('should reflect setDates function', () => {
      expect(sut.setDates).toBeInstanceOf(Function);
    });
    it('should reflect setCollection function', () => {
      expect(sut.setCollection).toBeInstanceOf(Function);
    });
    it('should reflect addToDates function', () => {
      expect(sut.addToDates).toBeInstanceOf(Function);
    });
    it('should reflect addToDates function', () => {
      expect(sut.addToCollection).toBeInstanceOf(Function);
    });
  });
  describe('set[field]', () => {
    it('should set the field', () => {
      sut.setTestField('value');
      const instance = sut.build(...defaultArgs);
      expect(instance.testField).toBe('value');
    });
    it('should supercede build parameter', () => {
      sut.setArg1(5);
      const instance = sut.build(...defaultArgs);
      expect(instance.arg1).toBe(5);
    });
    it('should return the builder', () => {
      const builder = sut.setArg1(10);
      expect(sut).toBe(builder);
    });
  });
  describe('addTo[collection]', () => {
    it('should add to the collection', () => {
      sut.addToCollection('value1');
      sut.addToCollection('value2');
      const instance = sut.build(...defaultArgs);
      expect(instance.collection).toEqual(['value1', 'value2']);
    });
    it('should supercede build parameter', () => {
      sut.addToArg2(5);
      sut.addToArg2(6);
      const instance = sut.build(...defaultArgs);
      expect(instance.arg2).toEqual([5, 6]);
    });
    it('should return the builder', () => {
      const builder = sut.addToCollection('thing');
      expect(sut).toBe(builder);
    });
  });
});
