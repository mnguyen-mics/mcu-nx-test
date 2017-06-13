import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as ActionbarActions from '../../../../state/Actionbar/actions';
import { McsIcons } from '../../../../components/McsIcons';

import ExportService from '../../../../services/ExportService';
import GoalService from '../../../../services/GoalService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import {
  GOAL_QUERY_SETTINGS,

  deserializeQuery
} from '../../RouteQuerySelector';

const fetchExportData = (organisationId, filter) => {

  const buildOptionsForGetGoals = () => {
    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000
    };

    if (filter.keywords) { options.keywords = filter.keywords; }

    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = 'goal_id';

  const apiResults = Promise.all([
    GoalService.getGoals(organisationId, buildOptionsForGetGoals()),
    ReportService.getConversionPerformanceReport(organisationId, startDate, endDate, dimension)
  ]);

  return apiResults.then(results => {
    const goals = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'goal_id'
    );

    const mergedData = Object.keys(goals).map((goalId) => {
      return {
        ...goals[goalId],
        ...performanceReport[goalId]
      };
    });

    return mergedData;
  });
};

class GoalsActionbar extends Component {

  constructor(props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false
    };
  }

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.GOALS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  handleRunExport() {
    const {
      activeWorkspace: {
        organisationId
      },
      translations,

    } = this.props;

    const filter = deserializeQuery(this.props.query, GOAL_QUERY_SETTINGS);

    this.setState({
      exportIsRunning: true
    });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, filter).then(data => {
      ExportService.exportGoals(organisationId, data, filter, translations);
      this.setState({
        exportIsRunning: false
      });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({
        exportIsRunning: false
      });
      hideExportLoadingMsg();
    });

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    return (
      <Actionbar {...this.props}>
        <Link to={`${organisationId}/goals/`}>
          <Button type="primary">
            <McsIcons type="plus" /><FormattedMessage id="NEW_GOAL" />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcons type="download" />}<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }
}

GoalsActionbar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  translations: state.translationsState.translations,
  query: ownProps.router.location.query,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

GoalsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalsActionbar);

export default GoalsActionbar;
