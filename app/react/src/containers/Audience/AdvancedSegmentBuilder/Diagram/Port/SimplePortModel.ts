import { PortModel } from 'storm-react-diagrams';
import SimpleLinkModel from '../Link/SimpleLinkModel';

export default class SimplePortModel extends PortModel {
  constructor(name: string) {
    super(name, 'simple');
  }

  createLinkModel() {
    const linkModel = new SimpleLinkModel();
    linkModel.setSourcePort(this);
    return linkModel;
  }
}
