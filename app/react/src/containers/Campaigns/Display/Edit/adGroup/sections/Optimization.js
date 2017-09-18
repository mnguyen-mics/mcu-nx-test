import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import messages from '../../messages';

const { FormSection } = Form;

function Optimization({ formValues, formatMessage, handlers }) {

  const dataSource = formValues.reduce((tableData, bidOptimizer, index) => {
    return (!bidOptimizer.toBeRemoved
      ? [
        ...tableData,
        {
          key: bidOptimizer.id,
          type: { image: 'question', name: bidOptimizer.provider },
          info: [bidOptimizer.name],
          toBeRemoved: index,
        }
      ]
      : tableData
    );
  }, []);

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

      <Row>
        <AdGroupTable
          dataSource={dataSource}
          tableName="bidOptimizerTable"
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

Optimization.defaultProps = {
  formValues: [],
};

Optimization.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,
};

export default Optimization;
