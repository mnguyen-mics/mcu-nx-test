import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function Optimization() {

  return (
    <div id="optimization">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
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

export default Optimization;
