import { camelizeKeys } from 'humps';
import ApiService from './ApiService';

export type ServiceType = 'AUDIENCE_DATA' | 'DISPLAY_CAMPAIGN';
export type ServiceFamily =
  'AUDIENCE_DATA.AUDIENCE_SEGMENT' |
  'AUDIENCE_DATA.USER_DATA_TYPE' |
  'DISPLAY_CAMPAIGN.ADEX_INVENTORY' |
  'DISPLAY_CAMPAIGN.REAL_TIME_BIDDING' |
  'DISPLAY_CAMPAIGN.VISIBILITY';
export type ServiceCategoryType =
  'AUDIENCE';
export type ServiceCategorySubType =
  'AUDIENCE.AGE' |
  'AUDIENCE.GENDER';
export type Locale = 'en_US' | 'fr_FR';

export interface ServiceItemPublicResource {
  id: string;
  // locale: Locale;
  name: string;
  description?: string;
  providerId?: string;
  categoryId?: string;
  listWeight?: number;
  serviceType?: ServiceType;
  [key: string]: any;
}

export interface AudienceSegmentServiceItemPublicResource extends ServiceItemPublicResource {
  segmentId: string;
  datamartId: string;
}

export interface AdexInventoryServiceItemPublicResource extends ServiceItemPublicResource {
  adExchangeHubKey: string;
}

export type ServiceItemShape = AudienceSegmentServiceItemPublicResource | AdexInventoryServiceItemPublicResource;

export interface ServiceCategoryPublicResource {
  id: string;
  // locale: Locale;
  name: string;
  description?: string;
  providerId?: string;
  parentCategoryId?: string;
  categorySubType?: string;
  listWeight?: number;
}

export interface ServiceCategoryTree {
  node: ServiceCategoryPublicResource;
  children: ServiceCategoryTree[];
  services?: ServiceCategoryPublicResource[];
}

const fakeTree: ServiceCategoryTree[] = [{
  node: {
    id: '1',
    name: 'Intérêts',
  },
  children: [{
    node: {
      id: '1-1',
      name: 'Industrie et Service',
    },
    children: [],
  }],
}, {
  node: { id: '2', name: 'Passion' },
  children: [],
}];

// const fakeServices: ServiceItemPublicResource[] = [{
//   id: 'cat1',
//   categoryId: '1-1',
//   name: 'Automobile',
//   description: 'Note about automobile segment',
// }, {
//   id: 'cat2',
//   categoryId: '1-1',
//   name: 'Aéronautique',
//   description: 'Note about aéro',
// }] as ServiceItemPublicResource[];

const CatalogService = {

  getCategoryTree(
    organisationId: string,
    options: {
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
    } = {},
  ): Promise<ServiceCategoryTree[]> {
    // const endpoint = `/subscribed_services/${organisationId}/category_trees`;
    // const params = decamelizeKeys(options);
    // return ApiService.getRequest(endpoint, params).then(res => camelizeKeys(res.data) as ServiceCategoryTree[]);
    return new Promise<ServiceCategoryTree[]>((resolve, reject) => {
      setTimeout(() => {
        resolve(fakeTree);
      }, 500);
    });
  },

  getCategory(
    organisationId: string,
    categoryId: string,
  ): Promise<ServiceCategoryPublicResource> {
    const endpoint = `/subscribed_services/${organisationId}/categories/${categoryId}`;
    return ApiService.getRequest(endpoint).then(res => camelizeKeys(res.data) as ServiceCategoryPublicResource);
  },

  getCategories(
    organisationId: string,
    options: {
      root?: boolean,
      parentCategoryId?: string,
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
    } = {},
  ): Promise<ServiceCategoryPublicResource[]> {
    // const endpoint = `/subscribed_services/${organisationId}/categories`;
    // const params = decamelizeKeys(options);
    // return ApiService.getRequest(endpoint, params).then(res => camelizeKeys(res.data) as ServiceCategoryPublicResource[]);
    return new Promise<ServiceCategoryPublicResource[]>((resolve, reject) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  },

  getServices(
    organisationId: string,
    options: {
      root?: boolean,
      parentCategoryId?: string,
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
      searchDepth?: number,
    } = {},
  ): Promise<ServiceItemPublicResource[]> {
    // const endpoint = `/subscribed_services/${organisationId}/services`;
    // const params = decamelizeKeys(options);
    // return ApiService.getRequest(endpoint, params).then(res => camelizeKeys(res.data) as ServiceItemPublicResource[]);
    return new Promise<ServiceItemPublicResource[]>((resolve, reject) => {
      setTimeout(() => {

        const { categorySubtype, parentCategoryId } = options;
        if (categorySubtype && categorySubtype.includes('AUDIENCE.AGE')) {
          resolve([{
            id: 'age1',
            name: '20-25 ans (Behavioral)',
            segmentId: '1',
          }, {
            id: 'age2',
            name: '20-25 ans (CRM)',
            segmentId: '2',
          }, {
            id: 'age3',
            name: 'age3',
            segmentId: '3',
          }, {
            id: 'age4',
            name: 'age4',
            segmentId: '4',
          }, {
            id: 'age5',
            name: 'age5',
            segmentId: '5',
          }, {
            id: 'age6',
            name: 'age6',
            segmentId: '6',
          }, {
            id: 'age7',
            name: 'age7',
            segmentId: '7',
          }, {
            id: 'age8',
            name: 'age8',
            segmentId: '8',
          }, {
            id: 'age9',
            name: 'age9',
            segmentId: '9',
          }, {
            id: 'age10',
            name: 'age10',
            segmentId: '10',
          }]);
        } else if (categorySubtype && categorySubtype.includes('AUDIENCE.GENDER')) {
          resolve([{
            id: 'gender1',
            name: 'Male (Behavioral)',
            segmentId: '3',
          }, {
            id: 'gender2',
            name: 'Male (CRM)',
            segmentId: '4',
          }]);
        } else if (parentCategoryId === '2') {
          resolve([{
            id: '2-1',
            name: 'Sport',
            segmentId: '4196',
          }, {
            id: '2-2',
            name: 'Cinéma',
            segmentId: '4521',
          }]);
        } else if (parentCategoryId === '1-1') {
          resolve([{
            id: '1-1-1',
            name: 'Automobile',
            segmentId: '3577',
          }, {
            id: '1-1-2',
            name: 'Aéronautique',
            segmentId: '4527',
          }]);
        }

        resolve([]);
      }, 500);
    });
  },

};

export default CatalogService;
