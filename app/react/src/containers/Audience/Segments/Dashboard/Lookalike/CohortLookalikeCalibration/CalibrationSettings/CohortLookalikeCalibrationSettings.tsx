import * as React from 'react';
import {
  AudienceSegmentShape,
  UserLookalikeByCohortsSegment,
} from '@mediarithmics-private/advanced-components/lib/models/audienceSegment/AudienceSegmentResource';
import { Button, Tag, Switch, Tooltip } from 'antd';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { defineMessages, FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { AreaChartSlider } from '@mediarithmics-private/mcs-components-library';
import { DataPoint } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart-slider/AreaChartSlider';
import { InfoCircleFilled, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { IAudienceSegmentService } from '../../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../../constants/types';
import { lazyInject } from '../../../../../../../config/inversify.config';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../../Notifications/injectNotifications';
import { SimilarityIndexInfos } from '../CohortLookalikeCalibration';
import _ from 'lodash';

interface ChangingValue<T> {
  previousValue: T;
  currentValue: T;
}

function initChangingValue<T>(initialValue: T): ChangingValue<T> {
  return {
    previousValue: initialValue,
    currentValue: initialValue,
  };
}

function changeCurrentValue<T>(newCurrentValue: T, value: ChangingValue<T>): ChangingValue<T> {
  return {
    ...value,
    currentValue: newCurrentValue,
  };
}

export interface CohortCalibrationGraphPoint {
  cohortNumber: number;
  nbUserPoints: number;
  nbUserPointsInSegment: number;
  overlap: number;
  similarityIndex: number;
}

interface CohortLookalikeCalibrationSettingsProps {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
  seedSegment: AudienceSegmentShape;
  cohorts: CohortCalibrationGraphPoint[];
  similarityIndexInfos: SimilarityIndexInfos;
}

type Props = CohortLookalikeCalibrationSettingsProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

interface ComputedGraphPoint {
  aggregatedCohortsForGraphPoint: CohortCalibrationGraphPoint[];
  nbUserPointsInCohorts: number;
  nbUserPointsInCohortsAndSegment: number;
  minSimilarityIndex: number;
  cumulativeNbUbserPointsInCohorts: number;
  cumulativeNbUbserPointsInCohortsAndSegment: number;
  cumulativeNbOfCohorts: number;
}

interface CustomDataPoint extends DataPoint {
  nbCohorts: number;
  nbUserPoints: number;
  similarityIndex: number;
}

// In edit mode, cancel is displayed to return to view mode
// In set mode, cancel is not displayed
type CalibrationMode = 'EDIT' | 'SET' | 'VIEW';

interface CohortLookalikeCalibrationSettingsState {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
  includeSeedSegment: ChangingValue<boolean>;
  selectedIndex: ChangingValue<number>;
  calibrationMode: CalibrationMode;
  graphData?: {
    generalGraphData: ComputedGraphPoint[];
    includedSegmentGraph: CustomDataPoint[];
    notIncludedSegmentGraph: CustomDataPoint[];
  };
}

class CohortLookalikeCalibrationSettings extends React.Component<
  Props,
  CohortLookalikeCalibrationSettingsState
> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    const { cohortLookalikeSegment } = props;

    const { include_seed_segment, min_overlap, similarity_index, user_points_target } =
      cohortLookalikeSegment;

    this.state = {
      cohortLookalikeSegment: cohortLookalikeSegment,
      calibrationMode: !user_points_target && !min_overlap && !similarity_index ? 'SET' : 'VIEW',
      includeSeedSegment: initChangingValue(include_seed_segment),
      selectedIndex: initChangingValue(-1),
    };
  }

  componentDidMount() {
    this.createGraphData();
  }

  createGraphData = () => {
    const { cohorts, similarityIndexInfos, cohortLookalikeSegment } = this.props;
    const { selectedIndex, includeSeedSegment } = this.state;

    const lookalikeSegmentMinSimilarityIndex =
      cohortLookalikeSegment.similarity_index ||
      (cohortLookalikeSegment.min_overlap &&
        +(
          Math.ceil(
            (cohortLookalikeSegment.min_overlap / similarityIndexInfos.segmentRatioInDatamart) * 10,
          ) / 10
        ).toFixed(1)) ||
      -1.0;

    interface GraphAccData {
      graphPoints: ComputedGraphPoint[];
      cumulativeNbUbserPointsInCohorts: number;
      cumulativeNbUbserPointsInCohortsAndSegment: number;
      cumulativeNbOfCohorts: number;
    }

    const sortedCohorts = cohorts.sort((a, b) => {
      return b.similarityIndex - a.similarityIndex;
    });

    const minSimilarityIndex = sortedCohorts.reduce(
      (
        acc: { nbUserPointsInCohortsAndNotSegment: number; minSimilarityIndex: number },
        cohort: CohortCalibrationGraphPoint,
      ) => {
        if (
          acc.nbUserPointsInCohortsAndNotSegment / similarityIndexInfos.nbUserPointsInSegment >
          0.1
        ) {
          return acc;
        } else {
          return {
            nbUserPointsInCohortsAndNotSegment:
              acc.nbUserPointsInCohortsAndNotSegment +
              cohort.nbUserPoints -
              cohort.nbUserPointsInSegment,
            minSimilarityIndex: cohort.similarityIndex,
          };
        }
      },
      {
        nbUserPointsInCohortsAndNotSegment: 0,
        minSimilarityIndex: 1 / similarityIndexInfos.segmentRatioInDatamart,
      },
    ).minSimilarityIndex;

    const firstXForGraph = +(Math.ceil(minSimilarityIndex * 10) / 10).toFixed(1);

    const computedGraphData = _.range(firstXForGraph, 0.9, -0.1)
      .map(x => {
        return +(Math.round(x * 10) / 10).toFixed(1);
      })
      .map((x, index) => {
        const cohortsInRange = sortedCohorts.filter(cohort => {
          return index === 0
            ? cohort.similarityIndex >= x
            : cohort.similarityIndex >= x && cohort.similarityIndex < x + 0.1;
        });
        return {
          similarityIndex: x,
          cohortsForGraphPoint: cohortsInRange,
        };
      })
      .reduce(
        (acc: GraphAccData, similarityAndCohorts) => {
          const { similarityIndex, cohortsForGraphPoint } = similarityAndCohorts;
          const nbUserPointsInGraphPoint = cohortsForGraphPoint.reduce((acc, cohort) => {
            return acc + cohort.nbUserPoints;
          }, 0);
          const nbUserPointsInSegmentInGraphPoint = cohortsForGraphPoint.reduce((acc, cohort) => {
            return acc + cohort.nbUserPointsInSegment;
          }, 0);

          const cumulativeNbUbserPointsInCohorts =
            acc.cumulativeNbUbserPointsInCohorts + nbUserPointsInGraphPoint;
          const cumulativeNbUbserPointsInCohortsAndSegment =
            acc.cumulativeNbUbserPointsInCohortsAndSegment + nbUserPointsInSegmentInGraphPoint;
          const cumulativeNbOfCohorts = acc.cumulativeNbOfCohorts + cohortsForGraphPoint.length;
          return {
            graphPoints: acc.graphPoints.concat([
              {
                aggregatedCohortsForGraphPoint: cohortsForGraphPoint,
                nbUserPointsInCohorts: nbUserPointsInGraphPoint,
                nbUserPointsInCohortsAndSegment: nbUserPointsInSegmentInGraphPoint,
                minSimilarityIndex: similarityIndex,
                cumulativeNbUbserPointsInCohorts,
                cumulativeNbUbserPointsInCohortsAndSegment,
                cumulativeNbOfCohorts,
              },
            ]),
            cumulativeNbUbserPointsInCohorts,
            cumulativeNbUbserPointsInCohortsAndSegment,
            cumulativeNbOfCohorts,
          };
        },
        {
          graphPoints: [],
          cumulativeNbUbserPointsInCohorts: 0,
          cumulativeNbUbserPointsInCohortsAndSegment: 0,
          cumulativeNbOfCohorts: 0,
        },
      ).graphPoints;

    // Creating graph data

    const includedSegmentGraph: CustomDataPoint[] = computedGraphData.map(point => {
      return {
        nbCohorts: point.cumulativeNbOfCohorts,
        nbUserPoints:
          point.cumulativeNbUbserPointsInCohorts +
          similarityIndexInfos.nbUserPointsInSegment -
          point.cumulativeNbUbserPointsInCohortsAndSegment,
        similarityIndex: point.minSimilarityIndex,
      };
    });

    const notIncludedSegmentGraph: CustomDataPoint[] = computedGraphData.map(point => {
      return {
        nbCohorts: point.cumulativeNbOfCohorts,
        nbUserPoints:
          point.cumulativeNbUbserPointsInCohorts - point.cumulativeNbUbserPointsInCohortsAndSegment,
        similarityIndex: point.minSimilarityIndex,
      };
    });

    const newGraphData = includeSeedSegment.currentValue
      ? includedSegmentGraph
      : notIncludedSegmentGraph;

    const tmpIndex = newGraphData.findIndex(graphPoint => {
      return graphPoint.similarityIndex === lookalikeSegmentMinSimilarityIndex;
    });

    const defaultIndex = Math.round(newGraphData.length / 2);

    const newSelectedIndex =
      selectedIndex.currentValue === -1
        ? initChangingValue(tmpIndex >= 0 ? tmpIndex : defaultIndex)
        : selectedIndex;

    this.setState({
      selectedIndex: newSelectedIndex,
      graphData: {
        generalGraphData: computedGraphData,
        includedSegmentGraph: includedSegmentGraph,
        notIncludedSegmentGraph: notIncludedSegmentGraph,
      },
    });
  };

  saveLookalikeSettings = () => {
    const {
      cohortLookalikeSegment,
      notifySuccess,
      notifyError,
      intl: { formatMessage },
    } = this.props;
    const {
      graphData,
      includeSeedSegment: { currentValue: includeSeedSegmentCurrentValue },
      selectedIndex,
    } = this.state;

    const { currentValue: selectedIndexCurrentValue } = selectedIndex;

    if (graphData) {
      const researchedGraph = includeSeedSegmentCurrentValue
        ? graphData.includedSegmentGraph
        : graphData.notIncludedSegmentGraph;
      const selectedDataPoint = researchedGraph[selectedIndexCurrentValue];

      this._audienceSegmentService
        .updateAudienceSegment(cohortLookalikeSegment.id, {
          include_seed_segment: includeSeedSegmentCurrentValue,
          user_points_target: selectedDataPoint.nbUserPoints,
          similarity_index: selectedDataPoint.similarityIndex,
          type: cohortLookalikeSegment.type,
        })
        .then(({ data: segmentUpdated }) => {
          notifySuccess({
            message: formatMessage(messages.notifSuccess),
            description: formatMessage(messages.notifSuccessMessage),
          });
          this.setState({
            cohortLookalikeSegment: segmentUpdated as UserLookalikeByCohortsSegment,
            calibrationMode: 'VIEW',
            selectedIndex: initChangingValue(selectedIndexCurrentValue),
            includeSeedSegment: initChangingValue(includeSeedSegmentCurrentValue),
          });
        })
        .catch(err => {
          notifyError(err);
        });
    }
  };

  changeToEditMode = () => {
    this.setState({ calibrationMode: 'EDIT' });
  };

  changeIncludeSegmentSeed = (checked: boolean) => {
    const { includeSeedSegment } = this.state;
    this.setState({
      includeSeedSegment: changeCurrentValue(checked, includeSeedSegment),
    });
  };

  areaChartSliderOnChange = (index: number) => {
    const { selectedIndex } = this.state;
    this.setState({
      selectedIndex: changeCurrentValue(index, selectedIndex),
    });
  };

  tipFormatter = (selected: CustomDataPoint) => {
    return selected.similarityIndex;
  };

  cancelEdit = () => {
    const {
      selectedIndex: { previousValue: previousSelectedIndex },
      includeSeedSegment: { previousValue: previousIncludeSeedSegment },
    } = this.state;

    this.setState({
      selectedIndex: initChangingValue(previousSelectedIndex),
      includeSeedSegment: initChangingValue(previousIncludeSeedSegment),
      calibrationMode: 'VIEW',
    });
  };

  getSaveButtonContent = () => {
    const { calibrationMode } = this.state;

    switch (calibrationMode) {
      case 'EDIT':
        return (
          <div>
            <UnlockOutlined />
            <FormattedMessage {...messages.saveSettings} />
          </div>
        );
      case 'SET':
        return <FormattedMessage {...messages.saveSettings} />;
      case 'VIEW':
        return (
          <div>
            <LockOutlined />
            <FormattedMessage {...messages.editSettings} />
          </div>
        );
    }
  };

  render() {
    const {
      seedSegment,
      match: {
        params: { organisationId },
      },
      cohorts,
      similarityIndexInfos,
      intl: { formatMessage },
    } = this.props;

    const {
      includeSeedSegment,
      graphData,
      selectedIndex,
      calibrationMode,
      cohortLookalikeSegment,
    } = this.state;

    /**
     * If user_points_target is set :
     * - Information in tags are sourced from user_points_target & similarity_index
     * If user_points_target is not set or if click on Edit those settings :
     * - Information in tags are sourced from the overlap calculation (using the 2 OTQL queries)
     */

    const researchedGraph = includeSeedSegment.currentValue
      ? graphData?.includedSegmentGraph
      : graphData?.notIncludedSegmentGraph;
    const dataPointSelected = researchedGraph?.[selectedIndex.currentValue];

    let userPointsTarget: number | undefined = dataPointSelected?.nbUserPoints;

    let similarityIndex: number | undefined = dataPointSelected?.similarityIndex;

    if (cohortLookalikeSegment.user_points_target && calibrationMode === 'VIEW') {
      userPointsTarget = cohortLookalikeSegment.user_points_target;
      similarityIndex =
        cohortLookalikeSegment.similarity_index ||
        (cohortLookalikeSegment.min_overlap &&
          +(
            Math.ceil(
              (cohortLookalikeSegment.min_overlap / similarityIndexInfos.segmentRatioInDatamart) *
                10,
            ) / 10
          ).toFixed(1));
    }

    return (
      <div className='mcs-cohortLookalikeCalibrationSettings'>
        <div className='mcs-cohortLookalikeCalibrationSettings_header'>
          <div className='mcs-cohortLookalikeCalibrationSettings_header_content'>
            <div className='seedSegmentAndSwitch'>
              <div className='seedSegmentMessage'>
                <FormattedMessage
                  {...messages.seedSegmentGeneral}
                  values={{
                    seedSegment: <b>{formatMessage(messages.seedSegment)}</b>,
                    seedSegmentName: (
                      <Link
                        to={`/v2/o/${organisationId}/audience/segments/${seedSegment.id}`}
                        target='_blank'
                      >
                        {seedSegment.name}
                      </Link>
                    ),
                    linkToSeedSegment: (
                      <Link
                        to={`/v2/o/${organisationId}/audience/segments/${seedSegment.id}`}
                        target='_blank'
                      >
                        #{seedSegment.id}
                      </Link>
                    ),
                    nbUserPoints: (
                      <b>{(seedSegment.user_points_count || 0).toLocaleString('en')}</b>
                    ),
                  }}
                />
              </div>
              <Switch
                checkedChildren={formatMessage(messages.include)}
                unCheckedChildren={formatMessage(messages.exclude)}
                checked={includeSeedSegment.currentValue}
                onChange={this.changeIncludeSegmentSeed}
                disabled={calibrationMode === 'VIEW'}
              />
            </div>
            <div className='reach'>
              <FormattedMessage
                {...messages.reach}
                values={{
                  userPointsMention: (
                    <Tag className={`cohortTag ${calibrationMode !== 'VIEW' && 'green'}`}>
                      <b>
                        {userPointsTarget !== undefined
                          ? userPointsTarget.toLocaleString('en')
                          : '...'}{' '}
                        {formatMessage(messages.userpoints)}
                      </b>
                    </Tag>
                  ),
                  overlapMention: (
                    <Tag className={`cohortTag ${calibrationMode !== 'VIEW' && 'green'}`}>
                      <b>
                        {similarityIndex !== undefined ? similarityIndex : '...'}{' '}
                        {formatMessage(messages.similarityIndex)}
                      </b>
                    </Tag>
                  ),
                }}
              />
              <Tooltip
                className='reachTooltip'
                title={
                  dataPointSelected
                    ? `${dataPointSelected.nbCohorts}/${cohorts.length} ${formatMessage(
                        messages.cohortsSelectedTip,
                      )}`
                    : '...'
                }
                placement='bottom'
              >
                <InfoCircleFilled />
              </Tooltip>
            </div>
          </div>
          <div>
            {calibrationMode === 'EDIT' && (
              <Button key='cancel' className='mcs-primary' type='link' onClick={this.cancelEdit}>
                <FormattedMessage {...messages.cancelEditSettings} />
              </Button>
            )}
            <Button
              className='mcs-primary'
              type='primary'
              onClick={
                calibrationMode === 'EDIT' || calibrationMode === 'SET'
                  ? this.saveLookalikeSettings
                  : this.changeToEditMode
              }
            >
              {this.getSaveButtonContent()}
            </Button>
          </div>
        </div>
        <AreaChartSlider
          data={researchedGraph || []}
          isLoading={!graphData}
          xAxis={{
            key: 'similarityIndex',
            labelFormat: '{value}',
            title: formatMessage(messages.areaChartSliderXAxisTitle),
            subtitle: formatMessage(messages.areaChartSliderXAxisSubtitle),
            reversed: true,
          }}
          yAxis={{
            key: 'nbUserPoints',
            title: formatMessage(messages.areaChartSliderYAxisTitle),
            subtitle: formatMessage(messages.areaChartSliderYAxisSubtitle),
          }}
          color={'#00a1df'}
          value={selectedIndex.currentValue}
          onChange={this.areaChartSliderOnChange}
          tipFormatter={this.tipFormatter}
          disabled={calibrationMode === 'VIEW'}
        />
      </div>
    );
  }
}

export default compose<Props, CohortLookalikeCalibrationSettingsProps>(
  injectIntl,
  injectNotifications,
  withRouter,
)(CohortLookalikeCalibrationSettings);

const messages = defineMessages({
  saveSettings: {
    id: 'audience.segments.lookalike.type.cohort.settings.save',
    defaultMessage: 'Save those settings',
  },
  editSettings: {
    id: 'audience.segments.lookalike.type.cohort.settings.edit',
    defaultMessage: 'Edit those settings',
  },
  cancelEditSettings: {
    id: 'audience.segments.lookalike.type.cohort.settings.edit.cancel',
    defaultMessage: 'Cancel',
  },
  seedSegmentGeneral: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.general',
    defaultMessage:
      '{seedSegment} : {seedSegmentName} ({linkToSeedSegment}) - {nbUserPoints} userpoints',
  },
  reach: {
    id: 'audience.segments.lookalike.type.cohort.settings.reach',
    defaultMessage:
      'Reach for this segment is set to {userPointsMention} while guaranteeing at least a {overlapMention} with seed segment.',
  },
  seedSegment: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment',
    defaultMessage: 'Seed segment',
  },
  userpoints: {
    id: 'audience.segments.lookalike.type.cohort.settings.userpoints',
    defaultMessage: 'user points',
  },
  similarityIndex: {
    id: 'audience.segments.lookalike.type.cohort.settings.similarityIndex',
    defaultMessage: 'similarity index',
  },
  include: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.include',
    defaultMessage: 'Include',
  },
  exclude: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.exclude',
    defaultMessage: 'Exclude',
  },
  cohortsSelectedTip: {
    id: 'audience.segments.lookalike.type.cohort.settings.reach.tip.cohortsSelected',
    defaultMessage: 'cohorts selected',
  },
  notifSuccess: {
    id: 'audience.segments.lookalike.type.cohort.settings.save.success',
    defaultMessage: 'Success',
  },
  notifSuccessMessage: {
    id: 'audience.segments.lookalike.type.cohort.settings.save.success.message',
    defaultMessage: 'Cohort lookalike calibration saved.',
  },
  areaChartSliderXAxisTitle: {
    id: 'audience.segments.lookalike.type.cohort.settings.chart.xaxis.title',
    defaultMessage: 'Similarity index',
  },
  areaChartSliderXAxisSubtitle: {
    id: 'audience.segments.lookalike.type.cohort.settings.chart.xaxis.subtitle',
    defaultMessage: 'Minimum similarity index between seed segment and selected cohorts',
  },
  areaChartSliderYAxisTitle: {
    id: 'audience.segments.lookalike.type.cohort.settings.chart.yaxis.title',
    defaultMessage: 'Userpoints',
  },
  areaChartSliderYAxisSubtitle: {
    id: 'audience.segments.lookalike.type.cohort.settings.chart.yaxis.subtitle',
    defaultMessage: '# of userpoints expected in this segment',
  },
});
