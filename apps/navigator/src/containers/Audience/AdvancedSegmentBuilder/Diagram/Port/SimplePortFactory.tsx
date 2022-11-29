import { AbstractPortFactory } from 'storm-react-diagrams';
import SimplePortModel from './SimplePortModel';

export default class SimplePortFactory extends AbstractPortFactory<SimplePortModel> {
  constructor() {
    super('simple');
  }

  getNewInstance(initialConfig?: any): SimplePortModel {
    return new SimplePortModel('unknown');
  }
}
