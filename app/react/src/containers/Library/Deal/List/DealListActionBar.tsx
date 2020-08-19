import * as React from 'react';
import { Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import McsIcon from '../../../../components/McsIcon';
import messages from './messages';

interface RouterProps {
  organisationId: string;
}

class DealListActionbar extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps
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
        name: formatMessage(messages.dealList),
        path: `/v2/o/${organisationId}/library/deallist`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/library/deallist/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage {...messages.newDealList} />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(DealListActionbar);
