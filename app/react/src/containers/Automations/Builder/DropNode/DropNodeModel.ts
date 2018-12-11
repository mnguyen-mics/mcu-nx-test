import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';


export default class DropNodeModel extends NodeModel {
  collapsed = false;
  negation = false;
  color:string;

  constructor() {
    super('drop-node');

    this.addPort(new SimplePortModel('center'));
    this.addPort(new SimplePortModel('right'));

    this.color = '#919191';
  }

  getPosition = () => {
    return {
      x: this.x,
      y: this.y,
    };
  };

  getSize() {
    return {
      width: 20,
      height: 20,
      borderWidth: 1,
    };
  };

  getColor() {
    return this.color;
  };
}
