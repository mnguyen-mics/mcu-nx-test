import { Card } from 'antd';
import * as React from 'react';
import { compose } from 'recompose';
import CohortCalibrationInProgress from './Calibration/CohortCalibrationInProgress';
import CohortLookalikeCalibrationSettings, {
  CohortCalibrationGraphPoint,
} from './CalibrationSettings/CohortLookalikeCalibrationSettings';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import {
  AudienceSegmentShape,
  UserLookalikeByCohortsSegment,
} from '@mediarithmics-private/advanced-components/lib/models/audienceSegment/AudienceSegmentResource';
import { IQueryService } from '../../../../../../services/QueryService';
import { OTQLAggregationResult } from '../../../../../../models/datamart/graphdb/OTQLResult';
import CohortCalibrationFailed from './Calibration/CohortCalibrationFailed';

interface CohortLookalikeCalibrationProps {
  cohortLookalikeSegment: UserLookalikeByCohortsSegment;
}

type Props = CohortLookalikeCalibrationProps & InjectedNotificationProps;

interface CohortLookalikeCalibrationState {
  isCalibrating: boolean;
  calibrationFailed: boolean;
  fetchedData?: {
    cohortLookalikeSegment: UserLookalikeByCohortsSegment;
    sourceSegment: AudienceSegmentShape;
    cohorts: CohortCalibrationGraphPoint[];
    similarityIndexInfos: SimilarityIndexInfos;
  };
}

export interface SimilarityIndexInfos {
  nbUserPointsInSegment: number;
  nbUserPointsInDatamart: number;
  segmentRatioInDatamart: number;
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

              const nbUserPointsInDatamart = perCohortBuckets.reduce((acc, b) => {
                return acc + b.count;
              }, 0);
              const nbUserPointsInSegment = perCohortAndSegmentBuckets.reduce((acc, b) => {
                return acc + b.count;
              }, 0);
              const segmentRatioInDatamart =
                nbUserPointsInSegment !== 0 && nbUserPointsInDatamart !== 0
                  ? nbUserPointsInSegment / nbUserPointsInDatamart
                  : 1;

              const similarityIndexInfos: SimilarityIndexInfos = {
                nbUserPointsInSegment: nbUserPointsInSegment,
                nbUserPointsInDatamart: nbUserPointsInDatamart,
                segmentRatioInDatamart: segmentRatioInDatamart,
              };

              const cohorts: CohortCalibrationGraphPoint[] = [];

              perCohortBuckets.forEach(b => {
                const cohortId = b.key;

                const nbUserpoints = b.count;

                const associatedAndSegmentB = perCohortAndSegmentBuckets.find(bb => {
                  return bb.key === cohortId;
                });

                const nbInCohortAndSegment = associatedAndSegmentB?.count || 0;

                const overlap = nbInCohortAndSegment / nbUserpoints;

                if (nbUserpoints !== 0) {
                  const cohort: CohortCalibrationGraphPoint = {
                    cohortNumber: +cohortId,
                    nbUserPoints: nbUserpoints,
                    nbUserPointsInSegment: nbInCohortAndSegment,
                    overlap: overlap,
                    similarityIndex: overlap / similarityIndexInfos.segmentRatioInDatamart,
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
                  similarityIndexInfos: similarityIndexInfos,
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

  render() {
    const { isCalibrating, fetchedData, calibrationFailed } = this.state;

    if (
      calibrationFailed ||
      (!isCalibrating &&
        fetchedData &&
        (fetchedData.similarityIndexInfos.nbUserPointsInSegment === 0 ||
          fetchedData.similarityIndexInfos.nbUserPointsInDatamart === 0))
    ) {
      return (
        <Card className='mcs-audienceSegmentDashboard_cohort_lookalike_calibration'>
          <CohortCalibrationFailed errorType={calibrationFailed ? 'GENERIC' : 'NO_USERPOINT'} />
        </Card>
      );
    } else if (isCalibrating || !fetchedData) {
      return (
        <Card className='mcs-audienceSegmentDashboard_cohort_lookalike_calibration'>
          <CohortCalibrationInProgress />
        </Card>
      );
    } else {
      return (
        <Card className='mcs-audienceSegmentDashboard_cohort_lookalike_calibration'>
          <CohortLookalikeCalibrationSettings
            cohortLookalikeSegment={fetchedData.cohortLookalikeSegment}
            seedSegment={fetchedData.sourceSegment}
            cohorts={fetchedData.cohorts}
            similarityIndexInfos={fetchedData.similarityIndexInfos}
          />
        </Card>
      );
    }
  }
}

export default compose<Props, CohortLookalikeCalibrationProps>(injectNotifications)(
  CohortLookalikeCalibration,
);
