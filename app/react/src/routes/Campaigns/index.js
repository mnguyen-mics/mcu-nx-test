import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../../components/AuthenticatedComponent';
import { Campaigns, CampaignsDisplay } from '../../containers/Campaigns';

export default (
  <Route path="campaigns" component={requireAuthentication(Campaigns)}>
    <Route path="display" component={CampaignsDisplay} />
  </Route>
);
