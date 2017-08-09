import React from 'react';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import messages from '../../messages';

function Publisher() {

  return (
    <div id="publisher">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle4}
        title={messages.sectionTitle4}
      />
      <Row />
    </div>
  );
}

export default Publisher;
