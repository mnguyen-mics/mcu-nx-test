import * as React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';

function Device() {

  return (
    <div id="device">
      <FormSection
        subtitle={messages.sectionSubtitle3}
        title={messages.sectionTitle3}
      />
      <Row />
    </div>
  );
}

export default Device;

