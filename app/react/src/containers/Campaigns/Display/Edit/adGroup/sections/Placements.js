import React, { Component } from 'react';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components/index.ts';
import RelatedRecordTable from '../../../../../RelatedRecordTable.tsx';
import PlacementListServices from '../../../../../../services/Library/PlacementListsService.ts';

import messages from '../../messages';

const { FormSection } = Form;

class Placements extends Component {

  state = { loading: false }

  getPlacementLists = ({ getAll }) => () => {
    const { organisationId } = this.props;
    const options = { getAll };

    return PlacementListServices.getPlacementLists(organisationId, options);
  }

  getSelectedIds = () => {
    return this.props.formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.placement_list_id);
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
      actionBarTitle: 'Add a Placement List',
      columnsDefinitions,
      close: handlers.closeNextDrawer,
      fetchSelectorData: this.getPlacementLists({ getAll: true }),
      save: this.updateData,
      singleSelection: false,
      selectedIds: this.getSelectedIds(),
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (newSelectedIds) => {
    const { handlers } = this.props;

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    Promise.all(newSelectedIds.map(item => PlacementListServices.getPlacementList(item)))
      .then(results => {
        return results.map(placementList => {
          const alreadyExistingElement = this.props.formValues.find(elem => elem.placement_list_id === placementList.data.id);
          return !alreadyExistingElement ? {
            ...placementList.data,
            modelId: placementList.data.id,
            include: !placementList.data.exclude,
            placement_list_id: placementList.data.id,
          } : alreadyExistingElement;
        });
      })
      .then(results => {
        return results.reduce((acc, value) => {
          return value ? [...acc, value] : [...acc];
        }, []);
      })
      .then(results => {
        handlers.updateTableFields({ newFields: results, tableName: 'placementTable' });
        this.setState({ loading: false });
      });

  }

  render() {
    const { formValues, formatMessage, handlers } = this.props;
    const dataSource = formValues.reduce((tableData, placementList, index) => {
      return (!placementList.toBeRemoved
      ? [
        ...tableData,
        {
          key: placementList.modelId,
          type: { image: 'question', name: placementList.provider },
          info: [placementList.name],
          toBeRemoved: index,
          include: { bool: placementList.include, index },
        }
      ]
      : tableData
      );
    }, []);

    return (
      <div id="placement">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          title={messages.sectionTitlePlacement}
          subtitle={messages.sectionSubtitlePlacement}
        />

        <FieldArray
          component={RelatedRecordTable}
          dataSource={dataSource}
          loading={this.state.loading}
          name="placementTable"
          tableName="placementTable"
          updateTableFieldStatus={handlers.updateTableFieldStatus}
        />

        {!dataSource.length
          ? <EmptyRecords
            iconType="placement"
            message={formatMessage(messages.contentSectionOptimizerEmptyTitle)}
          />
          : null
        }
      </div>
    );
  }
}

Placements.defaultProps = {
  formValues: [],
};

Placements.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired
};

export default Placements;
