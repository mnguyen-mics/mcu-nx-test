import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { getPaginatedApiParam, PaginatedApiParam } from '../../../../utils/ApiHelper';
import { AttributionModel } from '../../../../models/Plugins';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAttributionModelService } from '../../../../services/AttributionModelService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableSelector } from '@mediarithmics-private/mcs-components-library';
import { TableSelectorProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-selector';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';

const AttributionModelTableSelector: React.ComponentClass<TableSelectorProps<AttributionModel>> =
  TableSelector;
const messages = defineMessages({
  attributionModelSelectorColumnType: {
    id: 'attributionModel.selector.column.attribution.type',
    defaultMessage: 'Attribution Type',
  },
  attributionModelSelectorColumnProcessor: {
    id: 'attributionModel.selector.column.attribution.processor',
    defaultMessage: 'Attribution Model Processor',
  },
  attributionModelSelectorTitle: {
    id: 'attributionModel.selector.title',
    defaultMessage: 'Add Attribution Model',
  },
  attributionModelSelectorSearchPlaceholder: {
    id: 'attributionModel.selector.search.placeholder',
    defaultMessage: 'Search an attribution model',
  },
  audienceSegment: {
    id: 'attributionModel.tableSelector.audience-segment',
    defaultMessage: 'Audience Segment',
  },
  userAccountCompartment: {
    id: 'attributionModel.tableSelector.user-account-compartment',
    defaultMessage: 'User Account Compartment',
  },
  serviceType: {
    id: 'attributionModel.tableSelector.service-type',
    defaultMessage: 'Service Type',
  },
  addElementText: {
    id: 'attributionModel.TableSelector.add-element-text',
    defaultMessage: 'Add',
  },
});

export interface AttributionModelSelectorProps {
  selectedAttributionModelIds: string[];
  save: (selectedAttributionModels: AttributionModel[]) => void;
  close: () => void;
}

interface MapStateProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = AttributionModelSelectorProps &
  InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<{ organisationId: string }>;

class AttributionModelSelector extends React.Component<Props> {
  @lazyInject(TYPES.IAttributionModelService)
  private _attributionModelService: IAttributionModelService;

  fetchAttributionModels = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const options: PaginatedApiParam = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };
    return this._attributionModelService.getAttributionModels(organisationId, options);
  };

  fetchAttributionModel = (attributionModelId: string) => {
    return this._attributionModelService.getAttributionModel(attributionModelId);
  };

  saveAttributionModels = (
    selectedAttributionModelIds: string[],
    selectedAttributionModels: AttributionModel[],
  ) => {
    this.props.save(selectedAttributionModels);
  };

  render() {
    const {
      selectedAttributionModelIds,
      intl: { formatMessage },
      close,
      workspace,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const columns: Array<DataColumnDefinition<AttributionModel>> = [
      {
        title: formatMessage(messages.attributionModelSelectorColumnType),
        key: 'type',
        render: (text, record) => <span>{record.id} (WITH PROCESSOR)</span>,
      },
      {
        title: formatMessage(messages.attributionModelSelectorColumnProcessor),
        key: 'processor',
        render: (text, record) => (
          <span>
            {record.name}({record.group_id}:{record.artifact_id})
          </span>
        ),
      },
    ];

    const datamarts = workspace(organisationId).datamarts;

    return (
      <AttributionModelTableSelector
        actionBarTitle={formatMessage(messages.attributionModelSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(messages.attributionModelSelectorSearchPlaceholder)}
        selectedIds={selectedAttributionModelIds}
        fetchDataList={this.fetchAttributionModels}
        fetchData={this.fetchAttributionModel}
        columnsDefinitions={columns}
        save={this.saveAttributionModels}
        close={close}
        datamarts={datamarts}
        messages={{
          audienceSegment: intl.formatMessage(messages.audienceSegment),
          userAccountCompartment: intl.formatMessage(messages.userAccountCompartment),
          serviceType: intl.formatMessage(messages.serviceType),
          addElementText: intl.formatMessage(messages.addElementText),
        }}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, AttributionModelSelectorProps>(
  connect(mapStateToProps, undefined),
  injectIntl,
  withRouter,
)(AttributionModelSelector);
