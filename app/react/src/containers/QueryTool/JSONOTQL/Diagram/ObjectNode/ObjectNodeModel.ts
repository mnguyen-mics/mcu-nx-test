import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { ObjectNode } from '../../../../../models/datamart/graphdb/QueryDocument';

export default class ObjectNodeModel extends NodeModel
  implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];
  objectNode: ObjectNode;
  parentObjectNode?: ObjectNode;

  constructor(objectNode?: ObjectNode, treeNodePath?: number[]) {
    super('object-node');

    if (objectNode === undefined || treeNodePath === undefined) {
      throw new Error('Missing parameters');
    }

    this.addPort(new SimplePortModel('center'));

    this.objectNode = objectNode;
    this.negation = !!objectNode.negation;
    this.treeNodePath = treeNodePath;
  }

  getSize() {
    return {
      width: 200,
      height: 70,
      borderWidth: 2,
    };
  }

  getColor = () => {
    if (this.extras.negation) {
      return '#ff5959';
    }
    return '#00ad68';
  };
}
