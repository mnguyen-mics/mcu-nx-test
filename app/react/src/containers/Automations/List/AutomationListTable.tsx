import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Layout, Tooltip } from 'antd';
import { compose } from 'recompose';
import { ExtendedTableRowSelection } from '../../../components/TableView/TableView';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withTranslations, { TranslationProps } from '../../Helpers/withTranslations';
import { AutomationResource } from '../../../models/automations/automations';
import { updateSearch, compareSearches, isSearchValid, buildDefaultSearch, parseSearch, PAGINATION_SEARCH_SETTINGS } from '../../../utils/LocationSearchHelper';
import { McsIcon } from '../../../components';
import { EmptyTableView, TableViewFilters } from '../../../components/TableView';
import { MapDispatchToProps, MapStateToProps } from './AutomationListPage';
import { FilterParams } from '../../Campaigns/Display/List/DisplayCampaignsActionbar';

const { Content } = Layout;
const SCENARIOS_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
];
interface AutomationsTableProps
  extends MapDispatchToProps,
  MapStateToProps {
  rowSelection: ExtendedTableRowSelection;
  isUpdatingStatuses: boolean;
}

type JoinedProps = AutomationsTableProps &
  InjectedIntlProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string }>;

class AutomationsListTable extends React.Component<JoinedProps> {

    static propTypes: { match: PropTypes.Validator<any>; location: PropTypes.Validator<any>; history: PropTypes.Validator<any>; translations: PropTypes.Validator<any>; hasAutomations: PropTypes.Validator<any>; isFetchingAutomationList: PropTypes.Validator<any>; dataSource: PropTypes.Validator<any>; totalAutomations: PropTypes.Validator<any>; fetchAutomationList: PropTypes.Validator<any>; resetAutomationsTable: PropTypes.Validator<any>; };
  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
        },
      },
      fetchAutomationList,
    } = this.props;

    if (!isSearchValid(search, SCENARIOS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, SCENARIOS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch<FilterParams>(search, SCENARIOS_SEARCH_SETTINGS);
      fetchAutomationList(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      fetchAutomationList,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, SCENARIOS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, SCENARIOS_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch<FilterParams>(nextSearch, SCENARIOS_SEARCH_SETTINGS);
        fetchAutomationList(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAutomationsTable();
  }

  editAutomation = (record: AutomationResource) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/automations/${record.id}/edit`);
  }

  updateLocationSearch = (params: any) => {
    const {
      history,
      location: {
        search: currentSearch,
        pathname,
      },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, SCENARIOS_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      isFetchingAutomations,
      dataSource,
      totalAutomations,
      translations,
      hasAutomations,
      rowSelection,
    } = this.props;

    const filter = parseSearch(search, SCENARIOS_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAutomations,
      onChange: (page: number) => {
        this.updateLocationSearch({
          currentPage: page,
        });
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
      onShowSizeChange: (current: number, size: number) => this.updateLocationSearch({
        currentPage: 1,
        pageSize: size,
      }),
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: (text: string) => (
          <Tooltip placement="top" title={translations[text]}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: string, record: AutomationResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/automations/${record.id}/edit`}
          >{text}
          </Link>
        ),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: () => [
          {
            translationKey: 'EDIT',
            callback: this.editAutomation,
          }
        ],
      },
    ];

    return (hasAutomations
      ? (
          <div className="ant-layout">
            <Content className="mcs-content-container">
              <div className="mcs-table-container">
                <TableViewFilters
                  columns={dataColumns}
                  actionsColumnsDefinition={actionColumns}
                  dataSource={dataSource}
                  loading={isFetchingAutomations}
                  pagination={pagination}
                  rowSelection={rowSelection}
                />
              </div>
            </Content>
          </div>
      )
      : <EmptyTableView iconType="automation" text="EMPTY_AUTOMATIONS" />
    );
  }
}

export default compose<JoinedProps, AutomationsTableProps>(
    withRouter,
    withTranslations,
    injectIntl,
  )(AutomationsListTable);
