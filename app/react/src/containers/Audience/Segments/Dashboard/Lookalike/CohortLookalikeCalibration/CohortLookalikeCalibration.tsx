import { Card } from 'antd';
import * as React from 'react';
import { compose } from 'recompose';
import CohortCalculationInProgress from './Calculation/CohortCalculationInProgress';
import CohortLookalikeCalibrationSettings, {
  CohortCalibrationGraphPoint,
} from './CalibrationSettings/CohortLookalikeCalibrationSettings';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { InjectedFeaturesProps, injectFeatures } from '../../../../../Features';
import {
  AudienceSegmentShape,
  UserLookalikeByCohortsSegment,
} from '@mediarithmics-private/advanced-components/lib/models/audienceSegment/AudienceSegmentResource';
import { IQueryService } from '../../../../../../services/QueryService';
import { OTQLAggregationResult } from '../../../../../../models/datamart/graphdb/OTQLResult';
import CohortCalculationFailed from './Calculation/CohortCalculationFailed';

interface CohortLookalikeCalibrationProps {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
}

type Props = CohortLookalikeCalibrationProps & InjectedNotificationProps & InjectedFeaturesProps;

interface CohortLookalikeCalibrationState {
  isCalibrating: boolean;
  calibrationFailed: boolean;
  fetchedData?: {
    cohortLookalikeSegment: UserLookalikeByCohortsSegment;
    sourceSegment: AudienceSegmentShape;
    cohorts: CohortCalibrationGraphPoint[];
  };
}

class CohortLookalikeCalibration extends React.Component<Props, CohortLookalikeCalibrationState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = { isCalibrating: true, calibrationFailed: false };
  }

  componentDidMount() {
    this.fetchInfos();
  }

  fetchInfos = () => {
    const { hasFeature } = this.props;

    hasFeature('audience-segments-cohort-lookalike-mocked-data')
      ? this.fetchMockedInfos()
      : this.fetchRealInfos();
  };

  fetchRealInfos = () => {
    const { cohortLookalikeSegment, notifyError } = this.props;
    this.setState({ isCalibrating: true }, () => {
      const cohortSegmentPromise = this._audienceSegmentService.getSegment(
        cohortLookalikeSegment.id,
      );

      const sourceSegmentPromise = this._audienceSegmentService.getSegment(
        cohortLookalikeSegment.source_segment_id,
      );
      Promise.all([sourceSegmentPromise, cohortSegmentPromise])
        .then(res => {
          const sourceSegment = res[0].data;
          const datamartId = sourceSegment.datamart_id;
          const cohortSegment = res[1].data as UserLookalikeByCohortsSegment;
          const volPerCohortOtqlQuery =
            'SELECT { clustering_cohort { cohort_id @map(limit:4096) } } FROM UserPoint';
          const volPerCohortQueryP = this._queryService.runOTQLQuery(
            datamartId,
            volPerCohortOtqlQuery,
            'DASHBOARD',
            'SEGMENT_DASHBOARD',
            { use_cache: false },
          );
          const volPerCohortAndSegmentOtqlQuery = `SELECT { clustering_cohort { cohort_id @map(limit:4096) } } FROM UserPoint WHERE segments { id = "${sourceSegment.id}" }`;
          const volPerCohortAndSegmentQueryP = this._queryService.runOTQLQuery(
            datamartId,
            volPerCohortAndSegmentOtqlQuery,
            'DASHBOARD',
            'SEGMENT_DASHBOARD',
            { use_cache: false },
          );

          Promise.all([volPerCohortQueryP, volPerCohortAndSegmentQueryP])
            .then(resPs => {
              const resVolPerCohortQuery = resPs[0].data;
              const resVolPerCohortAndSegmentQuery = resPs[1].data;

              const perCohortBuckets = (resVolPerCohortQuery.rows as OTQLAggregationResult[])[0]
                .aggregations.buckets[0].buckets;
              const perCohortAndSegmentBuckets = (
                resVolPerCohortAndSegmentQuery.rows as OTQLAggregationResult[]
              )[0].aggregations.buckets[0].buckets;

              const cohorts: CohortCalibrationGraphPoint[] = [];

              perCohortBuckets.forEach(b => {
                const cohortId = b.key;

                const nbUserpoints = b.count;

                const associatedAndSegmentB = perCohortAndSegmentBuckets.find(bb => {
                  return bb.key === cohortId;
                });

                if (associatedAndSegmentB && nbUserpoints !== 0) {
                  const cohort: CohortCalibrationGraphPoint = {
                    cohortNumber: +cohortId,
                    nbUserpoints: nbUserpoints,
                    overlap: (associatedAndSegmentB.count / nbUserpoints) * 100,
                  };
                  cohorts.push(cohort);
                }
              });

              cohorts.sort((a, b) => a.overlap - b.overlap);
              this.setState({
                isCalibrating: false,
                fetchedData: {
                  sourceSegment: sourceSegment,
                  cohorts,
                  cohortLookalikeSegment: cohortSegment,
                },
              });
            })
            .catch(err => {
              notifyError(err);
              this.setState({ isCalibrating: false, calibrationFailed: true });
            });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isCalibrating: false, calibrationFailed: true });
        });
    });
  };

  fetchMockedInfos = () => {
    const { cohortLookalikeSegment, notifyError } = this.props;
    this.setState({ isCalibrating: true }, () => {
      const cohortSegmentPromise = this._audienceSegmentService.getSegment(
        cohortLookalikeSegment.id,
      );
      const sourceSegmentPromise = this._audienceSegmentService.getSegment(
        cohortLookalikeSegment.source_segment_id,
      );

      Promise.all([sourceSegmentPromise, cohortSegmentPromise])
        .then(res => {
          const cohortSegment = res[1].data as UserLookalikeByCohortsSegment;
          const sourceSegment = res[0].data;
          const totalPop = 15000000;
          const cohorts = this.generateOrderedData(totalPop, 500);

          const meanSeedSegmentPop = totalPop / 30;
          const chosenSeedSegmentPop = Math.floor(meanSeedSegmentPop * (0.5 + Math.random()));

          const modifiedSourceSegment: AudienceSegmentShape = {
            ...sourceSegment,
            user_points_count: chosenSeedSegmentPop,
          };

          this.setState({
            isCalibrating: false,
            fetchedData: {
              cohortLookalikeSegment: cohortSegment,
              sourceSegment: modifiedSourceSegment,
              cohorts,
            },
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isCalibrating: true });
        });
    });
  };

  generateData = (
    totalPop: number,
    i: number,
    accu: CohortCalibrationGraphPoint[] = [],
  ): CohortCalibrationGraphPoint[] => {
    if (accu.length === i) return accu;
    {
      const overlap = Math.random() * 100;
      const meanNbPerCohort = totalPop / i;
      const graphPoint: CohortCalibrationGraphPoint = {
        cohortNumber: accu.length,
        nbUserpoints: Math.floor(meanNbPerCohort * (0.5 + Math.random())),
        overlap: overlap,
      };
      return this.generateData(totalPop, i, accu.concat(graphPoint));
    }
  };

  generateOrderedData = (
    totalPop: number,
    numberOfCohorts: number,
  ): CohortCalibrationGraphPoint[] => {
    return this.generateData(totalPop, numberOfCohorts).sort(
      (a: CohortCalibrationGraphPoint, b: CohortCalibrationGraphPoint) => {
        return b.overlap - a.overlap;
      },
    );
  };

  render() {
    const { isCalibrating, fetchedData, calibrationFailed } = this.state;
    return (
      <div>
        <Card className='mcs-audienceSegmentDashboard_cohort_lookalike_calibration'>
          {calibrationFailed ? (
            <CohortCalculationFailed />
          ) : isCalibrating || !fetchedData ? (
            <CohortCalculationInProgress />
          ) : (
            <CohortLookalikeCalibrationSettings
              cohortLookalikeSegment={fetchedData.cohortLookalikeSegment}
              seedSegment={fetchedData.sourceSegment}
              cohorts={fetchedData.cohorts}
            />
          )}
        </Card>
      </div>
    );
  }
}

export default compose<Props, CohortLookalikeCalibrationProps>(
  injectNotifications,
  injectFeatures,
)(CohortLookalikeCalibration);
