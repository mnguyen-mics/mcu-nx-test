import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { ObjectNode } from '../../../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class ObjectNodeModel extends NodeModel implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];
  objectNode: ObjectNode;
  objectTypeInfo: ObjectLikeTypeInfoResource;

  constructor(objectNode?: ObjectNode, treeNodePath?: number[]) {
    super('object-node');

    if (objectNode === undefined || treeNodePath === undefined) {
      throw new Error('Missing parameters');
    }

    this.addPort(new SimplePortModel('right'));
    this.addPort(new SimplePortModel('left'));
    this.addPort(new SimplePortModel('bottom'));
    this.addPort(new SimplePortModel('top'));

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
