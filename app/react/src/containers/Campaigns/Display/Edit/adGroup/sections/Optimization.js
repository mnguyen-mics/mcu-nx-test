import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import BidOptimizerServices from '../../../../../../services/BidOptimizerServices';

import messages from '../../messages';

const { FormSection } = Form;

class Optimization extends Component {

  state = { loading: false }

  getBidOptimizers = ({ getAll, newSelectedIds }) => () => {
    const prevSelectedIds = this.getSelectedIds();

    return BidOptimizerServices.getBidOptimizers({
      getAll,
      organisationId: this.props.organisationId,
      selectedIds: newSelectedIds || prevSelectedIds,
    });

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
      .then((optimizers) => {
        const newFields = optimizers.reduce((acc, optimizer) => {
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
          <FieldArray
            component={AdGroupTable}
            dataSource={dataSource}
            loading={this.state.loading}
            name="optimizerTable"
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
