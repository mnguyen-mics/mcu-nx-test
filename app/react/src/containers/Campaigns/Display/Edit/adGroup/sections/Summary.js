import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function Summary() {

  return (
    <div id="summary">
      <FormSection
        subtitle={messages.sectionSubtitle8}
        title={messages.sectionTitle8}
      />
      <Row />
    </div>
  );
}

export default Summary;
