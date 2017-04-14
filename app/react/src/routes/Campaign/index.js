import React from 'react';
import Route from 'react-router/lib/Route';

import { EditCampaign } from '../../containers/Campaigns';

export default (
  <div>
    <Route path="campaign/edit" component={EditCampaign} />
  </div>
);
