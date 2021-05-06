import * as React from 'react';
import ServiceItemListPage from '../../ServiceItem/ServiceItemListPage';

class SubscribedOfferServiceItemListPage extends React.Component<{}> {
  render() {
    const offerOwnership = 'subscribed_offer';

    return <ServiceItemListPage offerOwnership={offerOwnership} />;
  }
}

export default SubscribedOfferServiceItemListPage;
