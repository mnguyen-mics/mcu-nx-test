import { DefaultLinkModelListener, BaseEvent, LinkModel } from 'storm-react-diagrams';

export default class AutomationLinkModel extends LinkModel {
  color: string;
  width: number;
  constructor() {
    super('simple');
  }

  setColor(color: string) {
    this.color = color;
    this.iterateListeners((listener: DefaultLinkModelListener, event: BaseEvent) => {
      if (listener.colorChanged) {
        listener.colorChanged({ ...event, color: color });
      }
    });
  }
}
