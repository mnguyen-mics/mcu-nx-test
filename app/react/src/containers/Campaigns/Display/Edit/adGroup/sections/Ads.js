import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function Ads() {

  return (
    <div id="ads">
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
        subtitle={messages.sectionSubtitle7}
        title={messages.sectionTitle7}
      />
      <Row />
    </div>
  );
}

export default Ads;
