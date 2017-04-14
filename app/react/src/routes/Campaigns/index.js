import React from 'react';
import Route from 'react-router/lib/Route';

import { Campaigns, CampaignsDisplay } from '../../containers/Campaigns';

export default (
  <div>
    <Route path="campaigns" component={Campaigns} >
      <Route path="display" component={CampaignsDisplay} />
    </Route>
  </div>
);
