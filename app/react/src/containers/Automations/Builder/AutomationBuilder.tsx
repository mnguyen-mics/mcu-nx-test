import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
import { ROOT_NODE_POSITION } from '../../QueryTool/JSONOTQL/domain';
import { Col } from 'antd';
import { McsIcon, ButtonStyleless } from '../../../components';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SimplePortFactory from '../../QueryTool/JSONOTQL/Diagram/Port/SimplePortFactory';
import AutomationNodeFactory from './AutomationNode/AutomationNodeFactory';
import AutomationNodeModel from './AutomationNode/AutomationNodeModel';
import AutomationLinkFactory from './Link/AutomationLinkFactory';
import DropNodeFactory from './DropNode/DropNodeFactory';
import AvailableNodeVisualizer from './NodeVisualizer/AvailableNodeVisualizer';
import {
  StorylineNodeResource,
  EdgeHandler,
} from '../../../models/automations/automations';
import { McsIconType } from '../../../components/McsIcon';
import {
  StorylineNodeModel,
  DropNode,
  AutomationNodeShape,
  DeleteNodeOperation,
  AddNodeOperation,
  TreeNodeOperations,
} from './domain';
import DropNodeModel from './DropNode/DropNodeModel';
import AutomationLinkModel from './Link/AutomationLinkModel';

export interface AutomationBuilderProps {
  datamartId: string;
  organisationId: string;
  scenarioId: string;
  automationData: StorylineNodeModel;
  updateAutomationData: (
    automationData: StorylineNodeModel,
  ) => StorylineNodeModel;
}

interface State {
  viewNodeSelector: boolean;
}

type Props = AutomationBuilderProps;

class AutomationBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  div: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    this.engine.registerNodeFactory(new AutomationNodeFactory());
    this.engine.registerNodeFactory(
      new DropNodeFactory(this.getTreeNodeOperations()),
    );
    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());
    this.state = {
      viewNodeSelector: true,
    };
  }

  getTreeNodeOperations = (): TreeNodeOperations => {
    return {
      deleteNode: this.deleteNode,
      addNode: this.addNode,
      updateLayout: () => this.engine.repaintCanvas(),
    };
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
    const { automationData } = this.props;
    const model = new DiagramModel();
    model.setLocked(true);
    this.startAutomationTree(automationData, model);
    this.engine.setDiagramModel(model);
  }

  componentDidUpdate() {
    const { automationData } = this.props;
    const model = new DiagramModel();
    model.setLocked(this.engine.getDiagramModel().locked);
    model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
    model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
    model.setOffsetY(this.engine.getDiagramModel().getOffsetY());
    this.startAutomationTree(automationData, model);
    this.engine.setDiagramModel(model);
    this.engine.repaintCanvas();
  }

  addNode = (idParentNode: string, childNodeId: string): StorylineNodeModel => {
    return this.props.updateAutomationData(
      new AddNodeOperation(idParentNode, childNodeId).execute(
        this.props.automationData,
      ),
    );
  };

  deleteNode = (idNodeToBeDeleted: string): StorylineNodeModel => {
    return this.props.updateAutomationData(
      new DeleteNodeOperation(idNodeToBeDeleted).execute(
        this.props.automationData,
      ),
    );
  };

  buildAutomationNode(
    nodeModel: StorylineNodeResource,
    xAxisLocal: number,
    maxHeightLocal: number,
  ): AutomationNodeModel {
    const storylineNode = new AutomationNodeModel(
      nodeModel,
      this.generateNodeProperties(nodeModel.node).iconType,
      `${nodeModel.node.name} - (type: ${nodeModel.node.type})`,
      this.generateNodeProperties(nodeModel.node).color,
      180,
      90,
    );
    return storylineNode;
  }

  buildDropNode(dropNode: DropNode, height:number): DropNodeModel {
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
        storylineNode = this.buildDropNode(child.node, nodeModel.height);
        storylineNode.y =
          ROOT_NODE_POSITION.y * maxHeightLocal + nodeModel.height / 2 - 10;
        linkPointHeight = storylineNode.y + 10;
      } else {
        storylineNode = this.buildAutomationNode(
          child as StorylineNodeResource,
          xAxisLocal,
          maxHeightLocal,
        );
        storylineNode.y = ROOT_NODE_POSITION.y * maxHeightLocal;
        linkPointHeight = storylineNode.y + nodeModel.height / 2;
      }
      storylineNode.x = ROOT_NODE_POSITION.x + 250 * xAxisLocal;

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
        link.point(nodeModel.x + nodeModel.width + 21.5, linkPointHeight);
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

  generateNodeProperties = (
    node: AutomationNodeShape,
  ): {
    iconType: McsIconType;
    color: string;
  } => {
    switch (node.type) {
      case 'DISPLAY_CAMPAIGN':
        return {
          iconType: 'display',
          color: '#0ba6e1',
        };
      case 'EMAIL_CAMPAIGN':
        return {
          iconType: 'email',
          color: '#0ba6e1',
        };
      case 'QUERY_INPUT':
      case 'ABN_NODE':
        return {
          iconType: 'question',
          color: '#fbc02d',
        };
      case 'GOAL':
        return {
          iconType: 'check',
          color: '#18b577',
        };
      case 'FAILURE':
        return {
          iconType: 'close',
          color: '#ff5959',
        };
      default:
        return {
          iconType: 'info',
          color: '#fbc02d',
        };
    }
  };

  startAutomationTree = (
    automationData: StorylineNodeModel,
    model: DiagramModel,
  ) => {
    const rootNode = new AutomationNodeModel(
      automationData,
      this.generateNodeProperties(automationData.node).iconType,
      `${automationData.node.name} - (type: ${automationData.node.type})`,
      this.generateNodeProperties(automationData.node).color,
      180,
      90,
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
  };

  onNodeSelectorClick = () => {
    this.setState({ viewNodeSelector: !this.state.viewNodeSelector });
  };

  render() {
    const { viewNodeSelector } = this.state;
    return (
      <div className={`automation-builder`} ref={this.div}>
        <Col span={viewNodeSelector ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={true}
            allowCanvasTranslation={true}
            inverseZoom={true}
          />
          <div className="button-helpers top">
            <ButtonStyleless
              onClick={this.onNodeSelectorClick}
              className="helper"
            >
              <McsIcon
                type={'chevron-right'}
                style={
                  viewNodeSelector
                    ? {}
                    : {
                        transform: 'rotate(180deg)',
                        transition: 'all 0.5ms ease',
                      }
                }
              />{' '}
            </ButtonStyleless>
          </div>
        </Col>
        <Col
          span={viewNodeSelector ? 6 : 24}
          className="available-nodes-visualizer"
        >
          <AvailableNodeVisualizer />
        </Col>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(AutomationBuilder);
