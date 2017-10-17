import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components/index.ts';
import RelatedRecordTable from '../../../../../RelatedRecordTable.tsx';
import BidOptimizerServices from '../../../../../../services/BidOptimizerServices';

import messages from '../../messages';

const { FormSection } = Form;

class Optimization extends Component {

  state = { loading: false }

  getBidOptimizers = ({ getAll, newSelectedIds }) => () => {
    const selectedIds = newSelectedIds || this.getSelectedIds();
    const options = { getAll };

    return BidOptimizerServices.getBidOptimizers(this.props.organisationId, selectedIds, options);
  }

  getSelectedIds = () => {
    return this.props.formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);
  }

  openWindow = () => {
    const { handlers } = this.props;

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
      actionBarTitle: 'Add a Bid Optimizer',
      columnsDefinitions,
      close: handlers.closeNextDrawer,
      fetchSelectorData: this.getBidOptimizers({ getAll: true }),
      save: this.updateData,
      singleSelection: true,
      selectedIds: this.getSelectedIds(),
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (newSelectedIds) => {
    const { handlers } = this.props;

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    this.getBidOptimizers({ newSelectedIds })()
      .then(({ data }) => {
        const newFields = data.reduce((acc, optimizer) => {
          return (newSelectedIds.includes(optimizer.id)
            ? [...acc, optimizer]
            : acc
          );
        }, []);

        handlers.updateTableFields({ newFields, tableName: 'optimizerTable' });
        this.setState({ loading: false });
      });
  }

  render() {
    const { formValues, formatMessage, handlers } = this.props;
    const dataSource = formValues.reduce((tableData, bidOptimizer, index) => {
      return (!bidOptimizer.toBeRemoved
      ? [
        ...tableData,
        {
          key: bidOptimizer.modelId,
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
          subtitle={messages.sectionSubtitleOptimizer}
          title={messages.sectionTitleOptimizer}
        />

        <Row>
          <FieldArray
            component={RelatedRecordTable}
            dataSource={dataSource}
            loading={this.state.loading}
            name="optimizerTable"
            tableName="optimizerTable"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!dataSource.length
          ? <EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSectionOptimizerEmptyTitle)}
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
