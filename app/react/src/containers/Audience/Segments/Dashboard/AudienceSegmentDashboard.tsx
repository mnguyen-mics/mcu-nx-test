import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';

import { Card } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { EditAudienceSegmentParam } from '../Edit/domain';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserListImportCard from './UserListImportCard';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import AudienceCounters from './AudienceCounters';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';

interface State {
  audienceSegment?: AudienceSegmentShape;
  loading: boolean;
}

interface MapStateToProps {
  segment: {
    report_view: Array<{
      day: string;
      user_points: number;
      user_accounts: number;
      emails: number;
      desktop_cookie_ids: number;
    }>;
  };
  isFetching: boolean;
}

type Props = MapStateToProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceSegmentDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {

    this.setState({ loading: true });
    
    const { match: { params: { segmentId } } } = this.props;

    if (segmentId) {
      AudienceSegmentService.getSegment(segmentId)
        .then(res => {
          this.setState({
            audienceSegment: res.data,
            loading:false,
          });
        })
        .catch(err => {
          this.props.notifyError(err);
          this.setState({ loading: false });
        });
    }
  }

  render() {
    
    const { segment, intl, isFetching } = this.props;

    const getLoadingValue = (
      key: 'user_points' | 'user_accounts' | 'emails' | 'desktop_cookie_ids',
    ) => {
      const value =
        segment &&
        segment.report_view &&
        segment.report_view[0] &&
        segment.report_view[0][key];
      return {
        value,
        loading: isFetching,
      };
    };
    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: <Overview />,
      },
      {
        title: intl.formatMessage(messages.additionDeletion),
        display: <AdditionDeletion />,
      },
      {
        title: intl.formatMessage(messages.overlap),
        display: <Overlap />,
      },
    ];
    if (this.state.audienceSegment !== undefined) {
      if (this.state.audienceSegment.type === 'USER_LIST') {
        items.push({
          title: intl.formatMessage(messages.imports),
          display: (
            <UserListImportCard
              datamartId={this.state.audienceSegment.datamart_id}
            />
          ),
        });
      }
    }

    return (
      <div>
        <AudienceCounters
          userPoints={getLoadingValue('user_points')}
          userAccounts={getLoadingValue('user_accounts')}
          userAgents={getLoadingValue('desktop_cookie_ids')}
          userEmails={getLoadingValue('emails')}
        />
        <Card>
          <McsTabs items={items} />
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  segment:
    state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
  isFetching: state.audienceSegmentsTable.audienceSegmentsSingleApi.isFeching,
});

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps),
)(AudienceSegmentDashboard);

const messages = defineMessages({
  overview: {
    id: 'audience-segment-dashboard-tab-title-overview',
    defaultMessage: 'Overview',
  },
  additionDeletion: {
    id: 'audience-segment-dashboard-tab-title-addition-deletion',
    defaultMessage: 'Addition Deletion',
  },
  overlap: {
    id: 'audience-segment-dashboard-tab-title-overlap',
    defaultMessage: 'Overlap',
  },
  imports: {
    id: 'audience-segment-dashboard-tab-title-user-list-imports',
    defaultMessage: 'Imports Status',
  },
});
