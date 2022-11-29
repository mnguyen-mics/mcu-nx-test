import * as React from 'react';
import cuid from 'cuid';
import { DiagramEngine, PortWidget } from 'storm-react-diagrams';
import AutomationNodeModel from './AutomationNodeModel';
import { WindowBodyPortal } from '../../../../components';
import { ROOT_NODE_POSITION } from '../../../Audience/AdvancedSegmentBuilder/domain';
import { injectIntl, FormattedMessage, defineMessages, WrappedComponentProps } from 'react-intl';
import { injectDrawer } from '../../../../components/Drawer';
import { compose } from 'recompose';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { TreeNodeOperations, generateNodeProperties, StorylineNodeModel } from '../domain';
import { Tooltip } from 'antd';
import {
  isScenarioNodeShape,
  AutomationFormDataType,
  AutomationFormPropsType,
  isQueryInputNode,
  isAddToSegmentNode,
  isDeleteFromSegmentNode,
  isOnSegmentEntryInputNode,
  isOnSegmentExitInputNode,
  isFeedNode,
  isInputNode,
  isEndNode,
} from './Edit/domain';

import { ScenarioNodeType } from '../../../../models/automations/automations';
import { withRouter, RouterProps, RouteComponentProps } from 'react-router-dom';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { isFakeId } from '../../../../utils/FakeIdHelper';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import FeedNodeAutomationDashboardStats, {
  FeedNodeAutomationDashboardStatsProps,
} from './Dashboard/FeedNode/FeedNodeAutomationDashboardStats';
import UsersCounter from '../UsersCounter';
import EntryNodeAutomationDashboardStats, {
  EntryNodeAutomationDashboardStatsProps,
} from './Dashboard/EntryNode/EntryNodeAutomationDashboardStats';
import ExitNodeAutomationDashboardStats, {
  ExitNodeAutomationDashboardStatsProps,
} from './Dashboard/ExitNode/ExitNodeAutomationDashboardStats';
import { ScenarioCountersData } from '../../../../utils/ScenarioAnalyticsReportHelper';
import { ICustomActionService } from '../../../../services/CustomActionService';

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
  nodeName?: string;
  nodeSubTitle?: string;
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
  goToSegment: {
    id: 'automation.builder.node.goToSegment',
    defaultMessage: 'Go to Segment',
  },
});

type Props = AutomationNodeProps &
  InjectedDrawerProps &
  WrappedComponentProps &
  RouterProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  constructor(props: Props) {
    super(props);

    this.state = {
      focus: false,
      hover: false,
      nodeName: undefined,
    };
  }

  componentDidMount() {
    const { node } = this.props;
    if (
      isScenarioNodeShape(node.storylineNodeModel.node) &&
      node.storylineNodeModel.node.last_added_node
    ) {
      this.editNode();
    }

    this.fetchNodeName();
  }

  fetchNodeName() {
    const { node, diagramEngine } = this.props;

    const nodeShape = node.storylineNodeModel.node;
    let nodeName: string | undefined;
    switch (nodeShape.type) {
      case 'ADD_TO_SEGMENT_NODE':
        nodeName = 'Add to segment';
        if (nodeShape.formData.audienceSegmentName) {
          this.setState({ nodeName, nodeSubTitle: nodeShape.formData.audienceSegmentName });
        } else if (nodeShape.formData.audienceSegmentId) {
          this._audienceSegmentService
            .getSegment(nodeShape.formData.audienceSegmentId)
            .then(({ data: segment }) => {
              this.setState({ nodeName, nodeSubTitle: segment.name });
            })
            .catch(() => {
              this.setState({ nodeName, nodeSubTitle: undefined });
            });
        }
        break;
      case 'DELETE_FROM_SEGMENT_NODE':
        nodeName = 'Remove from segment';
        if (nodeShape.formData.segmentId) {
          if (!isFakeId(nodeShape.formData.segmentId)) {
            this._audienceSegmentService
              .getSegment(nodeShape.formData.segmentId)
              .then(({ data: segment }) => {
                this.setState({ nodeName, nodeSubTitle: segment.name });
              })
              .catch(() => {
                this.setState({ nodeName, nodeSubTitle: undefined });
              });
          } else {
            const scenarioNodes = Object.values(diagramEngine.diagramModel.nodes)
              .filter(nodeModel => nodeModel.type === 'automation-node')
              .map((nodeModel: AutomationNodeModel) => nodeModel.storylineNodeModel);
            const nodeSubTitle = this.findSegmentNameFromAddToSegmentNode(
              nodeShape.formData.segmentId,
              scenarioNodes,
            );
            this.setState({ nodeName, nodeSubTitle });
          }
        }
        break;
      case 'CUSTOM_ACTION_NODE':
        if (nodeShape.formData?.customActionId) {
          this._customActionService
            .getInstanceById(nodeShape.formData.customActionId)
            .then(({ data: customAction }) => {
              this.setState({ nodeSubTitle: customAction.name });
            })
            .catch(() => {
              this.setState({ nodeSubTitle: undefined });
            });
        }
        break;
      case 'WAIT_NODE':
        if (nodeShape.formData) {
          const waitDuration = nodeShape.formData.wait_duration;
          const formData = nodeShape.formData;
          nodeName = `Wait ${waitDuration.value} ${
            parseInt(waitDuration.value) === 1 ? waitDuration.unit.slice(0, -1) : waitDuration.unit
          }`;
          const subTitle: string[] = [];
          if (formData.time_window_end && formData.time_window_start) {
            subTitle.push(
              `between ${formData.time_window_start.format(
                'HH:MM',
              )} and ${formData.time_window_end.format('HH:MM')}`,
            );
          }
          if (formData.day_window && formData.day_window.length < 7) {
            if (formData.day_window.length === 1) {
              const dayName = formData.day_window[0];
              const formattedDayName = `${dayName[0].toUpperCase()}${dayName
                .slice(1)
                .toLowerCase()}`;
              subTitle.push(`on ${formattedDayName}s`);
            } else {
              subTitle.push(`on ${formData.day_window.length} days`);
            }
          }
          if (subTitle.length > 0) {
            const endStr = formData.time_window_end && formData.time_window_start ? '' : ',';
            subTitle.unshift(`Move on${endStr}`);
          }
          this.setState({ nodeName, nodeSubTitle: subTitle.join(' ') });
        }
        break;
      default:
        break;
    }
  }

  findSegmentNameFromAddToSegmentNode = (id: string, storylineNodeModels: StorylineNodeModel[]) => {
    const addToSegmentStoryLine = storylineNodeModels.find(
      storylineNode =>
        isAddToSegmentNode(storylineNode.node) &&
        id === storylineNode.node.formData.audienceSegmentId,
    );
    if (addToSegmentStoryLine && isAddToSegmentNode(addToSegmentStoryLine.node)) {
      return addToSegmentStoryLine.node.formData.audienceSegmentName || '';
    }
    return '';
  };

  setPosition = (node: HTMLDivElement | null) => {
    const bodyPosition = document.body.getBoundingClientRect();
    const viewportOffset = node ? node.getBoundingClientRect() : null;
    this.top = viewportOffset ? viewportOffset.top + bodyPosition.top : 0;
    this.left = viewportOffset ? viewportOffset.left + bodyPosition.left : 0;
  };

  removeNode = () => {
    this.setState({ focus: false }, () => {
      this.props.nodeOperations.deleteNode(this.props.node.storylineNodeModel.node.id);
    });
  };

  viewStats = () => {
    const { node, openNextDrawer, closeNextDrawer, datamartId } = this.props;
    const selectedNode = node.storylineNodeModel.node;

    if (isFeedNode(selectedNode) && selectedNode.feed_id) {
      openNextDrawer<FeedNodeAutomationDashboardStatsProps>(FeedNodeAutomationDashboardStats, {
        additionalProps: {
          feedId: selectedNode.feed_id,
          close: closeNextDrawer,
        },
        size: 'medium',
      });
    } else if (isInputNode(selectedNode)) {
      openNextDrawer<EntryNodeAutomationDashboardStatsProps>(EntryNodeAutomationDashboardStats, {
        additionalProps: {
          datamartId: datamartId,
          nodeId: selectedNode.id,
          close: closeNextDrawer,
        },
        size: 'medium',
      });
    } else if (isEndNode(selectedNode)) {
      openNextDrawer<ExitNodeAutomationDashboardStatsProps>(ExitNodeAutomationDashboardStats, {
        additionalProps: {
          datamartId: datamartId,
          nodeId: selectedNode.id,
          close: closeNextDrawer,
        },
        size: 'medium',
      });
    }
  };

  editNode = () => {
    const {
      node,
      openNextDrawer,
      closeNextDrawer,
      nodeOperations,
      viewer,
      datamartId,
      diagramEngine,
      intl: { formatMessage },
    } = this.props;
    this.setState({ focus: false }, () => {
      if (isScenarioNodeShape(node.storylineNodeModel.node)) {
        const scenarioNodeShape = node.storylineNodeModel.node;
        let initialValue: AutomationFormDataType = {};
        let size: 'small' | 'large' = 'small';

        switch (scenarioNodeShape.type) {
          case 'ABN_NODE':
          case 'EMAIL_CAMPAIGN':
          case 'WAIT_NODE':
            initialValue = {
              ...scenarioNodeShape.formData,
            };
            break;
          case 'QUERY_INPUT':
          case 'IF_NODE':
            // add here query input
            initialValue = {
              ...scenarioNodeShape.formData,
              datamart_id: scenarioNodeShape.formData.datamart_id
                ? scenarioNodeShape.formData.datamart_id
                : datamartId,
            } as any;
            size =
              scenarioNodeShape.type === 'QUERY_INPUT'
                ? scenarioNodeShape.ui_creation_mode === 'REACT_TO_EVENT_STANDARD' ||
                  scenarioNodeShape.ui_creation_mode === 'REACT_TO_EVENT_ADVANCED'
                  ? 'small'
                  : 'large'
                : 'large';
            break;
          case 'ON_SEGMENT_ENTRY_INPUT_NODE':
          case 'ON_SEGMENT_EXIT_INPUT_NODE':
            initialValue = {
              ...scenarioNodeShape.formData,
              datamartId: scenarioNodeShape.formData.datamartId
                ? scenarioNodeShape.formData.datamartId
                : datamartId,
            } as any;
            break;
          case 'CUSTOM_ACTION_NODE':
          case 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE':
          case 'DELETE_FROM_SEGMENT_NODE':
          case 'ADD_TO_SEGMENT_NODE':
            initialValue = {
              ...scenarioNodeShape.formData,
            } as any;
            break;
          default:
            break;
        }

        let disableEdition = false;
        switch (scenarioNodeShape.type) {
          case 'ABN_NODE':
            disableEdition = Object.keys(scenarioNodeShape.edges_selection).length !== 0;
            break;
          case 'ADD_TO_SEGMENT_NODE':
          case 'DELETE_FROM_SEGMENT_NODE':
            disableEdition = !!scenarioNodeShape.user_list_segment_id;
            break;
          case 'ON_SEGMENT_ENTRY_INPUT_NODE':
          case 'ON_SEGMENT_EXIT_INPUT_NODE':
            disableEdition = !!scenarioNodeShape.audience_segment_id;
            break;
          default:
            break;
        }

        const close = () => {
          closeNextDrawer();
        };

        const scenarioNodes = Object.values(diagramEngine.diagramModel.nodes)
          .filter(nodeModel => nodeModel.type === 'automation-node')
          .map((nodeModel: AutomationNodeModel) => nodeModel.storylineNodeModel);

        openNextDrawer<AutomationFormPropsType>(node.editFormComponent, {
          additionalProps: {
            storylineNodeModel: node.storylineNodeModel,
            scenarioNodes: scenarioNodes,
            close: close,
            breadCrumbPaths: [
              generateNodeProperties(node.storylineNodeModel.node, formatMessage).title,
            ],
            disabled: viewer || disableEdition,
            onSubmit: (formData: AutomationFormDataType) => {
              nodeOperations.updateNode(scenarioNodeShape, formData, initialValue);
              closeNextDrawer();
            },
            initialValues: initialValue,
          },
          size: size,
          isModal: true,
        });
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

  renderAbnEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--edit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );

      if (!node.isFirstNode) {
        content.push(
          <div
            key='remove'
            onClick={this.removeNode}
            className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--remove'
          >
            <FormattedMessage {...messages.remove} />
          </div>,
        );
      }
    }

    return content;
  };

  renderAddToSegmentOrDeleteFromSegmentEdit = (): React.ReactNodeArray => {
    const {
      viewer,
      node,
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--edit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );

      if (!node.isFirstNode) {
        content.push(
          <div
            key='remove'
            onClick={this.removeNode}
            className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--remove'
          >
            <FormattedMessage {...messages.remove} />
          </div>,
        );
      }
    } else {
      const gotToSegment = () => {
        if (
          isAddToSegmentNode(node.storylineNodeModel.node) ||
          isDeleteFromSegmentNode(node.storylineNodeModel.node)
        )
          history.push(
            `/v2/o/${organisationId}/audience/segments/${node.storylineNodeModel.node.user_list_segment_id}`,
          );
      };
      content.push(
        <div
          key='stats'
          onClick={gotToSegment}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-stats'
        >
          <FormattedMessage {...messages.goToSegment} />
        </div>,
      );

      content.push(
        <div
          key='view'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-node-config'
        >
          <FormattedMessage {...messages.view} />
        </div>,
      );
    }

    return content;
  };

  renderOnSegmentInputEdit = (): React.ReactNodeArray => {
    const {
      viewer,
      node,
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--edit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );
    } else {
      content.push(
        <div
          key='stats'
          onClick={this.viewStats}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-stats'
        >
          <FormattedMessage {...messages.stats} />
        </div>,
      );

      const gotToSegment = () => {
        if (
          isOnSegmentEntryInputNode(node.storylineNodeModel.node) ||
          isOnSegmentExitInputNode(node.storylineNodeModel.node)
        )
          history.push(
            `/v2/o/${organisationId}/audience/segments/${node.storylineNodeModel.node.audience_segment_id}`,
          );
      };
      content.push(
        <div
          key='segment'
          onClick={gotToSegment}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--got-to-segment'
        >
          <FormattedMessage {...messages.goToSegment} />
        </div>,
      );
      content.push(
        <div
          key='view'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-node-config'
        >
          <FormattedMessage {...messages.view} />
        </div>,
      );
    }

    return content;
  };

  renderDefautEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--edit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );

      if (!node.isFirstNode) {
        content.push(
          <div
            key='remove'
            onClick={this.removeNode}
            className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--remove'
          >
            <FormattedMessage {...messages.remove} />
          </div>,
        );
      }
    } else {
      content.push(
        <div
          key='stats'
          onClick={this.viewStats}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-stats'
        >
          <FormattedMessage {...messages.stats} />
        </div>,
      );

      content.push(
        <div
          key='view'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-node-config'
        >
          <FormattedMessage {...messages.view} />
        </div>,
      );
    }

    return content;
  };

  renderQueryEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;
    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu_item_queryEdit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );

      if (!node.isFirstNode) {
        content.push(
          <div
            key='remove'
            onClick={this.removeNode}
            className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--remove'
          >
            <FormattedMessage {...messages.remove} />
          </div>,
        );
      }
    } else {
      content.push(
        <div
          key='stats'
          onClick={this.viewStats}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-stats'
        >
          <FormattedMessage {...messages.stats} />
        </div>,
      );

      content.push(
        <div
          key='view'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-node-config'
        >
          <FormattedMessage {...messages.view} />
        </div>,
      );
    }

    return content;
  };

  renderEndNodeEdit = (): React.ReactNodeArray => {
    const { viewer } = this.props;
    const content: React.ReactNodeArray = [];

    if (viewer) {
      content.push(
        <div
          key='stats'
          onClick={this.viewStats}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-stats'
        >
          <FormattedMessage {...messages.stats} />
        </div>,
      );
    }

    return content;
  };

  defaultEditRemoveNode = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push(
        <div
          key='edit'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--edit'
        >
          <FormattedMessage {...messages.edit} />
        </div>,
      );

      if (!node.isFirstNode) {
        content.push(
          <div
            key='remove'
            onClick={this.removeNode}
            className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--remove'
          >
            <FormattedMessage {...messages.remove} />
          </div>,
        );
      }
    } else {
      content.push(
        <div
          key='view'
          onClick={this.editNode}
          className='boolean-menu-item mcs-automationNodeWidget_booleanMenu--view-node-config'
        >
          <FormattedMessage {...messages.view} />
        </div>,
      );
    }

    return content;
  };

  renderEditMenu = (nodeType: ScenarioNodeType): React.ReactNodeArray => {
    switch (nodeType) {
      case 'ABN_NODE':
        return this.renderAbnEdit();
      case 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE':
        return this.renderDefautEdit();
      case 'ADD_TO_SEGMENT_NODE':
      case 'DELETE_FROM_SEGMENT_NODE':
        return this.renderAddToSegmentOrDeleteFromSegmentEdit();
      case 'QUERY_INPUT':
        return this.renderQueryEdit();
      case 'END_NODE':
        return this.renderEndNodeEdit();
      case 'EMAIL_CAMPAIGN':
      case 'CUSTOM_ACTION_NODE':
      case 'IF_NODE':
      case 'WAIT_NODE':
      case 'PLUGIN_NODE':
        return this.defaultEditRemoveNode();
      case 'ON_SEGMENT_ENTRY_INPUT_NODE':
      case 'ON_SEGMENT_EXIT_INPUT_NODE':
        return this.renderOnSegmentInputEdit();
      default:
        return [];
    }
  };

  getIcon = (node: AutomationNodeModel) => {
    const backgroundColor = node.getColor();
    const color = '#ffffff';
    const borderColor = node.getColor();

    const icon = node.iconAnt ? (
      node.iconAnt
    ) : (
      <McsIcon type={node.icon as McsIconType} className='available-node-icon-gyph' />
    );

    if (node.iconAssetUrl) {
      return (
        <div
          className={'node-icon'}
          style={{
            width: node.getSize().width,
            height: node.getSize().height,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            float: 'left',
          }}
        >
          <img
            className='available-node-icon-img'
            src={`${(window as any).MCS_CONSTANTS.ASSETS_URL}${node.iconAssetUrl}`}
          />
        </div>
      );
    } else {
      return (
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
          {icon}
        </div>
      );
    }
  };

  getNumberOfUsers = (): number | undefined => {
    const { node } = this.props;

    const scenarioCountersData: ScenarioCountersData | undefined = node.getScenarioCountersData();

    if (!scenarioCountersData) return undefined;

    const count = scenarioCountersData.nodeCountersData.find(
      line => line.nodeId === node.storylineNodeModel.node.id,
    )?.userPointsCount;
    return count ? +count : undefined;
  };

  getNodeSubTitleMaxSize = (): number => {
    const { node } = this.props;
    switch (node.storylineNodeModel.node.type) {
      case 'WAIT_NODE':
        return 60;
      default:
        return 25;
    }
  };

  getOnClickFunction = (menuItemCount: number): undefined | (() => void) => {
    if (menuItemCount > 1) {
      return;
    }
    const { node, viewer } = this.props;
    const nodeType = node.storylineNodeModel.node.type;
    switch (nodeType) {
      case 'ABN_NODE':
        return viewer ? this.editNode : undefined;
      case 'QUERY_INPUT':
        return viewer ? this.viewStats : this.editNode;
      case 'END_NODE':
        return this.viewStats;
      case 'EMAIL_CAMPAIGN':
      case 'CUSTOM_ACTION_NODE':
      case 'IF_NODE':
      case 'WAIT_NODE':
      case 'PLUGIN_NODE':
        return this.editNode;
      case 'ON_SEGMENT_ENTRY_INPUT_NODE':
      case 'ON_SEGMENT_EXIT_INPUT_NODE':
        return viewer ? this.viewStats : this.editNode;
      default:
        return;
    }
  };

  render() {
    const { node, viewer } = this.props;
    const { nodeName, nodeSubTitle } = this.state;
    const NODE_NAME_MAX_SIZE = 20;
    const NODE_SUBTITLE_MAX_SIZE = this.getNodeSubTitleMaxSize();
    const icon = this.getIcon(node);

    const nodeCounter = viewer ? (
      <UsersCounter
        style={{ height: node.getNodeCounterHeight() }}
        iconName={'user'}
        numberOfUsers={this.getNumberOfUsers()}
      />
    ) : undefined;

    const booleanMenuTop = viewer ? node.getNodeCounterHeight() * 0.75 : 0;

    const onFocus = () => {
      this.setPosition(document.getElementById(this.id) as HTMLDivElement);
      this.setState({ focus: !this.state.focus });
    };

    const zoomRatio = this.props.diagramEngine.getDiagramModel().zoom / 100;

    const nodeTitleToDisplayed = nodeName || node.title;
    const nodeSubTitleToDisplay = nodeSubTitle ?? node.subtitle ?? '';

    const nodeType = node.storylineNodeModel.node.type;

    const editContent = this.renderEditMenu(nodeType);
    const onClick: undefined | (() => void) =
      editContent.length === 0 ? undefined : this.getOnClickFunction(editContent.length) ?? onFocus;

    const renderedAutomationNode = (
      <div
        className={`node-body mcs-automationNodeWidget${
          nodeTitleToDisplayed ? '_' + nodeTitleToDisplayed.replace(/ +/g, '') : ''
        }`}
        style={{
          width: `${node.getNodeSize().width}px`,
          height: `${node.getNodeSize().height}px`,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {icon}
        <div className='node-content'>
          {nodeCounter}
          <Tooltip
            title={
              nodeTitleToDisplayed.length > NODE_NAME_MAX_SIZE ? nodeTitleToDisplayed : undefined
            }
            placement='bottom'
          >
            {`${
              nodeTitleToDisplayed.substring(0, NODE_NAME_MAX_SIZE) +
              (nodeTitleToDisplayed.length > NODE_NAME_MAX_SIZE ? '...' : '')
            }`}
          </Tooltip>
        </div>
        <div className='node-subtitle'>
          <Tooltip
            title={
              nodeSubTitleToDisplay.length > NODE_SUBTITLE_MAX_SIZE
                ? nodeSubTitleToDisplay
                : undefined
            }
            placement='bottom'
          >
            {`${
              nodeSubTitleToDisplay.substring(0, NODE_SUBTITLE_MAX_SIZE) +
              (nodeSubTitleToDisplay.length > NODE_SUBTITLE_MAX_SIZE ? '...' : '')
            }`}
          </Tooltip>
        </div>
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
          <PortWidget name='center' node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: node.getNodeSize().height / 2,
            left: node.getNodeSize().width + 20,
          }}
        >
          <PortWidget name='right' node={this.props.node} />
        </div>
        {(node.y !== ROOT_NODE_POSITION.y || node.x !== ROOT_NODE_POSITION.x) && (
          <div
            style={{
              position: 'absolute',
              top: node.getNodeSize().height / 2 - 6,
              left: -10,
            }}
          >
            <McsIcon type='chevron-right' className='arrow' />
          </div>
        )}
        {this.state.focus && (
          <WindowBodyPortal>
            <div className='automation-builder focus'>
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
                className='object-node no-hover'
                style={{
                  width: node.getNodeSize().width,
                  height: node.getNodeSize().height,
                  borderRadius: 4,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderColor: node.getColor(),
                  top: this.top - node.getNodeSize().height * ((1 - zoomRatio) / 2),
                  left: this.left - node.getNodeSize().width * ((1 - zoomRatio) / 2),
                  position: 'absolute',
                  zIndex: 1002,
                  transform: `scale(${zoomRatio})`,
                }}
                onClick={onFocus}
              >
                {renderedAutomationNode}
              </span>
              <div
                className='boolean-menu mcs-automationNodeWidget_booleanMenu'
                style={{
                  top: this.top + booleanMenuTop * zoomRatio,
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
  withRouter,
  injectIntl,
  injectDrawer,
)(AutomationNodeWidget);
