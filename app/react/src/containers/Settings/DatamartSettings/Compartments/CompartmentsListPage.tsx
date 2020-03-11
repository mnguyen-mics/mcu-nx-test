import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import settingsMessages from '../../messages';
import { Layout, Row, Icon, Button } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import CompartmentsTable from './List/CompartmentsTable';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../models/datamart/DatamartResource';
import { Filter } from '../Common/domain';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../state/Session/selectors';
import { connect } from 'react-redux';
import {
  parseSearch,
  KEYWORD_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
  updateSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { IDatamartService } from '../../../../services/DatamartService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Index } from '../../../../utils';
import queryString from 'query-string';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

const { Content } = Layout;

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedDatamartProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  MapStateToProps;

interface CompartmentsListPageState {
  compartments: UserAccountCompartmentDatamartSelectionResource[];
  totalCompartments: number;
  isFetchingCompartments: boolean;
  noCompartmentYet: boolean;
  filter: Filter;
}

class CompartmentsListPage extends React.Component<
  Props,
  CompartmentsListPageState
> {

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      compartments: [],
      totalCompartments: 0,
      isFetchingCompartments: true,
      noCompartmentYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        keywords: '',
      },
    };
  }

  componentDidMount() {
    const {
      location: { search },
      datamart,
    } = this.props;
    const { filter: stateFilter } = this.state;
    const filter = parseSearch(search, this.getSearchSetting());
    const calculatedDatamartId = filter.datamartId
      ? filter.datamartId
      : datamart.id;
    this.setState({
      isFetchingCompartments: true,
    });
    this.fetchCompartments(calculatedDatamartId, stateFilter);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      datamart,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    const { filter } = this.state;

    if (
      organisationId !== previousOrganisationId ||
      !compareSearches(search, previousSearch)
    ) {
      const selectedDatamartId =
        queryString.parse(search).datamartId || datamart.id;

      this.setState(
        {
          isFetchingCompartments: true,
        },
        () => {
          this.fetchCompartments(selectedDatamartId, filter);
        },
      );
    }
  }

  getSearchSetting() {
    return [...KEYWORD_SEARCH_SETTINGS, ...DATAMART_SEARCH_SETTINGS];
  }

  handleFilterChange = (newFilter: Filter) => {
    const {
      location: { search },
      datamart,
    } = this.props;
    this.setState({ filter: newFilter });
    const filters = parseSearch(search, this.getSearchSetting());
    this.fetchCompartments(
      filters.datamartId ? filters.datamartId : datamart.id,
      newFilter,
    );
  };

  fetchCompartments = (datamartId: string, filter: Filter) => {
    const { notifyError } = this.props;

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };
    return this._datamartService.getUserAccountCompartmentDatamartSelectionResources(
      datamartId,
      options,
    )
      .then(results => {
        this.setState({
          isFetchingCompartments: false,
          compartments: results.data,
          totalCompartments: results.total || results.count,
          noCompartmentYet: results.total === 0 || results.count === 0,
        });
      })
      .catch(err => {
        this.setState({ isFetchingCompartments: false });
        notifyError(err);
      });
  };

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSetting()),
    };

    history.push(nextLocation);
  };

  onClick = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/compartments/create`,
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      workspace,
    } = this.props;
    const {
      isFetchingCompartments,
      totalCompartments,
      compartments,
      noCompartmentYet,
      filter,
    } = this.state;

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (datamartItems.length > 1) {
      const filterData = parseSearch(search, this.getSearchSetting());
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage {...messages.datamartFilter} />
            <Icon type="down" />
          </div>
        ),
        selectedItems: filterData.datamartId
          ? [datamartItems.find(di => di.key === filterData.datamartId)]
          : [datamartItems[0]],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamartId:
              datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
          });
        },
      };
      filtersOptions.push(datamartFilter);
    }

    const button = (
      <Button
        key={messages.newCompartment.id}
        type="primary"
        onClick={this.onClick}
      >
        <FormattedMessage {...messages.newCompartment} />
      </Button>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...settingsMessages.compartments} />
                </span>
                <span className="mcs-card-button">{button}</span>
              </div>
              <hr className="mcs-separator" />
              <CompartmentsTable
                isFetchingCompartments={isFetchingCompartments}
                dataSource={compartments}
                totalCompartments={totalCompartments}
                noCompartmentYet={noCompartmentYet}
                onFilterChange={this.handleFilterChange}
                filter={filter}
                filtersOptions={filtersOptions}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

const MapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose(
  injectIntl,
  injectDatamart,
  withRouter,
  injectNotifications,
  connect(MapStateToProps),
)(CompartmentsListPage);
