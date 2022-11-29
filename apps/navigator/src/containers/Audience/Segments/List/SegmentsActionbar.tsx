import * as React from 'react';
import { Button, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, WrappedComponentProps, defineMessages, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import ExportService from '../../../../services/ExportService';
import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { Index } from '../../../../utils';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { UserActivationSegment } from '../../../../models/audiencesegment';
import { PermanentFilters } from './PermanentFilters';

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
    defaultMessage: 'Export stats',
  },
  clearFilters: {
    id: 'audiencesegment.actionbar.clearFilters',
    defaultMessage: 'Clear filters',
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
  userActivationClickers: {
    id: 'segment.dashboard.useractivation.clickers',
    defaultMessage: '{audienceSegmentName} - Clickers',
  },
  userActivationExposed: {
    id: 'segment.dashboard.useractivation.exposed',
    defaultMessage: '{audienceSegmentName} - Exposed',
  },
});

type Props = RouteComponentProps<{ organisationId: string }> &
  WrappedComponentProps &
  InjectedDatamartProps &
  InjectedNotificationProps;

interface State {
  exportIsRunning: boolean;
}

class SegmentsActionbar extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: Props) {
    super(props);
    this.state = { exportIsRunning: false };
  }

  getSearchSetting = () => {
    return [...SEGMENTS_SEARCH_SETTINGS];
  };

  formatUserActivationSegmentName = (record: UserActivationSegment): string => {
    const { intl } = this.props;

    if (record.clickers) {
      return intl.formatMessage(messages.userActivationClickers, {
        audienceSegmentName: record.name,
      });
    } else if (record.exposed) {
      return intl.formatMessage(messages.userActivationExposed, {
        audienceSegmentName: record.name,
      });
    } else {
      // Not supposed to happen
      return record.name;
    }
  };

  fetchExportData = (organisationId: string, datamartId: string, filter: Index<any>) => {
    const buildOptions = () => {
      const options: Index<any> = {
        first_result: 0,
        max_results: 5000,
      };

      if (filter.keywords) {
        options.keywords = filter.keywords;
      }
      if (datamartId) {
        options.datamart_id = datamartId;
      }
      if (filter.type && filter.type.length > 0) {
        options.type = filter.type;
      }
      if (filter.label_id && filter.label_id.length) {
        options.label_id = filter.label_id;
      }
      if (filter.orderBy && filter.orderBy.length) {
        options.order_by = filter.orderBy;
      }

      return options;
    };

    return this._audienceSegmentService
      .getSegments(organisationId, buildOptions())
      .then(response => {
        const result = response.data;

        return result.map(res => {
          const name =
            res.type === 'USER_ACTIVATION' ? this.formatUserActivationSegmentName(res) : res.name;
          return { ...res, name };
        });
      })
      .catch(e => {
        this.props.notifyError(e);
      });
  };

  handleRunExport = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const filter = parseSearch(this.props.location.search, this.getSearchSetting());

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(formatMessage(messages.exportRunning), 0);

    const datamartId = filter.datamartId ? filter.datamartId : undefined;

    this.fetchExportData(organisationId, datamartId, filter)
      .then(data => {
        ExportService.exportAudienceSegments(
          organisationId,
          datamartId,
          data,
          filter,
          formatMessage,
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

  clearFilters = () => {
    const permanentFilter = new PermanentFilters(this.props.datamart.organisation_id);
    permanentFilter.clear();
    this.props.history.push(this.props.location.pathname);
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
      <Link key='1' to={`/v2/o/${organisationId}/audience/segments`}>
        {intl.formatMessage(messages.audienceSegment)}
      </Link>,
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Link
          to={{
            pathname: `/v2/o/${organisationId}/audience/segments/create`,
          }}
        >
          <Button
            className='mcs-primary mcs-segmentsActionBar_createNewSemgmentButton'
            type='primary'
          >
            <McsIcon type='plus' /> <FormattedMessage {...messages.newSegment} />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type='download' />}
          <FormattedMessage {...messages.export} />
        </Button>
        <Button onClick={this.clearFilters}>
          {!exportIsRunning && <McsIcon type='refresh' />}
          <FormattedMessage {...messages.clearFilters} />
        </Button>
      </Actionbar>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDatamart,
  injectNotifications,
)(SegmentsActionbar);
