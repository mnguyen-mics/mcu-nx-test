import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function Location() {

  return (
    <div id="location">
      <FormSection
        subtitle={messages.sectionSubtitle4}
        title={messages.sectionTitle4}
      />
      <Row />
    </div>
  );
}

export default Location;
