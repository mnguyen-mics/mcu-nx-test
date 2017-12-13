import React, { Component } from 'react';
import { Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import messages from './messages';

interface RouterProps {
  organisationId: string;
}

class VisitAnalyzerActionBar extends Component<RouteComponentProps<RouterProps> & InjectedIntlProps> {

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: {
        formatMessage,
      },
    } = this.props;

    const breadcrumbPaths = [{ name: formatMessage(messages.visitAnalyzer), url: `/v2/o/${organisationId}/library/visit_analyzers` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/library/visit_analyzers/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage {...messages.newVisitAnalyzer} />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
)(VisitAnalyzerActionBar);
