import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../../components/AuthenticatedComponent';
import { Campaigns, CampaignsDisplay, EditCampaign } from '../../containers/Campaigns';

export default (
  <div>
    <Route path="campaigns" component={requireAuthentication(Campaigns)} />
    <Route path="campaign/edit" component={requireAuthentication(EditCampaign)} />
    <Route path="display" component={CampaignsDisplay} />
  </div>
);
