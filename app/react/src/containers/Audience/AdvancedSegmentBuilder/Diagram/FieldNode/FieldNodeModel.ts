import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { FieldNode } from '../../../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class FieldNodeModel extends NodeModel implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  edition = false;
  treeNodePath: number[] = [];
  objectTypeInfo: ObjectLikeTypeInfoResource;
  fieldNode: FieldNode;

  constructor(fieldNode?: FieldNode, treeNodePath?: number[]) {
    super('field-node');

    if (fieldNode === undefined || treeNodePath === undefined) {
      throw new Error('Missing parameters');
    }

    this.addPort(new SimplePortModel('right'));
    this.addPort(new SimplePortModel('left'));
    this.addPort(new SimplePortModel('bottom'));
    this.addPort(new SimplePortModel('top'));

    this.fieldNode = fieldNode;
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
    if (this.extras.edition) {
      return '#00a1df';
    }
    if (this.extras.negation) {
      return '#ff5959';
    }
    return '#00ad68';
  };
}
