import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { ObjectNode, GroupNode } from '../../../../../models/datamart/graphdb/QueryDocument';

export default class BooleanOperatorNodeModel extends NodeModel implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];

  objectOrGroupNode: ObjectNode | GroupNode;

  constructor(objectOrGroupNode?: ObjectNode | GroupNode, treeNodePath?: number[]) {
    super('boolean-operator-node');

    if (objectOrGroupNode === undefined || treeNodePath === undefined) {
      throw new Error('Missing parameters');
    }

    this.addPort(new SimplePortModel('right'));
    this.addPort(new SimplePortModel('left'));
    this.addPort(new SimplePortModel('bottom'));
    this.addPort(new SimplePortModel('top'));

    this.objectOrGroupNode = objectOrGroupNode;
    this.treeNodePath = treeNodePath;
  }

  getSize() {
    return {
      width: 51,
      height: 51,
      borderWidth: 2,
    };
  }

  getColor = () => {
    if (this.extras.negation) {
      return '#ff5959';
    }
    return this.objectOrGroupNode.type === 'GROUP' ? '#00a1df' : '#00ad68';
  };
}
