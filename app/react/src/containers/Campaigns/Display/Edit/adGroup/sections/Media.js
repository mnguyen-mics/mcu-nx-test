import React from 'react';
import { Row } from 'antd';

import { FormSection } from '../../../../../../components/Form';
import messages from '../../messages';

function Media() {

  return (
    <div id="media">
      <FormSection
        dropdownItems={[
          {
            id: messages.dropdownAdd.id,
            message: messages.dropdownAdd,
            onClick: () => {},
          },
        ]}
        subtitle={messages.sectionSubtitle5}
        title={messages.sectionTitle5}
      />
      <Row />
    </div>
  );
}

export default Media;
