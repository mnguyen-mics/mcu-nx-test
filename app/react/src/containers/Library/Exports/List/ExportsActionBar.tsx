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

class ExportsActionbar extends Component<RouteComponentProps<RouterProps> & InjectedIntlProps> {

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

    const breadcrumbPaths = [{ name: formatMessage(messages.exports), url: `/v2/o/${organisationId}/library/exports` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/o${organisationId}d${1}/library/exports/new`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage {...messages.newExport} />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
)(ExportsActionbar);
