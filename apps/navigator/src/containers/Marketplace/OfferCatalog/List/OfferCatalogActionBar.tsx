import * as React from 'react';
import { compose } from 'recompose';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps, Link } from 'react-router-dom';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import messages from './messages';

interface OfferCatalogActionbarProps {
  organisationId: string;
}

type JoinedProps = OfferCatalogActionbarProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }>;

class OfferCatalogActionBar extends React.Component<JoinedProps> {
  constructor(props: JoinedProps) {
    super(props);
  }

  render() {
    const { organisationId, intl } = this.props;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/marketplace/offercatalog`}>
        {intl.formatMessage(messages.offerCatalogTitle)}
      </Link>,
    ];

    return <Actionbar pathItems={breadcrumbPaths} />;
  }
}

export default compose<JoinedProps, OfferCatalogActionbarProps>(injectIntl)(OfferCatalogActionBar);
