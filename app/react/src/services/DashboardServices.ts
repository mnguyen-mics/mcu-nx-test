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
      {
        layout: {
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
          plot_labels: ["2nd", "1rst_email_click", "1rst logged"],
          title: 'Nombre de user par type de profil matching',
          show_legend: false
        },
      },
      {
        layout: {
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
          plot_labels: ["Autres", "Basket View", "Purchase", "Search", "Email Click"],
          title: "Nombre d'évènements par typologie",
          show_legend: false
        },
      },
      {
        layout: {
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
          plot_labels: ["Contact CRM avec activités", "Contact CRM sans activités"],
          title: 'Activité web des contacts CRM ',
          show_legend: false
        },
      },
      {
        layout: {
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
          plot_labels: ["email clicks", "basket view", "purchase", "search"],
          title: "Nombre d'évènements par jour par typologie",
          labels_enabled: true
        },
      },
      {
        layout: {
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
          plot_labels: ["1rst", "2nd"],
          title: 'Nombre de visites par jour par type de profil matching',
          labels_enabled: true
        },
      },
      {
        layout: {
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
          plot_labels: ["tickets"],
          title: "Nombre de ticket réalisé par les contacts CRM sur les 12 derniers mois",
          labels_enabled: true
        },
      },
    ]
  },
  {
    id: "2",
    name: "Deterministic Insights",
    datamart_id: "1409",
    type: "SEGMENT",
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
          component_type: "PERCENTAGE",
          title: "English Users",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      }
    ]
  },
  {
    id: "2",
    name: "Home",
    datamart_id: "1409",
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
          component_type: "PERCENTAGE",
          title: "# of UserPoints",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
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
          component_type: "PERCENTAGE",
          title: "# of Page Views",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
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
          component_type: "PERCENTAGE",
          title: "% of Subscriptions",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
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
          component_type: "PERCENTAGE",
          title: "Gender Probalistic Reach",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      },
      {
        layout: {
          h: 1,
          static: false,
          w: 3,
          x: 0,
          y: 1,
        },
        component: {
          component_type: "PERCENTAGE",
          title: "Avg Bid Won",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      },
      {
        layout: {
          h: 1,
          static: false,
          w: 3,
          x: 3,
          y: 1,
        },
        component: {
          component_type: "PERCENTAGE",
          title: "Ad Slot Viewed per Page",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      },
      {
        layout: {
          h: 1,
          static: false,
          w: 3,
          x: 6,
          y: 1,
        },
        component: {
          component_type: "PERCENTAGE",
          title: "Avg Page View per Session",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      },
      {
        layout: {
          h: 1,
          static: false,
          w: 3,
          x: 9,
          y: 1,
        },
        component: {
          component_type: "PERCENTAGE",
          title: "Avg Session Duration",
          id: 1,
          query_id: "25525",
          total_query_id: "25526"
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 2,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Age Repartition",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 2,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Country Repartition",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 5,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Gender Repartition",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 5,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Plan Subscription Repartition",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 8,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Top URLS",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 8,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Top Tags",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 0,
          y: 11,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Top Sections",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      },
      {
        layout: {
          h: 3,
          static: false,
          w: 6,
          x: 6,
          y: 11,
        },
        component: {
          component_type: "TOP_INFO_COMPONENT",
          title: "Top Authors",
          id: 1,
          query_id: "25531",
          show_legend: false
        }
      }
    ]
  }
]
