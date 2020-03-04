import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import TableSelector, {
  TableSelectorProps,
} from '../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../components/ElementSelector';
import { DataColumnDefinition } from '../../../components/TableView/TableView';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { PlacementListResource } from '../../../models/placement/PlacementListResource';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IPlacementListService } from '../../../services/Library/PlacementListService';

const PlacementListTableSelector: React.ComponentClass<TableSelectorProps<
  PlacementListResource
>> = TableSelector;

const messages = defineMessages({
  placementListSelectorTitle: {
    id: 'placement-list-selector-title',
    defaultMessage: 'Add a placement',
  },
  placementListSelectorSearchPlaceholder: {
    id: 'placement-list-selector-search-placeholder',
    defaultMessage: 'Search placements',
  },
  placementListSelectorColumnName: {
    id: 'placement-list-selector-column-name',
    defaultMessage: 'Name',
  },
});

export interface PlacementListSelectorProps {
  selectedPlacementListIds: string[];
  save: (placementLists: PlacementListResource[]) => void;
  close: () => void;
}

type Props = PlacementListSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class PlacementListSelector extends React.Component<Props> {
  @lazyInject(TYPES.IPlacementListService)
  private _placementListService: IPlacementListService;

  savePlacementLists = (
    placementIds: string[],
    placements: PlacementListResource[],
  ) => {
    this.props.save(placements);
  };

  fetchPlacementLists = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: any = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.name = filter.keywords;
    }

    return this._placementListService.getPlacementLists(
      organisationId,
      options,
    );
  };

  render() {
    const {
      selectedPlacementListIds,
      close,
      intl: { formatMessage },
    } = this.props;

    const columns: Array<DataColumnDefinition<PlacementListResource>> = [
      {
        intlMessage: messages.placementListSelectorColumnName,
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
    ];

    const fetchPlacementList = (id: string) =>
      this._placementListService.getPlacementList(id);

    return (
      <PlacementListTableSelector
        actionBarTitle={formatMessage(messages.placementListSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.placementListSelectorSearchPlaceholder,
        )}
        selectedIds={selectedPlacementListIds}
        fetchDataList={this.fetchPlacementLists}
        fetchData={fetchPlacementList}
        columnsDefinitions={columns}
        save={this.savePlacementLists}
        close={close}
      />
    );
  }
}

export default compose<Props, PlacementListSelectorProps>(
  withRouter,
  injectIntl,
)(PlacementListSelector);
