import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import Actionbar from '../../../components/ActionBar';
import messages from './messages';

export interface CatalogActionBarProps {}

class CatalogActionBar extends React.Component<
  CatalogActionBarProps &
    RouteComponentProps<{ organisationId: string }> &
    InjectedIntlProps,
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
      {
        name: formatMessage(messages.catalog),
        url: `/v2/o/${organisationId}/library/catalog`,
      },
    ];

    return <Actionbar paths={breadcrumbPaths} />;
  }
}

export default compose(
  injectIntl,
  withRouter,
)(CatalogActionBar);
