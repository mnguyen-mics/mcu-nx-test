import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { Link } from 'react-router-dom';

class CatalogActionBar extends React.Component<
  RouteComponentProps<{ organisationId: string }> & InjectedIntlProps,
  any
> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/library/catalog`}>{formatMessage(messages.catalog)}</Link>
    ];

    return <Actionbar pathItems={breadcrumbPaths} />;
  }
}

export default compose(injectIntl, withRouter)(CatalogActionBar);
