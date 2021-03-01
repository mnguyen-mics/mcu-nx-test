import * as React from 'react';
import { Button, message, Dropdown, Menu } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import ExportService from '../../../../services/ExportService';
import exportMessages from '../../../../common/messages/exportMessages';
import segmentMessages, { formatAudienceSegmentProperty } from './messages';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import AudienceLookalikeCreation, {
  AudienceLookalikeCreationProps,
} from './Lookalike/AudienceLookalikeCreation';
import { injectDrawer } from '../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import {
  UserLookalikeSegment,
  UserListSegment,
  AudienceSegmentShape,
  UserQuerySegment,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { SEGMENT_QUERY_SETTINGS, OverlapData } from './constants';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { IOverlapInterval } from './OverlapServices';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import AudienceExperimentationEditPage, {
  AudienceExperimentationEditPageProps,
} from './Experimentation/AudienceExperimentationEditPage';
import { isUserQuerySegment } from '../Edit/domain';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import resourceHistoryMessages from '../../../ResourceHistory/ResourceTimeline/messages';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface AudienceSegmentActionbarProps {
  segment?: AudienceSegmentShape;
  isLoading: boolean;
  onCalibrationClick: () => void;
  datamarts: DatamartWithMetricResource[];
  controlGroupSegment?: UserQuerySegment;
}

type Props = AudienceSegmentActionbarProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedDrawerProps &
  InjectedFeaturesProps &
  InjectedDatamartProps;

interface State {
  overlapFetchIsRunning: boolean;
  overlap?: any;
  exportIsRunning: boolean;
  showLookalikeModal: boolean;
  datamarts: DatamartWithMetricResource[];
}

class AudienceSegmentActionbar extends React.Component<Props, State> {
  state = {
    overlapFetchIsRunning: false,
    overlap: undefined,
    exportIsRunning: false,
    showLookalikeModal: false,
    datamarts: [],
  };
  @lazyInject(TYPES.IOverlapInterval)
  private _overlapInterval: IOverlapInterval;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: AudienceSegmentService;

  hideExportLoadingMsg = () => {
    // init
  };

  fetchExportData = (
    organisationId: string,
    segmentId: string,
    from: McsMoment,
    to: McsMoment,
  ) => {
    const fetchCounters = this.fetchCounterView(organisationId, [
      { name: 'audience_segment_id', value: segmentId },
    ]);
    const fetchDashboard = this.fetchDashboardView(organisationId, from, to, [
      { name: 'audience_segment_id', value: segmentId },
    ]);
    const overlapData = this._overlapInterval
      .fetchOverlapAnalysis(segmentId)
      .then(res => this.formatOverlapData(res));

    return Promise.all([fetchCounters, fetchDashboard, overlapData]);
  };

  formatOverlapData = (data: OverlapData) => {
    return data.data
      ? data.data.formattedOverlap.map(d => ({
          xKey: d!.segment_intersect_with.name,
          yKey:
            d!.segment_intersect_with.segment_size === 0
              ? 0
              : (d!.overlap_number / d!.segment_source_size) * 100,
          segment_intersect_with: d!.segment_intersect_with.id,
        }))
      : [];
  };

  fetchCounterView = (organisationId: string, filters: Filter[]) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids'],
      filters,
    ).then(res => normalizeReportView(res.data.report_view));
  };

  fetchDashboardView = (
    organisationId: string,
    from: McsMoment,
    to: McsMoment,
    filters: Filter[],
  ) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      from,
      to,
      ['day'],
      [
        'user_points',
        'user_accounts',
        'emails',
        'desktop_cookie_ids',
        'user_point_additions',
        'user_point_deletions',
      ],
      filters,
    ).then(res => normalizeReportView(res.data.report_view));
  };

  handleRunExport = () => {
    const {
      match: {
        params: { organisationId, segmentId },
      },
      location: { search },
      intl: { formatMessage },
      segment,
      datamarts,
    } = this.props;
    const filters = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      formatMessage(exportMessages.exportInProgress),
      0,
    );

    const datamartId = segment && segment.datamart_id;
    const datamart = datamarts.find(dm => dm.id === datamartId);

    const additionalMetrics =
      datamart && datamart.audience_segment_metrics
        ? datamart.audience_segment_metrics.filter(
            metric => metric.status === 'LIVE',
          )
        : undefined;

    this.fetchExportData(organisationId, segmentId, filters.from, filters.to)
      .then(res => {
        return ExportService.exportAudienceSegmentDashboard(
          organisationId,
          segment && segment.datamart_id,
          res[1],
          res[2],
          filters,
          formatMessage,
          segment,
          additionalMetrics,
        );
      })
      .then(() => {
        hideExportLoadingMsg();
        this.setState({ exportIsRunning: false });
      })
      .catch(err => {
        hideExportLoadingMsg();
        message.error(
          'There was an error generating your export please try again.',
          5,
        );
        this.setState({ exportIsRunning: false });
      });
  };

  onEditClick = () => {
    const {
      match: {
        params: { organisationId, segmentId },
      },
      location,
      history,
    } = this.props;
    const editUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  handleCreateNewFeed = () => {
    const {
      match: {
        params: { organisationId, segmentId },
      },
      location,
      history,
    } = this.props;
    const editUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}/feeds/create`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  onCreateExperimentationClick = () => {
    const {
      segment,
      intl: { formatMessage },
      openNextDrawer,
    } = this.props;

    openNextDrawer<AudienceExperimentationEditPageProps>(
      AudienceExperimentationEditPage,
      {
        additionalProps: {
          close: this.props.closeNextDrawer,
          breadCrumbPaths: [
            {
              name: (segment as AudienceSegmentResource).name || '',
            },
            {
              name: formatMessage(segmentMessages.experimentationCreation),
            },
          ],
          segment: segment as UserQuerySegment,
        },
      },
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      segment,
      onCalibrationClick,
      hasFeature,
      controlGroupSegment,
      history,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const datamartId = segment && segment.datamart_id;

    const breadcrumbPaths = [
      {
        key: formatMessage(segmentMessages.audienceSegment),
        name: formatMessage(segmentMessages.audienceSegment),
        path: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        key: segment ? (segment as AudienceSegmentResource).name : '',
        name: segment ? (segment as AudienceSegmentResource).name : '',
      },
    ];

    const onClick = () => {
      if (!datamartId) return;

      this.props.openNextDrawer<AudienceLookalikeCreationProps>(
        AudienceLookalikeCreation,
        {
          additionalProps: {
            datamartId: datamartId,
            close: this.props.closeNextDrawer,
            breadCrumbPaths: [
              {
                name: (segment as AudienceSegmentResource).name || '',
              },
              {
                name: formatMessage(segmentMessages.lookAlikeCreation),
              },
            ],
            initialValues: {
              source_segment_id: (segment as AudienceSegmentResource).id,
              persisted: true,
              type: 'USER_LOOKALIKE',
              lookalike_algorithm: 'CLUSTER_OVERLAP',
              extension_factor: 1,
              datamart_id: datamartId,
              organisation_id: organisationId,
            },
          },
        },
      );
    };

    const onRecalibrateClick = () => onCalibrationClick();

    let actionButton = null;

    if (
      segment &&
      (segment as AudienceSegmentResource).type === 'USER_LOOKALIKE'
    ) {
      switch ((segment as UserLookalikeSegment).status) {
        case 'DRAFT':
          actionButton = (
            <Button
              className="mcs-primary"
              type="primary"
              onClick={onRecalibrateClick}
            >
              <McsIcon type="bolt" />
              <FormattedMessage
                {...segmentMessages.lookAlikeCalibrationExecution}
              />
            </Button>
          );
          break;
        case 'CALIBRATING':
          actionButton = (
            <Button className="mcs-primary" type="primary" disabled={true}>
              <McsIcon type="bolt" />
              <FormattedMessage
                {...segmentMessages.lookAlikeCalibrationRunning}
              />
            </Button>
          );
          break;
        case 'CALIBRATION_ERROR':
          actionButton = (
            <Button
              className="mcs-primary"
              type="primary"
              onClick={onRecalibrateClick}
            >
              <McsIcon type="bolt" />
              <FormattedMessage
                {...segmentMessages.lookAlikeCalibrationErrorSuccess}
              />
            </Button>
          );
          break;
        case 'CALIBRATED':
          actionButton = (
            <Button
              className="mcs-primary"
              type="primary"
              onClick={onRecalibrateClick}
            >
              <McsIcon type="bolt" />
              <FormattedMessage
                {...segmentMessages.lookAlikeCalibrationErrorSuccess}
              />
            </Button>
          );
          break;
      }
    }

    const onMenuClick = (event: any) => {
      switch (event.key) {
        case 'LOOKALIKE':
          return onClick();
        case 'EXPERIMENTATION':
          return (
            segment &&
            isUserQuerySegment(segment) &&
            this.onCreateExperimentationClick()
          );
        case 'CONTROL_GROUP_SEGMENT':
          return (
            controlGroupSegment &&
            history.push(
              `/v2/o/${organisationId}/audience/segments/${controlGroupSegment.id}`,
            )
          );
        case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(
            ResourceTimelinePage,
            {
              additionalProps: {
                resourceType: 'AUDIENCE_SEGMENT',
                resourceId: (segment as AudienceSegmentResource).id,
                handleClose: () => this.props.closeNextDrawer(),
                formatProperty: formatAudienceSegmentProperty,
                resourceLinkHelper: {
                  AUDIENCE_SEGMENT: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.segmentResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this._audienceSegmentService
                        .getSegment(id)
                        .then(response => {
                          return response.data.name || id;
                        });
                    },
                    goToResource: (id: string) => {
                      history.push(
                        `/v2/o/${organisationId}/audience/segments/${id}`,
                      );
                    },
                  },
                },
              },
              size: 'small',
            },
          );
        default:
          return () => ({});
      }
    };

    const dropdowMenu = (
      <Menu onClick={onMenuClick}>
        <Menu.Item key="HISTORY">
          <FormattedMessage {...segmentMessages.history} />
        </Menu.Item>
        <Menu.Item key="LOOKALIKE">
          <FormattedMessage {...segmentMessages.lookAlikeCreation} />
        </Menu.Item>
        {segment &&
          segment.type === 'USER_QUERY' &&
          hasFeature('audience-segment_uplift') &&
          segment.subtype === 'STANDARD' && (
            <Menu.Item key="EXPERIMENTATION">
              <FormattedMessage {...segmentMessages.experimentationCreation} />
            </Menu.Item>
          )}
        {controlGroupSegment && (
          <Menu.Item key="CONTROL_GROUP_SEGMENT">
            <FormattedMessage {...segmentMessages.seeToControlGroupDashboard} />
          </Menu.Item>
        )}
      </Menu>
    );

    const renderDotsMenu = () => {
      return (
        segment &&
        (segment as UserListSegment).subtype !== 'USER_CLIENT' &&
        (segment as UserListSegment).subtype !== 'EDGE' && (
          <Dropdown overlay={dropdowMenu} trigger={['click']}>
            <Button>
              <McsIcon className="compact" type={'dots'} />
            </Button>
          </Dropdown>
        )
      );
    };

    return (
      <Actionbar paths={breadcrumbPaths}>
        {actionButton}
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.handleCreateNewFeed}
        >
          <McsIcon type="bolt" />
          <FormattedMessage
            id="audience.segments.dashboard.actionbar.feedButton"
            defaultMessage="Add a Feed"
          />
        </Button>
        <Button onClick={this.onEditClick}>
          <McsIcon type="pen" />
          <FormattedMessage
            id="audience.segments.dashboard.actionbar.editButton"
            defaultMessage="Edit"
          />
        </Button>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          <McsIcon type="download" />
          <FormattedMessage
            id="audience.segments.dashboard.actionbar.exportButton"
            defaultMessage="Export stats"
          />
        </Button>
        {renderDotsMenu()}
      </Actionbar>
    );
  }
}

export default compose<Props, AudienceSegmentActionbarProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectDrawer,
  injectDatamart,
  injectFeatures,
)(AudienceSegmentActionbar);
