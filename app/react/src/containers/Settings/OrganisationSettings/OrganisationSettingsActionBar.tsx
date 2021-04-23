import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, defineMessages, InjectedIntlProps } from 'react-intl';

import { Actionbar } from '@mediarithmics-private/mcs-components-library';

type Props = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class OrganisationSettingsActionBar extends React.Component<Props> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbMessages = defineMessages({
      settings: {
        id: 'settings.organisation.settings',
        defaultMessage: 'Organisation Settings',
      },
    });

    const breadcrumbPaths = [
      <Link key="1" to={`/v2/o/${organisationId}/settings/organisation&tab=labels`}>{formatMessage(breadcrumbMessages.settings)}</Link>
    ];
    return <Actionbar pathItems={breadcrumbPaths} />;
  }
}

export default compose(
  withRouter,
  injectIntl,
)(OrganisationSettingsActionBar);
