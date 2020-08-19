import * as React from 'react';
import { compose } from 'recompose';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';

interface OfferCatalogActionbarProps {
  organisationId: string;
}

type JoinedProps = OfferCatalogActionbarProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class OfferCatalogActionBar extends React.Component<JoinedProps> {
  constructor(props: JoinedProps) {
    super(props);
  }

  render() {

    const { 
      organisationId, 
      intl 
    } = this.props;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.offerCatalogTitle),
        path: `/v2/o/${organisationId}/marketplace/offercatalog`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths} />
    );
  }
}

export default compose<JoinedProps, OfferCatalogActionbarProps>(
  injectIntl,
)(OfferCatalogActionBar);
