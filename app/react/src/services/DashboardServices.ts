import * as yup from 'yup';
import log from '../utils/Logger';
import { injectable, inject } from 'inversify';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../utils/LocationSearchHelper';
import {
  DashboardContentResource,
  DashboardResource,
  DashboardsOptions,
  DashboardType,
  DataFileDashboardResource,
} from '../models/dashboards/dashboards';
import { TYPES } from '../constants/types';
import { IDataFileService } from './DataFileService';
import cuid from 'cuid';
export interface GetDashboardsOptions extends PaginatedApiParam {
  organisation_id?: string;
  datamartId?: string;
  type?: DashboardType;
  keywords?: string;
  status?: string[];
  order_by?: string[];
}

export const SCENARIOS_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...FILTERS_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
];

export interface IDashboardService {
  /*****   DASHBOARD RESOURCE   *****/

  getDashboards: (
    datamartId: string,
    organisationId: string,
    options?: DashboardsOptions,
  ) => Promise<DataListResponse<DashboardResource>>;

  getDashboardContent: (
    datamartId: string,
    organisationId: string,
    dashboardId: string,
  ) => Promise<DashboardContentResource>;

  getDataFileDashboards: (
    organisationId: string,
    datamartId: string,
    type: 'HOME' | 'SEGMENT',
    options?: GetDashboardsOptions,
  ) => Promise<DataListResponse<DataFileDashboardResource>>;

  getDataFileSegmentDashboards: (
    organisationId: string,
    datamartId: string,
    segmentId: string,
    options?: GetDashboardsOptions,
  ) => Promise<DataListResponse<DataFileDashboardResource>>;

  getDataFileStandardSegmentBuilderDashboards: (
    organisationId: string,
    datamartId: string,
    standardSegmentBuilderId: string,
    options?: GetDashboardsOptions,
  ) => Promise<DataListResponse<DataFileDashboardResource>>;

  getDefaultDashboard: (dashboardId: string) => Promise<DataResponse<DataFileDashboardResource>>;
}

const readFile = (b: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      return resolve(reader.result as string);
    };
    reader.onerror = r => {
      return reject(r);
    };
    reader.readAsText(b);
  });

const dashboardsSchema = yup.array().of(
  yup.object().shape({
    id: yup.string().required(),
    type: yup.string().required(),
    datamart_id: yup.string().required(),
    name: yup.string().required(),
    components: yup.array(
      yup.object().shape({
        layout: yup.object().shape({
          i: yup.string(),
          x: yup.number().required(),
          y: yup.number().required(),
          w: yup.number().required(),
          h: yup.number().required(),
        }),
        component: yup
          .object()
          .required()
          .shape({
            id: yup.string().required(),
            component_type: yup
              .string()
              .required()
              .oneOf([
                'MAP_BAR_CHART',
                'MAP_PIE_CHART',
                'DATE_AGGREGATION_CHART',
                'COUNT',
                'PERCENTAGE',
                'GAUGE_PIE_CHART',
                'MAP_STACKED_BAR_CHART',
                'MAP_INDEX_CHART',
                'WORLD_MAP_CHART',
                'COUNT_BAR_CHART',
                'COUNT_PIE_CHART',
                'TOP_INFO_COMPONENT',
                'MAP_RADAR_CHART',
              ]),
            title: yup.string().required(),
            description: yup.string(),
          }),
      }),
    ),
  }),
);

@injectable()
export class DashboardService implements IDashboardService {
  @inject(TYPES.IDataFileService)
  private _datafileService!: IDataFileService;

  getDashboards(
    datamartId: string,
    organisationId: string,
    options?: DashboardsOptions,
  ): Promise<any> {
    const endpointLegacy = `datamarts/${datamartId}/dashboards`;
    const endpoint = `dashboards`;
    const paramsLegacy = {
      archived: options?.archived,
    };
    const params = {
      archived: options?.archived,
      searching_organisation_id: organisationId,
    };
    return (
      ApiService.getRequest(endpoint, params)
        // TODO: remove this logic after the complete delivery of MICS-10725
        .then(result => {
          return result;
        })
        .catch(err => {
          if (err.error && err.error.includes('Route') && err.error.includes('Not Found')) {
            return ApiService.getRequest(endpointLegacy, paramsLegacy).then(result => {
              return result;
            });
          } else throw err;
        })
    );
  }

  getDashboardContent(
    datamartId: string,
    organisationId: string,
    dashboardId: string,
  ): Promise<any> {
    const endpointLegacy = `datamarts/${datamartId}/dashboards/${dashboardId}/content`;
    const endpoint = `dashboards/${dashboardId}/content`;

    const params = {
      organisation_id: organisationId,
    };

    return (
      ApiService.getRequest(endpoint, params)
        // TODO: remove this logic after the complete delivery of MICS-10725
        .then(result => {
          return result;
        })
        .catch(err => {
          if (err.error && err.error.includes('Route') && err.error.includes('Not Found')) {
            return ApiService.getRequest(endpointLegacy)
              .then(result => {
                return result;
              })
              .catch(err2 => {
                throw err2;
              });
          } else throw err;
        })
    );
  }

  getDataFileDashboards(
    organisationId: string,
    datamartId: string,
    type: 'HOME' | 'SEGMENT' | 'AUDIENCE_BUILDER',
    options: GetDashboardsOptions = {},
  ): Promise<DataListResponse<DataFileDashboardResource>> {
    const hardcodedDashboards = myDashboards.filter(
      d => d.datamart_id === datamartId && d.type === type,
    );

    return new Promise((resolve, reject) => {
      return this._datafileService
        .getDatafileData(
          `mics://data_file/tenants/${organisationId}/dashboards/${datamartId}/${type}.json`,
        )
        .then((b: Blob) => {
          return readFile(b);
        })
        .then(s => {
          // validate with yup
          return JSON.parse(s);
        })
        .then((s: object) => {
          return dashboardsSchema.validate(s).then(v => {
            if ((v as any).name === 'ValidationError') {
              throw new Error((v as any).message);
            }
            return v as any;
          });
        })
        .then(s => {
          return resolve({
            status: 'ok' as any,
            data: s as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        })
        .catch(e => {
          log.debug(e);
          return resolve({
            status: 'ok' as any,
            data: hardcodedDashboards as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        });
    });
  }

  getDataFileSegmentDashboards(
    organisationId: string,
    datamartId: string,
    segmentId: string,
    options: GetDashboardsOptions = {},
  ): Promise<DataListResponse<DataFileDashboardResource>> {
    const hardcodedDashboards = myDashboards.filter(
      d => d.datamart_id === datamartId && d.type === 'SEGMENT',
    );

    return new Promise((resolve, reject) => {
      return this._datafileService
        .getDatafileData(
          `mics://data_file/tenants/${organisationId}/dashboards/${datamartId}/SEGMENT-${segmentId}.json`,
        )
        .then(
          d => d,
          () =>
            this._datafileService.getDatafileData(
              `mics://data_file/tenants/${organisationId}/dashboards/${datamartId}/SEGMENT.json`,
            ),
        )
        .then((b: Blob) => {
          return readFile(b);
        })
        .then(s => {
          // validate with yup
          return JSON.parse(s);
        })
        .then((s: object) => {
          return dashboardsSchema.validate(s).then(v => {
            if ((v as any).name === 'ValidationError') {
              throw new Error((v as any).message);
            }
            return v as any;
          });
        })
        .then(s => {
          return resolve({
            status: 'ok' as any,
            data: s as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        })
        .catch(e => {
          log.debug(e);
          return resolve({
            status: 'ok' as any,
            data: hardcodedDashboards as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        });
    });
  }

  getDataFileStandardSegmentBuilderDashboards(
    organisationId: string,
    datamartId: string,
    standardSegmentBuilderId: string,
    options: GetDashboardsOptions = {},
  ): Promise<DataListResponse<DataFileDashboardResource>> {
    const hardcodedDashboards = myDashboards.filter(
      d => d.datamart_id === datamartId && d.type === 'AUDIENCE_BUILDER',
    );

    return new Promise((resolve, reject) => {
      return this._datafileService
        .getDatafileData(
          `mics://data_file/tenants/${organisationId}/dashboards/${datamartId}/AUDIENCE_BUILDER-${standardSegmentBuilderId}.json`,
        )
        .then(
          d => d,
          () =>
            this._datafileService.getDatafileData(
              `mics://data_file/tenants/${organisationId}/dashboards/${datamartId}/AUDIENCE_BUILDER.json`,
            ),
        )
        .then((b: Blob) => {
          return readFile(b);
        })
        .then(s => {
          // validate with yup
          return JSON.parse(s);
        })
        .then((s: object) => {
          return dashboardsSchema.validate(s).then(v => {
            if ((v as any).name === 'ValidationError') {
              throw new Error((v as any).message);
            }
            return v as any;
          });
        })
        .then(s => {
          return resolve({
            status: 'ok' as any,
            data: s as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        })
        .catch(e => {
          log.debug(e);
          return resolve({
            status: 'ok' as any,
            data: hardcodedDashboards as DataFileDashboardResource[],
            count: hardcodedDashboards.filter(d => d.datamart_id === datamartId).length,
          });
        });
    });
  }

  getDefaultDashboard(dashboardId: string): Promise<DataResponse<DataFileDashboardResource>> {
    // const endpoint = `dashboards/${dashboardId}`;
    // return ApiService.getRequest(endpoint);
    const foundDashboard = myDashboards.find(d => d.id === dashboardId);
    if (foundDashboard) {
      return Promise.resolve({ status: 'ok' as any, data: foundDashboard });
    }
    return Promise.reject({ status: 'error' as any, message: 'NOT_FOUND' });
  }
}

const myDashboards: DataFileDashboardResource[] = [
  {
    datamart_id: '1265',
    id: '1',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          query_id: '25344',
          total_query_id: '25345',
          title: 'Pourcentage de visites reconnues (30j)',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          query_id: '25365',
          title: 'Nombre de tickets global',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          query_id: '25346',
          title: 'Nombre de contacts CRM',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          query_id: '25347',
          title: 'Nombre de UserPoints web',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          query_id: '25348',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['25349', '25350', '25351'],
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['25352', '25353', '25354', '25355', '25356'],
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['25357', '25358'],
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['25398', '25399', '25400', '25401'],
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['25359', '25360'],
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['25362'],
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
    ],
  },
  {
    datamart_id: '1365',
    id: '2',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          query_id: '27824',
          total_query_id: '27825',
          title: 'Pourcentage de visites reconnues (30j)',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          query_id: '27826',
          title: 'Nombre de tickets global',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          query_id: '27827',
          title: 'Nombre de contacts CRM',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          query_id: '27828',
          title: 'Nombre de UserPoints web',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          query_id: '27832',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27833', '27834', '27835'],
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27836', '27837', '27838', '27839', '27840'],
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27841', '27842'],
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27844', '27845', '27846', '27847'],
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27848', '27849'],
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27850'],
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
    ],
  },
  {
    datamart_id: '1298',
    id: '3',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          query_id: '27868',
          total_query_id: '27870',
          title: 'Pourcentage de visites reconnues (30j)',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          query_id: '27873',
          title: 'Nombre de tickets global',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          query_id: '27871',
          title: 'Nombre de contacts CRM',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          query_id: '27872',
          title: 'Nombre de UserPoints web',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          query_id: '27874',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27875', '27876', '27877'],
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de users par type de profil matching (30j)',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27878', '27879', '27880', '27881', '27882'],
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          query_ids: ['27883', '27884'],
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27890', '27891', '27892', '27894'],
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27885', '27886'],
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          query_ids: ['27895'],
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
        },
      },
    ],
  },
  {
    id: '4',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29525',
          total_query_id: '29521',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29523',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29526',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29522',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29524',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de users par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29529', '29532', '29531'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29527', '29528', '29530', '29533', '29534'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29535', '29537'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29536', '29538', '29539', '29542'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29572', '29574'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29541'],
        },
      },
    ],
    datamart_id: '1287',
  },
  {
    id: '5',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29690',
          total_query_id: '29688',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29696',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29691',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29692',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29689',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29695', '29700', '29694'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29697', '29693', '29702', '29699', '29698'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29701', '29703'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29706', '29705', '29704', '29707'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29709', '29708'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29710'],
        },
      },
    ],
    datamart_id: '1277',
  },
  {
    id: '6',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29714',
          total_query_id: '29712',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29713',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29715',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29716',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29711',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29720', '29717', '29718'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29722', '29721', '29719', '29726', '29723'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29724', '29728'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29725', '29727', '29729', '29731'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29732', '29730'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29733'],
        },
      },
    ],
    datamart_id: '1271',
  },
  {
    id: '7',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29854',
          total_query_id: '29852',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29853',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29855',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29856',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29857',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29861', '29858', '29862'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29859', '29863', '29860', '29865', '29866'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29864', '29868'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29867', '29869', '29870', '29872'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29871', '29873'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29874'],
        },
      },
    ],
    datamart_id: '1296',
  },
  {
    id: '8',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29759',
          total_query_id: '29763',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29758',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29761',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29760',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29762',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29764', '29766', '29767'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29765', '29770', '29769', '29768', '29771'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29772', '29773'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29778', '29774', '29775', '29776'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29779', '29777'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29780'],
        },
      },
    ],
    datamart_id: '1291',
  },
  {
    id: '9',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29782',
          total_query_id: '29785',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29784',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29783',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29787',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29786',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29788', '29792', '29790'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29789', '29791', '29793', '29796', '29797'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29795', '29794'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29799', '29798', '29800', '29804'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29801', '29803'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29802'],
        },
      },
    ],
    datamart_id: '1300',
  },
  {
    id: '10',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '29807',
          total_query_id: '29805',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '29809',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '29810',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '29808',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '29806',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['29813', '29816', '29814'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['29811', '29812', '29815', '29818', '29821'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['29817', '29820'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29819', '29822', '29823', '29825'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29824', '29826'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['29827'],
        },
      },
    ],
    datamart_id: '1299',
  },
  {
    id: '11',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '32028',
          total_query_id: '32025',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '32029',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '32024',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '32027',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '32026',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['32031', '32030', '32032'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['32033', '32036', '32035', '32037', '32034'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['32038', '32039'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['32043', '32042', '32040', '32041'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['32044', '32045'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['32046'],
        },
      },
    ],
    datamart_id: '1382',
  },
  {
    id: '12',
    name: 'Home',
    type: 'HOME',
    datamart_id: '1409',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of UserPoints',
          query_id: '30905',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Page Views (30d)',
          query_id: '32072',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Sessions (30d)',
          query_id: '32073',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Logged In Users (30d)',
          query_id: '30915',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'DATE_AGGREGATION_CHART',
          title: 'Active UserPoint Per Day (30d)',
          plot_labels: ['Non Identified UserPoints', 'Identified UserPoints'],
          query_ids: ['30926', '30927'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Declarative Gender Repartition',
          query_id: '30930',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Interests',
          query_id: '30932',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'COUNT_BAR_CHART',
          title: 'Age Repartition',
          query_ids: ['30942', '30941', '30940', '30939', '30938'],
          labels_enabled: true,
          show_legend: false,
          plot_labels: ['18-25', '25-35', '35-45', '45-55', '55+'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Sections Viewed',
          query_id: '30943',
          show_legend: true,
        },
      },
    ],
  },
  {
    id: '13',
    name: 'Insights',
    type: 'SEGMENT',
    datamart_id: '1409',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of UserPoints',
          query_id: '30905',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 4,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Active UserPoint (30d)',
          query_id: '30906',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 8,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Logged In Users (30d)',
          query_id: '30915',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'DATE_AGGREGATION_CHART',
          title: 'Active UserPoint Per Day (30d)',
          plot_labels: ['Non Identified UserPoints', 'Identified UserPoints'],
          query_ids: ['30926', '30927'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Declarative Gender Repartition',
          query_id: '30930',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Interests',
          query_id: '30932',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'COUNT_BAR_CHART',
          title: 'Age Repartition',
          query_ids: ['30942', '30941', '30940', '30939', '30938'],
          labels_enabled: true,
          show_legend: false,
          plot_labels: ['18-25', '25-35', '35-45', '45-55', '55+'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Sections Viewed',
          query_id: '30943',
          show_legend: true,
        },
      },
    ],
  },
  {
    id: '14',
    name: 'Home',
    type: 'HOME',
    datamart_id: '1436',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of UserPoints',
          query_id: '32693',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Transactions (30d)',
          query_id: '32694',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Basket View (30d)',
          query_id: '32695',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Logged In Users (30d)',
          query_id: '32696',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'DATE_AGGREGATION_CHART',
          title: 'Active UserPoint Per Day (30d)',
          plot_labels: ['UserPoints'],
          query_ids: ['32697'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Declarative Gender Repartition',
          query_id: '32698',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Interests',
          query_id: '32699',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'COUNT_BAR_CHART',
          title: 'Age Repartition',
          query_ids: ['32704', '32705', '32706', '32707', '32708'],
          labels_enabled: true,
          show_legend: false,
          plot_labels: ['18-25', '25-35', '35-45', '45-55', '55+'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Product Viewed',
          query_id: '32709',
          show_legend: true,
        },
      },
    ],
  },
  {
    id: '15',
    name: 'Insights',
    type: 'SEGMENT',
    datamart_id: '1436',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of UserPoints',
          query_id: '32693',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 4,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of UserPoint With Purchase (30d)',
          query_id: '32711',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 4,
          x: 8,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'COUNT',
          title: '# of Logged In Users (30d)',
          query_id: '32696',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'DATE_AGGREGATION_CHART',
          title: 'Active UserPoint Per Day (30d)',
          plot_labels: ['UserPoint'],
          query_ids: ['32697'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Declarative Gender Repartition',
          query_id: '32698',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Interests',
          query_id: '32699',
          show_legend: true,
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'COUNT_BAR_CHART',
          title: 'Age Repartition',
          query_ids: ['32704', '32705', '32706', '32707', '32708'],
          labels_enabled: true,
          show_legend: false,
          plot_labels: ['18-25', '25-35', '35-45', '45-55', '55+'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 4,
        },
        component: {
          id: 1,
          component_type: 'MAP_PIE_CHART',
          title: 'Product Viewed',
          query_id: '32709',
          show_legend: true,
        },
      },
    ],
  },
  {
    id: '16',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '33033',
          total_query_id: '33037',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '33032',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '33034',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '33036',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartion des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '33035',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de user par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['33039', '33041', '33040'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['33042', '33038', '33043', '33045', '33047'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['33044', '33046'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['33048', '33049', '33050', '33052'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['33053', '33051'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['33054'],
        },
      },
    ],
    datamart_id: '1433',
  },
  {
    id: '17',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '36419',
          total_query_id: '36415',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '36416',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '36414',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '36413',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '36417',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de users par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['36420', '36418', '36423'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['36421', '36422', '36424', '36429', '36425'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['36426', '36427'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['36428', '36430', '36433', '36431'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['36432', '36434'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['36435'],
        },
      },
    ],
    datamart_id: '1458',
  },
  {
    id: '18',
    name: 'Home',
    type: 'HOME',
    components: [
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 0,
        },
        component: {
          id: 1,
          component_type: 'PERCENTAGE',
          title: 'Pourcentage de visites reconnues (30j)',
          query_id: '37756',
          total_query_id: '37760',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 0,
        },
        component: {
          id: 2,
          component_type: 'COUNT',
          title: 'Nombre de tickets global',
          query_id: '37758',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 0,
        },
        component: {
          id: 3,
          component_type: 'COUNT',
          title: 'Nombre de contacts CRM',
          query_id: '37759',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 0,
        },
        component: {
          id: 4,
          component_type: 'COUNT',
          title: 'Nombre de UserPoints web',
          query_id: '37757',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'MAP_PIE_CHART',
          title: 'Répartition des visites par type de profil matching (30j)',
          show_legend: true,
          query_id: '37761',
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 1,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['2nd', '1st_email_click', '1st logged'],
          title: 'Nombre de users par type de profil matching (30j)',
          show_legend: false,
          query_ids: ['37762', '37764', '37763'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Page View', 'Basket View', 'Purchase', 'Search', 'Email Click'],
          title: "Nombre d'évènements web par typologie (30j)",
          show_legend: false,
          query_ids: ['37765', '37766', '37767', '37768', '37771'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 4,
        },
        component: {
          id: 5,
          component_type: 'COUNT_PIE_CHART',
          labels_enabled: true,
          plot_labels: ['Contact CRM avec activités', 'Contact CRM sans activités'],
          title: 'Activité web des contacts CRM ',
          show_legend: false,
          query_ids: ['37772', '37769'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 7,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['email clicks', 'basket view', 'purchase', 'search'],
          title: "Nombre d'évènements web par jour par typologie (30j)",
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['37770', '37774', '37773', '37776'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 10,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['1st', '2nd'],
          title: 'Nombre de visites par jour par type de profil matching (30j)',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['37775', '37778'],
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 13,
        },
        component: {
          id: 5,
          component_type: 'DATE_AGGREGATION_CHART',
          plot_labels: ['tickets'],
          title: 'Nombre de tickets réalisés par les contacts CRM',
          labels_enabled: true,
          format: 'YYYY/MM/DD',
          query_ids: ['37777'],
        },
      },
    ],
    datamart_id: '1309',
  },
  {
    id: '19',
    name: 'Demographics',
    type: 'HOME',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Gender',
          query_id: '38036',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Age',
          query_id: '38037',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Status',
          query_id: '37670',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Composition',
          query_id: '37670',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Income',
          query_id: '37670',
          // compared_query_id: '37670',
          percentage: true,
          show_legend: true,
          vertical: false,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '20',
    name: 'Psychographics',
    type: 'HOME',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_RADAR_CHART',
          title: 'Top 10 Interests',
          query_id: '37670',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '21',
    name: 'Behavioral',
    type: 'HOME',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Purchase Intent by Category',
          query_id: '37673',
          shouldCompare: false,
          percentage: true,
          show_legend: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '22',
    name: 'Media Touch Points',
    type: 'HOME',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'App Categories',
          query_id: '37670',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Top 10 Apps',
          query_id: '37670',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '23',
    name: 'Demographics',
    type: 'SEGMENT',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Gender',
          query_id: '38036',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Age',
          query_id: '38037',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Status',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Composition',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Income',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: false,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '24',
    name: 'Psychographics',
    type: 'SEGMENT',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_RADAR_CHART',
          title: 'Top 10 Interests',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '25',
    name: 'Behavioral',
    type: 'SEGMENT',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Purchase Intent by Category',
          query_id: '37673',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '26',
    name: 'Media Touch Points',
    type: 'SEGMENT',
    datamart_id: '1459',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'App Categories',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Top 10 Apps',
          query_id: '37670',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },

  // converged poland

  {
    id: '27',
    name: 'Demographics',
    type: 'HOME',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Gender',
          query_id: '38689',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Age',
          query_id: '38690',
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Status',
          query_id: '38691',
          // NOK
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Composition',
          query_id: '38692',
          // NOK
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Income',
          query_id: '38693',
          // NOK
          // compared_query_id: '37670',
          percentage: true,
          show_legend: true,
          vertical: false,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '28',
    name: 'Psychographics',
    type: 'HOME',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_RADAR_CHART',
          title: 'Top 10 Interests',
          query_id: '38694',
          // NOK
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '29',
    name: 'Behavioral',
    type: 'HOME',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Purchase Intent by Category',
          query_id: '38695',
          shouldCompare: false,
          percentage: true,
          show_legend: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '30',
    name: 'Media Touch Points',
    type: 'HOME',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'App Categories',
          query_id: '38696',
          // NOK
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Top 10 Apps',
          query_id: '38697',
          // NOK
          // compared_query_id: '37513',
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '31',
    name: 'Demographics',
    type: 'SEGMENT',
    datamart_id: '1500',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Gender',
          query_id: '38689',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Age',
          query_id: '38690',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          sortKey: 'A-Z',
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 0,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Status',
          query_id: '38691',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 4,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Family Composition',
          query_id: '38692',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 4,
          x: 8,
          y: 3,
        },
        component: {
          // select {profiles{demographic{personal_attributes{age_range @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Income',
          query_id: '38693',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: false,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '32',
    name: 'Psychographics',
    type: 'SEGMENT',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_RADAR_CHART',
          title: 'Top 10 Interests',
          query_id: '38694',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '33',
    name: 'Behavioral',
    type: 'SEGMENT',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 12,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Purchase Intent by Category',
          query_id: '38695',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
  {
    id: '34',
    name: 'Media Touch Points',
    type: 'SEGMENT',
    datamart_id: '1466',
    components: [
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'App Categories',
          query_id: '38696',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
      {
        layout: {
          i: cuid(),
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 0,
        },
        component: {
          // select {profiles{demographic{personal_attributes{gender @map}}}} from UserPoint
          id: 1,
          component_type: 'MAP_BAR_CHART',
          title: 'Top 10 Apps',
          query_id: '38697',
          shouldCompare: true,
          percentage: true,
          show_legend: true,
          vertical: true,
          labels: {
            enable: true,
            filterValue: 0,
            format: '{point.y}%',
          },
          tooltip: {
            formatter: '{point.y}% ({point.count})',
          },
        },
      },
    ],
  },
];
