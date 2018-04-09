import * as React from 'react';
import { Button, message } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import * as AudienceSegmentActions from '../../../../state/Audience/Segments/actions';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import ExportService from '../../../../services/ExportService';
import {
  getAudienceSegmentPerformance,
  getOverlapView,
} from '../../../../state/Audience/Segments/selectors';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';

import exportMessages from '../../../../common/messages/exportMessages';
import segmentMessages from './messages';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import AudienceLookalikeCreation, {
  AudienceLookalikeCreationProps,
} from './Lookalike/AudienceLookalikeCreation';
import { injectDrawer } from '../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { UserLookalikeSegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { SEGMENT_QUERY_SETTINGS } from './constants';

export interface AudienceSegmentActionbarProps {}

interface AudienceSegmentActionbarStoreProps {
  defaultDatamart: (organisationId: string) => DatamartResource;
  overlapView: any;
  segmentData: AudienceSegmentResource[];
  exportAudienceSegmentDashboard: (
    a: { segmentId: string; organisationId: string; datamartId: string },
    b: { export: () => void },
  ) => void;
  loadAudienceSegmentSingleDataSource: (
    segmentId: string,
    organisationId: string,
    filters: any,
  ) => void;
}

type Props = AudienceSegmentActionbarProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps &
  AudienceSegmentActionbarStoreProps &
  InjectedDrawerProps &
  InjectedDatamartProps;

interface State {
  overlapFetchIsRunning: boolean;
  overlap?: any;
  segment: {} | AudienceSegmentResource;
  exportIsRunning: boolean;
  showLookalikeModal: boolean;
}

class AudienceSegmentActionbar extends React.Component<Props, State> {
  state = {
    overlapFetchIsRunning: false,
    overlap: undefined,
    segment: {},
    exportIsRunning: false,
    showLookalikeModal: false,
  };

  hideExportLoadingMsg = () => {
    // init
  };

  componentDidMount() {
    const { match: { params: { segmentId } } } = this.props;

    if (segmentId) {
      this.fetchAudienceSegment(segmentId);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { match: { params: { segmentId } } } = this.props;

    const { match: { params: { segmentId: nextSegmentId } } } = nextProps;

    if (segmentId !== nextSegmentId) {
      this.fetchAudienceSegment(nextSegmentId);
    }
  }

  fetchAudienceSegment = (segmentId: string) => {
    return AudienceSegmentService.getSegment(segmentId)
      .then(response =>
        this.setState({
          segment: response.data,
        }),
      )
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  doExport = () => {
    const {
      match: { params: { organisationId } },
      location: { search },
      defaultDatamart,
      segmentData,
      overlapView,
      intl,
    } = this.props;

    const { segment } = this.state;

    const filter = parseSearch(search, undefined);
    this.setState({ exportIsRunning: false });
    if (this.hideExportLoadingMsg !== null && this.hideExportLoadingMsg) {
      this.hideExportLoadingMsg();
    }
    const datamartId = defaultDatamart(organisationId).id;
    const overlapData = overlapView ? overlapView.data : [];

    // Overlap job may still be pending. In which case we dont include it in the export.
    ExportService.exportAudienceSegmentDashboard(
      organisationId,
      datamartId,
      segmentData,
      overlapData,
      filter,
      intl.formatMessage,
      segment,
    );
  };

  handleRunExport = () => {
    const {
      match: { params: { organisationId, segmentId } },
      intl: { formatMessage },
      defaultDatamart,
      exportAudienceSegmentDashboard,
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;
    this.setState({ exportIsRunning: true });
    this.hideExportLoadingMsg = message.loading(
      formatMessage(exportMessages.exportInProgress),
      0,
    );
    exportAudienceSegmentDashboard(
      {
        segmentId: segmentId,
        organisationId: organisationId,
        datamartId: datamartId,
      },
      { export: this.doExport },
    );
  };

  render() {
    const {
      match: { params: { organisationId, segmentId } },
      intl: { formatMessage },
      datamart,
      loadAudienceSegmentSingleDataSource,
      location: { search },
    } = this.props;

    const { segment } = this.state;

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

    const editLink = `/v2/o/${organisationId}/audience/segments/${segmentId}/edit`;

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
          },
          isModal: true
        },
      );

    const onRecalibrateClick = () => {
      if (
        segment &&
        Object.keys(segment).length &&
        (segment as AudienceSegmentResource).id
      ) {
        AudienceSegmentService.recalibrateAudienceLookAlike(
          (segment as AudienceSegmentResource).id,
        ).then(res => {
          const filter = parseSearch(search, SEGMENT_QUERY_SETTINGS);
          loadAudienceSegmentSingleDataSource(
            segmentId,
            organisationId,
            filter,
          );
        });
      }
      return Promise.resolve();
    };
    let actionButton = (
      <Button className="mcs-primary" type="primary" onClick={onClick}>
        <McsIcon type="bolt" />
        <FormattedMessage {...segmentMessages.lookAlikeCreation} />
      </Button>
    );

    if (
      Object.keys(segment).length &&
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
        <Link key="2" to={editLink}>
          <Button>
            <McsIcon type="pen" />
            <FormattedMessage id="EDIT" />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  defaultDatamart: getDefaultDatamart(state),
  overlapView: getOverlapView(state),
  segmentData: getAudienceSegmentPerformance(state),
});

const mapDispatchToProps = {
  loadAudienceSegmentSingleDataSource:
    AudienceSegmentActions.loadAudienceSegmentSingleDataSource,
  createOverlapAnalysis:
    AudienceSegmentActions.createAudienceSegmentOverlap.request,
  exportAudienceSegmentDashboard:
    AudienceSegmentActions.exportAudienceSegmentDashboard.request,
};

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps, mapDispatchToProps),
  injectDrawer,
  injectDatamart,
)(AudienceSegmentActionbar);
