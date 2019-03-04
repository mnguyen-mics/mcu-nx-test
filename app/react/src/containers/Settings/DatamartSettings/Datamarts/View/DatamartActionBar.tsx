import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Actionbar } from '../../../../Actionbar';
import { McsIcon } from '../../../../../components';
import { Button } from 'antd';
import messages from './messages';

type Props = RouteComponentProps<{ organisationId: string; datamartId: string }> &
  InjectedIntlProps;

class DatamartActionBar extends React.Component<Props> {

  onEditClick = () => {
    const {
      match: {
        params: {
          organisationId,
          datamartId,
        },
      },
      history,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/settings/datamart/my_datamart/${datamartId}/edit`;

    history.push({
      pathname: editUrl,
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
      {
        name: formatMessage(messages.datamart),
        url: `/v2/o/${organisationId}/settings/datamart/my_datamart`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Button onClick={this.onEditClick}>
          <McsIcon type="pen" />
          <FormattedMessage {...messages.edit} />
        </Button>
      </Actionbar>
    )
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
)(DatamartActionBar);