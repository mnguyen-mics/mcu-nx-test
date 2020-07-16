import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import Actionbar from '../../../components/ActionBar';
import { RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import messages from './messages';

type JoinedProps = RouteComponentProps<any> & InjectedIntlProps;

class OverviewActionBar extends Component<JoinedProps> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.overview),
        path: `/v2/o/${organisationId}/analytics/overview`,
      },
    ];

    return <Actionbar paths={breadcrumbPaths} />;
  }
}

export default compose(injectIntl, withRouter)(OverviewActionBar);
