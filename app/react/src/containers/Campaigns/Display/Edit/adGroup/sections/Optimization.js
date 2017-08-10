import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
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
        subtitle={messages.sectionSubtitle6}
        title={messages.sectionTitle6}
      />
      <Row />
    </div>
  );
}

export default Optimization;
