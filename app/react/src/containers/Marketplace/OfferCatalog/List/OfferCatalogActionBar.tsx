import * as React from 'react';
import { compose } from 'recompose';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';
import { Link } from 'react-router-dom';

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
      <Link key='1' to={`/v2/o/${organisationId}/marketplace/offercatalog`}>
        {intl.formatMessage(messages.offerCatalogTitle)}
      </Link>
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths} />
    );
  }
}

export default compose<JoinedProps, OfferCatalogActionbarProps>(
  injectIntl,
)(OfferCatalogActionBar);
