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

class AssetsActionbar extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps> {

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

    const breadcrumbPaths = [{ name: formatMessage(messages.assets), url: `/v2/o/${organisationId}/library/assets` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/library/keywordslists/new`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage {...messages.newAsset} />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
)(AssetsActionbar);
