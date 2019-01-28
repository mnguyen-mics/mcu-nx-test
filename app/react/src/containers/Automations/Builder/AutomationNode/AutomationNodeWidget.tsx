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
import { TreeNodeOperations } from '../domain';
import { Icon } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import JSONQLPreview from '../../../QueryTool/JSONOTQL/JSONQLPreview';
import {
  isScenarioNodeShape,
  AutomationFormDataType,
  AutomationFormPropsType,
  isQueryInputNode,
  INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
} from './Edit/domain';
import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import AdGroupFormService from '../../../Campaigns/Display/Edit/AdGroup/AdGroupFormService';

interface AutomationNodeProps {
  node: AutomationNodeModel;
  lockGlobalInteraction: (lock: boolean) => void;
  diagramEngine: DiagramEngine;
  nodeOperations: TreeNodeOperations;
  updateQueryNode: (nodeId: string, queryText: string) => void;
}

interface State {
  focus: boolean;
  hover: boolean;
  initialValuesForm?: AutomationFormDataType;
}

const messages = defineMessages({
  edit: {
    id: 'automation.builder.node.edit',
    defaultMessage: 'Edit',
  },
  remove: {
    id: 'automation.builder.node.remove',
    defaultMessage: 'Remove',
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

  componentDidMount() {
    const {
      node: {
        storylineNodeModel: { node },
      },
    } = this.props;
    switch (node.type) {
      case 'DISPLAY_CAMPAIGN':
        return node.campaign_id && node.ad_group_id
          ? DisplayCampaignService.getCampaignDisplay(node.campaign_id).then(
              campaignResp => {
                AdGroupFormService.loadAdGroup(
                  node.campaign_id,
                  node.ad_group_id,
                ).then(adGroupResp => {
                  this.setState({
                    initialValuesForm: {
                      campaign: campaignResp.data,
                      name: node.name,
                      locationFields: adGroupResp.locationFields,
                      adGroup: adGroupResp.adGroup,
                      adFields: adGroupResp.adFields,
                      bidOptimizerFields: adGroupResp.bidOptimizerFields,
                      inventoryCatalFields: adGroupResp.inventoryCatalFields,
                    },
                  });
                });
              },
            )
          : this.setState({
              initialValuesForm: INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
            });
      case 'EMAIL_CAMPAIGN':
        const eCFormData = node.formData;
        return eCFormData || INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA;
      case 'ABN_NODE':
        const abnFormData = node.formData;
        return (
          abnFormData || {
            name: '',
            branch_number: 2,
          }
        );
      default:
        return;
    }
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

  editNode = () => {
    const { node, lockGlobalInteraction } = this.props;
    const { initialValuesForm } = this.state;
    this.setState({ focus: false }, () => {
      lockGlobalInteraction(false);
      if (
        isScenarioNodeShape(node.storylineNodeModel.node) &&
        initialValuesForm
      ) {
        const scenarioNodeShape = node.storylineNodeModel.node;

        this.props.openNextDrawer<AutomationFormPropsType>(
          node.editFormComponent,
          {
            additionalProps: {
              node: scenarioNodeShape,
              close: this.props.closeNextDrawer,
              breadCrumbPaths: [{ name: node.storylineNodeModel.node.name }],
              onSubmit: (formData: AutomationFormDataType) => {
                this.props.nodeOperations.updateNode(
                  scenarioNodeShape,
                  formData,
                  initialValuesForm,
                );
                this.props.closeNextDrawer();
              },
              initialValues: this.state.initialValuesForm,
            },
            size: 'small',
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

  handleQueryOnChange = (queryText: string) => {
    const { node } = this.props;
    this.props.updateQueryNode(node.storylineNodeModel.node.id, queryText);
  };

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

    const renderedAutomationNode = (
      <div
        className="node-body"
        style={{
          width: `${node.getNodeSize().width}px`,
          height: `${node.getNodeSize().height}px`,
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

        <div className="node-content">{node.title}</div>
      </div>
    );

    const nodeType = node.storylineNodeModel.node.type;

    return (
      <div id={this.id} onClick={onFocus}>
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
                {/* Uncomment when feature is ready */}
                {/* <div onClick={this.toggleCollapsed} className='boolean-menu-item'>Collapse</div> */}
                {nodeType === 'START' || nodeType === 'QUERY_INPUT' ? (
                  <JSONQLPreview
                    datamartId={node.datamartId}
                    value={this.getQuery()}
                    isTrigger={true}
                    onChange={this.handleQueryOnChange}
                    context="AUTOMATION_BUILDER"
                  />
                ) : (
                  <div onClick={this.editNode} className="boolean-menu-item">
                    <FormattedMessage {...messages.edit} />
                  </div>
                )}

                {nodeType !== 'START' &&
                  nodeType !== 'GOAL' &&
                  nodeType !== 'FAILURE' && (
                    <div
                      onClick={this.removeNode}
                      className="boolean-menu-item"
                    >
                      <FormattedMessage {...messages.remove} />
                    </div>
                  )}
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
