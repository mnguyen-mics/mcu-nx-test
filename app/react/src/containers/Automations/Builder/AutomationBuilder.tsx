import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
import { ROOT_NODE_POSITION, createLink } from '../../QueryTool/JSONOTQL/domain';
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
  ScenarioNodeShape,
  EdgeHandler,
} from '../../../models/automations/automations';
import { McsIconType } from '../../../components/McsIcon';
import { StorylineNodeModel, DropNode } from './domain';
import DropNodeModel from './DropNode/DropNodeModel';

export interface AutomationBuilderProps {
  automationData: StorylineNodeResource;
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

    this.engine.registerNodeFactory(new DropNodeFactory());
    this.engine.registerNodeFactory(new AutomationNodeFactory());
    this.engine.registerNodeFactory(new DropNodeFactory());
    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());
    this.state = {
      viewNodeSelector: true,
    };
  }

  componentWillMount() {
    const { automationData } = this.props;
    const model = new DiagramModel();
    model.setLocked(true);
    this.startAutomationTree(automationData, model);
    this.engine.setDiagramModel(model);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { automationData } = this.props;
    const model = new DiagramModel();
    model.setLocked(this.engine.getDiagramModel().locked);
    model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
    model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
    model.setOffsetY(this.engine.getDiagramModel().getOffsetY());
    this.startAutomationTree(automationData, model);
    this.engine.setDiagramModel(model);
  }

  convert(automationData: StorylineNodeResource) : StorylineNodeModel {
    
    const out_edges : StorylineNodeModel[] = automationData.out_edges.map((child,index) =>{
      const dropNode = new DropNode(child, automationData);
      return {
        node: dropNode,
        in_edge: {
          id: "1",
          source_id: automationData.node.id,
          target_id: child.node.id,
          handler: 'ON_VISIT' as EdgeHandler,
          scenario_id: automationData.node.scenario_id,
        },
        out_edges: [child]
      }
    })
    
    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: out_edges,
    }
  }

  buildAutomationNode(
    nodeModel: StorylineNodeResource,
    xAxisLocal: number,
    maxHeightLocal: number,
  ): AutomationNodeModel {
    const storylineNode = new AutomationNodeModel(
      this.generateNodeProperties(child.node).iconType,
      `${child.node.name} - (type: ${child.node.type})`,
      this.generateNodeProperties(child.node).color,
      180,
      90,
    );
    return storylineNode;
  }

  buildDropNode(maxHeightLocal: number, xAxisLocal: number): DropNodeModel {
    return new DropNodeModel();
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
      const storylineNode =
        child.node instanceof DropNode
          ? this.buildDropNode(maxHeightLocal, xAxisLocal)
          : this.buildAutomationNode(
              child as StorylineNodeResource,
              xAxisLocal,
              maxHeightLocal,
            );
      storylineNode.x = ROOT_NODE_POSITION.x + 250 * xAxisLocal;
      storylineNode.y = ROOT_NODE_POSITION.y * maxHeightLocal;
      model.addNode(storylineNode);
      if (child.in_edge)
        model.addLink(
          createLink(nodeModel.ports.right, storylineNode.ports.left),
        );
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
    node: ScenarioNodeShape,
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
    automationData: StorylineNodeResource,
    model: DiagramModel,
  ) => {
    const rootNode = new AutomationNodeModel(
      this.generateNodeProperties(automationData.node).iconType,
      `${automationData.node.name} - (type: ${automationData.node.type})`,
      this.generateNodeProperties(automationData.node).color,
      180,
      90,
    );
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
