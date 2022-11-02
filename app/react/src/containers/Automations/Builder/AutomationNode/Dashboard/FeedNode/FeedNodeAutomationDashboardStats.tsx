import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import {
  Actionbar,
  McsIcon,
  Card,
  McsDateRangePicker,
} from '@mediarithmics-private/mcs-components-library';
import FeedChart from '../../../../../Audience/Segments/Dashboard/Feeds/Charts/FeedChart';
import McsMoment from '../../../../../../utils/McsMoment';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { DATE_SEARCH_SETTINGS, parseSearch } from '../../../../../../utils/LocationSearchHelper';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

export interface FeedNodeAutomationDashboardStatsProps {
  feedId: string;
  close: () => void;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  FeedNodeAutomationDashboardStatsProps;

type State = {
  dateRange: McsDateRangeValue;
};

class FeedNodeAutomationDashboardStats extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      location: { search },
    } = props;

    const filters = parseSearch(search, DATE_SEARCH_SETTINGS);

    this.state = {
      dateRange: {
        from: filters.from || new McsMoment('now-7d'),
        to: filters.to || new McsMoment('now'),
      },
    };
  }

  onDatePickerChange = (newValues: McsDateRangeValue) => {
    this.setState({
      dateRange: {
        from: newValues.from,
        to: newValues.to,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
      feedId,
    } = this.props;

    const { dateRange } = this.state;
    const McsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <div className='mcs-feedNodeAutomationDashboardStats ant-layout'>
        <Actionbar pathItems={[formatMessage(messages.actionbarName)]} edition={true}>
          <McsIcon
            type='close'
            className='close-icon'
            style={{ cursor: 'pointer' }}
            onClick={this.props.close}
          />
        </Actionbar>
        <div className='mcs-feedNodeAutomationDashboardStats_content ant-layout ant-layout-content mcs-content-container'>
          <div className='mcs-feedNodeAutomationDashboardStats_content_dateRangePicker'>
            <McsDateRangePicker
              values={this.state.dateRange}
              onChange={this.onDatePickerChange}
              messages={McsdatePickerMsg}
              className='mcs-datePicker_container'
            />
          </div>
          <Card>
            <FeedChart organisationId={organisationId} feedId={feedId} dateRange={dateRange} />
          </Card>
        </div>
      </div>
    );
  }
}

const messages = defineMessages({
  actionbarName: {
    id: 'automation.feedNode.dashboard.stats.actionbar.name',
    defaultMessage: 'Feed stats',
  },
});

export default compose<Props, FeedNodeAutomationDashboardStatsProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(FeedNodeAutomationDashboardStats);
