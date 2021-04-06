import * as React from 'react';
import {
  DiagramEngine,
  DiagramWidget,
  DiagramModel,
  LabelModel,
} from 'storm-react-diagrams';
import { ROOT_NODE_POSITION } from '../../QueryTool/JSONOTQL/domain';
import { Col } from 'antd';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
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
  QueryInputUiCreationMode,
  ScenarioExitConditionFormResource,
} from '../../../models/automations/automations';
import {
  StorylineNodeModel,
  DropNode,
  DeleteNodeOperation,
  AddNodeOperation,
  TreeNodeOperations,
  UpdateNodeOperation,
  generateNodeProperties,
  cleanLastAdded,
  findLastAddedNode,
} from './domain';
import DropNodeModel from './DropNode/DropNodeModel';
import AutomationLinkModel from './Link/AutomationLinkModel';
import withDragDropContext from '../../../common/Diagram/withDragDropContext';
import { AutomationFormDataType } from './AutomationNode/Edit/domain';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { compose } from 'recompose';
import ExitConditionButton from './ExitConditionButton/ExitConditionButton';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';

export const messages = defineMessages({
  ifNodeFalsePathLabel: {
    id: 'automation.builder.ifNode.label.false',
    defaultMessage: 'If Condition False',
  },
  ifNodeTruePathLabel: {
    id: 'automation.builder.ifNode.label.true',
    defaultMessage: 'If Condition True',
  },
});

export interface AutomationBuilderBaseProps {
  datamartId: string;
  scenarioId: string;
  automationTreeData?: StorylineNodeModel;
  exitCondition?: ScenarioExitConditionFormResource;
  viewer: boolean;
  creation_mode: QueryInputUiCreationMode;
}

export interface AutomationBuilderVisualizerProps
  extends AutomationBuilderBaseProps {
  viewer: true;
}

export interface AutomationBuilderEditorProps
  extends AutomationBuilderBaseProps {
  viewer: false;
  updateAutomationData: (
    automationData: StorylineNodeModel,
    exitConditionFormResource?: ScenarioExitConditionFormResource,
  ) => StorylineNodeModel;
}

export type AutomationBuilderProps =
  | AutomationBuilderEditorProps
  | AutomationBuilderVisualizerProps;

const isAutomationBuilderEditorProp = (
  props: AutomationBuilderProps,
): props is AutomationBuilderEditorProps => {
  return props.viewer === false;
};

interface State {
  locked: boolean;
  viewNodeSelector: boolean;
}

type Props = AutomationBuilderProps & InjectedIntlProps & InjectedFeaturesProps;

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
        this.lockInteraction,
        props.datamartId,
        props.viewer,
      ),
    );

    this.engine.registerLinkFactory(new AutomationLinkFactory());
    this.engine.registerPortFactory(new SimplePortFactory());
    this.state = {
      locked: false,
      viewNodeSelector: true,
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { automationTreeData } = this.props;
    const { automationTreeData: prevAutomationTreeData } = prevProps;

    let cleanedAutomationTreeData = automationTreeData;
    if (automationTreeData) {
      const prevNodeWithLastAdded = automationTreeData
        ? findLastAddedNode(automationTreeData)
        : undefined;
      const nodeWithLastAdded = prevAutomationTreeData
        ? findLastAddedNode(prevAutomationTreeData)
        : undefined;

      if (
        prevNodeWithLastAdded &&
        nodeWithLastAdded &&
        prevNodeWithLastAdded.node.id === nodeWithLastAdded.node.id
      ) {
        cleanedAutomationTreeData = cleanLastAdded(automationTreeData);
      }
    }

    if (this.state.viewNodeSelector === prevState.viewNodeSelector) {
      const model = new DiagramModel();
      model.setLocked(this.engine.getDiagramModel().locked);
      model.setZoomLevel(this.engine.getDiagramModel().getZoomLevel());
      model.setOffsetX(this.engine.getDiagramModel().getOffsetX());
      model.setOffsetY(this.engine.getDiagramModel().getOffsetY());
      setTimeout(() => {
        this.startAutomationTree(cleanedAutomationTreeData, model);
        this.engine.setDiagramModel(model);
        this.engine.repaintCanvas();
      }, 10);
    }
  }

  addNode = (
    idParentNode: string,
    childNodeId: string,
    node: ScenarioNodeShape,
  ): StorylineNodeModel | void => {
    const props = this.props;
    if (isAutomationBuilderEditorProp(props) && props.automationTreeData) {
      // Otherwise every node of the same type have the same id
      // The id seems to be generated only once for all the class instances
      node.id = generateFakeId();
      return props.updateAutomationData(
        new AddNodeOperation(idParentNode, childNodeId, node).execute(
          props.automationTreeData,
        ),
      );
    }
  };

  deleteNode = (idNodeToBeDeleted: string): StorylineNodeModel | void => {
    const props = this.props;
    if (isAutomationBuilderEditorProp(props) && props.automationTreeData) {
      return props.updateAutomationData(
        new DeleteNodeOperation(idNodeToBeDeleted).execute(
          props.automationTreeData,
        ),
      );
    }
  };

  updateNode = (
    node: ScenarioNodeShape,
    formData: AutomationFormDataType,
    initialFormData: AutomationFormDataType,
  ): StorylineNodeModel | void => {
    const props = this.props;
    if (isAutomationBuilderEditorProp(props) && props.automationTreeData) {
      return props.updateAutomationData(
        new UpdateNodeOperation(node, formData, initialFormData).execute(
          props.automationTreeData,
        ),
      );
    }
  };

  buildAutomationNode(nodeModel: StorylineNodeResource): AutomationNodeModel {
    const {
      intl: { formatMessage },
    } = this.props;
    const nodeProperties = generateNodeProperties(
      nodeModel.node,
      formatMessage,
    );

    const storylineNode = new AutomationNodeModel(
      this.props.datamartId,
      nodeModel,
      nodeProperties.title,
      nodeProperties.subtitle,
      nodeProperties.color,
      nodeProperties.iconType,
      nodeProperties.iconAssetUrl,
      nodeProperties.iconAnt,
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
        this.addLabelForIfNodeLink(outLink, child);

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
        this.addLabelForIfNodeLink(link, child);

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

  addLabelForIfNodeLink = (
    link: AutomationLinkModel,
    child: StorylineNodeModel,
  ) => {
    if (child.in_edge !== undefined) {
      if (child.in_edge.handler === 'IF_CONDITION_FALSE') {
        link.addLabel(
          new LabelModel(messages.ifNodeFalsePathLabel.defaultMessage),
        );
      } else if (child.in_edge.handler === 'IF_CONDITION_TRUE') {
        link.addLabel(
          new LabelModel(messages.ifNodeTruePathLabel.defaultMessage),
        );
      }
    }
  };

  startAutomationTree = (
    automationData?: StorylineNodeModel,
    model?: DiagramModel,
  ) => {
    if (automationData && automationData.node && model) {
      const {
        intl: { formatMessage },
      } = this.props;
      const nodeProperties = generateNodeProperties(
        automationData.node,
        formatMessage,
      );

      const rootNode = new AutomationNodeModel(
        this.props.datamartId,
        automationData,
        nodeProperties.title,
        nodeProperties.subtitle,
        nodeProperties.color,
        nodeProperties.iconType,
        undefined,
        nodeProperties.iconAnt,
        undefined,
        true,
        this.props.creation_mode,
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
    const {
      viewer,
      exitCondition,
      datamartId,
      automationTreeData,
      hasFeature,
    } = this.props;

    let content = (
      <div className={`automation-builder`} ref={this.div}>
        <Col span={viewNodeSelector ? 18 : 24} className={'diagram'}>
          <DiagramWidget
            diagramEngine={this.engine}
            allowCanvasZoom={!this.state.locked}
            allowCanvasTranslation={!this.state.locked}
            // allowCanvasZoom={true}
            // allowCanvasTranslation={true}
            inverseZoom={true}
          />

          <div className="button-helpers top">
            <Button
              onClick={this.onNodeSelectorClick}
              className="helper nodes-drawer"
            >
              <McsIcon
                type={'chevron-right'}
                style={
                  viewNodeSelector
                    ? {}
                    : {
                        transform: 'rotate(180deg)',
                        transition: 'all 0.5s ease',
                      }
                }
              />{' '}
            </Button>
          </div>

          {hasFeature('automations-global-exit-condition') && (
            <ExitConditionButton
              datamartId={datamartId}
              automationTreeData={automationTreeData}
              exitCondition={exitCondition}
              viewer={viewer}
              updateAutomationData={
                isAutomationBuilderEditorProp(this.props)
                  ? this.props.updateAutomationData
                  : undefined
              }
            />
          )}
        </Col>
        <Col
          span={viewNodeSelector ? 6 : 0}
          className="available-nodes-visualizer"
        >
          <AvailableNodeVisualizer />
        </Col>
      </div>
    );

    if (viewer) {
      content = (
        <div className={`automation-builder`} ref={this.div}>
          <Col span={24} className={'diagram'}>
            <DiagramWidget
              diagramEngine={this.engine}
              allowCanvasZoom={!this.state.locked}
              allowCanvasTranslation={!this.state.locked}
              // allowCanvasZoom={true}
              // allowCanvasTranslation={true}
              inverseZoom={true}
            />
            {hasFeature('automations-global-exit-condition') && (
              <ExitConditionButton
                datamartId={datamartId}
                automationTreeData={automationTreeData}
                exitCondition={exitCondition}
                viewer={viewer}
                updateAutomationData={
                  isAutomationBuilderEditorProp(this.props)
                    ? this.props.updateAutomationData
                    : undefined
                }
              />
            )}
          </Col>
        </div>
      );
    }

    return content;
  }
}

export default compose<Props, AutomationBuilderProps>(
  injectIntl,
  injectFeatures,
)(withDragDropContext(AutomationBuilder));
