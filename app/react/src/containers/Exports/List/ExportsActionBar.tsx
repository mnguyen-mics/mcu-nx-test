import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { InjectedDatamartProps, injectDatamart } from '../../Datamart';

interface RouterProps {
  organisationId: string;
}

class ExportsActionbar extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedDatamartProps
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
        name: formatMessage(messages.exports),
        path: `/v2/o/${organisationId}/datastudio/exports`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/datastudio/exports/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage {...messages.newExport} />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectDatamart,
)(ExportsActionbar);
