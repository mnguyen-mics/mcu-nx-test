import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import {
  AddOperation,
  DeleteOperation,
  NodeModelBTree,
  ROOT_NODE_POSITION,
  UpdateOperation,
  createLink,
} from '../../QueryTool/JSONOTQL/domain';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { Col } from 'antd';
import { ButtonStyleless, McsIcon } from '../../../components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SimplePortFactory from '../../QueryTool/JSONOTQL/Diagram/Port/SimplePortFactory';
import BuilderMenu, { UndoRedoProps } from '../../QueryTool/JSONOTQL/BuilderMenu';
import AutomationNodeFactory from './AutomationNode/AutomationNodeFactory';
import AutomationNodeModel from './AutomationNode/AutomationNodeModel';
import AvailableNode from './NodeVisualizer/AvailableNode';
import AutomationLinkFactory from './Link/AutomationLinkFactory';

export interface QueryResult {
  loading: boolean;
  error?: any;
  otqlResult?: OTQLResult;
}

export interface AutomationBuilderProps {
  objectTypes: ObjectLikeTypeInfoResource[];
  query: ObjectTreeExpressionNodeShape | undefined;
  updateQuery: (query: ObjectTreeExpressionNodeShape | undefined) => void;
  undoRedo: UndoRedoProps;
  edition?: boolean;
  staleQueryResult: boolean;
  queryResult: QueryResult;
  datamartId: string;
  organisationId: string;
}

interface State {
  keydown: string[];
  locked: boolean;
  viewSchema: boolean;
}

type Props = AutomationBuilderProps;

class AutomationBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  nodeBTreeCache?: NodeModelBTree;
  div: React.RefObject<HTMLDivElement>;
  isDragging: boolean = false;

  constructor(props: Props) {
    super(props);
    this.engine.registerNodeFactory(
      new AutomationNodeFactory(
        this.lockInteraction,
      ),
    );

    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());

    this.state = {
      keydown: [],
      locked: false,
      viewSchema: true,
    };
  }

  lockInteraction = (locked: boolean) => {
    this.setState({ locked });
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

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
            (this.state.keydown.includes('Y') &&
              this.props.undoRedo.enableRedo))
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
    const rootNode = new AutomationNodeModel('plus', 'User belongs to ### segment', '#2ecc71');
    rootNode.root = true;
    rootNode.x = ROOT_NODE_POSITION.x;
    rootNode.y = ROOT_NODE_POSITION.y;

    const endNode = new AutomationNodeModel('close', 'End automation', '#ff5959');
      endNode.x = ROOT_NODE_POSITION.x * 4;
      endNode.y = ROOT_NODE_POSITION.y;

    this.buildModelTree(this.props.query, rootNode, endNode, objectTypes, model);

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

      const rootNode = new AutomationNodeModel('plus', 'User belongs to ### segment', '#2ecc71');
      rootNode.root = true;
      rootNode.x = ROOT_NODE_POSITION.x;
      rootNode.y = ROOT_NODE_POSITION.y;

      const endNode = new AutomationNodeModel('close', 'End automation', '#ff5959');
      endNode.x = ROOT_NODE_POSITION.x * 4;
      endNode.y = ROOT_NODE_POSITION.y;

      this.buildModelTree(nextQuery, rootNode, endNode, objectTypes, model);

      this.engine.setDiagramModel(model);
    }
  }

  buildModelTree(
    query: ObjectTreeExpressionNodeShape | undefined,
    rootNode: AutomationNodeModel,
    endNode: AutomationNodeModel,
    objectTypes: ObjectLikeTypeInfoResource[],
    model: DiagramModel,
  ) {
    model.addNode(rootNode);
    model.addNode(endNode);
    model.addLink(
      createLink(rootNode.ports.right, endNode.ports.left),
    );
  
  }

  render() {

    const { viewSchema } = this.state;

    const onSchemaSelectorClick = () =>
      this.setState({ viewSchema: !viewSchema });

    return (
      <div
        className={`automation-builder ${this.props.edition ? 'edition-mode' : ''}`}
        ref={this.div}
      >
        <Col span={viewSchema ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={!this.state.locked}
            allowCanvasTranslation={!this.state.locked}
            inverseZoom={true}
          />
          <BuilderMenu undoRedo={this.props.undoRedo} />
          <div className="button-helpers top">
            <ButtonStyleless onClick={onSchemaSelectorClick} className="helper">
              <McsIcon type={'chevron-right'} style={viewSchema ? {} : { transform: 'rotate(180deg)', transition: 'all 0.5ms ease' }} />
            </ButtonStyleless>
          </div>
        </Col>
        <Col span={viewSchema ? 6 : 24} className="available-nodes-visualizer">
        <AvailableNode icon='chevron-right' title='Send email' color='#0ba6e1'/>
        </Col>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(AutomationBuilder);
