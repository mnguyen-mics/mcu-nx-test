import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form/index.ts';
import messages from '../../messages';

function DeviceAndLocation() {

  return (
    <div id="deviceAndLocation">
      <FormSection
        subtitle={messages.sectionSubtitle3}
        title={messages.sectionTitle3}
      />

      <Row />
    </div>
  );
}

export default DeviceAndLocation;
