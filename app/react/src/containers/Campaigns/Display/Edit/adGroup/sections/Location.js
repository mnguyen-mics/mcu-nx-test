import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form/index.ts';
import messages from '../../messages';

function Location() {

  return (
    <div id="location">
      <FormSection
        subtitle={messages.sectionSubtitleLocation}
        title={messages.sectionTitleLocation}
      />

      <Row />
    </div>
  );
}

export default Location;
