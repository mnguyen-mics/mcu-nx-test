import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';
import { McsIconType } from '../../../../components/McsIcon';


export default class AutomationNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  iconType: McsIconType;
  title: string;
  color: string;
  root?: boolean;

  constructor(
    iconType: McsIconType,
    title: string,
    color: string,
  ) {
    super('automation-node');

    this.addPort(new SimplePortModel('right'));
    this.addPort(new SimplePortModel('left'));
    this.addPort(new SimplePortModel('bottom'));
    this.addPort(new SimplePortModel('top'));

    this.iconType = iconType;
    this.title = title;
    this.color = color;
  }

  getPosition = () => {
    return {
      x: this.x,
      y: this.y,
    };
  }

  getSize() {
    return {
      width: 50,
      height: 50,
      borderWidth: 2,
    };
  }

  getColor() {
    return this.color;
  }
}
