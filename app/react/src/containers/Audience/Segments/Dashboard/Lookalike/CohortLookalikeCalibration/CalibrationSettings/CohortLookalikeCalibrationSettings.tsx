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
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
  includeSeedSegment: boolean;
  previousIncludeSeedSegment: boolean;
  graphData?: DataPoint[];
  selectedIndex?: number;
  previousSelectedIndex?: number;
  editMode: boolean;
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
    const { cohorts, seedSegment, cohortLookalikeSegment } = this.props;
    const { includeSeedSegment, selectedIndex, previousSelectedIndex } = this.state;

    const lookalikeSegmentMinOverlap =
      cohortLookalikeSegment.min_overlap !== undefined
        ? Math.floor(cohortLookalikeSegment.min_overlap * 100)
        : undefined;

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

    const newSelectedIndex =
      selectedIndex === undefined
        ? newGraphData.findIndex(graphPoint => {
            return graphPoint.overlap === lookalikeSegmentMinOverlap;
          })
        : selectedIndex;

    this.setState({
      selectedIndex: newSelectedIndex,
      previousSelectedIndex:
        previousSelectedIndex === undefined ? newSelectedIndex : previousSelectedIndex,
      graphData: newGraphData,
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
      const selectedDataPoint = graphData[selectedIndex];

      this._audienceSegmentService
        .updateAudienceSegment(cohortLookalikeSegment.id, {
          include_seed_segment: includeSeedSegment,
          user_points_target: selectedDataPoint.nbUserpoints,
          min_overlap: selectedDataPoint.overlap / 100,
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
    this.setState({ includeSeedSegment: checked }, () => {
      this.createGraphData();
    });
  };

  areaChartSliderOnChange = (index: number) => {
    this.setState({
      selectedIndex: index,
    });
  };

  tipFormatter = (selected: DataPoint) => {
    return <FormattedMessage {...messages.overlapTip} values={{ percentage: selected.overlap }} />;
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
      intl: { formatMessage },
    } = this.props;

    const { includeSeedSegment, graphData, selectedIndex, editMode, cohortLookalikeSegment } =
      this.state;

    const switchEditMode = (editMode: boolean) => this.setState({ editMode });

    /**
     * If user_points_target is set :
     * - Information in tags are sourced from user_points_target & min_overlap
     * If user_points_target is not set or if click on Edit those settings :
     * - Information in tags are sourced from the overlap calculation (using the 2 OTQL queries)
     */

    const dataPointSelected = selectedIndex !== undefined && graphData?.[selectedIndex];

    let userPointsTarget: number | undefined = dataPointSelected
      ? dataPointSelected.nbUserpoints
      : 0;

    let minOverlap: number | undefined = dataPointSelected ? dataPointSelected.overlap : 0;

    if (cohortLookalikeSegment.user_points_target && !editMode) {
      userPointsTarget = cohortLookalikeSegment.user_points_target;
      minOverlap = cohortLookalikeSegment.min_overlap
        ? cohortLookalikeSegment.min_overlap * 100
        : undefined;
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
                    nbUserPoints: <b>{(seedSegment.user_points_count || 0).toLocaleString()}</b>,
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
                        {userPointsTarget !== undefined ? userPointsTarget.toLocaleString() : '...'}{' '}
                        {formatMessage(messages.userpoints)}
                      </b>
                    </Tag>
                  ),
                  overlapMention: (
                    <Tag className={`cohortTag ${editMode && 'green'}`}>
                      <b>
                        {minOverlap !== undefined ? minOverlap : '...'}%{' '}
                        {formatMessage(messages.overlap)}
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
          data={graphData || []}
          isLoading={!graphData}
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
