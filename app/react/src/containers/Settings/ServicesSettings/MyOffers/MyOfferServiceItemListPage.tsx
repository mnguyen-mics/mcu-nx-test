import * as React from 'react';
import ServiceItemListPage from '../ServiceItem/ServiceItemListPage';

class MyOfferServiceItemListPage extends React.Component<{}> {
  render() {
    const offerOwnership = 'my_offer';

    return <ServiceItemListPage offerOwnership={offerOwnership} />;
  }
}

export default MyOfferServiceItemListPage;
