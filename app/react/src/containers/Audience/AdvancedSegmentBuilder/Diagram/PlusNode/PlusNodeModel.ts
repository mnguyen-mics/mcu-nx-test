import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { GroupNode, ObjectNode } from '../../../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class PlusNodeModel extends NodeModel implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];
  objectOrGroupNode?: GroupNode | ObjectNode;
  objectTypeInfo?: ObjectLikeTypeInfoResource;
  root?: boolean;

  constructor(
    objectOrGroupNode?: GroupNode | ObjectNode,
    treeNodePath?: number[],
    objectTypeInfo?: ObjectLikeTypeInfoResource,
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
    this.objectTypeInfo = objectTypeInfo;
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
