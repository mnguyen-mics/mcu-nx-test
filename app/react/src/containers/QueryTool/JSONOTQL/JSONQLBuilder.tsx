import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
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
} from './domain';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import CounterList from './CounterList';

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
}

interface State {
  keydown: string[];
  locked: boolean;
}

type Props = JSONQLBuilderProps;

class JSONQLBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  nodeBTreeCache?: NodeModelBTree;
  div: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.engine.registerNodeFactory(
      new BooleanOperatorNodeFactory(this.getTreeNodeOperations(), this.lockInteraction),
    );
    this.engine.registerNodeFactory(
      new PlusNodeFactory(this.getTreeNodeOperations(), this.props.objectTypes, this.lockInteraction),
    );
    this.engine.registerNodeFactory(
      new ObjectNodeFactory(
        this.getTreeNodeOperations(),
        this.props.objectTypes,
        this.lockInteraction
      ),
    );
    this.engine.registerNodeFactory(
      new FieldNodeFactory(this.getTreeNodeOperations(),  this.lockInteraction),
    );

    this.engine.registerLinkFactory(new SimpleLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());

    this.state = {
      keydown: [],
      locked: false,
    };
  }


  lockInteraction = (locked: boolean) => {
    this.setState({ locked })
  }

  componentDidMount() {
    // if (this.div && this.div.current){
    //   this.div.current.addEventListener('keydown', this.handleKeyDown);
    //   this.div.current.addEventListener('keyup', this.handleKeyUp);
    // }
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    // if (this.div && this.div.current){
    //   this.div.current.removeEventListener('keydown', this.handleKeyDown);
    //   this.div.current.removeEventListener('keyup', this.handleKeyUp);
    // }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  getTreeNodeOperations = (): TreeNodeOperations => {
    return {
      deleteNode: this.deleteNode,
      addNode: this.addNode,
      updateNode: this.updateNode,
      updateLayout: () => this.engine.repaintCanvas(),
      addNewGroupAsRoot: this.addNewGroupAsRoot,
    };
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
            this.state.keydown.includes('Y') &&
            this.props.undoRedo.enableRedo
          )
         ) {
              this.props.undoRedo.handleRedo();
         }
      },
    );
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
    rootNode.x = ROOT_NODE_POSITION.x;
    rootNode.y = ROOT_NODE_POSITION.y;

    this.buildModelTree(this.props.query, rootNode, objectTypes, model);

    this.engine.setDiagramModel(model);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { query } = this.props;
    const { query: nextQuery, objectTypes } = nextProps;
    if (query !== nextQuery) {
      const model = new DiagramModel();
      model.setLocked(this.engine.getDiagramModel().locked);
      model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
      model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
      model.setOffsetY(this.engine.getDiagramModel().getOffsetY());

      const rootNode = new PlusNodeModel();
      rootNode.root = true;
      rootNode.x = ROOT_NODE_POSITION.x;
      rootNode.y = ROOT_NODE_POSITION.y;

      this.buildModelTree(nextQuery, rootNode, objectTypes, model);

      this.engine.setDiagramModel(model);
    }
  }

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
          ROOT_NODE_POSITION,
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
        createLink(rootNode.ports.center, nodeBTree.node.ports.center),
      );
      toNodeList(nodeBTree).forEach(n => model.addNode(n));
      buildLinkList(nodeBTree).forEach(l => model.addLink(l));
      this.nodeBTreeCache = nodeBTree;
    }
  }

  render() {
    const { queryResult, staleQueryResult, runQuery } = this.props;

    return (
      <div
        className={`query-builder ${this.props.edition ? 'edition-mode' : ''}`}
        ref={this.div}
      >
        <CounterList
          queryResults={[queryResult]}
          staleQueryResult={staleQueryResult}
          onRefresh={runQuery}
        />
        <DiagramWidget
          diagramEngine={this.engine}
          allowCanvasZoom={!this.state.locked}
          allowCanvasTranslation={!this.state.locked}
          inverseZoom={true}
        />
        <BuilderMenu undoRedo={this.props.undoRedo} />
      </div>
    );
  }
}

export default JSONQLBuilder;
