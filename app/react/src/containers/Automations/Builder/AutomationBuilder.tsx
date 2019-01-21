import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
import { ROOT_NODE_POSITION } from '../../QueryTool/JSONOTQL/domain';
import { Col } from 'antd';
import { McsIcon, ButtonStyleless } from '../../../components';
import SimplePortFactory from '../../QueryTool/JSONOTQL/Diagram/Port/SimplePortFactory';
import AutomationNodeFactory from './AutomationNode/AutomationNodeFactory';
import AutomationNodeModel from './AutomationNode/AutomationNodeModel';
import AutomationLinkFactory from './Link/AutomationLinkFactory';
import DropNodeFactory from './DropNode/DropNodeFactory';
import AvailableNodeVisualizer from './NodeVisualizer/AvailableNodeVisualizer';
import {
  StorylineNodeResource,
  EdgeHandler,
  ScenarioNodeShape,
} from '../../../models/automations/automations';
import {
  StorylineNodeModel,
  DropNode,
  DeleteNodeOperation,
  AddNodeOperation,
  TreeNodeOperations,
  UpdateNodeOperation,
  generateNodeProperties,
} from './domain';
import DropNodeModel from './DropNode/DropNodeModel';
import AutomationLinkModel from './Link/AutomationLinkModel';
import withDragDropContext from '../../../common/Diagram/withDragDropContext';
import { AutomationFormDataType } from './AutomationNode/Edit/domain';

export interface AutomationBuilderProps {
  datamartId: string;
  scenarioId: string;
  automationTreeData?: StorylineNodeModel;
  updateAutomationData: (
    automationData: StorylineNodeModel,
  ) => StorylineNodeModel;
  updateQueryNode: (nodeId: string, queryText: string) => void;
  editMode: boolean;
}

interface State {
  viewNodeSelector: boolean;
  locked: boolean;
}

type Props = AutomationBuilderProps;

class AutomationBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  div: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.engine.registerNodeFactory(
      new DropNodeFactory(this.getTreeNodeOperations()),
    );
    this.engine.registerNodeFactory(
      new AutomationNodeFactory(
        this.getTreeNodeOperations(),
        this.props.updateQueryNode,
        this.lockInteraction,
      ),
    );
    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());
    this.state = {
      viewNodeSelector: props.editMode,
      locked: false,
    };
  }

  getTreeNodeOperations = (): TreeNodeOperations => {
    return {
      deleteNode: this.deleteNode,
      addNode: this.addNode,
      updateNode: this.updateNode,
      updateLayout: () => this.engine.repaintCanvas(),
    };
  };

  lockInteraction = (locked: boolean) => {
    this.setState({ locked: locked });
  };

  convertToFrontData(automationData: StorylineNodeModel): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        const dropNode = new DropNode('1', child, automationData);
        return {
          node: dropNode,
          in_edge: {
            id: '1',
            source_id: automationData.node.id,
            target_id: child.node.id,
            handler: 'ON_VISIT' as EdgeHandler,
            scenario_id: this.props.scenarioId,
          },
          out_edges: [this.convertToFrontData(child)],
        };
      },
    );

    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: outEdges,
    };
  }

  componentDidMount() {
    const { automationTreeData } = this.props;
    const model = new DiagramModel();
    model.setLocked(true);
    this.startAutomationTree(automationTreeData, model);
    this.engine.setDiagramModel(model);
  }

  componentDidUpdate() {
    const { automationTreeData } = this.props;
    const model = new DiagramModel();
    model.setLocked(this.engine.getDiagramModel().locked);
    model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
    model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
    model.setOffsetY(this.engine.getDiagramModel().getOffsetY());
    this.startAutomationTree(automationTreeData, model);
    this.engine.setDiagramModel(model);
    this.engine.repaintCanvas();
  }

  addNode = (
    idParentNode: string,
    childNodeId: string,
    node: ScenarioNodeShape,
  ): StorylineNodeModel | void => {
    const { automationTreeData } = this.props;
    if (automationTreeData) {
      return this.props.updateAutomationData(
        new AddNodeOperation(idParentNode, childNodeId, node).execute(
          automationTreeData,
        ),
      );
    }
  };

  deleteNode = (idNodeToBeDeleted: string): StorylineNodeModel | void => {
    const { automationTreeData } = this.props;
    if (automationTreeData) {
      return this.props.updateAutomationData(
        new DeleteNodeOperation(idNodeToBeDeleted).execute(automationTreeData),
      );
    }
  };

  updateNode = (
    node: ScenarioNodeShape,
    formData: AutomationFormDataType,
  ): StorylineNodeModel => {
    return this.props.updateAutomationData(
      new UpdateNodeOperation(node, formData).execute(
        this.props.automationData,
      ),
    );
  };

  buildAutomationNode(nodeModel: StorylineNodeResource): AutomationNodeModel {
    const storylineNode = new AutomationNodeModel(
      this.props.datamartId,
      nodeModel,
      `${nodeModel.node.name}`, // - (type: ${nodeModel.node.type})`,
      generateNodeProperties(nodeModel.node).color,
      generateNodeProperties(nodeModel.node).iconType,
      generateNodeProperties(nodeModel.node).iconAnt,
    );
    return storylineNode;
  }

  buildDropNode(dropNode: DropNode, height: number): DropNodeModel {
    return new DropNodeModel(dropNode, height);
  }

  drawAutomationTree = (
    model: DiagramModel,
    node: StorylineNodeModel,
    nodeModel: AutomationNodeModel | DropNodeModel,
    xAxis: number,
    maxHeight: number,
  ): number => {
    return node.out_edges.reduce((acc, child, index) => {
      const maxHeightLocal = index > 0 ? acc + 1 : acc;
      const xAxisLocal = xAxis + 1;
      let storylineNode;
      let linkPointHeight;
      if (child.node instanceof DropNode) {
        storylineNode = this.buildDropNode(
          child.node,
          nodeModel.getNodeSize().height,
        );
        storylineNode.y =
          ROOT_NODE_POSITION.y * maxHeightLocal +
          nodeModel.getNodeSize().height / 2 -
          10;
        linkPointHeight = storylineNode.y + 10;
        storylineNode.x = 80 + ROOT_NODE_POSITION.x + 180 * xAxisLocal;
      } else {
        storylineNode = this.buildAutomationNode(
          child as StorylineNodeResource,
        );
        storylineNode.y = ROOT_NODE_POSITION.y * maxHeightLocal;
        linkPointHeight = storylineNode.y + nodeModel.getNodeSize().height / 2;
        storylineNode.x = ROOT_NODE_POSITION.x + 180 * xAxisLocal;
      }

      model.addNode(storylineNode);

      if (node.out_edges.length > 0 && index === 0) {
        const outLink = new AutomationLinkModel();
        outLink.setSourcePort(nodeModel.ports.center);
        outLink.setTargetPort(storylineNode.ports.center);
        outLink.setColor('#afafaf');
        model.addLink(outLink);
      }
      if (index !== 0) {
        const link = new AutomationLinkModel();
        link.setColor('#afafaf');
        link.setSourcePort(nodeModel.ports.right);
        link.setTargetPort(storylineNode.ports.center);
        link.point(
          nodeModel.x + nodeModel.getNodeSize().width + 21.5,
          linkPointHeight,
        );
        model.addLink(link);
      }
      return this.drawAutomationTree(
        model,
        child,
        storylineNode,
        xAxisLocal,
        maxHeightLocal,
      );
    }, maxHeight);
  };

  startAutomationTree = (
    automationData?: StorylineNodeModel,
    model?: DiagramModel,
  ) => {
    if (automationData && automationData.node && model) {
      const rootNode = new AutomationNodeModel(
        this.props.datamartId,
        automationData,
        `${automationData.node.name}`,
        generateNodeProperties(automationData.node).color,
        generateNodeProperties(automationData.node).iconType,
        generateNodeProperties(automationData.node).iconAnt,
      );
      rootNode.root = true;
      rootNode.x = ROOT_NODE_POSITION.x;
      rootNode.y = ROOT_NODE_POSITION.y;
      model.addNode(rootNode);
      this.drawAutomationTree(
        model,
        this.convertToFrontData(automationData),
        rootNode,
        0,
        1,
      );
    }
  };

  onNodeSelectorClick = () => {
    this.setState({
      viewNodeSelector: !this.state.viewNodeSelector,
    });
  };

  render() {
    const { viewNodeSelector } = this.state;
    const { editMode } = this.props;

    return (
      <div className={`automation-builder`} ref={this.div}>
        <Col
          span={viewNodeSelector || editMode ? 18 : 24}
          className={'diagram'}
        >
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={!this.state.locked}
            allowCanvasTranslation={!this.state.locked}
            // allowCanvasZoom={true}
            // allowCanvasTranslation={true}
            inverseZoom={true}
          />
          {editMode && (
            <div className="button-helpers top">
              <ButtonStyleless
                onClick={this.onNodeSelectorClick}
                className="helper"
              >
                <McsIcon
                  type={'chevron-right'}
                  style={
                    viewNodeSelector || editMode
                      ? {}
                      : {
                          transform: 'rotate(180deg)',
                          transition: 'all 0.5ms ease',
                        }
                  }
                />{' '}
              </ButtonStyleless>
            </div>
          )}
        </Col>
        <Col
          span={viewNodeSelector || editMode ? 6 : 24}
          className="available-nodes-visualizer"
        >
          <AvailableNodeVisualizer />
        </Col>
      </div>
    );
  }
}

export default withDragDropContext(AutomationBuilder);
