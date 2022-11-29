import { parseSearch } from '../../../../utils/LocationSearchHelper';

enum SegmentsColumnsKey {
  technical_name = 'technical_name',
  creation_ts = 'creation_ts',
  user_points_count = 'user_points_count',
  user_accounts_count = 'user_accounts_count',
  emails_count = 'emails_count',
  desktop_cookie_ids_count = 'desktop_cookie_ids_count',
  mobile_cookie_ids_count = 'mobile_cookie_ids_count',
  mobile_ad_ids_count = 'mobile_ad_ids_count',
}

export type SegmentsColumnKey = keyof typeof SegmentsColumnsKey;
export type SegmentsColumnsList = SegmentsColumnKey[];

type SegmentsColumnsVisibility = Map<SegmentsColumnKey, boolean>;

export class PermanentFilters {
  private search: string;
  private readonly searchKey: string;
  private readonly defaultVisibleColumn: SegmentsColumnsList = [
    'user_points_count',
    'user_accounts_count',
    'emails_count',
    'desktop_cookie_ids_count',
    'mobile_cookie_ids_count',
    'mobile_ad_ids_count',
  ];
  private columnsVisibility: SegmentsColumnsVisibility;
  private readonly columnsVisibilityKey: string;

  getSegmentsColumnsVisibility = (visibleColumns: SegmentsColumnsList) => {
    function setVisibility(columns: SegmentsColumnsList, visibility: boolean) {
      return columns.reduce((acc: SegmentsColumnsVisibility, column) => {
        acc.set(column, visibility);
        return acc;
      }, new Map([]) as SegmentsColumnsVisibility);
    }

    const allHidden: SegmentsColumnsVisibility = setVisibility(
      Object.keys(SegmentsColumnsKey) as SegmentsColumnsList,
      false,
    );
    const visibleColumnsVisibility = setVisibility(visibleColumns, true);

    return new Map([
      ...Array.from(allHidden.entries()),
      ...Array.from(visibleColumnsVisibility.entries()),
    ]) as SegmentsColumnsVisibility;
  };

  constructor(organisationId: string) {
    this.searchKey = `mics.navigator.organisation-${organisationId}.audience-segments-table.audience-segments-table.search`;
    this.columnsVisibilityKey = `mics.navigator.organisation-${organisationId}.audience-segments-table.audience-segments-table.visible-columns`;
    this.search = localStorage.getItem(this.searchKey) || '';
    this.columnsVisibility = this.getSegmentsColumnsVisibility(
      JSON.parse(localStorage.getItem(this.columnsVisibilityKey) || '[]') ||
        this.defaultVisibleColumn,
    );
  }

  getSearch = () => this.search;

  getColumnsVisibility = () => this.columnsVisibility;

  getVisibleColumns = () => {
    const visibleColumns = Array.from(this.columnsVisibility.keys()).filter(key =>
      this.columnsVisibility.get(key),
    );
    if (visibleColumns.length === 0) {
      return this.defaultVisibleColumn;
    } else {
      return visibleColumns;
    }
  };

  clear = () => {
    this.search = '';
    this.columnsVisibility = this.getSegmentsColumnsVisibility(this.defaultVisibleColumn);
    localStorage.removeItem(this.searchKey);
    localStorage.removeItem(this.columnsVisibilityKey);
  };

  getOrderBy = () => {
    let orderBy: { isAsc?: boolean | undefined; sortField: string | undefined } = {
      isAsc: undefined,
      sortField: undefined,
    };
    if (this.search) {
      const parsedSearch = parseSearch(this.search);
      if (parsedSearch.orderBy) {
        if (parsedSearch.orderBy.startsWith('-')) {
          orderBy = { isAsc: false, sortField: parsedSearch.orderBy.substr(1) };
        } else {
          orderBy = { isAsc: true, sortField: parsedSearch.orderBy };
        }
      }
    }
    return orderBy;
  };

  updateSearch = (search: string) => {
    this.search = search;
    localStorage.setItem(this.searchKey, search);
  };

  updateColumnsVisibility = (visibleColumns: SegmentsColumnsList) => {
    this.columnsVisibility = this.getSegmentsColumnsVisibility(visibleColumns);

    localStorage.setItem(this.columnsVisibilityKey, JSON.stringify(visibleColumns));
  };
}
