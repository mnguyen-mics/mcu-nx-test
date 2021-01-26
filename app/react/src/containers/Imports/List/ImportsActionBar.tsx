import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import {
  Actionbar,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { InjectedDatamartProps, injectDatamart } from '../../Datamart';

interface RouterProps {
  organisationId: string;
}

class ImportsActionbar extends React.Component<
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
        name: formatMessage(messages.imports),
        path: `/v2/o/${organisationId}/datastudio/imports`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/datastudio/imports/create`}>
          <Button className="mcs-primary mcs-imports_creationButton" type="primary">
            <McsIcon type="plus" /> <FormattedMessage {...messages.newImport} />
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
)(ImportsActionbar);
