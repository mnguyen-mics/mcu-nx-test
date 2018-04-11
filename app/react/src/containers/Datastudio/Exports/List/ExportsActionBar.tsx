import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import messages from './messages';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';

interface RouterProps {
  organisationId: string;
}

class ExportsActionbar extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedDatamartProps> {

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

    const breadcrumbPaths = [{ name: formatMessage(messages.exports), url: `/v2/o/${organisationId}/datastudio/exports` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        {/* to uncomment when the export creation page is created in v2 */}
        {/* <Link to={`/o${organisationId}d${datamart.id}/datastudio/exports/new`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage {...messages.newExport} />
          </Button>
        </Link> */}
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
  injectDatamart,
)(ExportsActionbar);
