import { PortModel, LinkModel, NodeModel, DiagramEngine } from 'storm-react-diagrams';
import lodash from 'lodash'
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
import { ObjectLikeTypeInfoResource, FieldInfoResource, ObjectLikeType, ObjectLikeTypeDirectiveInfoResource, SchemaDecoratorResource, FieldDirectiveResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { SchemaItem } from './domain';

export type FieldProposalLookup = (treeNodePath: number[], fieldName: string) => Promise<string[]>;

export enum typesTrigger {
  "UserActivity",
  "UserEvent"
}

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

export class MicsDiagramEngine extends DiagramEngine {

  private objectType?: string;
  private copiedObjectTree?: ObjectTreeExpressionNodeShape;
  private treeNodePath?: number[];

  setCopying = (copiedObjectTree: ObjectTreeExpressionNodeShape, objectType: string, treeNodePath: number[]) => {
    this.objectType = objectType;
    this.copiedObjectTree = copiedObjectTree;
    this.treeNodePath = treeNodePath;
  }

  getCopiedValue = () => ({
    copiedObjectType: this.copiedObjectTree,
    objectType: this.objectType,
    treeNodePath: this.treeNodePath
  })

  isCopying = () => {
    return !!(this.objectType && this.copiedObjectTree)
  }

  emptyClipboard = () => {
    this.objectType = undefined;
    this.copiedObjectTree = undefined;
    this.treeNodePath = undefined;
  }
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
  copyNode: (nodePath: number[], objectLikeType: string, treeNodePath: number[]) => void;
  cutNode: (nodePath: number[], objectLikeType: string, treeNodePath: number[]) => void;
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
      const fieldType = field.field_type.match(/\w+/)![0]
      const nextObjectType = objectTypes.find(
        ot => fieldType === ot.name,
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

export type Field = FieldInfoEnhancedResource | SchemaItem | FieldInfoResource

export interface SchemaItem {
  id: string;
  runtime_schema_id: string;
  type: ObjectLikeType;
  name: string;
  schemaType?: string;
  fields: Field[];
  closestParentType: string;
  path?: string;
  directives: ObjectLikeTypeDirectiveInfoResource[];
  decorator?: SchemaDecoratorResource;
}

export function isSchemaItem(item: SchemaItem | FieldInfoEnhancedResource | FieldInfoResource): item is SchemaItem {
  return (item as SchemaItem).fields && (item as SchemaItem).fields.length > 0
}

export function isFieldInfoEnfancedResource(item: SchemaItem | FieldInfoEnhancedResource | FieldInfoResource): item is FieldInfoEnhancedResource {
  return !isSchemaItem(item) && (item as FieldInfoEnhancedResource).closestParentType !== undefined;
}

export const extractFieldType = (field: FieldInfoEnhancedResource) => field.field_type.match(/\w+/)![0] as string

export function filterAvailableFields(schemaItem: SchemaItem): boolean{
  return lodash.flatMap(schemaItem.directives, d => { 
    return d.arguments.map(a =>
      Object.values(typesTrigger).includes(a.value.replace(/[^a-zA-Z]+/g,'')))
     }
    ).reduce((acc: boolean, val: boolean) => {return acc || val}, false)
}

export function computeFinalSchemaItem(
  objectTypes: ObjectLikeTypeInfoResource[],
  rootObjectTypeName: string,
  onlyIndexed: boolean = true,
  isTrigger: boolean,
  isEdge: boolean,
): SchemaItem {
  const initialSchemaItem = buildSchemaItem(
    objectTypes, 
    {
      ...objectTypes.find(ot => ot.name === rootObjectTypeName)!,
      closestParentType: '',
    }
  )
  const filteredSchemaItem = filterSchemaItem(initialSchemaItem, objectTypes, onlyIndexed, isTrigger, isEdge)
  return computeSchemaItemPath(filteredSchemaItem, objectTypes, '');
}

function buildSchemaItem(
  objectTypes: ObjectLikeTypeInfoResource[],
  rootObjectType: SchemaItem,
): SchemaItem {
  return {
    ...rootObjectType,
    fields: rootObjectType.fields.map(field => {
      const match = extractFieldType(field as FieldInfoEnhancedResource);
      if (
        match &&
        objectTypes.map(ot => ot.name).includes(match)
      ) {
        const newRootObject: SchemaItem =  {...objectTypes.find(ot => ot.name === match)!, schemaType: match, name: field.name, closestParentType: rootObjectType.name, decorator: field.decorator}
        return buildSchemaItem(
          objectTypes,
          newRootObject,
        );
      } else {
        return {...field, closestParentType: rootObjectType.name};
      }
    }).sort((a, b) => {
      const isAObjectType = isSchemaItem(a)
      const isBObjectType = isSchemaItem(b)
      const aName = (a.decorator && !a.decorator.hidden ? a.decorator.label : a.name)
      const bName = (b.decorator && !b.decorator.hidden ? b.decorator.label : b.name)
      return isAObjectType && !isBObjectType ? 1 : (isAObjectType && isBObjectType) || (!isAObjectType && !isBObjectType) ? aName.localeCompare(bName) : -1 
    }),
  };
}

function checkIfVisible(
  field: Field
): boolean {
  const isVisible = field.decorator ? !field.decorator.hidden : true;
  return isVisible;
}

function filterSchemaItem(
  schema: SchemaItem,
  objectTypes: ObjectLikeTypeInfoResource[],
  onlyIndexed: boolean,
  isTrigger: boolean,
  isEdge: boolean
): SchemaItem {
  return {
    ...schema,
    fields: schema.fields.filter(field => {
      if(isTrigger){
        if(isSchemaItem(field) && field.closestParentType==="UserPoint") return filterAvailableFields(field as SchemaItem) && checkIfVisible(field)
        else if(isFieldInfoEnfancedResource(field) && field.closestParentType==="UserPoint") return false && checkIfVisible(field)
        else return true && checkIfVisible(field)
      }else{
        if(isFieldInfoEnfancedResource(field) && onlyIndexed){
          const match = extractFieldType(field as FieldInfoEnhancedResource);
          if (objectTypes.map(ot => ot.name).includes(match)) return true && checkIfVisible(field);
          return (field as FieldInfoEnhancedResource).directives && (field as FieldInfoEnhancedResource).directives.length &&  (field as FieldInfoEnhancedResource).directives.find(f => f.name === 'TreeIndex') && (isEdge ? (field as FieldInfoEnhancedResource).directives.find(f => f.name === 'EdgeAvailability'): true) && checkIfVisible(field)
        } 
      return true && checkIfVisible(field)
      }
    }).map(field => {
      if (isSchemaItem(field)) return filterSchemaItem(field as SchemaItem, objectTypes, onlyIndexed, isTrigger, isEdge)
      else return {...field, closestParentType: schema.name};
    }).filter(field => !('fields' in field) || field.fields.length > 0),
  };
}

function computeSchemaItemPath(
  schema: SchemaItem,
  objectTypes: ObjectLikeTypeInfoResource[],
  path: string
): SchemaItem {
  return {
    ...schema,
    path: path,
    fields: schema.fields.map((field, index) => {
      const newPath = `${path}${path ? '.' : ''}${index}`;
      if (isSchemaItem(field)) return computeSchemaItemPath(field as SchemaItem, objectTypes, newPath)
      else return {...field, closestParentType: schema.name,  path: newPath};
    }),
  };
}
  
export interface FieldInfoEnhancedResource extends FieldInfoResource {
  closestParentType: string;
  path: string;
}

interface DragAndDropCommonInterface {
  name: string;
  objectSource: string
  path: string;
}

interface DragAndDropFieldInterface extends DragAndDropCommonInterface {
  type: 'field';
  fieldType: string;
  item: FieldInfoEnhancedResource;
}

interface DragAndDropObjectdInterface extends DragAndDropCommonInterface {
  type: 'object';
  schemaType: string;
  item: SchemaItem;
}

export type DragAndDropInterface = DragAndDropFieldInterface |DragAndDropObjectdInterface;

export function computeSchemaPathFromQueryPath(query: ObjectTreeExpressionNodeShape | undefined, path: number[] , schema: SchemaItem | undefined, lastProperty?: string) {
 
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
  if (lastProperty) {
    newPath.splice(-1,1);
    newPath.push(lastProperty);
  }
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

export const getCoreReferenceTypeAndModel = (directives: FieldDirectiveResource[]): { type: string, modelType: string } | undefined => {
  const ref = directives.find(d => d.name === 'ReferenceTable');
  if (ref && ref.arguments) {
    const type = ref.arguments.find(a => a.name === 'type')
    const modelType = ref.arguments.find(a => a.name === 'model_type')
    if (type) {
      const match = type.value.match(/\w+/);
      if (match && match[0] && match[0] === "CORE_OBJECT") {
        if (modelType) {
          return {
            type: "CORE_OBJECT",
            modelType: modelType.value.replace(/\"/g, "")
          }
        }
      }
      
    }
  }
  return undefined
}