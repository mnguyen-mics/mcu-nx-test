export interface CatalogRessource {
  creation_ts: number;
  currency: string;
  datamart_id: string;
  editor_id: string;
  id: string;
  locale: string;
  token: string;
}

export interface CategoryRessource {
  datamart_id: string;
  catalog_id: string;
  category_id: string;
  catalog_version: string;
  properties?: any;
  overriding_properties: any;
  creation_ts: number;
  last_modified_ts: number;
}

export interface ItemRessource {
  datamart_id: string;
  catalog_id: string;
  item_id: string;
  catalog_version: string;
  properties: {
    $title: string;
    $description: string;
    $link: string;
    $image_link: string;
    $product_type: string;
    $availability: string;
    $mpn: string;
    $gtin: string;
    $brand: string;
    $price: string;
    $sale_price: string;
    [key: string]: string;
  };
  overriding_properties: any;
  creation_ts: number;
  last_modified_ts: number;
  status: string;
}
