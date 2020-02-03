import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import TableSelector, {
  TableSelectorProps,
} from '../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../components/ElementSelector';
import { DataColumnDefinition } from '../../../components/TableView/TableView';
import { StringPropertyResource } from '../../../models/plugin';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { BidOptimizer } from '../../../models/Plugins';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IBidOptimizerService } from '../../../services/Library/BidOptimizerService';

const BidOptimizerTableSelector: React.ComponentClass<TableSelectorProps<
  BidOptimizer
>> = TableSelector;

const messages = defineMessages({
  bidOptimizerSelectorTitle: {
    id: 'bid-optimizer-selector-title',
    defaultMessage: 'Add a bid optimizer',
  },
  bidOptimizerSelectorSearchPlaceholder: {
    id: 'bid-optimizer-selector-search-placeholder',
    defaultMessage: 'Search bid optimizers',
  },
  bidOptimizerSelectorColumnName: {
    id: 'bid-optimizer-selector-column-name',
    defaultMessage: 'Name',
  },
  bidOptimizerSelectorColumnType: {
    id: 'bid-optimizer-selector-column-type',
    defaultMessage: 'Type',
  },
  bidOptimizerSelectorColumnProvider: {
    id: 'bid-optimizer-selector-column-provider',
    defaultMessage: 'Provider',
  },
});

export interface BidOptimizerSelectorProps {
  selectedBidOptimizerIds: string[];
  save: (bidOptimizers: BidOptimizer[]) => void;
  close: () => void;
}

interface State {
  metadataByBidOptmizerId: {
    [id: string]: { type?: string; provider?: string; fetching: boolean };
  };
}

type Props = BidOptimizerSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class BidOptimizerSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IBidOptimizerService)
  private _bidOptimizerService: IBidOptimizerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      metadataByBidOptmizerId: {},
    };
  }

  saveBidOptimizers = (
    bidOptimizerIds: string[],
    bidOptimizers: BidOptimizer[],
  ) => {
    this.props.save(bidOptimizers);
  };

  fetchBidOptimizers = (filter: SearchFilter) => {
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

    return this._bidOptimizerService
      .getBidOptimizers(organisationId, options)
      .then(res => {
        // fetch properties to update state
        this.setState(() => ({
          metadataByBidOptmizerId: res.data.reduce(
            (acc, value) => ({
              ...acc,
              [value.id]: {
                fetching: true,
              },
            }),
            {},
          ),
        }));
        Promise.all(
          res.data.map(bidOptimzer => {
            return this._bidOptimizerService
              .getInstanceProperties(bidOptimzer.id)
              .then(propsRes => {
                const nameProp = propsRes.data.find(
                  prop => prop.technical_name === 'name',
                );
                const providerProp = propsRes.data.find(
                  prop => prop.technical_name === 'provider',
                );
                if (nameProp && providerProp) {
                  this.setState(prevState => ({
                    metadataByBidOptmizerId: {
                      ...prevState.metadataByBidOptmizerId,
                      [bidOptimzer.id]: {
                        type: (nameProp as StringPropertyResource).value.value,
                        provider: (providerProp as StringPropertyResource).value
                          .value,
                        fetching: false,
                      },
                    },
                  }));
                }
              });
          }),
        );

        // return original list for TableSelector
        return res;
      });
  };

  render() {
    const {
      selectedBidOptimizerIds,
      close,
      intl: { formatMessage },
    } = this.props;
    const { metadataByBidOptmizerId } = this.state;

    const columns: Array<DataColumnDefinition<BidOptimizer>> = [
      {
        intlMessage: messages.bidOptimizerSelectorColumnName,
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        intlMessage: messages.bidOptimizerSelectorColumnType,
        key: 'type',
        render: (text, record) => {
          if (metadataByBidOptmizerId[record.id]) {
            if (metadataByBidOptmizerId[record.id].fetching) {
              return <i className="mcs-table-cell-loading" />;
            }
            return <span>{metadataByBidOptmizerId[record.id].type}</span>;
          }
          return '';
        },
      },
      {
        intlMessage: messages.bidOptimizerSelectorColumnProvider,
        key: 'provider',
        render: (text, record) => {
          if (metadataByBidOptmizerId[record.id]) {
            if (metadataByBidOptmizerId[record.id].fetching) {
              return <i className="mcs-table-cell-loading" />;
            }
            return <span>{metadataByBidOptmizerId[record.id].provider}</span>;
          }
          return '';
        },
      },
    ];

    const fetchBidOptimizer = (id: string) =>
      this._bidOptimizerService.getInstanceById(id);

    return (
      <BidOptimizerTableSelector
        actionBarTitle={formatMessage(messages.bidOptimizerSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.bidOptimizerSelectorSearchPlaceholder,
        )}
        selectedIds={selectedBidOptimizerIds}
        fetchDataList={this.fetchBidOptimizers}
        fetchData={fetchBidOptimizer}
        singleSelection={true}
        columnsDefinitions={columns}
        save={this.saveBidOptimizers}
        close={close}
      />
    );
  }
}

export default compose<Props, BidOptimizerSelectorProps>(
  withRouter,
  injectIntl,
)(BidOptimizerSelector);
