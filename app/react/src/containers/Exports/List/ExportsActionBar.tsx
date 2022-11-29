import * as React from 'react';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button } from 'antd';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { InjectedDatamartProps, injectDatamart } from '../../Datamart';

interface RouterProps {
  organisationId: string;
}

class ExportsActionbar extends React.Component<
  RouteComponentProps<RouterProps> & WrappedComponentProps & InjectedDatamartProps
> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/datastudio/exports`}>
        {formatMessage(messages.exports)}
      </Link>,
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/datastudio/exports/create`}>
          <Button className='mcs-primary mcs-exports_creationButton' type='primary'>
            <McsIcon type='plus' /> <FormattedMessage {...messages.newExport} />
          </Button>
        </Link>
      </Actionbar>
    );
  }
}

export default compose(injectIntl, withRouter, injectDatamart)(ExportsActionbar);
