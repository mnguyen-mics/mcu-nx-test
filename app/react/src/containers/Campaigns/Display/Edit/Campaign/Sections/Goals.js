import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components';
import messages from '../messages';
import GoalService from '../../../../../../services/GoalService';
import { getDefaultDatamart } from '../../../../../../state/Session/selectors';
import { getPaginatedApiParam } from '../../../../../../utils/ApiHelper';
import GoalTable from '../Tables';
import { formatMetric } from '../../../../../../utils/MetricHelper';

const { FormSection } = Form;

class Audience extends Component {

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
    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleUserPoints,
        key: 'user_points',
        isHideable: false,
        render: text => <span>{formatMetric(text, '0,0')}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleCookieIds,
        key: 'desktop_cookie_ids',
        isHideable: false,
        render: text => <span>{formatMetric(text, '0,0')}</span>,
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

  updateData = (selectedIds) => {
    const { formValues, handlers, organisationId } = this.props;
    const fetchSelectedGoald = Promise.all(selectedIds.map(goalId => {
      return GoalService.getSegment(goalId);
    }));
    const fetchMetadata = GoalService.getSegmentMetaData(organisationId);

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    Promise.all([fetchSelectedGoald, fetchMetadata])
      .then(results => {
        const goals = results[0];
        const metadata = results[1];

        return goals.map(goal => {
          const { desktop_cookie_ids, user_points } = metadata[goal.id];
          const prevSeg = formValues.find(elem => elem.id === goal.id);
          const include = (prevSeg ? prevSeg.include : true);

          return { ...goal, desktop_cookie_ids, include, user_points };
        });
      })
      .then(newFields => {
        handlers.updateTableFields({ newFields, tableName: 'audienceTable' });
        this.setState({ loading: false });
      });
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;

    const dataSource = formValues.reduce((tableData, goal, index) => {
      return (!goal.toBeRemoved
        ? [
          ...tableData,
          {
            key: goal.id,
            type: { image: 'users', name: goal.name },
            info: [
              `${formatMetric(goal.user_points, '0,0')} ${formatMessage(messages.contentSection2Medium1)}`,
              `${formatMetric(goal.desktop_cookie_ids, '0,0')} ${formatMessage(messages.contentSection2Medium2)}`,
            ],
            include: { bool: goal.include, index },
            toBeRemoved: index,
          }
        ]
        : tableData
      );
    }, []);

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: () => {},
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

        <Row>
          <FieldArray
            component={GoalTable}
            dataSource={dataSource}
            loading={this.state.loading}
            name="audienceTable"
            tableName="audienceTable"
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

Audience.defaultProps = {
  formValues: [],
};

Audience.propTypes = {
  defaultDatamart: PropTypes.func.isRequired,
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired,
};

export default compose(
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(Audience);
