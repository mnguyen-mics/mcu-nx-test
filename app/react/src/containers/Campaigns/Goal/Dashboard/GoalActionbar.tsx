import * as React from 'react';
import lodash from 'lodash';
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Menu, Modal, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { GoalResource } from '../../../../models/goal/index';
import modalMessages from '../../../../common/messages/modalMessages';
import { Actionbar, McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import log from '../../../../utils/Logger';
import messages from './messages';
import ReportService from '../../../../services/ReportService';
import ExportService from '../../../../services/ExportService';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { GOAL_SEARCH_SETTINGS } from './constants';
import { Index } from '../../../../utils';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { injectDrawer } from '../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import resourceHistoryMessages from '../../../ResourceHistory/ResourceTimeline/messages';
import { formatGoalProperty } from '../../Goal/messages';
import { lazyInject } from '../../../../config/inversify.config';
import { IDisplayCampaignService } from '../../../../services/DisplayCampaignService';
import { TYPES } from '../../../../constants/types';
import { IResourceHistoryService } from '../../../../services/ResourceHistoryService';
import { IGoalService } from '../../../../services/GoalService';
import { Link } from 'react-router-dom';

const { Dropdown } = PopupContainer;

interface ExportActionbarProps {
  goal?: GoalResource;
  fetchGoal: (id: string) => any;
}

interface ExportActionbarState {
  exportIsRunning: boolean;
}

type JoinedProps = ExportActionbarProps &
  RouteComponentProps<{ organisationId: string; goalId: string }> &
  InjectedIntlProps &
  InjectedDrawerProps &
  InjectedNotificationProps;

const reportTypeExportOptions = [
  {
    reportType: 'SOURCE',
    dimensions: ['marketing_channel', 'source', 'interaction_type'],
  },
  {
    reportType: 'CAMPAIGN',
    dimensions: ['campaign_id', 'campaign_name', 'interaction_type'],
  },
  {
    reportType: 'CREATIVE',
    dimensions: ['creative_id', 'creative_name', 'interaction_type'],
  },
];

class ExportsActionbar extends React.Component<JoinedProps, ExportActionbarState> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: JoinedProps) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false,
    };
  }

  fetchExportData = (organisationId: string, goalId: string, filter: Index<any>) => {
    const startDate = filter.from;
    const endDate = filter.to;

    const conversionPerformancePromise = ReportService.getConversionPerformanceReport(
      organisationId,
      startDate,
      endDate,
      ['day'],
      ['value', 'price', 'conversions'],
      [{ name: 'goal_id', value: goalId }],
    );

    const attributionPerformancePromises = this._goalService
      .getAttributionModels(goalId)
      .then(response => {
        const promises = lodash.flatMap(response.data, attributionSelectionResource => {
          return reportTypeExportOptions.map(reportTypeOptions => {
            return ReportService.getConversionAttributionPerformance(
              organisationId,
              startDate,
              endDate,
              [],
              reportTypeOptions.dimensions,
              ['weighted_conversions', 'weighted_value', 'interaction_to_conversion_duration'],
              [
                { name: 'goal_id', value: goalId },
                {
                  name: 'attribution_model_id',
                  value: attributionSelectionResource.id,
                },
              ],
            ).then(result => ({
              ...result,
              attribution_model_id: attributionSelectionResource.attribution_model_id,
              attribution_model_name: attributionSelectionResource.attribution_model_name,
              report_type: reportTypeOptions.reportType,
            }));
          });
        });

        return Promise.all(promises);
      });

    return conversionPerformancePromise.then(conversionPerformanceResult => {
      return attributionPerformancePromises.then(attributionPerformanceResult => {
        return {
          goalData: normalizeReportView(conversionPerformanceResult.data.report_view),
          attributionsData: attributionPerformanceResult.map(attribution => ({
            attribution_model_id: attribution.attribution_model_id,
            attribution_model_name: attribution.attribution_model_name,
            report_type: attribution.report_type,
            normalized_report_view: normalizeReportView(attribution.data.report_view),
          })),
        };
      });
    });
  };

  handleRunExport() {
    const {
      goal,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    if (!goal) return;

    const filter = parseSearch(this.props.location.search, GOAL_SEARCH_SETTINGS);

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(intl.formatMessage(messages.exportInProgress), 0);

    this.fetchExportData(organisationId, goal.id, filter)
      .then(exportData => {
        ExportService.exportGoal(
          organisationId,
          exportData.goalData,
          exportData.attributionsData,
          filter,
          intl.formatMessage,
        );
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      })
      .catch(() => {
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      });
  }

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, goalId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/goals/${goalId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  changeCampaignStatus = () => {
    const { fetchGoal, goal, notifyError } = this.props;
    if (goal) {
      const promise =
        goal.status === 'ACTIVE'
          ? this._goalService.updateGoal(goal.id, { status: 'PAUSED' })
          : this._goalService.updateGoal(goal.id, { status: 'ACTIVE' });
      return promise
        .then(res => {
          return fetchGoal(goal.id);
        })
        .catch(err => {
          return notifyError(err);
        });
    }
    return;
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      goal,
      intl,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/goals`}>
        {intl.formatMessage(messages.goals)}
      </Link>,
      goal && goal.name ? goal.name : '',
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        {goal && (
          <Button type='primary' className='mcs-primary' onClick={this.changeCampaignStatus}>
            {goal.status === 'ACTIVE' ? (
              <div>
                <McsIcon type='pause' />
                <FormattedMessage {...messages.pause} />
              </div>
            ) : (
              <div>
                <McsIcon type='play' />
                <FormattedMessage {...messages.activate} />
              </div>
            )}
          </Button>
        )}

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type='download' />}
          <FormattedMessage id='goal.dashboard.actionbar.export' defaultMessage='Export' />
        </Button>

        <Button onClick={this.editCampaign}>
          <McsIcon type='pen' />
          <FormattedMessage {...messages.edit} />
        </Button>

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }

  buildMenu = () => {
    const {
      goal,
      history,
      notifyError,
      match: {
        params: { organisationId, goalId },
      },
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      if (goal) {
        const updateGoal = () => {
          return this._goalService.updateGoal(goal.id, {
            ...goal,
            archived: true,
          });
        };
        Modal.confirm({
          title: formatMessage(messages.archiveGoalModalTitle),
          content: formatMessage(messages.archiveGoalModalBody),
          icon: <ExclamationCircleOutlined />,
          okText: formatMessage(modalMessages.confirm),
          cancelText: formatMessage(modalMessages.cancel),
          onOk() {
            return updateGoal()
              .then(() => {
                const editUrl = `/v2/o/${organisationId}/campaigns/goals`;
                history.push({
                  pathname: editUrl,
                  state: { from: `${location.pathname}${location.search}` },
                });
              })
              .catch(err => {
                notifyError(err);
              });
          },
        });
      }
    };

    const onClick = (event: any) => {
      if (goal)
        switch (event.key) {
          case 'ARCHIVED':
            return handleArchiveGoal(goal.id);
          case 'HISTORY':
            return this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
              additionalProps: {
                resourceType: 'GOAL',
                resourceId: goalId,
                handleClose: () => this.props.closeNextDrawer(),
                formatProperty: formatGoalProperty,
                resourceLinkHelper: {
                  GOAL_SELECTION: {
                    direction: 'PARENT',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.displayCampaignResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this._resourceHistoryService
                        .getLinkedResourceIdInSelection(
                          organisationId,
                          'GOAL_SELECTION',
                          id,
                          'CAMPAIGN',
                        )
                        .then(campaignId => {
                          return this._displayCampaignService
                            .getCampaignName(campaignId)
                            .then(response => {
                              return response;
                            });
                        });
                    },
                    goToResource: (id: string) => {
                      this._resourceHistoryService
                        .getLinkedResourceIdInSelection(
                          organisationId,
                          'GOAL_SELECTION',
                          id,
                          'CAMPAIGN',
                        )
                        .then(campaignId => {
                          history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}`);
                        });
                    },
                  },
                },
              },
              size: 'small',
            });
          default:
            return () => {
              log.error('onclick error');
            };
        }
    };

    return (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='HISTORY'>
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        <Menu.Item key='ARCHIVED'>
          <FormattedMessage {...messages.archive} />
        </Menu.Item>
      </Menu>
    );
  };
}

export default compose<JoinedProps, ExportActionbarProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectDrawer,
)(ExportsActionbar);
