import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import {
  ReportRequestBody,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import {
  buildScenarioAnalyticsRequestBody,
  ScenarioAnalyticsDimension,
  ScenarioAnalyticsMetric,
  ScenarioCountersData,
  ExitConditionCounterData,
  NodeCounterData,
} from '../utils/ScenarioAnalyticsReportHelper';
import McsMoment from '../utils/McsMoment';
import { ReportView } from '../models/ReportView';
import { normalizeReportView } from '../utils/MetricHelper';

export interface IScenarioAnalyticsService {
  getAnalytics: (
    datamartId: string,
    metrics: ScenarioAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: ScenarioAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
  ) => Promise<ReportViewResponse>;

  getNodeCountersAnalytics: (
    datamartId: string,
    scenarioId: string,
    from: McsMoment,
    to: McsMoment,
    exitConditionIdOpt?: string,
  ) => Promise<ScenarioCountersData>;
}
@injectable()
export class ScenarioAnalyticsService implements IScenarioAnalyticsService {
  getAnalytics(
    datamartId: string,
    metrics: ScenarioAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: ScenarioAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildScenarioAnalyticsRequestBody(
      metrics,
      from,
      to,
      dimensions,
      dimensionFilterClauses,
    );
    const endpoint = `datamarts/${datamartId}/user_scenario_analytics`;
    return ApiService.postRequest(endpoint, report);
  }

  getNodeCountersAnalytics = (
    datamartId: string,
    scenarioId: string,
    from: McsMoment,
    to: McsMoment,
    exitConditionIdOpt?: string,
  ): Promise<ScenarioCountersData> => {
    const getReportViewPromise = (
      nodeOrExitCondition: ScenarioAnalyticsDimension,
    ) => {
      const metrics: ScenarioAnalyticsMetric[] = ['user_points_count'];
      const dimensions: ScenarioAnalyticsDimension[] = [
        nodeOrExitCondition,
        'scenario_id',
      ];
      const dimensionFilterClauses: DimensionFilterClause = {
        operator: 'OR',
        filters: [
          {
            dimension_name: 'SCENARIO_ID',
            operator: 'EXACT',
            expressions: [scenarioId],
          },
        ],
      };

      const reportViewP: Promise<ReportView> = this.getAnalytics(
        datamartId,
        metrics,
        from,
        to,
        dimensions,
        dimensionFilterClauses,
      ).then((res) => {
        return res.data.report_view;
      });

      return reportViewP;
    };

    const nodesReportViewP = getReportViewPromise('node_id');
    const exitConditionReportViewP: Promise<
      ReportView | undefined
    > = exitConditionIdOpt
      ? getReportViewPromise('exit_condition_id')
      : Promise.resolve(undefined);

    return Promise.all([nodesReportViewP, exitConditionReportViewP]).then(
      (resReports) => {
        const nodesReportView = resReports[0];
        const exitConditionReportView = resReports[1];

        const nodeCountersDataL: NodeCounterData[] = normalizeReportView(
          nodesReportView,
        )
          .map((line) => {
            if (line.node_id !== '') {
              const nodeCounterData: NodeCounterData = {
                nodeId: line.node_id,
                userPointsCount: line.user_points_count,
              };
              return nodeCounterData;
            } else return undefined;
          })
          .filter((line): line is NodeCounterData => line !== undefined);
        const exitConditionCounterDataL: ExitConditionCounterData[] = exitConditionReportView
          ? normalizeReportView(exitConditionReportView)
              .map((line) => {
                if (line.exit_condition_id !== '') {
                  const exitConditionCounterData: ExitConditionCounterData = {
                    exitConditionId: line.exit_condition_id,
                    userPointsCount: line.user_points_count,
                  };
                  return exitConditionCounterData;
                } else return undefined;
              })
              .filter(
                (line): line is ExitConditionCounterData => line !== undefined,
              )
          : [];

        const scenarioCountersData: ScenarioCountersData = {
          scenarioId: scenarioId,
          from: from,
          to: to,
          nodeCountersData: nodeCountersDataL,
          exitConditionCounterData: exitConditionCounterDataL,
        };

        return scenarioCountersData;
      },
    );
  };
}
