import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { CatalogRessource, CategoryRessource, ItemRessource } from '../../models/catalog/catalog';
import { injectable } from 'inversify';

interface CategoryOptions {
  depth?: number;
  first_result?: number;
  max_results?: number;
}

export interface ILibraryCatalogService {
  getCatalogs: (datamartId: string) => Promise<DataListResponse<CatalogRessource>>;
  getCatalog: (datamartId: string, catalogToken: string) => Promise<DataResponse<CatalogRessource>>;
  getCatalogMainCategories: (
    datamartId: string,
    catalogToken: string,
    options?: CategoryOptions,
  ) => Promise<DataListResponse<CategoryRessource>>;
  getCatalogSubCategories: (
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options?: CategoryOptions,
  ) => Promise<DataListResponse<CategoryRessource>>;
  getCatalogParentCategories: (
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options?: CategoryOptions,
  ) => Promise<DataListResponse<CategoryRessource>>;
  getCatalogCategoryItems: (
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options?: CategoryOptions,
  ) => Promise<DataListResponse<ItemRessource>>;
}

@injectable()
export class LibraryCatalogService {
  getCatalogs(datamartId: string): Promise<DataListResponse<CatalogRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs`;
    return ApiService.getRequest(endpoint);
  }
  getCatalog(datamartId: string, catalogToken: string): Promise<DataResponse<CatalogRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}`;
    return ApiService.getRequest(endpoint);
  }
  getCatalogMainCategories(
    datamartId: string,
    catalogToken: string,
    options: CategoryOptions = {},
  ): Promise<DataListResponse<CategoryRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories`;
    return ApiService.getRequest(endpoint, options);
  }
  getCatalogSubCategories(
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options: CategoryOptions = {},
  ): Promise<DataListResponse<CategoryRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/sub_categories`;
    return ApiService.getRequest(endpoint, options);
  }
  getCatalogParentCategories(
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options: CategoryOptions = {},
  ): Promise<DataListResponse<CategoryRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/parent_categories`;
    return ApiService.getRequest(endpoint, options);
  }
  getCatalogCategoryItems(
    datamartId: string,
    catalogToken: string,
    categoryName: string,
    options: CategoryOptions = {},
  ): Promise<DataListResponse<ItemRessource>> {
    const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/items`;
    return ApiService.getRequest(endpoint, options);
  }
}
