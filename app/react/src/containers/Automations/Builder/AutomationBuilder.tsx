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
import AvailableNode from './NodeVisualizer/AvailableNode';
import AutomationLinkFactory from './Link/AutomationLinkFactory';

export interface AutomationBuilderProps {
  datamartId: string;
  organisationId: string;
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

  componentWillMount() {
    const model = new DiagramModel();
    model.setLocked(true);
    const rootNode = new AutomationNodeModel('plus', 'User belongs to ### segment', '#2ecc71');
    rootNode.root = true;
    rootNode.x = ROOT_NODE_POSITION.x;
    rootNode.y = ROOT_NODE_POSITION.y;

    const endNode = new AutomationNodeModel('close', 'End automation', '#ff5959');
      endNode.x = ROOT_NODE_POSITION.x * 4;
      endNode.y = ROOT_NODE_POSITION.y;

    this.buildModelTree(rootNode, endNode, model);

    this.engine.setDiagramModel(model);
  }

  buildModelTree(
    rootNode: AutomationNodeModel,
    endNode: AutomationNodeModel,
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
