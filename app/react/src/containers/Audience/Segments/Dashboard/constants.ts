import {
  PAGINATION_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import DataFileService from '../../../../services/DataFileService';
import { OverlapFileResource, OverlapItemResult, AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';

type QueryType = { types: string }

const typeSearchSetting = {
  paramName: 'types',
  defaultValue: [],
  deserialize: (query: QueryType) => {
    if (query.types) {
      return query.types.split(',');
    }
    return [];
  },
  serialize: (value: string[]) => value.join(','),
  isValid: (query: QueryType) => !query.types || query.types.split(',').length > 0,
};

export const SEGMENT_QUERY_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  typeSearchSetting,
];


export type AudienceReport = Array<{
  day: string;
  user_points: number;
  user_accounts: number;
  emails: number;
  desktop_cookie_ids: number;
  user_point_deletions: number;
  user_point_additions: number;
}>

export interface OverlapData {
  hasOverlap: boolean,
  isRunning: boolean,
  isInError: boolean,
  data: Data | null,
}

interface FormattedOverlapData {
  segment_source_id: string;
  segment_intersect_with: {
    id: string,
    name: string,
    segment_size: number,
  };
  overlap_number: number;
}

interface Data {
  date: number;
  formattedOverlap: Array<FormattedOverlapData | null>
}

let interval: any = null;

export function createOverlapAnalysis(datamartId: string, segmentId: string, organisationId: string) {
  return AudienceSegmentService.createOverlap(datamartId, segmentId)
    .then(res => {
      return new Promise((resolve, reject) => {
        interval = window.setInterval(async () => {
          const job = await AudienceSegmentService.retrieveOverlap(segmentId, {
            first_result: 0,
            max_results: 1,
          }).then(r => r.data)
          if (job.length) {
            const lastJob = job[0];
            if (lastJob.external_model_name === 'PUBLIC_AUDIENCE_SEGMENT') {
              if (!(lastJob.status === 'PENDING' || lastJob.status === 'RUNNING' || lastJob.status === 'SCHEDULED' || lastJob.status === 'WAITING_DEPENDENT_JOB')) {
                clearTimeout(interval)
                resolve()
              }
            } else {
              clearTimeout(interval)
              resolve()
            }
          }
        }, 1000)
      })
    })

}

export function stopInterval() {
  clearTimeout(interval)
}


export function fetchOverlapAnalysis(segmentId: string): Promise<OverlapData> {

  const formattedResponse = {
    hasOverlap: false,
    isRunning: false,
    isInError: false,
    data: null
  }

  return AudienceSegmentService.retrieveOverlap(segmentId, {
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
            return DataFileService.getDatafileData(datafileUri)
              .then(datafile => readOverlap(datafile))
              .then((parsedDataFile: OverlapFileResource) => formatOverlapResponse(parsedDataFile, segmentId))
              .then(formattedOverlapData => ({
                ...formattedResponse,
                hasOverlap: true,
                data: formattedOverlapData
              }))
              .catch(() => ({
                ...formattedResponse,
                isInError: true,
              }))
          } else if (lastJob.status === 'FAILED' || lastJob.status === 'EXECUTOR_NOT_RESPONDING' || lastJob.status === 'LOST') {
            return {
              ...formattedResponse,
              isInError: true,
            }
          } else if (lastJob.status === 'PENDING' || lastJob.status === 'RUNNING' || lastJob.status === 'SCHEDULED' || lastJob.status === 'WAITING_DEPENDENT_JOB') {
            return {
              ...formattedResponse,
              isRunning: true,
            }
          }
        } else {
          return {
            ...formattedResponse,
            hasOverlap: false
          }
        }
      }
      return {
        ...formattedResponse,
        hasOverlap: false
      }
    })
}

function readOverlap(datafile: Blob) {
  return new Promise(resolve => {
    const fileReader = new FileReader(); /* global FileReader */
    fileReader.onload = (fileLoadedEvent) => {
      const textFromFileLoaded = fileReader.result;
      return resolve(JSON.parse(textFromFileLoaded));
    };

    fileReader.readAsText(datafile, 'UTF-8');
  });
}

function formatOverlapResponse(overlapResult: OverlapFileResource, segmentId: string): Promise<Data | null> {
  const topOverlaps: OverlapItemResult[] = overlapResult.overlaps.sort((a, b) => {
    return a.overlap_number > b.overlap_number ? -1 : 1;
  }); // select 20 biggest overlpas

  const topSegments = topOverlaps.map(overlap => {
    return overlapResult.segments.find(
      s => s.segment_id === overlap.segment_intersect_with,
    ) || null;
  });

  const promises: Array<Promise<AudienceSegmentShape | null>> = [];

  topSegments.forEach((topsegment) => {
    if (topsegment) {
      promises.push(AudienceSegmentService.getSegment(topsegment.segment_id.toString()).then(res => res.data)
        .catch(() => Promise.resolve(null)))
    }
  })

  return Promise.all(promises)
    .then(segmentResources => {
      const formattedvalues: FormattedOverlapData[] = [];

      topOverlaps.forEach(to => {
        const isInOverlap = segmentResources.find(sr => sr ? sr.id === to.segment_intersect_with.toString() : false);
        if (isInOverlap) {
          const segmentInOverlap = topSegments.find(ts => ts ? ts.segment_id.toString() === isInOverlap.id : false);
          const segmentSize = segmentInOverlap ? segmentInOverlap.segment_size : 1;
          formattedvalues.push({
            ...to,
            segment_source_id: to.segment_source_id.toString(),
            segment_intersect_with: {
              id: to.segment_intersect_with.toString(),
              name: isInOverlap.name,
              segment_size: segmentSize
            }
          })
        }
      })
      return {
        date: overlapResult.date,
        formattedOverlap: formattedvalues
      };
    })
    .catch(() => null)
}