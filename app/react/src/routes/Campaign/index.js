import React from 'react';
import Route from 'react-router/lib/Route';

import {
  Campaigns as Campaign,
  EditCampaign
} from '../../containers/Campaigns';

import {
  CampaignEmail
} from '../../containers/Campaign';


export default (
  <div>
    <Route path="campaign" component={Campaign} >
      <Route path="email" >
        <Route path=":campaignId" component={CampaignEmail} />
      </Route>
    </Route>
  </div>
);
