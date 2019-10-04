import { injectable } from 'inversify';
import { DataListResponse, DataResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../utils/LocationSearchHelper';
import { DashboardType, DashboardResource } from '../models/dashboards/dashboards';

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
    options: GetDashboardsOptions,
  ) => Promise<DataListResponse<DashboardResource>>;
  getDashboard: (
    dashboardId: string,
  ) => Promise<DataResponse<DashboardResource>>;
}

@injectable()
export class DashboardService implements IDashboardService {
  getDashboards(
    datamartId: string,
    options: GetDashboardsOptions = {},
  ): Promise<DataListResponse<DashboardResource>> {
    // const endpoint = 'dashboards';
    // const params = {
    //   ...options,
    // };
    // return ApiService.getRequest(endpoint, params);
    return Promise.resolve({ status: "ok" as any, data: myDashboards.filter(d => d.datamart_id === datamartId && (options.type ? d.type === options.type : true) ), count: myDashboards.filter(d => d.datamart_id === datamartId).length})
  }
  getDashboard(
    dashboardId: string,
  ): Promise<DataResponse<DashboardResource>> {
    // const endpoint = `dashboards/${dashboardId}`;
    // return ApiService.getRequest(endpoint);
    const foundDashboard = myDashboards.find(d => d.id === dashboardId);
    if (foundDashboard) {
      return  Promise.resolve({ status: "ok" as any, data: foundDashboard })
    }
    return Promise.reject({ status: "error" as any, message: "NOT_FOUND" })
  }
}

const myDashboards: DashboardResource[] = [
  {
    datamart_id: "1265",
    id: "1",
    name: "Home",
    type: "HOME",
    components: [
      {
        layout: {
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
          title: 'Pourcentage de visites reconnues',
        },
      },
      {
        layout: {
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
          title: 'Nombre de userpoints web',
        },
      },
      {
        layout: {
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
          title: 'Repartion des visites par type de profil matching',
          show_legend: true
        },
      },
     
    ]
  }
]
