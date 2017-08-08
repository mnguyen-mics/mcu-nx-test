import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function General() {

  return (
    <div id="general">
      <FormSection
        subtitle={messages.sectionSubtitle1}
        title={messages.sectionTitle1}
      />
      <Row />
    </div>
  );
}

export default General;
