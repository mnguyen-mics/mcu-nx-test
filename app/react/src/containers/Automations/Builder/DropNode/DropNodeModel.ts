import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';
import { DropNode } from '../domain';

export default class DropNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  color: string;
  dropNode: DropNode;

  constructor(dropNode: DropNode, height: number) {
    super('drop-node');

    this.addPort(new SimplePortModel('center'));
    this.addPort(new SimplePortModel('right'));

    this.color = '#919191';
    this.dropNode = dropNode;
    this.height = height;
  }

  getPosition = () => {
    return {
      x: this.x,
      y: this.y,
    };
  };

  getNodeSize() {
    return {
      width: 20,
      height: 20,
      borderWidth: 1,
    };
  }

  getColor() {
    return this.color;
  }
}
