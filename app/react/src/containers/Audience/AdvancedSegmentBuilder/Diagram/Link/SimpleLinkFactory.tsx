import * as React from 'react';
import { DiagramEngine, AbstractLinkFactory } from 'storm-react-diagrams';
import SimpleLinkWidget from './SimpleLinkWidget';
import SimpleLinkModel from './SimpleLinkModel';

export default class SimpleLinkFactory extends AbstractLinkFactory<SimpleLinkModel> {
  constructor() {
    super('simple');
  }

  generateReactWidget(diagramEngine: DiagramEngine, link: SimpleLinkModel): JSX.Element {
    return React.createElement(SimpleLinkWidget, {
      link: link,
      diagramEngine: diagramEngine,
    });
  }

  getNewInstance(initialConfig?: any): SimpleLinkModel {
    return new SimpleLinkModel();
  }
}
