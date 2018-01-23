import * as React from 'react';
import { Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import messages from './messages';

interface RouterProps {
  organisationId: string;
}

class AttributionModelActionBar extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps> {

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

    const breadcrumbPaths = [{ name: formatMessage(messages.attributionmodel), url: `/v2/o/${organisationId}/library/assets` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/library/attribution_models/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage {...messages.newAttributionModel} />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
)(AttributionModelActionBar);
