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
import CounterCard from './CounterCard';
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

export interface JSONQLBuilderProps {
  objectTypes: ObjectLikeTypeInfoResource[];
  query: ObjectTreeExpressionNodeShape | undefined;
  updateQuery: (query: ObjectTreeExpressionNodeShape | undefined) => void;
  undoRedo: UndoRedoProps;
  edition?: boolean;
  shouldReloadQuery: boolean;
  handleRefreshValue: () => void;
}

interface State {
  keydown: string[];
}

type Props = JSONQLBuilderProps;

class JSONQLBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  nodeBTreeCache?: NodeModelBTree;

  constructor(props: Props) {
    super(props);
    this.engine.registerNodeFactory(
      new BooleanOperatorNodeFactory(this.getTreeNodeOperations()),
    );
    this.engine.registerNodeFactory(
      new PlusNodeFactory(this.getTreeNodeOperations(), this.props.objectTypes),
    );
    this.engine.registerNodeFactory(
      new ObjectNodeFactory(
        this.getTreeNodeOperations(),
        this.props.objectTypes,
      ),
    );
    this.engine.registerNodeFactory(
      new FieldNodeFactory(this.getTreeNodeOperations()),
    );

    this.engine.registerLinkFactory(new SimpleLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());

    this.state = {
      keydown: [],
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
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
      booleanOperator: 'OR',
      expressions: query ? [query] : [],
    });
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    this.setState(prevState => {
      return { keydown: prevState.keydown.find(k => k === event.key) ? prevState.keydown : [...this.state.keydown, event.key] }
    }, () => {
      if (this.state.keydown.includes('f') && this.state.keydown.length === 1) {
        this.engine.zoomToFit();
      }
      if (this.state.keydown.includes('Control') && this.state.keydown.includes('z') && this.props.undoRedo.enableUndo) {
        this.props.undoRedo.handleUndo()
      }
      if (this.state.keydown.includes('Control') && (this.state.keydown.includes('z') || this.state.keydown.includes('Z')) && this.state.keydown.includes('Shift') && this.props.undoRedo.enableRedo) {
        this.props.undoRedo.handleRedo()
      }
    })
  };

  handleKeyUp = (event: KeyboardEvent) => {
    this.setState(prevState => {
      const newKeyList = prevState.keydown.filter(k => k !== event.key)
      return {
        keydown: newKeyList
      }
    })
  }

  componentWillMount() {
    const model = new DiagramModel();
    model.setLocked(true);
    const rootNode = new PlusNodeModel();
    rootNode.root = true;
    rootNode.x = ROOT_NODE_POSITION.x;
    rootNode.y = ROOT_NODE_POSITION.y;
    model.addNode(rootNode);
    this.engine.setDiagramModel(model);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { query, objectTypes } = this.props;
    const { query: nextQuery } = nextProps;
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
      model.addNode(rootNode);

      if (nextQuery) {
        const nodeBTree = buildNodeModelBTree(nextQuery, objectTypes);
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

      this.engine.setDiagramModel(model);
    }
  }

  render() {    
    const { shouldReloadQuery, handleRefreshValue } = this.props;
    const values = [
      { viewValue: 999999999, viewName: 'UserPoint', loading: false },
    ];

    return (
      <div className={`query-builder ${this.props.edition ? 'edition-mode' : ''}`}>
        <CounterCard values={values} handleRefreshValue={handleRefreshValue} shouldRefreshValue={shouldReloadQuery} />
        <DiagramWidget
          diagramEngine={this.engine}
          allowCanvasZoom={true}
          allowCanvasTranslation={true}
        />
        <BuilderMenu undoRedo={this.props.undoRedo} />
      </div>
    );
  }
}

export default JSONQLBuilder;
