import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';

function Audience() {

  return (
    <div id="audience">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownNew.id,
            message: messages.dropdownNew,
            onClick: () => {},
          },
          {
            id: messages.dropdownAddExisting.id,
            message: messages.dropdownAddExisting,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle2}
        title={messages.sectionTitle2}
      />
      <Row />
    </div>
  );
}

export default Audience;
