import React from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { Row } from 'antd';

import FormSection from '../../../../../../components/Partials/FormSection';
import { FormInput } from '../../../../../../components/Form';
import messages from '../../messages';

function General({
  intl: { formatMessage },
}) {

  const fieldGridConfig = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10, offset: 1 }
  };

  return (
    <div id="general">
      <FormSection
        subtitle={messages.sectionSubtitle1}
        title={messages.sectionTitle1}
      />

      <Row>
        <FormInput
          input={{
            name: 'NameId',
          }}
          meta={{
            error: 'No error',
          }}
          formItemProps={{
            label: formatMessage(messages.contentSection1.row1.label),
            required: true,
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1.row1.placeholder)
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1.row1.tooltip)
          }}
        />
      </Row>
    </div>
  );
}

General.propTypes = {
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
)(General);
