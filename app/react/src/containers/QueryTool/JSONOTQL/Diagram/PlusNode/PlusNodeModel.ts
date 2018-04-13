import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import {
  GroupNode,
  ObjectNode,
} from '../../../../../models/datamart/graphdb/QueryDocument';

export default class PlusNodeModel extends NodeModel
  implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];
  objectOrGroupNode?: GroupNode | ObjectNode;
  root?: boolean;

  constructor(
    objectOrGroupNode?: GroupNode | ObjectNode,
    treeNodePath?: number[],
  ) {
    super('plus-node');

    this.addPort(new SimplePortModel('center'));

    if (objectOrGroupNode !== undefined && treeNodePath !== undefined) {
      this.objectOrGroupNode = objectOrGroupNode;
      this.treeNodePath = treeNodePath;
    }
  }

  getSize() {
    return {
      width: 50,
      height: 50,
      borderWidth: 2,
    };
  }

  getColor() {
    return '#cecece';
  }
}
