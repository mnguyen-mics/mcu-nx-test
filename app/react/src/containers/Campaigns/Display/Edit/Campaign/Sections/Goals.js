import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components/index.ts';
import messages from '../messages';
import GoalService from '../../../../../../services/GoalService';
import { getPaginatedApiParam } from '../../../../../../utils/ApiHelper';
import { GoalsTable } from '../Tables';
import GoalContent from '../Goal/GoalContent';
import * as SessionHelpers from '../../../../../../state/Session/selectors';

const { FormSection } = Form;

class Goals extends Component {

  state = { loading: false }

  getOrgGoals = (filterOptions) => {
    const { organisationId } = this.props;
    const { currentPage, keywords, pageSize } = filterOptions;
    const params = { ...getPaginatedApiParam(currentPage, pageSize) };

    if (keywords) {
      params.keywords = keywords;
    }

    return GoalService.getGoals(organisationId, params);
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;
    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => { return elem.main_id ? elem.main_id : elem.id; });

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
    ];

    const additionalProps = {
      close: handlers.closeNextDrawer,
      columnsDefinitions,
      displayFiltering: true,
      fetchSelectorData: this.getOrgGoals,
      save: this.updateData,
      selectedIds,
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  openNewWindow = () => {
    const { handlers } = this.props;
    const additionalProps = {
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      close: handlers.closeNextDrawer,
      save: this.createNewData,
    };

    const options = {
      additionalProps,
      isModal: true
    };

    handlers.openNextDrawer(GoalContent, options);
  }

  createNewData = (object) => {
    const { formValues, handlers } = this.props;
    const valuesToAdd = [
      ...formValues.filter(item => {
        return !item.toBeRemoved;
      }),
      object
    ];

    this.setState({ loading: true }, () => {
      handlers.updateTableFields({ newFields: valuesToAdd, tableName: 'goalsTable' });
    });
    this.setState({ loading: false });
    this.props.handlers.closeNextDrawer();
  }

  updateNewData = (object) => {
    const {
      formValues,
      handlers
    } = this.props;
    const newValues = formValues.map((item) => {
      return item.id === object.id ? object : item;
    });
    this.setState({ loading: true }, () => {
      handlers.updateTableFields({ newFields: newValues, tableName: 'goalsTable' });
      this.setState({ loading: false });
      this.props.handlers.closeNextDrawer();
    });

  }


  updateData = (selectedIds) => {
    const { formValues, handlers } = this.props;

    // Don't fetch goals that are in creation
    const filteredIds = selectedIds.filter(id => {
      const value = formValues.find(item => { return item.id === id; });
      return value && value.toBeRemoved !== true ? !value.toBeCreated : true;
    });

    // Replace Already Saved Goals as Goal Selection by their Goal Id

    const fetchSelectedGoald = Promise.all(filteredIds.map(goalId => {
      return GoalService.getGoal(goalId);
    }));

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    Promise.all([fetchSelectedGoald])
      .then(results => {
        const goals = results[0];
        return goals.map(goal => {
          return { ...goal.data };
        });
      })
      .then(newFields => {
        let storedData = formValues.filter(value => {
          return selectedIds.includes(value.id) && value.toBeCreated;
        });
        if (storedData.length === 0) {
          storedData = [storedData];
        }
        const newFieldsUpdated = newFields.concat(storedData);
        const sortedNewField = selectedIds.map(id => {
          return newFieldsUpdated.find(item => item.id === id);
        });
        handlers.updateTableFields({ newFields: sortedNewField, tableName: 'goalsTable' });
        this.setState({ loading: false });
      });
  }

  handleClickOnGoal = (goalValue) => {
    const {
      handlers,
      formValues
    } = this.props;

    const initialGoal = formValues.find(item => {
      return item.id === goalValue.key;
    });

    const goalEditorProps = {
      initialValues: initialGoal,
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      close: handlers.closeNextDrawer,
      save: this.updateNewData,
    };

    const options = {
      additionalProps: goalEditorProps,
      isModal: true,
    };

    handlers.openNextDrawer(GoalContent, options);
  }

  render() {
    const { formatMessage, formValues, handlers, defaultDatamart, organisationId, hasDatamarts, createUniqueGoal } = this.props;
    const dataSource = formValues.reduce((tableData, goal, index) => {
      return (!goal.toBeRemoved
        ? [
          ...tableData,
          {
            key: goal.id,
            type: { image: 'goals', name: goal.name ? goal.name : goal.goal_name },
            default: { bool: goal.default, index },
            toBeRemoved: index,
            toBeCreated: goal.toBeCreated
          }
        ]
        : tableData
      );
    }, []);
    return (
      <div id="goals">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openNewWindow,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle2}
          title={messages.sectionTitle2}
        />

        <div>
          <FieldArray
            component={GoalsTable}
            dataSource={dataSource}
            loading={this.state.loading}
            name="goalsTable"
            tableName="goalsTable"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
            openEditionMode={this.handleClickOnGoal}
            defaultDatamart={defaultDatamart}
            organisationId={organisationId}
            hasDatamarts={hasDatamarts}
            createUniqueGoal={createUniqueGoal}
          />

          {!dataSource.length
            ? <EmptyRecords
              iconType="goals"
              message={formatMessage(messages.contentSection2EmptyTitle)}
            />
            : null
          }
        </div>
      </div>
    );
  }
}

Goals.defaultProps = {
  formValues: [],
};

Goals.propTypes = {
  defaultDatamart: PropTypes.func.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,
  organisationId: PropTypes.string.isRequired,
  createUniqueGoal: PropTypes.func.isRequired,
};

export default compose(
  connect(
    state => ({
      defaultDatamart: SessionHelpers.getDefaultDatamart(state),
      hasDatamarts: SessionHelpers.hasDatamarts(state)
    }),
  ),
)(Goals);
