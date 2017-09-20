import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import BidOptimizerServices from '../../../../../../services/BidOptimizerServices';

import messages from '../../messages';

const { FormSection } = Form;

class Optimization extends Component {

  getBidOptimizers = (getAll) => () => {
    console.log('this.props = ', this.props);
    const { formValues, organisationId } = this.props;
    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);

    return BidOptimizerServices.getBidOptimizers({
      getAll,
      organisationId,
      selectedIds,
    });

  }

  openWindow = () => {
    const { formValues, handlers } = this.props;
    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleProvider,
        key: 'provider',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
    ];

    const additionalProps = {
      formName: 'optimizerTable',
      columnsDefinitions,
      close: handlers.closeNextDrawer,
      fetchSelectorData: this.getBidOptimizers(true),
      save: this.updateData,
      singleSelection: true,
      selectedIds,
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (selectedSegmentIds) => {
    const { handlers } = this.props;

    handlers.closeNextDrawer();

    this.getBidOptimizers()()
      .then((optimizers) => {
        const newFields = optimizers.reduce((acc, optimizer) => {
          return (selectedSegmentIds.includes(optimizer.id)
            ? [...acc, optimizer]
            : acc
          );
        }, []);

        handlers.updateTableFields({ newFields, tableName: 'optimizerTable' });
      });
  }

  render() {
    const { formValues, formatMessage, handlers } = this.props;
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
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle6}
          title={messages.sectionTitle6}
        />

        <Row>
          <AdGroupTable
            dataSource={dataSource}
            tableName="optimizerTable"
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
}

Optimization.defaultProps = {
  formValues: [],
};

Optimization.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired
};

export default Optimization;
