import * as React from 'react';
import { Button, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import ExportService from '../../../../services/ExportService';

import exportMessages from '../../../../common/messages/exportMessages';
import segmentMessages from './messages';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import AudienceLookalikeCreation, {
  AudienceLookalikeCreationProps,
} from './Lookalike/AudienceLookalikeCreation';
import { injectDrawer } from '../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { UserLookalikeSegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { SEGMENT_QUERY_SETTINGS, fetchOverlapAnalysis, OverlapData } from './constants';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';

export interface AudienceSegmentActionbarProps {
  segment: null | AudienceSegmentResource;
  isLoading: boolean;
  onCalibrationClick: () => void;
}

type Props = AudienceSegmentActionbarProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedDrawerProps &
  InjectedDatamartProps;

interface State {
  overlapFetchIsRunning: boolean;
  overlap?: any;
  exportIsRunning: boolean;
  showLookalikeModal: boolean;
}

class AudienceSegmentActionbar extends React.Component<Props, State> {
  state = {
    overlapFetchIsRunning: false,
    overlap: undefined,
    exportIsRunning: false,
    showLookalikeModal: false,
  };

  hideExportLoadingMsg = () => {
    // init
  };


  fetchExportData = (organisationId: string, segmentId: string, from: McsMoment, to: McsMoment) => {
    const fetchCounters = this.fetchCounterView(organisationId, [{ name: 'audience_segment_id', value: segmentId }])
    const fetchDashboard = this.fetchDashboardView(organisationId, from, to, [{ name: 'audience_segment_id', value: segmentId }])
    const overlapData = fetchOverlapAnalysis(segmentId).then(res => this.formatOverlapData(res))

    return Promise.all([fetchCounters, fetchDashboard, overlapData])
  }

  formatOverlapData = (data: OverlapData) => {
    return data.data ? data.data.formattedOverlap.map(d => ({
      xKey: d!.segment_intersect_with.name,
      yKey: d!.segment_intersect_with.segment_size === 0 ? 0 : (d!.overlap_number / d!.segment_intersect_with.segment_size) * 100,
      segment_intersect_with: d!.segment_intersect_with.id
    })) : []
  }

  fetchCounterView = (organisationId: string, filters: Filter[]) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids'],
      filters,
    ).then(res => normalizeReportView(res.data.report_view))

  }

  fetchDashboardView = (organisationId: string, from: McsMoment, to: McsMoment, filters: Filter[]) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      from,
      to,
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids', 'user_point_additions', 'user_point_deletions'],
      filters,
    ).then(res => normalizeReportView(res.data.report_view))

  }

  handleRunExport = () => {
    const {
      match: { params: { organisationId, segmentId } },
      location: { search },
      intl: { formatMessage },
      segment,
    } = this.props;
    const filters = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      formatMessage(exportMessages.exportInProgress),
      0,
    );

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
        );
      }).then(() => {
        hideExportLoadingMsg()
        this.setState({ exportIsRunning: false });
      })
      .catch((err) => {
        hideExportLoadingMsg()
        message.error('There was an error generating your export please try again.', 5)
        this.setState({ exportIsRunning: false });
      })
  };


  onEditClick = () => {

    const {
      match: { params: { organisationId, segmentId } },
      location,
      history
    } = this.props;
    const editUrl = `/v2/o/${organisationId}/audience/segments/${segmentId}/edit`;
    history.push({ pathname: editUrl, state: { from: `${location.pathname}${location.search}` } });
  }

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
      datamart,
      segment,
      onCalibrationClick
    } = this.props;



    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [
      {
        key: formatMessage(segmentMessages.audienceSegment),
        name: formatMessage(segmentMessages.audienceSegment),
        url: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        key: segment ? (segment as AudienceSegmentResource).name : '',
        name: segment ? (segment as AudienceSegmentResource).name : '',
      },
    ];

    const onClick = () =>
      this.props.openNextDrawer<AudienceLookalikeCreationProps>(
        AudienceLookalikeCreation,
        {
          additionalProps: {
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
              extension_factor: 30,
              datamart_id: datamart.id,
              organisation_id: organisationId,
            },
          }
        },
      );

    const onRecalibrateClick = () => onCalibrationClick()

    // const onRecalibrateClick = () => {
    //   if (
    //     segment &&
    //     Object.keys(segment).length &&
    //     (segment as AudienceSegmentResource).id
    //   ) {
    //     AudienceSegmentService.recalibrateAudienceLookAlike(
    //       (segment as AudienceSegmentResource).id,
    //     ).then(res => {
    //       const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);
    //       loadAudienceSegmentSingleDataSource(
    //         segmentId,
    //         organisationId,
    //         filter,
    //       );
    //     });
    //   }
    //   return Promise.resolve();
    // };

    let actionButton = (
      <Button className="mcs-primary" type="primary" onClick={onClick}>
        <McsIcon type="bolt" />
        <FormattedMessage {...segmentMessages.lookAlikeCreation} />
      </Button>
    );

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

    return (
      <Actionbar path={breadcrumbPaths}>
        {actionButton}
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          <McsIcon type="download" />
          <FormattedMessage id="EXPORT" />
        </Button>
        <Button onClick={this.onEditClick}>
          <McsIcon type="pen" />
          <FormattedMessage id="EDIT" />
        </Button>
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
)(AudienceSegmentActionbar);
