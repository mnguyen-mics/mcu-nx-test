import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';
import { compose } from 'recompose';
import { Filter } from '../../Common/domain';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import messages from './messages';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';

export interface CompartmentsTableProps {
  isFetchingCompartments: boolean;
  dataSource: UserAccountCompartmentDatamartSelectionResource[];
  totalCompartments: number;
  noCompartmentYet: boolean;
  onFilterChange: (a: Partial<Filter>) => void;
  filter: Filter;
  filtersOptions: Array<MultiSelectProps<any>>;
}

type Props = CompartmentsTableProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }>;

class CompartmentsTable extends React.Component<Props> {
  editCompartment = (compartment: UserAccountCompartmentDatamartSelectionResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const datamartId = compartment.datamart_id;
    const id = compartment.id;

    const editUrl = `/v2/o/${organisationId}/settings/datamart/${datamartId}/compartments/${id}/edit`;

    history.push({
      pathname: editUrl,
    });
  };

  voidFunction = (compartment: UserAccountCompartmentDatamartSelectionResource) => {
    return undefined;
  };

  render() {
    const {
      isFetchingCompartments,
      dataSource,
      totalCompartments,
      onFilterChange,
      filter,
      filtersOptions,
      intl: { formatMessage },
    } = this.props;

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCompartments,
      onChange: (page: number, size: number) => {
        onFilterChange({
          currentPage: page,
          pageSize: size,
        });
      },
      onShowSizeChange: (current: number, size: number) => {
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        });
      },
    };

    const dataColumns: Array<
      DataColumnDefinition<UserAccountCompartmentDatamartSelectionResource>
    > = [
      {
        title: formatMessage(messages.compartment_id),
        key: 'compartment_id',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span className='mcs-compartmentsTable_compartmentId'>
            {text} {record.default && ' (Default)'}
          </span>
        ),
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span className='mcs-compartmentsTable_compartmentName'>{text}</span>
        ),
      },
      {
        title: formatMessage(messages.token),
        key: 'token',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span className='mcs-compartmentsTable_compartmentToken'>{text}</span>
        ),
      },
    ];

    const actionColumns: Array<
      ActionsColumnDefinition<UserAccountCompartmentDatamartSelectionResource>
    > = [
      {
        className: 'mcs-compartmentsTable_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            className: 'mcs-compartmentsTable_dropDownMenu--edit',
            message: formatMessage(messages.editCompartment),
            callback: this.editCompartment,
          },
          {
            className: 'mcs-compartmentsTable_dropDownMenu--archive',
            message: formatMessage(messages.archiveCompartment),
            disabled: true,
            callback: this.voidFunction,
          },
          {
            className: 'mcs-compartmentsTable_dropDownMenu--delete',
            message: formatMessage(messages.deleteCompartment),
            disabled: true,
            callback: this.voidFunction,
          },
        ],
      },
    ];

    return (
      <TableViewFilters
        columns={dataColumns}
        dataSource={dataSource}
        loading={isFetchingCompartments}
        pagination={pagination}
        filtersOptions={filtersOptions}
        actionsColumnsDefinition={actionColumns}
      />
    );
  }
}

export default compose<Props, CompartmentsTableProps>(injectIntl, withRouter)(CompartmentsTable);
