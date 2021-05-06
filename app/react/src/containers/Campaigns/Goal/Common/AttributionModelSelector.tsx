import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { SearchFilter } from '../../../../components/ElementSelector';
import { getPaginatedApiParam, PaginatedApiParam } from '../../../../utils/ApiHelper';
import { TableSelectorProps } from '../../../../components/ElementSelector/TableSelector';
import { TableSelector } from '../../../../components/index';
import { AttributionModel } from '../../../../models/Plugins';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAttributionModelService } from '../../../../services/AttributionModelService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const AttributionModelTableSelector: React.ComponentClass<
  TableSelectorProps<AttributionModel>
> = TableSelector;
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
});

export interface AttributionModelSelectorProps {
  selectedAttributionModelIds: string[];
  save: (selectedAttributionModels: AttributionModel[]) => void;
  close: () => void;
}

type Props = AttributionModelSelectorProps &
  InjectedIntlProps &
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
      />
    );
  }
}

export default compose<Props, AttributionModelSelectorProps>(
  injectIntl,
  withRouter,
)(AttributionModelSelector);
