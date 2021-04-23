import React from 'react';
import { Button, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import ExportService from '../../../../services/ExportService';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { GOAL_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { Index } from '../../../../utils';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { IGoalService, GoalsOptions } from '../../../../services/GoalService';

const messages = defineMessages({
  exportInProgress: {
    id: 'goals.actionbar.button.export',
    defaultMessage: 'Export in progress',
  },
  goals: {
    id: 'goals.actionbar.breadCrumbPath.goals',
    defaultMessage: 'Goals',
  },
});

type GoalsActionbarProps = InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  exportIsRunning: boolean;
}

class GoalsActionbar extends React.Component<GoalsActionbarProps, State> {
  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;

  constructor(props: GoalsActionbarProps) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false,
    };
  }

  fetchExportData = (organisationId: string, filter: Index<any>) => {
    const buildOptionsForGetGoals = () => {
      let options: GoalsOptions = {};
      if (filter.statuses) {
        options = {
          archived: filter.statuses.includes('ARCHIVED'),
          first_result: 0,
          max_results: 2000,
        };
      }

      if (filter.keywords) {
        options.keywords = filter.keywords;
      }

      return options;
    };

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = ['goal_id'];

    const apiResults = Promise.all([
      this._goalService.getGoals(organisationId, buildOptionsForGetGoals()),
      ReportService.getConversionPerformanceReport(
        organisationId,
        startDate,
        endDate,
        dimension,
      ),
    ]);

    return apiResults.then(results => {
      const goals = normalizeArrayOfObject(results[0].data, 'id');
      const performanceReport = normalizeArrayOfObject(
        normalizeReportView(results[1].data.report_view),
        'goal_id',
      );

      const mergedData = Object.keys(goals).map(goalId => {
        return {
          ...goals[goalId],
          ...performanceReport[goalId],
        };
      });

      return mergedData;
    });
  };

  handleRunExport() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      GOAL_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      intl.formatMessage(messages.exportInProgress),
      0,
    );

    this.fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportGoals(
          organisationId,
          data,
          filter,
          intl.formatMessage,
        );
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      })
      .catch(() => {
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
        params: { organisationId },
      },
      intl,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/goals`}>{intl.formatMessage(messages.goals)}</Link>
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/goals/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />
            <FormattedMessage
              id="goals.list.actionbar.newGoal"
              defaultMessage="New Goal"
            />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage
            id="goals.list.actionbar.export"
            defaultMessage="Export"
          />
        </Button>
      </Actionbar>
    );
  }
}

export default compose(withRouter, injectIntl)(GoalsActionbar);
