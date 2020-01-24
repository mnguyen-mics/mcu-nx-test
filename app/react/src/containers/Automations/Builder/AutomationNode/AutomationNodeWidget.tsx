import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import AutomationNodeModel from './AutomationNodeModel';
import { McsIcon, WindowBodyPortal } from '../../../../components';
import { ROOT_NODE_POSITION } from '../../../QueryTool/JSONOTQL/domain';
import {
  injectIntl,
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
} from 'react-intl';
import { injectDrawer } from '../../../../components/Drawer';
import { compose } from 'recompose';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { TreeNodeOperations, AutomationNodeShape } from '../domain';
import { Icon } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import {
  isScenarioNodeShape,
  AutomationFormDataType,
  AutomationFormPropsType,
  isQueryInputNode,
} from './Edit/domain';

import { ScenarioNodeType, ScenarioNodeShape } from '../../../../models/automations/automations'
import DisplayCampaignAutomatedDashboardPage, { DisplayCampaignAutomatedDashboardPageProps } from './Dashboard/DisplayCampaign/DisplayCampaignAutomatedDashboardPage';
import EmailCampaignAutomatedDashboardPage, { EmailCampaignAutomatedDashboardPageProps } from './Dashboard/EmailCampaign/EmailCampaignAutomatedDashboardPage';


interface AutomationNodeProps {
  node: AutomationNodeModel;
  lockGlobalInteraction: (lock: boolean) => void;
  diagramEngine: DiagramEngine;
  nodeOperations: TreeNodeOperations;
  viewer: boolean;
  datamartId: string;
}

interface State {
  focus: boolean;
  hover: boolean;
}

const messages = defineMessages({
  edit: {
    id: 'automation.builder.node.edit',
    defaultMessage: 'Edit',
  },
  view: {
    id: 'automation.builder.node.view',
    defaultMessage: 'View Node Config.',
  },
  stats: {
    id: 'automation.builder.node.stats',
    defaultMessage: 'View Stats.',
  },
  remove: {
    id: 'automation.builder.node.remove',
    defaultMessage: 'Remove',
  },
  settings: {
    id: 'automation.builder.node.settings',
    defaultMessage: 'Settings',
  },
});

type Props = AutomationNodeProps & InjectedDrawerProps & InjectedIntlProps;

class AutomationNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  constructor(props: Props) {
    super(props);

    this.state = {
      focus: false,
      hover: false,
    };
  }


  setPosition = (node: HTMLDivElement | null) => {
    const bodyPosition = document.body.getBoundingClientRect();
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top + bodyPosition.top : 0;
    this.left = viewportOffset ? viewportOffset.left + bodyPosition.left : 0;
  };

  removeNode = () => {
    this.setState({ focus: false }, () => {
      this.props.nodeOperations.deleteNode(
        this.props.node.storylineNodeModel.node.id,
      );
    });
  };

  viewStats = () => {
    const { node, openNextDrawer, closeNextDrawer } = this.props;
    const selectedNode = node.storylineNodeModel.node;

    if (selectedNode.type === "DISPLAY_CAMPAIGN") {
      const campaignValue = selectedNode.formData;
      openNextDrawer<DisplayCampaignAutomatedDashboardPageProps>(
        DisplayCampaignAutomatedDashboardPage,
        {
          additionalProps: {
            campaignId: campaignValue.campaign.id!,
            close: closeNextDrawer,
          },
          size: 'large',
        },
      );
    } else if (selectedNode.type === "EMAIL_CAMPAIGN") {
      openNextDrawer<EmailCampaignAutomatedDashboardPageProps>(
        EmailCampaignAutomatedDashboardPage,
        {
          additionalProps: {
            campaignId: selectedNode.campaign_id,
            close: closeNextDrawer,
          },
          size: 'large',
        },
      );
    }
  }

  editNode = () => {
    const { node, lockGlobalInteraction, openNextDrawer, closeNextDrawer, nodeOperations, viewer, datamartId } = this.props;

    this.setState({ focus: false }, () => {
      lockGlobalInteraction(true);
      if (
        isScenarioNodeShape(node.storylineNodeModel.node)
      ) {
        const scenarioNodeShape = node.storylineNodeModel.node;
        let initialValue: AutomationFormDataType = {
          name: node.storylineNodeModel.node.name
        };
        let size: "small" | "large" = 'small';

        switch (scenarioNodeShape.type) {
          case 'ABN_NODE':
          case 'DISPLAY_CAMPAIGN':
          case 'EMAIL_CAMPAIGN':
          case 'ADD_TO_SEGMENT':
          case 'WAIT_NODE':
            initialValue = {
              ...scenarioNodeShape.formData,
              name: scenarioNodeShape.name
            };
            break;
          case 'QUERY_INPUT':
          case 'IF_NODE':
            // add here query input
            initialValue = {
              ...scenarioNodeShape.formData,
              datamart_id: scenarioNodeShape.formData.datamart_id ? scenarioNodeShape.formData.datamart_id : datamartId,
              name: scenarioNodeShape.name
            } as any;
            size = "large"
            break;
          default:
            break;
        }

        const close = () => {
          lockGlobalInteraction(false);
          closeNextDrawer()
        }

        openNextDrawer<AutomationFormPropsType>(
          node.editFormComponent,
          {
            additionalProps: {
              node: scenarioNodeShape,
              close: close,
              breadCrumbPaths: [{ name: node.storylineNodeModel.node.name ? node.storylineNodeModel.node.name : "" }],
              disabled: viewer,
              onSubmit: (formData: AutomationFormDataType) => {
                nodeOperations.updateNode(
                  scenarioNodeShape,
                  formData,
                  initialValue,
                );
                closeNextDrawer();
                lockGlobalInteraction(false);
              },
              initialValues: initialValue,
            },
            size: size,
            isModal: true
          },
        );
      }
    });
  };

  getQuery = () => {
    const node = this.props.node.storylineNodeModel.node;
    if (isQueryInputNode(node)) {
      if (node.formData.query_text) {
        return JSON.parse(node.formData.query_text);
      }
    }
    return undefined;
  };


  editNodeProperties = (node: ScenarioNodeShape) => () => {
    const { nodeOperations } = this.props;

    let initialValuesForm: AutomationFormDataType = { name: node.name };
    switch (node.type) {
      case 'DISPLAY_CAMPAIGN':
      case 'EMAIL_CAMPAIGN':
      case 'ADD_TO_SEGMENT':
        initialValuesForm = node.initialFormData;
        break;
    }

    nodeOperations.updateNode(
      node,
      initialValuesForm ? initialValuesForm : { name: node.name },
      initialValuesForm ? initialValuesForm : { name: node.name },
    );
  }

  renderAbnEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push((
        <div key="edit" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div key="remove" onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    }

    return content
  }

  renderAddToSegmentEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push((
        <div key="edit" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div key="remove" onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    } else {
      content.push((
        <div key="stats" onClick={this.viewStats} className="boolean-menu-item">
          <FormattedMessage {...messages.stats} />
        </div>
      ))

      content.push((
        <div key="view" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.view} />
        </div>
      ))
    }

    return content;

  }

  renderCampaignEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push((
        <div key="edit" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div key="remove" onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    } else {
      content.push((
        <div key="stats" onClick={this.viewStats} className="boolean-menu-item">
          <FormattedMessage {...messages.stats} />
        </div>
      ))

      content.push((
        <div key="view" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.view} />
        </div>
      ))
    }

    return content

  }

  renderQueryEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;
    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push((
        <div key="edit" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))
      content.push((
        <div key="settings" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.settings} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div key="remove" onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    } else {
      content.push((
        <div key="view" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.view} />
        </div>
      ))
    }

    return content;
  }

  renderEndNodeEdit = (): React.ReactNodeArray => {
    const content: React.ReactNodeArray = [];
  
    return content;
  }

  defaultEditRemoveNode = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push((
        <div key="edit" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div key="remove" onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    } else {
      content.push((
        <div key="view" onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.view} />
        </div>
      ))
    }

    return content;
  }


  renderEditMenu = (nodeType: ScenarioNodeType): React.ReactNodeArray => {
    switch (nodeType) {
      case 'ABN_NODE':
        return this.renderAbnEdit()
      case 'EMAIL_CAMPAIGN':
      case 'DISPLAY_CAMPAIGN':
        return this.renderCampaignEdit();
      case 'ADD_TO_SEGMENT':
        return this.renderAddToSegmentEdit();
      case 'QUERY_INPUT':
        return this.renderQueryEdit();
      case 'END_NODE':
        return this.renderEndNodeEdit();
      case 'IF_NODE':
      case 'WAIT_NODE':
      case 'PLUGIN_NODE':
        return this.defaultEditRemoveNode();
      default:
        return [];
    }
  }

  renderSubTitle = (node: AutomationNodeShape) => {
    switch (node.type) {
      case 'DISPLAY_CAMPAIGN':
        return node.formData.goalFields.length ? 'exit on goal' : 'exit on visit';
      case 'QUERY_INPUT':
        return node.evaluation_mode && node.evaluation_mode === 'LIVE' ? <span>Live evaluation</span> : <span>Evalutated every {node.evaluation_period} {node.evaluation_period_unit}</span>
      default:
        return '';
    }
  }

  render() {
    const { node } = this.props;

    const backgroundColor = node.getColor();
    const color = '#ffffff';
    const borderColor = node.getColor();

    const onFocus = () => {
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });

    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    let nodeName = node.title;

    switch (node.storylineNodeModel.node.type) {
      case 'DISPLAY_CAMPAIGN':
      case 'EMAIL_CAMPAIGN':
        nodeName = node.storylineNodeModel.node.formData && node.storylineNodeModel.node.formData.campaign && node.storylineNodeModel.node.formData.campaign.name ? node.storylineNodeModel.node.formData.campaign.name : nodeName
        break;
      case 'ABN_NODE':
        // node name not saved on ABN NODE"
        nodeName = 'Split';
        break;
    }

    const nodeType = node.storylineNodeModel.node.type;

    const editContent = this.renderEditMenu(nodeType);
    const onClick = editContent.length ? onFocus : undefined

    const renderedAutomationNode = (
      <div
        className="node-body"
        style={{
          width: `${node.getNodeSize().width}px`,
          height: `${node.getNodeSize().height}px`,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <div
          className={'node-icon'}
          style={{
            width: node.getSize().width,
            height: node.getSize().height,
            borderWidth: node.getSize().borderWidth,
            borderColor: borderColor,
            float: 'left',
            color: color,
            backgroundColor: backgroundColor,
          }}
        >
          {node.iconAnt ? (
            <Icon type={node.iconAnt} className="available-node-icon-gyph" />
          ) : (
              <McsIcon
                type={node.icon as McsIconType}
                className="available-node-icon-gyph"
              />
            )}
        </div>

        <div className="node-content">{nodeName}</div>
        <div className="node-subtitle">{this.renderSubTitle(node.storylineNodeModel.node)}</div>
      </div>
    );


    return (
      <div id={this.id} key={this.id} onClick={onClick}>
        {renderedAutomationNode}
        <div
          style={{
            position: 'absolute',
            top: node.getNodeSize().height / 2,
            left: node.getNodeSize().width / 2,
          }}
        >
          <PortWidget name="center" node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: node.getNodeSize().height / 2,
            left: node.getNodeSize().width + 20,
          }}
        >
          <PortWidget name="right" node={this.props.node} />
        </div>
        {(node.y !== ROOT_NODE_POSITION.y ||
          node.x !== ROOT_NODE_POSITION.x) && (
            <div
              style={{
                position: 'absolute',
                top: node.getNodeSize().height / 2 - 6,
                left: -10,
              }}
            >
              <McsIcon type="chevron-right" className="arrow" />
            </div>
          )}
        {this.state.focus && (
          <WindowBodyPortal>
            <div className="automation-builder">
              <div
                onClick={onFocus}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'black',
                  zIndex: 1000,
                  opacity: 0.6,
                }}
              />
              <span
                className="object-node no-hover"
                style={{
                  width: node.getNodeSize().width,
                  height: node.getNodeSize().height,
                  borderRadius: 4,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderColor: node.getColor(),
                  top:
                    this.top -
                    node.getNodeSize().height * ((1 - zoomRatio) / 2),
                  left:
                    this.left -
                    node.getNodeSize().width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
                onClick={onFocus}
              >
                {renderedAutomationNode}
              </span>
              <div
                className="boolean-menu"
                style={{
                  top: this.top,
                  left: this.left + node.getNodeSize().width * zoomRatio,
                  zIndex: 1001,
                }}
              >
                {editContent}
              </div>
            </div>
          </WindowBodyPortal>
        )}
      </div>
    );
  }
}

export default compose<{}, AutomationNodeProps>(
  injectIntl,
  injectDrawer,
)(AutomationNodeWidget);
