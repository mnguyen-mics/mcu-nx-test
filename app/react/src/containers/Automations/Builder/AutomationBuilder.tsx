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
import AvailableNodeVisualizer from './NodeVisualizer/AvailableNodeVisualizer';
import {
  StorylineNodeResource,
  ScenarioNodeShape,
} from '../../../models/automations/automations';
import { McsIconType } from '../../../components/McsIcon';
import { AutomationLinkModel } from './Link';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';

export interface QueryResult {
  loading: boolean;
  error?: any;
  otqlResult?: OTQLResult;
}

export interface AutomationBuilderProps {
  datamartId: string;
  organisationId: string;
  automationData: StorylineNodeResource;
}

interface State {
  viewSchema: boolean;
}

type Props = AutomationBuilderProps;

class AutomationBuilder extends React.Component<Props, State> {
  engine = new DiagramEngine();
  div: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.engine.registerNodeFactory(new AutomationNodeFactory());
    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());
    this.state = {
      viewSchema: true,
    };
  }

  buildAutomationTree = (
    model: DiagramModel,
    node: StorylineNodeResource,
    nodeModel: AutomationNodeModel,
    xAxis: number,
    maxHeight: number,
  ): number => {
    return node.out_edges.reduce((acc, child, index) => {
      const maxHeightLocal = index > 0 ? acc + 1 : acc;
      const xAxisLocal = xAxis + 1;
      const storylineNode = new AutomationNodeModel(
        this.generateNodeProperties(child.node).iconType,
        `${child.node.name} - (type: ${child.node.type})`,
        this.generateNodeProperties(child.node).color,
        180,
        90,
      );
      storylineNode.x = ROOT_NODE_POSITION.x + 300 * xAxisLocal;
      storylineNode.y = ROOT_NODE_POSITION.y * maxHeightLocal;
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
          nodeModel.x + nodeModel.width + 21.5,
          storylineNode.y + storylineNode.height / 2,
        );
        model.addLink(link);
      }

      return this.buildAutomationTree(
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
          color: '#f9f9f9',
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
    //
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
    this.engine.installDefaultFactories();
    this.buildAutomationTree(model, automationData, rootNode, 0, 1);
  };

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

  onSchemaSelectorClick = () => {
    this.setState({ viewSchema: !this.state.viewSchema });
  };

  render() {
    const { viewSchema } = this.state;
    return (
      <div className={`automation-builder`} ref={this.div}>
        <Col span={viewSchema ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={true}
            allowCanvasTranslation={true}
            inverseZoom={true}
          />
          <div className="button-helpers top">
            <ButtonStyleless
              onClick={this.onSchemaSelectorClick}
              className="helper"
            >
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
              />{' '}
            </ButtonStyleless>
          </div>
        </Col>
        <Col span={viewSchema ? 6 : 24} className="available-nodes-visualizer">
          <AvailableNodeVisualizer/>
        </Col>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(AutomationBuilder);
