import { PortModel, LinkModel, NodeModel } from 'storm-react-diagrams';
import { SimpleLinkModel } from './Diagram/Link';
import { BooleanOperatorNodeModel } from './Diagram/BooleanOperatorNode';
import { FieldNodeModel } from './Diagram/FieldNode';
import { PlusNodeModel } from './Diagram/PlusNode';
import { ObjectNodeModel } from './Diagram/ObjectNode';
import {
  ObjectTreeExpressionNodeShape,
  FieldNode,
  ObjectNode,
} from '../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';

export const MIN_X = 100;
export const MIN_Y = 100;
export const ROOT_NODE_POSITION: Point = {
  x: 100,
  y: 150,
};

export function createLink(source: PortModel, target: PortModel) {
  const link = new SimpleLinkModel();
  link.setSourcePort(source);
  link.setTargetPort(target);
  return link;
}

export interface Point {
  x: number;
  y: number;
}

export interface QueryBuilderNode {
  collapsed: boolean;
  negation: boolean;
  treeNodePath: number[];
  getSize: () => { width: number; height: number; borderWidth: number };
  getColor: () => string;
}

export type CustomNodeShape =
  | BooleanOperatorNodeModel
  | FieldNodeModel
  | ObjectNodeModel
  | PlusNodeModel;

export interface NodeModelBTree {
  node: CustomNodeShape;
  right?: NodeModelBTree;
  down?: NodeModelBTree;
}

export interface Operation {
  path: number[];

  execute(
    treeNode: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape | undefined;
}

export class AddOperation implements Operation {
  path: number[];
  node: ObjectTreeExpressionNodeShape;

  constructor(path: number[], node: ObjectTreeExpressionNodeShape) {
    this.path = path;
    this.node = node;
  }

  execute(
    treeNode?: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape | undefined {
    if (!treeNode) return this.node;

    if (isLeafNode(treeNode)) {
      return treeNode;
    }

    if (this.path.length === 0) {
      return {
        ...treeNode,
        expressions: treeNode.expressions.concat(this.node),
      };
    }

    const [head, ...tail] = this.path;

    return {
      ...treeNode,
      expressions: [
        ...treeNode.expressions.slice(0, head),
        new AddOperation(tail, this.node).execute(treeNode.expressions[head])!,
        ...treeNode.expressions.slice(head + 1),
      ],
    };
  }
}

export class DeleteOperation implements Operation {
  path: number[];

  constructor(path: number[]) {
    this.path = path;
  }

  execute(
    treeNode: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape | undefined {
    const result = this.deleteNode(treeNode, this.path);
    if (result !== undefined) {
      return this.removeNestedEmptyGroupNode(result);
    }
    return result;
  }

  private deleteNode(
    treeNode: ObjectTreeExpressionNodeShape,
    _path: number[],
  ): ObjectTreeExpressionNodeShape | undefined {
    if (isLeafNode(treeNode)) {
      return treeNode;
    }

    if (_path.length === 0) {
      return undefined;
    } else if (_path.length === 1) {
      return {
        ...treeNode,
        expressions: [
          ...treeNode.expressions.slice(0, _path[0]),
          ...treeNode.expressions.slice(_path[0] + 1),
        ],
      };
    }

    const [head, ...tail] = _path;
    return {
      ...treeNode,
      expressions: [
        ...treeNode.expressions.slice(0, head),
        this.deleteNode(treeNode.expressions[head], tail)!,
        ...treeNode.expressions.slice(head + 1),
      ],
    };
  }

  private removeNestedEmptyGroupNode(
    treeNode: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape | undefined {
    function removeEmptyGroupNode(
      _treeNode: ObjectTreeExpressionNodeShape,
    ): ObjectTreeExpressionNodeShape | undefined {
      if (isLeafNode(_treeNode)) {
        return _treeNode;
      } else if (
        _treeNode.type === 'GROUP' &&
        _treeNode.expressions.length === 0
      ) {
        return undefined;
      }
      return {
        ..._treeNode,
        expressions: _treeNode.expressions.reduce((acc, expr) => {
          const newExpr = removeEmptyGroupNode(expr);
          return newExpr ? [...acc, newExpr] : acc;
        }, []),
      };
    }

    function nodeCount(
      _treeNode: ObjectTreeExpressionNodeShape,
      countAcc: number = 0,
    ): number {
      const count = countAcc + 1;

      if (isLeafNode(_treeNode) || _treeNode.expressions.length === 0) {
        return count;
      }

      return _treeNode.expressions.reduce((acc, expr) => {
        return acc + nodeCount(expr, acc);
      }, count);
    }

    function recursiveRemoval(
      _treeNode: ObjectTreeExpressionNodeShape,
      hasChanged: boolean = true,
    ): ObjectTreeExpressionNodeShape | undefined {
      if (!hasChanged) return _treeNode;
      const newTree = removeEmptyGroupNode(_treeNode);
      if (!newTree) return undefined;
      const _hasChanged = nodeCount(newTree) !== nodeCount(_treeNode);
      return recursiveRemoval(newTree, _hasChanged);
    }

    return recursiveRemoval(treeNode);
  }
}

export class UpdateOperation implements Operation {
  path: number[];
  node: ObjectTreeExpressionNodeShape;

  constructor(path: number[], node: ObjectTreeExpressionNodeShape) {
    this.path = path;
    this.node = node;
  }

  execute(
    treeNode: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape | undefined {
    if (isLeafNode(treeNode)) {
      return treeNode;
    }

    if (this.path.length === 0) {
      return this.node;
    }

    const [head, ...tail] = this.path;
    return {
      ...treeNode,
      expressions: [
        ...treeNode.expressions.slice(0, head),
        new UpdateOperation(tail, this.node).execute(
          treeNode.expressions[head],
        )!,
        ...treeNode.expressions.slice(head + 1),
      ],
    };
  }
}

export interface TreeNodeOperations {
  deleteNode: (nodePath: number[]) => void;
  addNode: (nodePath: number[], node: ObjectTreeExpressionNodeShape) => void;
  updateNode: (nodePath: number[], node: ObjectTreeExpressionNodeShape) => void;
  updateLayout: () => void;
  addNewGroupAsRoot: () => void;
}

export function isLeafNode(
  node: ObjectTreeExpressionNodeShape,
): node is FieldNode {
  return node.type === 'FIELD';
}

export function setUniqueModelId(
  tree: NodeModelBTree,
  depth: number = 0,
  path: string[] = ['root'],
) {
  tree.node.id = path.join('-');
  if (tree.right) {
    setUniqueModelId(tree.right, depth + 1, path.concat(`r${depth}`));
  }
  if (tree.down) {
    setUniqueModelId(tree.down, depth + 1, path.concat(`d${depth}`));
  }
}

function containsAllField(
  objectNode: ObjectNode,
  objectTypes: ObjectLikeTypeInfoResource[] = [],
): boolean {
  if (objectTypes.length === 0) return true;
  const currentObject = objectTypes.find(type => type.name === objectNode.field);
  return !!(currentObject &&
    objectTypes
      .filter(t => currentObject.fields.map(f => f.field_type).find((i: string) => i.indexOf(t.name) > -1)
        ).length === 0);
}

export function buildNodeModelBTree(
  treeNode: ObjectTreeExpressionNodeShape,
  objectTypes: ObjectLikeTypeInfoResource[],
  treeNodePath: number[] = [],
  parentTreeNode?: ObjectTreeExpressionNodeShape,
): NodeModelBTree {
  switch (treeNode.type) {
    case 'GROUP':
      if (treeNode.expressions.length === 0) {
        return {
          node: new BooleanOperatorNodeModel(treeNode, treeNodePath),
          right: {
            node: new PlusNodeModel(treeNode, treeNodePath),
          },
        };
      }
      return treeNode.expressions
        .slice()
        .reverse()
        .reduce(
          (acc, expr, index) => {
            return {
              node: new BooleanOperatorNodeModel(treeNode, treeNodePath),
              down: treeNode.expressions.length > 0 ? acc : undefined,
              right: buildNodeModelBTree(expr, objectTypes, [
                ...treeNodePath,
                treeNode.expressions.length - 1 - index,
              ], treeNode),
            };
          },
          {
            node: new PlusNodeModel(treeNode, treeNodePath) as CustomNodeShape,
          },
      );
    // TODO PlusNodeModel are only available in certain condition
    case 'OBJECT':
      const objectNode = new ObjectNodeModel(treeNode, treeNodePath);
      if (parentTreeNode && parentTreeNode.type === 'OBJECT') {
        objectNode.parentObjectNode = parentTreeNode;
      }
      const hidePlusNode = containsAllField(
        treeNode,
        objectTypes,
      );
      return {
        node: objectNode,
        down: treeNode.expressions
          .slice()
          .reverse()
          .reduce(
            (acc, expr, index) => {
              return {
                node: new BooleanOperatorNodeModel(treeNode, treeNodePath),
                down: acc,
                right: buildNodeModelBTree(expr, objectTypes, [
                  ...treeNodePath,
                  treeNode.expressions.length - 1 - index,
                ], treeNode),
              };
            },
            hidePlusNode
              ? undefined
              : {
                  node: new PlusNodeModel(
                    treeNode,
                    treeNodePath,
                  ) as CustomNodeShape,
                },
          ),
      };

    case 'FIELD':
      const fieldNode = new FieldNodeModel(treeNode, treeNodePath);
      return {
        node: fieldNode,
      };
    default:
      return { node: new PlusNodeModel() };
  }
}

export function layout(
  tree: NodeModelBTree,
  position: Point,
  parentNodeBTRee?: NodeModelBTree,
): Point {
  const isCollapsed =
    (tree.node instanceof ObjectNodeModel && tree.node.collapsed) ||
    tree.node.extras.collapsed;

  tree.node.setPosition(position.x, position.y);

  let rightP = position;
  if (tree.right) {
    rightP = layout(
      tree.right,
      isCollapsed
        ? position
        : applyTranslation(
          position,
          MIN_X,
          (tree.node.getSize().height +
            (tree.node.getSize().borderWidth || 0) * 2) /
          2 -
          (tree.right.node.getSize().height +
            (tree.right.node.getSize().borderWidth || 0) * 2) /
          2,
        ),
      tree,
    );
  }
  let downP = rightP;
  if (tree.down) {
    downP = layout(
      tree.down,
      isCollapsed
        ? position
        : applyTranslation(
          { x: position.x, y: rightP.y },
          (tree.node.getSize().width +
            (tree.node.getSize().borderWidth || 0) * 2) /
          2 -
          (tree.down.node.getSize().width +
            (tree.down.node.getSize().borderWidth || 0) * 2) /
          2,
          MIN_Y,
        ),
      tree,
    );
  }
  return downP;
}

export function computeNodeExtras(
  tree: NodeModelBTree,
  parentNodeBTRee?: NodeModelBTree,
  isInNegationNodeExpression: boolean = false,
  isParentCollapsed: boolean = false,
): void {
  let negation = isInNegationNodeExpression;
  let collapsed = isParentCollapsed;

  if (!negation) {
    if (tree.node instanceof BooleanOperatorNodeModel) {
      negation = !!tree.node.objectOrGroupNode.negation;
    } else if (tree.node instanceof ObjectNodeModel) {
      negation = !!tree.node.objectNode.negation;
    }
  }

  tree.node.extras.collapsed = false;
  if (!collapsed && tree.node instanceof ObjectNodeModel) {
    collapsed = tree.node.collapsed;
  } else {
    tree.node.extras.collapsed = collapsed;
  }

  tree.node.extras.negation = negation;

  if (tree.right) {
    computeNodeExtras(tree.right, tree, negation, collapsed);
  }
  if (tree.down) {
    computeNodeExtras(tree.down, tree, negation, collapsed);
  }
}

export function buildLinkList(nodeBTree: NodeModelBTree): LinkModel[] {
  return [
    ...(nodeBTree.right
      ? [
        createLink(
          nodeBTree.node.ports.center,
          nodeBTree.right.node.ports.center,
        ),
      ]
      : []),
    ...(nodeBTree.down
      ? [
        createLink(
          nodeBTree.node.ports.center,
          nodeBTree.down.node.ports.center,
        ),
      ]
      : []),
    ...(nodeBTree.right ? buildLinkList(nodeBTree.right) : []),
    ...(nodeBTree.down ? buildLinkList(nodeBTree.down) : []),
  ];
}

export function toNodeList(nodeBTree: NodeModelBTree): NodeModel[] {
  return [
    nodeBTree.node,
    ...(nodeBTree.down ? toNodeList(nodeBTree.down) : []),
    ...(nodeBTree.right ? toNodeList(nodeBTree.right) : []),
  ];
}

export function applyTranslation(
  position: Point,
  tx: number = 0,
  ty: number = 0,
): Point {
  return {
    x: position.x + tx,
    y: position.y + ty,
  };
}
