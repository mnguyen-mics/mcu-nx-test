import { IDataFileService } from './../../../../services/DataFileService';
import { OverlapData, FormattedOverlapData, Data } from './constants';
import {
  OverlapFileResource,
  OverlapItemResult,
  AudienceSegmentShape,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { injectable, inject } from 'inversify';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';

export interface IOverlapInterval {
  fetchOverlapAnalysisLoop: (segmentId: string) => Promise<void>;
  createOverlapAnalysis: (
    datamartId: string,
    segmentId: string,
    organisationId: string,
  ) => Promise<any>;
  fetchOverlapAnalysis: (segmentId: string) => Promise<OverlapData>;
  formatOverlapResponse: (
    overlapResult: OverlapFileResource,
    segmentId: string,
  ) => Promise<Data | null>;
  stopInterval: () => void;
}

@injectable()
export class OverlapInterval implements IOverlapInterval {
  interval: number = 0;
  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @inject(TYPES.IDataFileService)
  private _dataFileService: IDataFileService;

  stopInterval() {
    clearTimeout(this.interval);
  }

  fetchOverlapAnalysisLoop(segmentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.interval = window.setInterval(() => {
        this._audienceSegmentService
          .retrieveOverlap(segmentId, {
            first_result: 0,
            max_results: 1,
          })
          .then(r => r.data)
          .then(job => {
            if (job.length) {
              const lastJob = job[0];
              if (lastJob.external_model_name === 'PUBLIC_AUDIENCE_SEGMENT') {
                if (
                  !(
                    lastJob.status === 'PENDING' ||
                    lastJob.status === 'RUNNING' ||
                    lastJob.status === 'SCHEDULED' ||
                    lastJob.status === 'WAITING_DEPENDENT_JOB'
                  )
                ) {
                  this.stopInterval();
                  resolve();
                }
              } else {
                this.stopInterval();
                resolve();
              }
            } else {
              this.stopInterval();
              resolve();
            }
          });
      }, 2000);
    });
  }

  createOverlapAnalysis(datamartId: string, segmentId: string, organisationId: string) {
    return this._audienceSegmentService.createOverlap(datamartId, segmentId).then(res => {
      return this.fetchOverlapAnalysisLoop(segmentId);
    });
  }
  fetchOverlapAnalysis = (segmentId: string): Promise<OverlapData> => {
    const formattedResponse = {
      hasOverlap: false,
      isRunning: false,
      isInError: false,
      data: null,
    };

    return this._audienceSegmentService
      .retrieveOverlap(segmentId, {
        first_result: 0,
        max_results: 1,
      })
      .then(res => res.data)
      .then(res => {
        if (res.length) {
          const lastJob = res[0];
          if (lastJob.external_model_name === 'PUBLIC_AUDIENCE_SEGMENT') {
            if (lastJob.status === 'SUCCEEDED') {
              const datafileUri = lastJob.output_result.result.data_file_uri;
              return this._dataFileService
                .getDatafileData(datafileUri)
                .then(datafile => readOverlap(datafile))
                .then((parsedDataFile: OverlapFileResource) =>
                  this.formatOverlapResponse(parsedDataFile, segmentId),
                )
                .then(formattedOverlapData => ({
                  ...formattedResponse,
                  hasOverlap: !!formattedOverlapData,
                  data: formattedOverlapData,
                }))
                .catch(() => ({
                  ...formattedResponse,
                  isInError: true,
                }));
            } else if (
              lastJob.status === 'FAILED' ||
              lastJob.status === 'EXECUTOR_NOT_RESPONDING' ||
              lastJob.status === 'LOST'
            ) {
              return {
                ...formattedResponse,
                isInError: true,
              };
            } else if (
              lastJob.status === 'PENDING' ||
              lastJob.status === 'RUNNING' ||
              lastJob.status === 'SCHEDULED' ||
              lastJob.status === 'WAITING_DEPENDENT_JOB'
            ) {
              return {
                ...formattedResponse,
                isRunning: true,
              };
            }
          } else {
            return {
              ...formattedResponse,
              hasOverlap: false,
            };
          }
        }
        return {
          ...formattedResponse,
          hasOverlap: false,
        };
      });
  };
  formatOverlapResponse(
    overlapResult: OverlapFileResource,
    segmentId: string,
  ): Promise<Data | null> {
    const topOverlaps: OverlapItemResult[] = overlapResult.overlaps.sort((a, b) => {
      return a.overlap_number > b.overlap_number ? -1 : 1;
    }); // sort overlaps

    const topSegments = topOverlaps.map(overlap => {
      return (
        overlapResult.segments.find(s => s.segment_id === overlap.segment_intersect_with) || null
      );
    });

    const promises: Array<Promise<AudienceSegmentShape | null>> = [];

    topSegments.forEach(topsegment => {
      if (topsegment) {
        promises.push(
          this._audienceSegmentService
            .getSegment(topsegment.segment_id.toString())
            .then(res => res.data)
            .catch(() => Promise.resolve(null)),
        );
      }
    });

    return Promise.all(promises)
      .then(segmentResources => {
        const formattedvalues: FormattedOverlapData[] = [];
        const segmentSourceSize = overlapResult.segments.find(
          seg => seg.segment_id.toString() === segmentId,
        )!.segment_size;
        const segmentSourceSizeAlt = overlapResult.overlaps.find(
          ovl =>
            ovl.segment_intersect_with.toString() === segmentId &&
            ovl.segment_source_id.toString() === segmentId,
        )!.overlap_number;

        topOverlaps.forEach(to => {
          const isInOverlap = segmentResources.find(sr =>
            sr ? sr.id === to.segment_intersect_with.toString() : false,
          );
          if (isInOverlap) {
            const segmentInOverlap = topSegments.find(ts =>
              ts ? ts.segment_id.toString() === isInOverlap.id : false,
            );
            const segmentSize = segmentInOverlap ? segmentInOverlap.segment_size : 1;
            formattedvalues.push({
              ...to,
              segment_source_id: to.segment_source_id.toString(),
              segment_source_size: segmentSourceSize || segmentSourceSizeAlt,
              segment_intersect_with: {
                id: to.segment_intersect_with.toString(),
                name: formatSegmentName(isInOverlap),
                segment_size: segmentSize,
              },
            });
          }
        });
        return {
          date: overlapResult.date,
          formattedOverlap: formattedvalues,
        };
      })
      .catch(() => null);
  }
}

const formatSegmentName = (segment: AudienceSegmentShape) => {
  let segmentName = segment.name;
  if (segment.type === 'USER_ACTIVATION') {
    if (segment.clickers) {
      segmentName = `${segmentName} - Clickers`;
    } else if (segment.exposed) {
      segmentName = `${segmentName} - Exposed`;
    }
  }
  return segmentName;
};

function readOverlap(datafile: Blob) {
  return new Promise(resolve => {
    const fileReader = new FileReader(); /* global FileReader */
    fileReader.onload = fileLoadedEvent => {
      const textFromFileLoaded = fileReader.result;
      return resolve(JSON.parse(textFromFileLoaded as string));
    };

    fileReader.readAsText(datafile, 'UTF-8');
  });
}
