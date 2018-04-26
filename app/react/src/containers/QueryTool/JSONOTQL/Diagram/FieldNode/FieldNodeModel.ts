import { NodeModel } from 'storm-react-diagrams';
import SimplePortModel from '../Port/SimplePortModel';
import { QueryBuilderNode } from '../../domain';
import { FieldNode } from '../../../../../models/datamart/graphdb/QueryDocument';

export default class FieldNodeModel extends NodeModel
  implements QueryBuilderNode {
  collapsed = false;
  negation = false;
  treeNodePath: number[] = [];

  fieldNode: FieldNode;

  constructor(fieldNode?: FieldNode, treeNodePath?: number[]) {
    super('field-node');

    if (fieldNode === undefined || treeNodePath === undefined) {
      throw new Error('Missing parameters');
    }

    this.addPort(new SimplePortModel('center'));

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
    if (this.extras.negation) {
      return '#ff5959';
    }
    return '#00ad68';
  };
}
