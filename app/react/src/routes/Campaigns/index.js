import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../../components/AuthenticatedComponent';
import { Campaigns, EditCampaign } from '../../containers/Campaigns';

export default (
  <div>
    <Route path="campaigns" component={requireAuthentication(Campaigns)} />
    <Route path="campaign/edit" component={requireAuthentication(EditCampaign)} />
  </div>
);
