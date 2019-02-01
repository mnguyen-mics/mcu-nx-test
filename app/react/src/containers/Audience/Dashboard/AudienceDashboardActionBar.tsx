import * as React from 'react';
import Actionbar from '../../../components/ActionBar';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';

export interface AudienceDashboardActionBarProps {}

type Props = AudienceDashboardActionBarProps & InjectedIntlProps;

const messages = defineMessages({
  dashboardTitle: {
    id: 'audience.dashboard.title',
    defaultMessage: 'Dashboard',
  },
  refreshButton: {
    id: 'audience.dashboard.refresh',
    defaultMessage: 'Refresh Dashboard',
  },
});

class AudienceDashboardActionBar extends React.Component<Props, any> {
  public render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.dashboardTitle),
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        {/* <Button type="primary" className="mcs-primary" ><FormattedMessage {...messages.refreshButton} /></Button> */}
      </Actionbar>
    );
  }
}

export default compose<Props, AudienceDashboardActionBarProps>(injectIntl)(
  AudienceDashboardActionBar,
);
