import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components/index.ts';
import RelatedRecordTable from '../../../../../RelatedRecordTable.tsx';
import BidOptimizerServices from '../../../../../../services/BidOptimizerServices';

import messages from '../../messages';

const { FormSection } = Form;

class Optimization extends Component {

  state = { loading: false }

  getBidOptimizers = () => () => {
    let bidList = [];
    return BidOptimizerServices.getAllBidOptimizers(this.props.organisationId)
      .then(res => res.data)
      .then(res => {
        bidList = res;
        return Promise.all(res.map(item => {
          return BidOptimizerServices.getBidOptimizerProperties(item.id).then(response => response.data).then(response => response.length && {
            type: (response.find(elem => elem.technical_name === 'name')).value.value,
            provider: (response.find(elem => elem.technical_name === 'provider')).value.value,
          });
        }));
      })
      .then(results => {
        return {
          status: 'ok',
          data: bidList.map((bo, i) => {
            return {
              ...bo,
              ...results[i]
            };
          })
        };
      });
  }

  getSelectedIds = () => {
    return this.props.formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);
  }

  openWindow = () => {
    const { handlers } = this.props;

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleType,
        key: 'type',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleProvider,
        key: 'provider',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
    ];

    const additionalProps = {
      actionBarTitle: 'Add a Bid Optimizer',
      columnsDefinitions,
      close: handlers.closeNextDrawer,
      fetchSelectorData: this.getBidOptimizers(),
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
    if (newSelectedIds.length) {
      BidOptimizerServices.getBidOptimizer(newSelectedIds[0])
        .then(res => res.data)
        .then(res => {
          return BidOptimizerServices.getBidOptimizerProperties(newSelectedIds[0]).then(response => response.data).then(response => response.length && {
            ...res,
            type: (response.find(elem => elem.technical_name === 'name')).value.value,
            provider: (response.find(elem => elem.technical_name === 'provider')).value.value,
          });
        }).then(result => {
          const newFields = [result];
          handlers.updateTableFields({ newFields, tableName: 'optimizerTable' });
          this.setState({ loading: false });
        });
    } else {
      handlers.updateTableFields({ newFields: [], tableName: 'optimizerTable' });
      this.setState({ loading: false });
    }


  }

  render() {
    const { formValues, formatMessage, handlers } = this.props;
    const dataSource = formValues.reduce((tableData, bidOptimizer, index) => {
      return (!bidOptimizer.toBeRemoved
      ? [
        ...tableData,
        {
          key: bidOptimizer.modelId,
          type: { image: 'optimization' },
          info: [bidOptimizer.name, `${bidOptimizer.type} - ${bidOptimizer.provider}`],
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
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleOptimizer}
          title={messages.sectionTitleOptimizer}
        />

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
            iconType="optimization"
            message={formatMessage(messages.contentSectionOptimizerEmptyTitle)}
          />
          : null
        }
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
