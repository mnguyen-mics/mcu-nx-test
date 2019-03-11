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
import {
  isScenarioNodeShape,
  AutomationFormDataType,
  AutomationFormPropsType,
  isQueryInputNode,
  INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
  INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
  INITIAL_QUERY_DATA,
  INITIAL_WAIT_DATA,
  DisplayCampaignAutomationFormData,
} from './Edit/domain';
import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import AdGroupFormService from '../../../Campaigns/Display/Edit/AdGroup/AdGroupFormService';
import EmailCampaignFormService from '../../../Campaigns/Email/Edit/EmailCampaignFormService';
import { ScenarioNodeType } from '../../../../models/automations/automations';
import { IQueryService } from '../../../../services/QueryService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { isFakeId } from '../../../../utils/FakeIdHelper';
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
  initialValuesForm?: AutomationFormDataType;
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
});

type Props = AutomationNodeProps & InjectedDrawerProps & InjectedIntlProps;

class AutomationNodeWidget extends React.Component<Props, State> {
  top: number = 0;
  left: number = 0;
  id: string = cuid();

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService; 

  constructor(props: Props) {
    super(props);
    this.state = {
      focus: false,
      hover: false,
    };
  }

  // todo move load into the formWrapper
  componentDidMount() {
    const {
      node: {
        storylineNodeModel: { node },
      },
      datamartId
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
                      goalFields: [],
                      adGroupFields: [{
                        key: adGroupResp.adGroup.id,
                        model: {
                          adFields: adGroupResp.adFields,
                          adGroup: {...adGroupResp.adGroup},
                          bidOptimizerFields: adGroupResp.bidOptimizerFields,
                          locationFields: adGroupResp.locationFields,
                          inventoryCatalFields: adGroupResp.inventoryCatalFields,
                          segmentFields: adGroupResp.segmentFields
                        }
                      }]
                    },
                  });
                });
              },
            )
          : this.setState({
              initialValuesForm: INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA,
            });
      case 'EMAIL_CAMPAIGN':
        return node.campaign_id
          ? EmailCampaignFormService.loadCampaign(node.campaign_id).then(
              campaignResp => {
                this.setState({
                  initialValuesForm: {
                    name: node.name,
                    campaign: campaignResp.campaign,
                    blastFields: campaignResp.blastFields,
                    routerFields: campaignResp.routerFields,
                  },
                });
              },
            )
          : this.setState({
              initialValuesForm: INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA,
            });
      case 'QUERY_INPUT':
        return node.query_id && !isFakeId(node.query_id) ?
          this._queryService.getQuery(datamartId, node.query_id).then(
            queryResp => {
              this.setState({
                initialValuesForm: {
                  name: node.name,
                  ...queryResp.data
                }
              })
            }
          ) : this.setState({ 
            initialValuesForm: {
              ...INITIAL_QUERY_DATA(datamartId),
              name: node.name
            } 
          })
      case 'ABN_NODE':
        return this.setState({
          initialValuesForm: {
            branch_number: node.branch_number,
            edges_selction: node.edges_selection,
            name: node.name ? node.name : 'Split',
          }
        });
      case 'WAIT_NODE':
        return node.formData ? this.setState({
          initialValuesForm: {
            timeout: node.timeout,
            name: node.name ? node.name : 'Wait'
          }
        }) : this.setState({
          initialValuesForm: {
            ...INITIAL_WAIT_DATA
          }
        })
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

  viewStats = () => {
    const { node, openNextDrawer, closeNextDrawer } = this.props;
    const { initialValuesForm } = this.state
    const selectedNode = node.storylineNodeModel.node;

    if (selectedNode.type === "DISPLAY_CAMPAIGN" && initialValuesForm) {
      const campaignValue = initialValuesForm as DisplayCampaignAutomationFormData;
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
    } else if (selectedNode.type === "EMAIL_CAMPAIGN" && initialValuesForm) {
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
    const { initialValuesForm } = this.state;
    this.setState({ focus: false }, () => {
      lockGlobalInteraction(true);
      if (
        isScenarioNodeShape(node.storylineNodeModel.node) &&
        initialValuesForm
      ) {
        const scenarioNodeShape = node.storylineNodeModel.node;
        let initialValue: any = initialValuesForm;
        let size: "small" | "large" = 'small';

        if ((scenarioNodeShape.type !== 'END_NODE' && scenarioNodeShape.type !== 'PLUGIN_NODE') && scenarioNodeShape.formData) {
          initialValue = scenarioNodeShape.formData
        }

        if (scenarioNodeShape.type === 'QUERY_INPUT') {
          initialValue.datamart_id = initialValue.datamart_id ? initialValue.datamart_id  : datamartId;
          size = "large"
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
              breadCrumbPaths: [{ name: node.storylineNodeModel.node.name }],
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

  renderAbnEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];

    if (!viewer) {
      content.push((
        <div onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))
      
      if (!node.isFirstNode) {
        content.push((
          <div onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
     
    }

    return content
  }

  renderCampaignEdit = (): React.ReactNodeArray => {
    const { viewer, node } = this.props;

    const content: React.ReactNodeArray = [];
    if (!viewer) {
      content.push((
        <div onClick={this.editNode} className="boolean-menu-item">
          <FormattedMessage {...messages.edit} />
        </div>
      ))

      if (!node.isFirstNode) {
        content.push((
          <div onClick={this.removeNode} className="boolean-menu-item">
            <FormattedMessage {...messages.remove} />
          </div>
        ))
      }
    } else {
      content.push((
        <div onClick={this.viewStats} className="boolean-menu-item">
          <FormattedMessage {...messages.stats} />
        </div>
      ))

      content.push((
        <div onClick={this.editNode} className="boolean-menu-item">
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

  renderWaitNodeEdit = (): React.ReactNodeArray => {
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

  rendePluginNodeEdit = (): React.ReactNodeArray => {
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
    switch(nodeType) {
      case 'ABN_NODE':
        return this.renderAbnEdit()
      case 'EMAIL_CAMPAIGN':
      case 'DISPLAY_CAMPAIGN':
        return this.renderCampaignEdit();
      case 'QUERY_INPUT':
        return this.renderQueryEdit();
      case 'END_NODE':
        return this.renderEndNodeEdit();
      case 'WAIT_NODE':
        return this.renderWaitNodeEdit();
      case 'PLUGIN_NODE':
        return this.rendePluginNodeEdit();
      default:
        return [];
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
        nodeName = node.storylineNodeModel.node.formData &&  node.storylineNodeModel.node.formData.campaign && node.storylineNodeModel.node.formData.campaign.name ? node.storylineNodeModel.node.formData.campaign.name : nodeName
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
      </div>
    );

    

    return (
      <div id={this.id} onClick={onClick}>
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
