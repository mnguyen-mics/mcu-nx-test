import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { CatalogRessource, CategoryRessource, ItemRessource } from '../../models/catalog/catalog';

interface CategoryOptions {
    depth?: number;
    first_result?: number;
    max_results?: number;
}

const Catalogservice = {
    getCatalogs(datamartId: string): Promise<DataListResponse<CatalogRessource>> {
        const endpoint = `datamarts/${datamartId}/catalogs`;
        return ApiService.getRequest(endpoint)
    },
    getCatalog(datamartId: string, catalogToken: string): Promise<DataResponse<CatalogRessource>> {
        const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}`;
        return ApiService.getRequest(endpoint)
    },
    getCatalogMainCategories(datamartId: string, catalogToken: string, options: CategoryOptions = {}): Promise<DataListResponse<CategoryRessource>> {
        const endpoint= `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories`;
        return ApiService.getRequest(endpoint, options)
    },
    getCatalogSubCategories(datamartId: string, catalogToken: string, categoryName: string, options: CategoryOptions = {}): Promise<DataListResponse<CategoryRessource>> {
        const endpoint= `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/sub_categories`;
        return ApiService.getRequest(endpoint, options)
    },
    getCatalogParentCategories(datamartId: string, catalogToken: string, categoryName: string, options: CategoryOptions = {}): Promise<DataListResponse<CategoryRessource>> {
        const endpoint= `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/parent_categories`;
        return ApiService.getRequest(endpoint, options)
    },
    getCatalogCategoryItems(datamartId: string, catalogToken: string, categoryName: string, options: CategoryOptions = {}): Promise<DataListResponse<ItemRessource>> {
        const endpoint = `datamarts/${datamartId}/catalogs/token=${catalogToken}/categories/${categoryName}/items`;
        return ApiService.getRequest(endpoint, options)
    }

}

export default Catalogservice;