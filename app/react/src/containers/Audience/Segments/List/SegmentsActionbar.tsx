import * as React from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';

import ExportService from '../../../../services/ExportService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { Index } from '../../../../utils';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import McsMoment from '../../../../utils/McsMoment';


const messages = defineMessages({
  exportRunning: {
    id: 'audiencesegment.actionbar.exportRunning',
    defaultMessage: 'Export in progress...',
  },
  audienceSegment: {
    id: 'audiencesegment.actionbar.audienceSegment',
    defaultMessage: 'Segments',
  },
  newSegment: {
    id: 'audiencesegment.actionbar.newSegment',
    defaultMessage: 'New Segment',
  },
  export: {
    id: 'audiencesegment.actionbar.export',
    defaultMessage: 'Export',
  },
  userQuery: {
    id: 'audiencesegment.actionbar.userQuery',
    defaultMessage: 'User Query',
  },
  userPixel: {
    id: 'audiencesegment.actionbar.userPixel',
    defaultMessage: 'User Pixel',
  },
  userList: {
    id: 'audiencesegment.actionbar.userList',
    defaultMessage: 'User List',
  },
});

const fetchExportData = (
  organisationId: string,
  datamartId: string,
  filter: Index<any>,
) => {
  const buildOptions = () => {
    const options: Index<any> = {
      first_result: 0,
      max_results: 2000,
    };

    if (filter.keywords) {
      options.name = filter.keywords;
    }
    if (datamartId) {
      options.datamart_id = datamartId;
    }
    if (filter.type && filter.type.length > 0) {
      options.type = filter.type;
    }
    return options;
  };

  const startDate = new McsMoment('now');
  const endDate = new McsMoment('now');
  const dimension = ['audience_segment_id'];

  const apiResults = Promise.all([
    AudienceSegmentService.getSegments(organisationId, buildOptions()),
    ReportService.getAudienceSegmentReport(
      organisationId,
      startDate,
      endDate,
      dimension,
    ),
  ]);

  return apiResults.then(results => {
    const audienceSegments = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'audience_segment_id',
    );

    const mergedData = Object.keys(audienceSegments).map(segmentId => {
      return {
        ...audienceSegments[segmentId],
        ...performanceReport[segmentId],
      };
    });

    return mergedData;
  });
};

interface MapStateToProps {
  translations: any;
}

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps &
  MapStateToProps &
  InjectedNotificationProps;

interface State {
  exportIsRunning: boolean;
}

class SegmentsActionbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { exportIsRunning: false };
  }

  getSearchSetting = () => {
    return [...SEGMENTS_SEARCH_SETTINGS];
  };

  handleRunExport = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
      translations,
      notifyError,
    } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      this.getSearchSetting(),
    );

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      intl.formatMessage(messages.exportRunning),
      0,
    );

    const datamartId = filter.datamartId ? filter.datamartId : undefined;

    fetchExportData(organisationId, datamartId, filter)
      .then(data => {
        ExportService.exportAudienceSegments(
          organisationId,
          datamartId,
          data,
          filter,
          translations,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(err => {
        // TODO notify error
        notifyError(err);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      // datamart,
      intl,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.audienceSegment),
        url: `/v2/o/${organisationId}/audience/segments`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={{
          pathname: `/v2/o/${organisationId}/audience/segments/create`,
        }}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage {...messages.newSegment} />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage {...messages.export} />
        </Button>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  injectNotifications,
  connect(mapStateToProps),
)(SegmentsActionbar);
