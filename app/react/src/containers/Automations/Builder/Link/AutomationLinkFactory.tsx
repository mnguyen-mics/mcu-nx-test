import * as React from 'react';
import { DiagramEngine, AbstractLinkFactory } from 'storm-react-diagrams';
import AutomationLinkWidget from './AutomationLinkWidget';
import AutomationLinkModel from './AutomationLinkModel';

export default class AutomationLinkFactory extends AbstractLinkFactory<AutomationLinkModel> {
  constructor() {
    super('simple');
  }

  generateReactWidget(diagramEngine: DiagramEngine, link: AutomationLinkModel): JSX.Element {
    return React.createElement(AutomationLinkWidget, {
      link: link,
      diagramEngine: diagramEngine,
    });
  }

  getNewInstance(initialConfig?: any): AutomationLinkModel {
    return new AutomationLinkModel();
  }

  generateLinkSegment(model: AutomationLinkModel, widget: any, selected: boolean, path: string) {
    return <path strokeWidth={model.width} stroke={model.color} d={path} />;
  }
}
