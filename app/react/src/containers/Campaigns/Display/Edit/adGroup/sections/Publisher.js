import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

const { FormSection } = Form;

function Publisher({ formValues, formatMessage, handlers }) {

  const dataSource = formValues.reduce((tableData, publisher, index) => {
    return (!publisher.toBeRemoved
      ? [
        ...tableData,
        {
          key: publisher.id,
          type: { image: 'question', name: publisher.display_network_name },
          info: [],
          toBeRemoved: index,
        }
      ]
      : tableData
    );
  }, []);

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

      <Row>
        <AdGroupTable
          dataSource={dataSource}
          tableName="publisherTable"
          updateTableFieldStatus={handlers.updateTableFieldStatus}
        />

        {!dataSource.length
          ? <EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSection2EmptyTitle)}
          />
          : null
        }
      </Row>
    </div>
  );
}

Publisher.defaultProps = {
  formValues: [],
};

Publisher.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,
};

export default Publisher;
