import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { TableSelector } from '@mediarithmics-private/mcs-components-library';
import { TableSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-selector';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { StringPropertyResource } from '../../../../models/plugin';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { VisitAnalyzer } from '../../../../models/Plugins';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IVisitAnalyzerService } from '../../../../services/Library/VisitAnalyzerService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { connect } from 'react-redux';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';

const VisitAnalyzerTableSelector: React.ComponentClass<TableSelectorProps<VisitAnalyzer>> =
  TableSelector;

const messages = defineMessages({
  visitAnalyzerSelectorTitle: {
    id: 'settings.visitAnalyzers.tableSelector.title',
    defaultMessage: 'Add a Activity Analyzer',
  },
  visitAnalyzerSelectorColumnName: {
    id: 'settings.visitAnalyzers.tableSelector.column.name',
    defaultMessage: 'Name',
  },
  visitAnalyzerSelectorColumnType: {
    id: 'settings.visitAnalyzers.tableSelector.column.type',
    defaultMessage: 'Type',
  },
  visitAnalyzerSelectorColumnProvider: {
    id: 'settings.visitAnalyzers.tableSelector.column.provider',
    defaultMessage: 'Provider',
  },
  audienceSegment: {
    id: 'settings.visitAnalyzers.tableSelector.audience-segment',
    defaultMessage: 'Audience Segment',
  },
  userAccountCompartment: {
    id: 'settings.visitAnalyzers.tableSelector.user-account-compartment',
    defaultMessage: 'User Account Compartment',
  },
  serviceType: {
    id: 'settings.visitAnalyzers.tableSelector.service-type',
    defaultMessage: 'Service Type',
  },
  addElementText: {
    id: 'settings.visitAnalyzers.tableSelector.add-element-text',
    defaultMessage: 'Add',
  },
});

export interface VisitAnalyzerSelectorProps {
  selectedVisitAnalyzerIds: string[];
  save: (visitAnalyzers: VisitAnalyzer[]) => void;
  close: () => void;
}

interface MapStateProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface State {
  metadataByBidOptmizerId: {
    [id: string]: { type?: string; provider?: string; fetching: boolean };
  };
}

type Props = VisitAnalyzerSelectorProps &
  InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<{ organisationId: string }>;

class VisitAnalyzerSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IVisitAnalyzerService)
  private _visitAnalyzerService: IVisitAnalyzerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      metadataByBidOptmizerId: {},
    };
  }

  saveVisitAnalyzers = (visitAnalyzerIds: string[], visitAnalyzers: VisitAnalyzer[]) => {
    this.props.save(visitAnalyzers);
  };

  fetchVisitAnalyzers = (filter?: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: any = {
      ...getPaginatedApiParam(filter?.currentPage, filter?.pageSize),
    };

    return this._visitAnalyzerService.getVisitAnalyzers(organisationId, options).then(res => {
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
          return this._visitAnalyzerService.getInstanceProperties(bidOptimzer.id).then(propsRes => {
            const nameProp = propsRes.data.find(prop => prop.technical_name === 'name');
            const providerProp = propsRes.data.find(prop => prop.technical_name === 'provider');
            if (nameProp && providerProp) {
              this.setState(prevState => ({
                metadataByBidOptmizerId: {
                  ...prevState.metadataByBidOptmizerId,
                  [bidOptimzer.id]: {
                    type: (nameProp as StringPropertyResource).value.value,
                    provider: (providerProp as StringPropertyResource).value.value,
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
      selectedVisitAnalyzerIds,
      close,
      intl: { formatMessage },
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { metadataByBidOptmizerId } = this.state;

    const datamarts = workspace(organisationId).datamarts;

    const columns: Array<DataColumnDefinition<VisitAnalyzer>> = [
      {
        title: formatMessage(messages.visitAnalyzerSelectorColumnName),
        key: 'name',
        render: (text, record) => <span>{record.name}</span>,
      },
      {
        title: formatMessage(messages.visitAnalyzerSelectorColumnType),
        key: 'type',
        render: (text, record) => {
          if (metadataByBidOptmizerId[record.id].fetching)
            return <i className='mcs-table-cell-loading' />;
          return <span>{metadataByBidOptmizerId[record.id].type}</span>;
        },
      },
      {
        title: formatMessage(messages.visitAnalyzerSelectorColumnProvider),
        key: 'provider',
        render: (text, record) => {
          if (metadataByBidOptmizerId[record.id].fetching)
            return <i className='mcs-table-cell-loading' />;
          return <span>{metadataByBidOptmizerId[record.id].provider}</span>;
        },
      },
    ];

    const fetchVisitAnalyzer = (id: string) => this._visitAnalyzerService.getInstanceById(id);

    return (
      <VisitAnalyzerTableSelector
        actionBarTitle={formatMessage(messages.visitAnalyzerSelectorTitle)}
        displayFiltering={false}
        selectedIds={selectedVisitAnalyzerIds}
        fetchDataList={this.fetchVisitAnalyzers}
        fetchData={fetchVisitAnalyzer}
        singleSelection={true}
        columnsDefinitions={columns}
        save={this.saveVisitAnalyzers}
        close={close}
        datamarts={datamarts}
        messages={{
          audienceSegment: formatMessage(messages.audienceSegment),
          userAccountCompartment: formatMessage(messages.userAccountCompartment),
          serviceType: formatMessage(messages.serviceType),
          addElementText: formatMessage(messages.addElementText),
        }}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, VisitAnalyzerSelectorProps>(
  connect(mapStateToProps, undefined),
  withRouter,
  injectIntl,
)(VisitAnalyzerSelector);
