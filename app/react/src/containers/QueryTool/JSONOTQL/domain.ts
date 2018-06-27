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
import { ObjectLikeTypeInfoResource, FieldInfoResource, ObjectLikeType } from '../../../models/datamart/graphdb/RuntimeSchema';

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
    if (this.path.length === 0) {
      return this.node;
    }

    if (isLeafNode(treeNode)) {
      return treeNode;
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

function hasTypeChild(
  objectType: ObjectLikeTypeInfoResource,
  objectTypes: ObjectLikeTypeInfoResource[],
): boolean {
  const objectTypeNames = objectTypes.map(ots => ots.name);
  const fieldTypeNames = objectType.fields.map(f => f.field_type);
  return (
    fieldTypeNames.filter(ftn => {
      // using a regexp to extract type like [UserEvent!]!
      const match = ftn.match(/\w+/);
      return !!objectTypeNames.find(otn => !!(match && match[0] === otn));
    }).length > 0
  );
}

export function buildNodeModelBTree(
  treeNode: ObjectTreeExpressionNodeShape,
  objectType: ObjectLikeTypeInfoResource,
  objectTypes: ObjectLikeTypeInfoResource[],
  treeNodePath: number[] = [],
): NodeModelBTree {
  switch (treeNode.type) {
    case 'GROUP':
      if (treeNode.expressions.length === 0) {
        return {
          node: new BooleanOperatorNodeModel(treeNode, treeNodePath),
          right: {
            node: new PlusNodeModel(treeNode, treeNodePath, objectType),
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
              right: buildNodeModelBTree(expr, objectType, objectTypes, [
                ...treeNodePath,
                treeNode.expressions.length - 1 - index,
              ]),
            };
          },
          {
            node: new PlusNodeModel(treeNode, treeNodePath, objectType),
          },
        );
    // TODO PlusNodeModel are only available in certain condition
    case 'OBJECT':
      const objectNode = new ObjectNodeModel(treeNode, treeNodePath);
      objectNode.objectTypeInfo = objectType;

      const field = objectType.fields.find(f => f.name === treeNode.field)!;
      const nextObjectType = objectTypes.find(
        ot => field.field_type.indexOf(ot.name) > -1,
      )!;

      const hidePlusNode = !hasTypeChild(nextObjectType, objectTypes);
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
                right: buildNodeModelBTree(expr, nextObjectType, objectTypes, [
                  ...treeNodePath,
                  treeNode.expressions.length - 1 - index,
                ]),
              };
            },
            hidePlusNode
              ? undefined
              : {
                  node: new PlusNodeModel(
                    treeNode,
                    treeNodePath,
                    nextObjectType,
                  ),
                },
          ),
      };

    case 'FIELD':
      const fieldNode = new FieldNodeModel(treeNode, treeNodePath);
      fieldNode.objectTypeInfo = objectType;
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
            nodeBTree.node.ports.right,
            nodeBTree.right.node.ports.left,
          ),
        ]
      : []),
    ...(nodeBTree.down
      ? [
          createLink(
            nodeBTree.node.ports.bottom,
            nodeBTree.down.node.ports.top,
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


export interface FieldEnhancedInfo extends FieldInfoResource {
  closestParentType: string;
}

export interface SchemaItem {
  id: string;
  runtime_schema_id: string;
  type: ObjectLikeType;
  name: string;
  schemaType?: string;
  fields: Array<FieldInfoResource | SchemaItem>
  closestParentType: string;
  path?: string
}

export const extractFieldType = (field: FieldInfoResource) => field.field_type.match(/\w+/)![0] as string

export function computeSchemaModel(
  objectTypes: ObjectLikeTypeInfoResource[],
  initialObjectType: SchemaItem,
  path: string,
  onlyIndexed: boolean = true
): SchemaItem {
  return {
    ...initialObjectType,
    fields: initialObjectType.fields.filter(field => {
      const match = extractFieldType(field as FieldInfoResource);
      if (onlyIndexed) {
        if (objectTypes.map(ot => ot.name).includes(match)) return true;
        return (field as FieldInfoResource).directives && (field as FieldInfoResource).directives.length &&  (field as FieldInfoResource).directives.find(f => f.name === 'TreeIndex')
      }
      return true
    }).map((field, index) => {
      const match = extractFieldType(field as FieldInfoResource);
      const newPath = `${path}${path ? '.' : ''}${index}`;
      if (
        match &&
        objectTypes.map(ot => ot.name).includes(match)
      ) {
        const newInitialObject: SchemaItem =  {...objectTypes.find(ot => ot.name === match)!, schemaType: match, name: field.name, closestParentType: initialObjectType.type, path: newPath}
        return computeSchemaModel(
          objectTypes,
          newInitialObject,
          newPath
        );
      } else {
        return {...field, closestParentType: initialObjectType.name,  path: newPath};
      }
    }),
  };
}

interface DragAndDropCommonInterface {
  name: string;
  objectSource: string
  type: 'field' | 'object';
  path: string;
  item: SchemaItem;
  fieldType?: string | null;
  schemaType?: string | null;
}


export type DragAndDropInterface = DragAndDropCommonInterface;

export function computeSchemaPathFromQueryPath(query: ObjectTreeExpressionNodeShape | undefined, path: number[] , schema: SchemaItem | undefined) {
 
  function computeElementInPath(_query: ObjectTreeExpressionNodeShape | undefined, _path: number[], elements: string[] = []): string[] {
    if (!_query) {
      return elements;
    }
    const _elements = _query.type !== 'GROUP' ? [...elements, _query.field] : elements
    if (_path.length === 0 || isLeafNode(_query!)) {
      return _elements;
    }
    const [head, ...tail] = _path;
    return computeElementInPath((_query as ObjectNode).expressions[head], tail, _elements);
  }

  function computePathFromElement(_schema: SchemaItem | undefined, _path: string[], elements: number[] = []): number[] {
    if (!_schema) {
      return elements;
    }
    if (!_path.length) {
      return elements;
    }
    if (!_schema.fields.length) {
      return elements;
    }
    const [head, ...tail] = _path;
    const fieldIndex =_schema.fields.findIndex(field => field.name === head)!;
    const _elements = [...elements, fieldIndex];
    return computePathFromElement(_schema.fields[fieldIndex] as SchemaItem, tail, _elements);
  }
  
  const newPath = computeElementInPath(query, path);
  const newElementPath = computePathFromElement(schema, newPath);
  return newElementPath;
  
}

export function computeAdditionalNode(additionalNodePath: number[], offset: number, schema: SchemaItem | undefined) {
  function computeElementFromPath(_additionalNodePath: number[], _offset: number, _schema: SchemaItem | undefined, _query?: ObjectTreeExpressionNodeShape[]): ObjectTreeExpressionNodeShape[] | undefined {
    if (!_schema) {
      return _query
    }

    if (_additionalNodePath.length === 0) {
      return _query;
    }
    
    const [head, ...tail] = _additionalNodePath;
    let _newOffset = _offset;
    if (_newOffset > 0) {
      _newOffset = _newOffset -1;
      return computeElementFromPath(tail, _newOffset, _schema.fields[head] as SchemaItem)
    }

    const _newQueryNode: ObjectTreeExpressionNodeShape = (_schema.fields[head] as SchemaItem).fields && (_schema.fields[head] as SchemaItem).fields.length ? {
      type: 'OBJECT',
      field: _schema.fields[head].name,
      expressions: [],
      boolean_operator: 'OR',
    } : {
      type: 'FIELD',
      field: _schema.fields[head].name,
    }

    const _newQuery =  _query ? [..._query, _newQueryNode] : [_newQueryNode]
    return computeElementFromPath(tail, _newOffset, _schema.fields[head] as SchemaItem, _newQuery)
  }

  const generatedQuery = computeElementFromPath(additionalNodePath, offset, schema);
  


  if (generatedQuery) {

    const reversedArray: ObjectTreeExpressionNodeShape[] = [];
    for (let i = 0; i < generatedQuery.length; i++) {
      reversedArray.push(generatedQuery[generatedQuery.length - 1 - i]);
    }

    const builtUpQuery = reversedArray
      .reduce((acc: ObjectTreeExpressionNodeShape, val) => {
        return acc ? {...val, expressions: [acc]} : val;
      }, undefined)
    
    return builtUpQuery;
  }
  return generatedQuery;
}