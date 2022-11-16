import * as React from 'react';
import {
  AudienceSegmentShape,
  UserLookalikeByCohortsSegment,
} from '@mediarithmics-private/advanced-components/lib/models/audienceSegment/AudienceSegmentResource';
import { Button, Tag, Switch, Tooltip } from 'antd';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
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

interface ComputedGraphPoint {
  aggregatedCohortsForGraphPoint: CohortCalibrationGraphPoint[];
  nbUserPointsInCohorts: number;
  nbUserPointsInCohortsAndSegment: number;
  minSimilarityIndex: number;
  cumulativeNbUbserPointsInCohorts: number;
  cumulativeNbUbserPointsInCohortsAndSegment: number;
  cumulativeNbOfCohorts: number;
}

type Props = CohortLookalikeCalibrationSettingsProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

interface CustomDataPoint extends DataPoint {
  nbCohorts: number;
  nbUserPoints: number;
  similarityIndex: number;
}

interface CohortLookalikeCalibrationSettingsState {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
  includeSeedSegment: boolean;
  previousIncludeSeedSegment: boolean;
  selectedIndex?: number;
  previousSelectedIndex?: number;
  editMode: boolean;
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
    const {
      cohortLookalikeSegment: { include_seed_segment },
    } = props;
    this.state = {
      cohortLookalikeSegment: props.cohortLookalikeSegment,
      editMode: false,
      includeSeedSegment: include_seed_segment,
      previousIncludeSeedSegment: include_seed_segment,
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
      1.0;

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

    const newGraphData = includeSeedSegment ? includedSegmentGraph : notIncludedSegmentGraph;

    const tmpIndex = newGraphData.findIndex(graphPoint => {
      return graphPoint.similarityIndex === lookalikeSegmentMinSimilarityIndex;
    });

    const newSelectedIndex =
      selectedIndex === undefined ? (tmpIndex >= 0 ? tmpIndex : 0) : selectedIndex;

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
    const { graphData, includeSeedSegment, selectedIndex } = this.state;

    if (graphData && selectedIndex !== undefined) {
      const researchedGraph = includeSeedSegment
        ? graphData.includedSegmentGraph
        : graphData.notIncludedSegmentGraph;
      const selectedDataPoint = researchedGraph[selectedIndex];

      this._audienceSegmentService
        .updateAudienceSegment(cohortLookalikeSegment.id, {
          include_seed_segment: includeSeedSegment,
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
            editMode: false,
            previousSelectedIndex: selectedIndex,
            previousIncludeSeedSegment: includeSeedSegment,
          });
        })
        .catch(err => {
          notifyError(err);
        });
    }
  };

  changeIncludeSegmentSeed = (checked: boolean) => {
    this.setState({ includeSeedSegment: checked });
  };

  areaChartSliderOnChange = (index: number) => {
    this.setState({
      selectedIndex: index,
    });
  };

  tipFormatter = (selected: CustomDataPoint) => {
    return (
      <FormattedMessage
        {...messages.similarityIndexTooltip}
        values={{ similarityIndex: selected.similarityIndex }}
      />
    );
  };

  cancelEdit = () => {
    const { previousSelectedIndex, previousIncludeSeedSegment } = this.state;

    this.setState(
      {
        selectedIndex: previousSelectedIndex,
        includeSeedSegment: previousIncludeSeedSegment,
        editMode: false,
      },
      this.createGraphData,
    );
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

    const { includeSeedSegment, graphData, selectedIndex, editMode, cohortLookalikeSegment } =
      this.state;

    const switchEditMode = (editMode: boolean) => this.setState({ editMode });

    /**
     * If user_points_target is set :
     * - Information in tags are sourced from user_points_target & similarity_index
     * If user_points_target is not set or if click on Edit those settings :
     * - Information in tags are sourced from the overlap calculation (using the 2 OTQL queries)
     */

    const researchedGraph = includeSeedSegment
      ? graphData?.includedSegmentGraph
      : graphData?.notIncludedSegmentGraph;
    const dataPointSelected =
      selectedIndex !== undefined ? researchedGraph?.[selectedIndex] : undefined;

    let userPointsTarget: number | undefined = dataPointSelected?.nbUserPoints;

    let similarityIndex: number | undefined = dataPointSelected?.similarityIndex;

    if (cohortLookalikeSegment.user_points_target && !editMode) {
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
                    seedSegmentName: seedSegment.name,
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
                checked={includeSeedSegment}
                onChange={this.changeIncludeSegmentSeed}
                disabled={!editMode}
              />
            </div>
            <div className='reach'>
              <FormattedMessage
                {...messages.reach}
                values={{
                  userPointsMention: (
                    <Tag className={`cohortTag ${editMode && 'green'}`}>
                      <b>
                        {userPointsTarget !== undefined
                          ? userPointsTarget.toLocaleString('en')
                          : '...'}{' '}
                        {formatMessage(messages.userpoints)}
                      </b>
                    </Tag>
                  ),
                  overlapMention: (
                    <Tag className={`cohortTag ${editMode && 'green'}`}>
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
            {editMode && (
              <Button key='cancel' className='mcs-primary' type='link' onClick={this.cancelEdit}>
                <FormattedMessage {...messages.cancelEditSettings} />
              </Button>
            )}
            <Button
              className='mcs-primary'
              type='primary'
              onClick={editMode ? this.saveLookalikeSettings : () => switchEditMode(true)}
            >
              {editMode ? <UnlockOutlined /> : <LockOutlined />}
              {editMode ? (
                <FormattedMessage {...messages.saveSettings} />
              ) : (
                <FormattedMessage {...messages.editSettings} />
              )}
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
          value={selectedIndex || 0}
          onChange={this.areaChartSliderOnChange}
          tipFormatter={this.tipFormatter}
          disabled={!editMode}
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
      'Reach for this segment is set to {userPointsMention} while guaranteeing at least {overlapMention} with seed segment.',
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
  similarityIndexTooltip: {
    id: 'audience.segments.lookalike.type.cohort.settings.slider.tooltip.similarityIndex',
    defaultMessage: '{similarityIndex} similarity index',
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
