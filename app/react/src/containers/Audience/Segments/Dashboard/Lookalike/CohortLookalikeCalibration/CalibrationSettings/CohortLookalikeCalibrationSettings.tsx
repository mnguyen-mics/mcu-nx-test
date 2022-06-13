import * as React from 'react';
import {
  AudienceSegmentShape,
  UserLookalikeByCohortsSegment,
} from '@mediarithmics-private/advanced-components/lib/models/audienceSegment/AudienceSegmentResource';
import { Button, Tag, Switch, Tooltip } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { AreaChartSlider } from '@mediarithmics-private/mcs-components-library';
import { DataPoint } from '@mediarithmics-private/mcs-components-library/lib/components/charts/area-chart-slider/AreaChartSlider';
import { InfoCircleFilled } from '@ant-design/icons';
import { IAudienceSegmentService } from '../../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../../constants/types';
import { lazyInject } from '../../../../../../../config/inversify.config';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../../Notifications/injectNotifications';

const messages = defineMessages({
  saveSettings: {
    id: 'audience.segments.lookalike.type.cohort.settings.save',
    defaultMessage: 'Save those settings',
  },
  seedSegmentGeneral: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.general',
    defaultMessage:
      '{seedSegment} : {seedSegmentName} ({linkToSeedSegment}) - {nbUserPoints} Userpoints',
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
    defaultMessage: 'Userpoints',
  },
  overlap: {
    id: 'audience.segments.lookalike.type.cohort.settings.overlap',
    defaultMessage: 'overlap',
  },
  include: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.include',
    defaultMessage: 'Include',
  },
  exclude: {
    id: 'audience.segments.lookalike.type.cohort.settings.seedSegment.exclude',
    defaultMessage: 'Exclude',
  },
  overlapTip: {
    id: 'audience.segments.lookalike.type.cohort.settings.slider.tip.overlap',
    defaultMessage: '{percentage}% overlap',
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
    defaultMessage: 'Overlap',
  },
  areaChartSliderXAxisSubtitle: {
    id: 'audience.segments.lookalike.type.cohort.settings.chart.xaxis.subtitle',
    defaultMessage: 'Minimum overlap between seed segment and selected cohorts',
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

interface CohortLookalikeCalibrationSettingsProps {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
  seedSegment: AudienceSegmentShape;
  cohorts: CohortCalibrationGraphPoint[];
}

interface GraphPointsAccumulator {
  lastGraphPoint?: DataPoint;
  currentGraphData: DataPoint[];
}

type Props = CohortLookalikeCalibrationSettingsProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; segmentId: string }>;

export interface CohortCalibrationGraphPoint {
  cohortNumber: number;
  nbUserpoints: number;
  overlap: number;
}

interface CohortLookalikeCalibrationSettingsState {
  includeSeedSegment: boolean;
  previousSavedValue?: DataPoint;
  graphData?: {
    currentGraphPoint: DataPoint;
    data: DataPoint[];
  };
  initialIndex?: number;
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
      includeSeedSegment: include_seed_segment,
    };
  }

  componentDidMount() {
    this.createGraphData();
  }

  createGraphData = () => {
    const { cohorts, seedSegment, cohortLookalikeSegment } = this.props;
    const { includeSeedSegment, graphData, initialIndex } = this.state;

    const previousCurrentGraphData = graphData?.currentGraphPoint;

    const firstPercentageNbUserpoints = includeSeedSegment ? seedSegment.user_points_count || 0 : 0;

    const newGraphData = [...Array(101).keys()].reverse().reduce(
      (acc: GraphPointsAccumulator, currentPercentage: number): GraphPointsAccumulator => {
        const { lastGraphPoint, currentGraphData } = acc;

        const offsetNbUserPoints = lastGraphPoint
          ? lastGraphPoint.nbUserpoints
          : firstPercentageNbUserpoints;

        const addedCohorts = cohorts.filter((cohort: CohortCalibrationGraphPoint) => {
          return cohort.overlap >= currentPercentage && cohort.overlap < currentPercentage + 1;
        });

        const newNbUserpoints =
          offsetNbUserPoints +
          addedCohorts.reduce((accNb, cohort) => {
            return accNb + Math.floor(cohort.nbUserpoints * (1 - cohort.overlap / 100));
          }, 0);

        const offsetNbCohorts = lastGraphPoint ? lastGraphPoint.nbCohorts : 0;

        const nbCohorts = offsetNbCohorts + addedCohorts.length;

        const newGraphPoint: DataPoint = {
          nbCohorts: nbCohorts,
          nbUserpoints: newNbUserpoints,
          overlap: currentPercentage,
        };

        return {
          lastGraphPoint: newGraphPoint,
          currentGraphData: currentGraphData.concat([newGraphPoint]),
        };
      },
      { currentGraphData: [] },
    ).currentGraphData;

    const researchedOverlap =
      previousCurrentGraphData?.overlap || cohortLookalikeSegment.min_overlap;

    const newInitialIndex =
      initialIndex ||
      newGraphData.findIndex(graphPoint => {
        return graphPoint.overlap === researchedOverlap;
      }) + 1 ||
      0;

    this.setState({
      graphData: {
        currentGraphPoint:
          newGraphData.find(graphPoint => {
            return graphPoint.overlap === researchedOverlap;
          }) || newGraphData[0],
        data: newGraphData,
      },
      initialIndex: newInitialIndex,
    });
  };

  saveLookalikeSettings = () => {
    const {
      cohortLookalikeSegment,
      notifySuccess,
      notifyError,
      intl: { formatMessage },
    } = this.props;
    const { graphData, includeSeedSegment } = this.state;

    if (graphData) {
      const { currentGraphPoint } = graphData;
      this.setState({ previousSavedValue: currentGraphPoint }, () => {
        this._audienceSegmentService
          .updateAudienceSegment(cohortLookalikeSegment.id, {
            include_seed_segment: includeSeedSegment,
            user_points_target: graphData.currentGraphPoint.nbUserpoints,
            min_overlap: graphData.currentGraphPoint.overlap,
            type: cohortLookalikeSegment.type,
          })
          .then(() => {
            notifySuccess({
              message: formatMessage(messages.notifSuccess),
              description: formatMessage(messages.notifSuccessMessage),
            });
          })
          .catch(err => {
            notifyError(err);
          });
      });
    }
  };

  changeIncludeSegmentSeed = (checked: boolean) => {
    this.setState({ includeSeedSegment: checked }, () => {
      this.createGraphData();
    });
  };

  areaChartSliderOnChange = (selected: DataPoint) => {
    const { graphData } = this.state;
    if (graphData)
      this.setState({
        graphData: {
          ...graphData,
          currentGraphPoint: selected,
        },
      });
  };

  tipFormatter = (selected: DataPoint) => {
    return <FormattedMessage {...messages.overlapTip} values={{ percentage: selected.overlap }} />;
  };

  shouldDisableButton = () => {
    const { graphData, previousSavedValue } = this.state;
    if (graphData) {
      const { currentGraphPoint } = graphData;

      if (previousSavedValue) {
        return previousSavedValue === currentGraphPoint;
      }
      return false;
    } else return true;
  };

  render() {
    const {
      seedSegment,
      match: {
        params: { organisationId },
      },
      cohorts,
      intl: { formatMessage },
    } = this.props;
    const { includeSeedSegment, graphData, initialIndex } = this.state;

    return (
      <div className='cohortLookalikeCalibrationSettings'>
        <div className='seedSegmentAndSwitch'>
          <span className='seedSegmentMessage'>
            <FormattedMessage
              {...messages.seedSegmentGeneral}
              values={{
                seedSegment: (
                  <span className='boldText'>{formatMessage(messages.seedSegment)}</span>
                ),
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
                  <span className='boldText'>
                    {(seedSegment.user_points_count || 0).toLocaleString()}
                  </span>
                ),
              }}
            />
          </span>
          <Switch
            checkedChildren={formatMessage(messages.include)}
            unCheckedChildren={formatMessage(messages.exclude)}
            checked={includeSeedSegment}
            onChange={this.changeIncludeSegmentSeed}
          />
        </div>
        <div className='reachAndButton'>
          <div className='reach'>
            <FormattedMessage
              {...messages.reach}
              values={{
                userPointsMention: (
                  <Tag className='cohortGreenTag boldText'>
                    {graphData ? graphData.currentGraphPoint.nbUserpoints.toLocaleString() : '...'}{' '}
                    {formatMessage(messages.userpoints)}
                  </Tag>
                ),
                overlapMention: (
                  <Tag className='cohortGreenTag boldText'>
                    {graphData ? graphData?.currentGraphPoint.overlap : '...'}%{' '}
                    {formatMessage(messages.overlap)}
                  </Tag>
                ),
              }}
            />
            <Tooltip
              className='reachTooltip'
              title={
                graphData
                  ? `${graphData?.currentGraphPoint?.nbCohorts}/${cohorts.length} ${formatMessage(
                      messages.cohortsSelectedTip,
                    )}`
                  : '...'
              }
              placement='bottom'
            >
              <InfoCircleFilled />
            </Tooltip>
          </div>
          <Button
            className='mcs-primary'
            type='primary'
            disabled={this.shouldDisableButton()}
            onClick={this.saveLookalikeSettings}
          >
            <FormattedMessage {...messages.saveSettings} />
          </Button>
        </div>
        <AreaChartSlider
          data={graphData?.data || []}
          xAxis={{
            key: 'overlap',
            labelFormat: '{value}%',
            title: formatMessage(messages.areaChartSliderXAxisTitle),
            subtitle: formatMessage(messages.areaChartSliderXAxisSubtitle),
            reversed: true,
          }}
          yAxis={{
            key: 'nbUserpoints',
            title: formatMessage(messages.areaChartSliderYAxisTitle),
            subtitle: formatMessage(messages.areaChartSliderYAxisSubtitle),
          }}
          color='#00a1df'
          initialValue={initialIndex || 0}
          onChange={this.areaChartSliderOnChange}
          tipFormatter={this.tipFormatter}
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
