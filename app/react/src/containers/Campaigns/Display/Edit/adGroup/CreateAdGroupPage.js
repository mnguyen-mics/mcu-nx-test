import React from 'react';

import AdGroupContent from './AdGroupContent';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';


function CreateAdGroupPage() {
  return <AdGroupContent />;
}

CreateAdGroupPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
};

export default CreateAdGroupPage;
