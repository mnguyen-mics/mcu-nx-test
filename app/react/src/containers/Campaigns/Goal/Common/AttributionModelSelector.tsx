import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
} from 'react-intl';
import { SearchFilter } from '../../../../components/ElementSelector';
import {
  getPaginatedApiParam,
  PaginatedApiParam,
} from '../../../../utils/ApiHelper';
import AttributionModelService from '../../../../services/AttributionModelService';
import { TableSelectorProps } from '../../../../components/ElementSelector/TableSelector';
import { TableSelector } from '../../../../components/index';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';
import { AttributionModelResource } from '../../../../models/goal/index';

const AttributionModelTableSelector: React.ComponentClass<
  TableSelectorProps<AttributionModelResource>
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
  save: (selectedAttributionModels: AttributionModelResource[]) => void;
  close: () => void;
}

type Props = AttributionModelSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class AttributionModelSelector extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

//   componentDidMount() {
//     const { match: { params: { organisationId } } } = this.props;
//     AttributionModelService.getAttributionModels(
//       organisationId
//     ).then(resp => resp.data).then(dataList => console.log(dataList));
//   }

  fetchAttributionModels = (filter: SearchFilter) => {
    const { match: { params: { organisationId } } } = this.props;
    const options: PaginatedApiParam = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };
    return AttributionModelService.getAttributionModels(
      organisationId,
      options,
    );
  };

  fetchAttributionModel = (attributionModelId: string) => {
    return AttributionModelService.getAttributionModel(attributionModelId);
  };

  saveAttributionModels = (
    selectedAttributionModelIds: string[],
    selectedAttributionModels: AttributionModelResource[],
  ) => {
    this.props.save(selectedAttributionModels);
  };

  render() {
    const {
      selectedAttributionModelIds,
      intl: { formatMessage },
      close,
    } = this.props;

    const columns: Array<DataColumnDefinition<AttributionModelResource>> = [
      {
        intlMessage: messages.attributionModelSelectorColumnType,
        key: 'type',
        render: (text, record) => <span>{record.id} (WITH PROCESSOR)</span>,
      },
      {
        intlMessage: messages.attributionModelSelectorColumnProcessor,
        key: 'processor',
        render: (text, record) => (
          <span>
            {record.name}
            ({record.group_id}:{record.artifact_id})
          </span>
        ),
      },
    ];

    return (
      <AttributionModelTableSelector
        actionBarTitle={formatMessage(messages.attributionModelSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.attributionModelSelectorSearchPlaceholder,
        )}
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
