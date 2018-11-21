import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
} from 'storm-react-diagrams';
import {
  ROOT_NODE_POSITION,
  createLink,
} from '../../QueryTool/JSONOTQL/domain';
import { Col } from 'antd';
import { ButtonStyleless, McsIcon } from '../../../components';
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
    this.engine.registerNodeFactory(
      new AutomationNodeFactory(),
    );

    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());

    this.state = {
      viewSchema: true,
    };
  }

  buildAutomationModelTree = (
    automationData: StorylineNodeResource,
    model: DiagramModel,
  ) => {
    const generateNodeProperties = (
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
    };


    const rootNode = new AutomationNodeModel(
      generateNodeProperties(automationData.node).iconType,
      `${automationData.node.name} - (type: ${automationData.node.type})`,
      generateNodeProperties(automationData.node).color,
    );
    rootNode.root = true;
    rootNode.x = ROOT_NODE_POSITION.x;
    rootNode.y = ROOT_NODE_POSITION.y;
    model.addNode(rootNode);
    


    const layout = (currentNode: StorylineNodeResource, depth: number) => {
      let acc = ROOT_NODE_POSITION.y;
      currentNode.out_edges.forEach((child, index) => {
        const storylineNode = new AutomationNodeModel(
          generateNodeProperties(child.node).iconType,
          `${child.node.name} - (type: ${child.node.type})`,
          generateNodeProperties(child.node).color,
        );
        const shouldAccumulate = ROOT_NODE_POSITION.y * (index + 1) > acc;
        if(shouldAccumulate) {
          acc = acc + 150;
        } 
        storylineNode.x = ROOT_NODE_POSITION.x * 4 * depth;
        // storylineNode.y =  shouldAccumulate ? : ;
        model.addNode(storylineNode);
        layout(child, depth + 1);
      });
    };
    layout(automationData, 1);

  };

  componentWillMount() {
    const { automationData } = this.props;
    const model = new DiagramModel();
    model.setLocked(true);
    this.buildAutomationModelTree(automationData, model);
    this.engine.setDiagramModel(model);
  }

  buildModelTree(
    rootNode: AutomationNodeModel,
    endNode: AutomationNodeModel,
    model: DiagramModel,
  ) {
    model.addNode(rootNode);
    model.addNode(endNode);
    model.addLink(createLink(rootNode.ports.right, endNode.ports.left));
  }

  render() {
    const { viewSchema } = this.state;

    const onSchemaSelectorClick = () =>
      this.setState({ viewSchema: !viewSchema });

    return (
      <div
        className={`automation-builder`}
        ref={this.div}
      >
        <Col span={viewSchema ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={true}
            allowCanvasTranslation={true}
            inverseZoom={true}
          />
          <div className="button-helpers top">
            <ButtonStyleless onClick={onSchemaSelectorClick} className="helper">
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
