import * as React from 'react';
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

class VisitAnalyzerActionBar extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps> {

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

    const breadcrumbPaths = [{ name: formatMessage(messages.recommender), url: `/v2/o/${organisationId}/library/recommenders` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/library/recommenders/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage {...messages.newRecommender} />
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
