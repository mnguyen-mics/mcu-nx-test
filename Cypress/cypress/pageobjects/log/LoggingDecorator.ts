import { LoggerFactory } from './LoggerFactory';

const logger = LoggerFactory.getInstance();

export function logFunction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      logger.log(`Calling ${propertyKey} (Class: ${target.constructor.name})`);
      return targetMethod.apply(this, args);
    };
    return descriptor;
  };
}

export function logGetter() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.get;
    descriptor.get = function (...args: any[]) {
      logger.log(`Getting ${propertyKey} (Class: ${target.constructor.name})`);
      return targetMethod?.apply(this);
    };
    return descriptor;
  };
}
