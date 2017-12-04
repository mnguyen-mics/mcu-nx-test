import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';


import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';

import ExportService from '../../../../services/ExportService';
import GoalService from '../../../../services/GoalService';
import ReportService from '../../../../services/ReportService.ts';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import { GOAL_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';

const fetchExportData = (organisationId, filter) => {

  const buildOptionsForGetGoals = () => {
    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000,
    };

    if (filter.keywords) { options.keywords = filter.keywords; }

    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = 'goal_id';

  const apiResults = Promise.all([
    GoalService.getGoals(organisationId, buildOptionsForGetGoals()),
    ReportService.getConversionPerformanceReport(organisationId, startDate, endDate, dimension),
  ]);

  return apiResults.then(results => {
    const goals = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'goal_id',
    );

    const mergedData = Object.keys(goals).map((goalId) => {
      return {
        ...goals[goalId],
        ...performanceReport[goalId],
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
      exportIsRunning: false,
    };
  }

  handleRunExport() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const filter = parseSearch(this.props.location.search, GOAL_SEARCH_SETTINGS);

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, filter).then(data => {
      ExportService.exportGoals(organisationId, data, filter, translations);
      this.setState({
        exportIsRunning: false,
      });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({
        exportIsRunning: false,
      });
      hideExportLoadingMsg();
    });

  }

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;


    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [{ name: translations.GOALS, url: `/v2/o/${organisationId}/campaigns/goal` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/goals/`}>
          <Button className="mcs-primary" type="primary">
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
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

GoalsActionbar = compose(
  withTranslations,
  withRouter,
)(GoalsActionbar);

export default GoalsActionbar;
