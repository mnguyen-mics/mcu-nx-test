import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, defineMessages, InjectedIntlProps } from 'react-intl';

import { Actionbar } from '@mediarithmics-private/mcs-components-library';

type Props = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class SettingsActionBar extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbMessages = defineMessages({
      settings: {
        id: 'settings.datamart.settings',
        defaultMessage: 'Datamart Settings',
      },
    });

    const breadcrumbPaths = [
      {
        name: formatMessage(breadcrumbMessages.settings),
        url: {
          pathname: `/v2/o/${organisationId}/settings`,
          search: '&tab=sites',
        },
      },
    ];
    return <Actionbar paths={breadcrumbPaths} />;
  }
}

export default compose(
  withRouter,
  injectIntl,
)(SettingsActionBar);
