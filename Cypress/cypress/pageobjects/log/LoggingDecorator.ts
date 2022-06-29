import { LoggerFactory } from './LoggerFactory';
import { logLevel } from '../../support/logLevel';

const logger = LoggerFactory.getInstance();

export function logFunction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      if (logLevel >= 1) {
        logger.log(`Calling ${propertyKey} (Class: ${target.constructor.name})`);
      }
      return targetMethod.apply(this, args);
    };
    return descriptor;
  };
}

export function logGetter() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.get;
    descriptor.get = function () {
      if (logLevel >= 2) {
        logger.log(`Getting ${propertyKey} (Class: ${target.constructor.name})`);
      }
      return targetMethod?.apply(this);
    };
    return descriptor;
  };
}
