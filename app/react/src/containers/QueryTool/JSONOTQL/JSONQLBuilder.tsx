import * as React from 'react';
import { DiagramWidget, DiagramModel } from 'storm-react-diagrams';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { BooleanOperatorNodeFactory } from './Diagram/BooleanOperatorNode';
import { FieldNodeFactory } from './Diagram/FieldNode';
import { SimpleLinkFactory } from './Diagram/Link';
import { ObjectNodeFactory } from './Diagram/ObjectNode';
import { PlusNodeFactory, PlusNodeModel } from './Diagram/PlusNode';
import { SimplePortFactory } from './Diagram/Port';
import BuilderMenu, { UndoRedoProps } from './BuilderMenu';
import {
  AddOperation,
  DeleteOperation,
  MIN_X,
  NodeModelBTree,
  ROOT_NODE_POSITION,
  TreeNodeOperations,
  UpdateOperation,
  applyTranslation,
  buildNodeModelBTree,
  computeNodeExtras,
  layout,
  setUniqueModelId,
  createLink,
  toNodeList,
  buildLinkList,
  MicsDiagramEngine,
  Point,
} from './domain';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import CounterList from './CounterList';
import { Col } from 'antd';
import SchemaVizualizer from './SchemaVisualizer/SchemaVizualizer';
import { McsIcon } from '../../../components';
import { JSONQLBuilderContext } from './JSONQLBuilderContext';
import withDragDropContext from '../../../common/Diagram/withDragDropContext';
import { Button } from '@mediarithmics-private/mcs-components-library';

export interface QueryResult {
  loading: boolean;
  error?: any;
  otqlResult?: OTQLResult;
}

export interface JSONQLBuilderProps {
  objectTypes: ObjectLikeTypeInfoResource[];
  query: ObjectTreeExpressionNodeShape | undefined;
  updateQuery: (query: ObjectTreeExpressionNodeShape | undefined) => void;
  undoRedo: UndoRedoProps;
  edition?: boolean;
  staleQueryResult: boolean;
  queryResult: QueryResult;
  runQuery: () => void;
  datamartId: string;
  organisationId: string;
  hideCounterAndTimeline?: boolean;
}

interface State {
  keydown: string[];
  locked: boolean;
  viewSchema: boolean;
  keyboardOnlyLock: boolean;
}

type Props = JSONQLBuilderProps;

class JSONQLBuilder extends React.Component<Props, State> {
  engine = new MicsDiagramEngine();
  nodeBTreeCache?: NodeModelBTree;
  div: React.RefObject<HTMLDivElement>;
  isDragging: boolean = false;

  constructor(props: Props) {
    super(props);
    const runtimeSchemaId = props.objectTypes[0]
      ? props.objectTypes[0].runtime_schema_id
      : '';
    this.engine.registerNodeFactory(
      new BooleanOperatorNodeFactory(
        this.getTreeNodeOperations(),
        this.lockInteraction,
      ),
    );
    this.engine.registerNodeFactory(
      new PlusNodeFactory(
        this.getTreeNodeOperations(),
        this.props.objectTypes,
        this.lockInteraction,
        this.props.datamartId,
        runtimeSchemaId,
      ),
    );
    this.engine.registerNodeFactory(
      new ObjectNodeFactory(
        this.getTreeNodeOperations(),
        this.props.objectTypes,
        this.lockInteraction,
        this.props.datamartId,
      ),
    );
    this.engine.registerNodeFactory(
      new FieldNodeFactory(
        this.getTreeNodeOperations(),
        this.props.objectTypes,
        this.lockInteraction,
        this.keyboardOnlyLock,
        this.props.datamartId,
      ),
    );

    this.engine.registerLinkFactory(new SimpleLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());

    this.state = {
      keydown: [],
      locked: false,
      viewSchema: true,
      keyboardOnlyLock: false,
    };
  }

  lockInteraction = (locked: boolean) => {
    this.setState({ locked });
  };

  keyboardOnlyLock = (keyboardOnlyLock: boolean) => {
    this.setState({ keyboardOnlyLock });
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  getTreeNodeOperations = (): TreeNodeOperations => {
    return {
      deleteNode: this.deleteNode,
      addNode: this.addNode,
      updateNode: this.updateNode,
      copyNode: this.copyNode,
      cutNode: this.cutNode,
      updateLayout: () => this.engine.repaintCanvas(),
      addNewGroupAsRoot: this.addNewGroupAsRoot,
    };
  };

  cutNode = (
    nodePath: number[],
    objectLikeType: string,
    treeNodePath: number[],
  ) => {
    this.copyNode(nodePath, objectLikeType, treeNodePath);
    this.deleteNode(nodePath);
  };

  copyNode = (
    nodePath: number[],
    objectLikeType: string,
    treeNodePath: number[],
  ) => {
    const { query } = this.props;
    if (query) {
      const partialObjectTree = this.getObjectTreeExpressionFromNodePath(
        nodePath,
        query,
      );
      this.engine.setCopying(partialObjectTree, objectLikeType, treeNodePath);
    }
  };

  getObjectTreeExpressionFromNodePath = (
    nodePath: number[],
    ot: ObjectTreeExpressionNodeShape,
  ): ObjectTreeExpressionNodeShape => {
    if (nodePath.length === 0) {
      return ot;
    }
    if (ot.type === 'FIELD') {
      return ot;
    }
    if (nodePath.length === 1) {
      return ot.expressions[nodePath[0]];
    }

    const [head, ...tail] = nodePath;
    return this.getObjectTreeExpressionFromNodePath(tail, ot.expressions[head]);
  };

  addNode = (nodePath: number[], node: ObjectTreeExpressionNodeShape) => {
    const { updateQuery, query } = this.props;
    updateQuery(new AddOperation(nodePath, node).execute(query!));
  };

  updateNode = (nodePath: number[], node: ObjectTreeExpressionNodeShape) => {
    const { updateQuery, query } = this.props;
    updateQuery(new UpdateOperation(nodePath, node).execute(query!));
  };

  deleteNode = (nodePath: number[]) => {
    const { updateQuery, query } = this.props;
    updateQuery(new DeleteOperation(nodePath).execute(query!));
  };

  addNewGroupAsRoot = () => {
    const { updateQuery, query } = this.props;
    updateQuery({
      type: 'GROUP',
      boolean_operator: 'OR',
      expressions: query ? [query] : [],
    });
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.state.keyboardOnlyLock) {
      this.setState(
        prevState => {
          return {
            keydown: prevState.keydown.find(k => k === event.key)
              ? prevState.keydown
              : [...this.state.keydown, event.key],
          };
        },
        () => {
          if (
            this.state.keydown.includes('f') &&
            this.state.keydown.length === 1
          ) {
            this.engine.zoomToFit();
          }
          if (
            this.state.keydown.includes('r') &&
            this.state.keydown.length === 1
          ) {
            this.engine.getDiagramModel().setZoomLevel(100);
            this.engine.getDiagramModel().setOffset(0, 0);
          }
          if (
            this.state.keydown.includes('Control') &&
            this.state.keydown.includes('z') &&
            this.props.undoRedo.enableUndo
          ) {
            this.props.undoRedo.handleUndo();
          }
          if (
            this.state.keydown.includes('Control') &&
            (this.state.keydown.includes('z') ||
              this.state.keydown.includes('Z')) &&
            this.state.keydown.includes('Shift') &&
            this.props.undoRedo.enableRedo
          ) {
            this.props.undoRedo.handleRedo();
          }
          if (
            this.state.keydown.includes('Control') &&
            (this.state.keydown.includes('y') ||
              (this.state.keydown.includes('Y') &&
                this.props.undoRedo.enableRedo))
          ) {
            this.props.undoRedo.handleRedo();
          }
        },
      );
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    this.setState(prevState => {
      const newKeyList = prevState.keydown.filter(k => k !== event.key);
      return {
        keydown: newKeyList,
      };
    });
  };

  componentWillMount() {
    const { objectTypes } = this.props;
    const model = new DiagramModel();
    model.setLocked(true);
    const rootNode = new PlusNodeModel();
    rootNode.root = true;
    const rootNodePosition = this.getRootNodePosition();
    rootNode.x = rootNodePosition.x;
    rootNode.y = rootNodePosition.y;

    this.buildModelTree(this.props.query, rootNode, objectTypes, model);

    this.engine.setDiagramModel(model);
  }

  componentDidUpdate(previousProps: Props) {
    const { query, objectTypes } = this.props;
    const { query: previousQuery } = previousProps;
    if (query !== previousQuery) {
      const model = new DiagramModel();
      model.setLocked(this.engine.getDiagramModel().locked);
      model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
      model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
      model.setOffsetY(this.engine.getDiagramModel().getOffsetY());

      const rootNode = new PlusNodeModel();
      rootNode.root = true;
      const rootNodePosition = this.getRootNodePosition();
      rootNode.x = rootNodePosition.x;
      rootNode.y = rootNodePosition.y;

      this.buildModelTree(query, rootNode, objectTypes, model);

      this.engine.setDiagramModel(model);
      this.forceUpdate();
    }
  }

  getRootNodePosition = () => {
    const { hideCounterAndTimeline } = this.props;
    const position: Point = {
      x: ROOT_NODE_POSITION.x,
      y:
        hideCounterAndTimeline
          ? ROOT_NODE_POSITION.x
          : ROOT_NODE_POSITION.y,
    };

    return position;
  };

  buildModelTree(
    query: ObjectTreeExpressionNodeShape | undefined,
    rootNode: PlusNodeModel,
    objectTypes: ObjectLikeTypeInfoResource[],
    model: DiagramModel,
  ) {
    const initialObjectType = objectTypes.find(ot => ot.name === 'UserPoint')!;
    rootNode.objectTypeInfo = initialObjectType;
    model.addNode(rootNode);
    if (query) {
      const nodeBTree = buildNodeModelBTree(
        query,
        initialObjectType,
        objectTypes,
      );
      setUniqueModelId(nodeBTree);
      computeNodeExtras(nodeBTree);
      layout(
        nodeBTree,
        applyTranslation(
          this.getRootNodePosition(),
          MIN_X,
          (rootNode.getSize().height +
            (rootNode.getSize().borderWidth || 0) * 2) /
            2 -
            (nodeBTree.node.getSize().height +
              (nodeBTree.node.getSize().borderWidth || 0) * 2) /
              2,
        ),
      );
      model.addLink(
        createLink(rootNode.ports.right, nodeBTree.node.ports.left),
      );
      toNodeList(nodeBTree).forEach(n => model.addNode(n));
      buildLinkList(nodeBTree).forEach(l => model.addLink(l));
      this.nodeBTreeCache = nodeBTree;
    }
  }

  render() {
    const {
      queryResult,
      staleQueryResult,
      runQuery,
      query,
      datamartId,
      organisationId,
      hideCounterAndTimeline,
    } = this.props;

    const { viewSchema } = this.state;

    const onSchemaSelectorClick = () =>
      this.setState({ viewSchema: !viewSchema });

    return (
      <div
        className={`query-builder ${this.props.edition ? 'edition-mode' : ''}`}
        ref={this.div}
      >
        <CounterList
          queryResults={[queryResult]}
          staleQueryResult={staleQueryResult}
          onRefresh={runQuery}
          datamartId={datamartId}
          organisationId={organisationId}
          query={query}
          editionLayout={this.props.edition}
          hideCounterAndTimeline={hideCounterAndTimeline}
        />
        <Col span={viewSchema ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={!this.state.locked}
            allowCanvasTranslation={!this.state.locked}
            inverseZoom={true}
          />
          <BuilderMenu undoRedo={this.props.undoRedo} />
          <div className="button-helpers top">
            <Button onClick={onSchemaSelectorClick} className="helper">
              <McsIcon
                type={'chevron-right'}
                style={
                  viewSchema
                    ? {}
                    : {
                        transform: 'rotate(180deg)',
                        transition: 'all 0.5ms ease',
                      }
                }
              />
            </Button>
          </div>
        </Col>
        <Col span={viewSchema ? 6 : 24} className="schema-visualizer">
          <JSONQLBuilderContext.Consumer>
            {({ schema }) => <SchemaVizualizer schema={schema} />}
          </JSONQLBuilderContext.Consumer>
        </Col>
        <div id="popoverId" />
      </div>
    );
  }
}

export default withDragDropContext(JSONQLBuilder);
