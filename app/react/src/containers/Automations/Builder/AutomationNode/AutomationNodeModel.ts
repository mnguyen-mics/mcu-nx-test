import { NodeModel } from 'storm-react-diagrams';
import { QueryBuilderNode } from '../../../QueryTool/JSONOTQL/domain';
import { GroupNode, ObjectNode } from '../../../../models/datamart/graphdb/QueryDocument';
import SimplePortModel from '../../../QueryTool/JSONOTQL/Diagram/Port/SimplePortModel';
import { McsIconType } from '../../../../components/McsIcon';


export default class AutomationNodeModel extends NodeModel
  implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];
  iconType: McsIconType;
  title: string;
  color: string;
  objectOrGroupNode?: GroupNode | ObjectNode;
  root?: boolean;
  

  constructor(
    iconType: McsIconType,
    title: string,
    color: string,
    objectOrGroupNode?: GroupNode | ObjectNode,
    treeNodePath?: number[],
  ) {
    super('plus-node');

    this.addPort(new SimplePortModel('right'));
    this.addPort(new SimplePortModel('left'));
    this.addPort(new SimplePortModel('bottom'));
    this.addPort(new SimplePortModel('top'));

    if (objectOrGroupNode !== undefined && treeNodePath !== undefined) {
      this.objectOrGroupNode = objectOrGroupNode;
      this.treeNodePath = treeNodePath;
    }
    this.iconType = iconType;
    this.title = title;
    this.color = color;
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
