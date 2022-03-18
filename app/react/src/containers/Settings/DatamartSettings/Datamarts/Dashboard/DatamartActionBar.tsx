import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Button } from 'antd';
import messages from './messages';
import { Link } from 'react-router-dom';

type Props = RouteComponentProps<{ organisationId: string; datamartId: string }> &
  InjectedIntlProps;

class DatamartActionBar extends React.Component<Props> {
  onEditClick = () => {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      history,
      location: { pathname, search },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}/edit`;

    history.push({
      pathname: editUrl,
      state: {
        from: `${pathname}${search}`,
      },
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/datamarts`}>
        {formatMessage(messages.datamart)}
      </Link>,
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Button onClick={this.onEditClick} type='primary' className={'mcs-primary'}>
          <McsIcon type='pen' />
          <FormattedMessage {...messages.edit} />
        </Button>
      </Actionbar>
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl)(DatamartActionBar);
