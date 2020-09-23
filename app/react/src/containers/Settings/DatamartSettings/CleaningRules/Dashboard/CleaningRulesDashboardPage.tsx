import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Row } from 'antd';
import { McsTabs } from '@mediarithmics-private/mcs-components-library';
import CleaningRulesContainer from '../List/CleaningRulesContainer';
import messages from './messages';
import {
  CleaningRuleType,
  ExtendedCleaningRuleResourceWithFilter,
} from '../../../../../models/cleaningRules/CleaningRules';
import {
  parseSearch,
  SearchSetting,
  updateSearch,
  compareSearches,
  isSearchValid,
  buildDefaultSearch,
} from '../../../../../utils/LocationSearchHelper';
import { CLEANING_RULES_SEARCH_SETTINGS, CleaningRulesFilter } from '../domain';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { connect } from 'react-redux';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartService } from '../../../../../services/DatamartService';
import { getWorkspace } from '../../../../../redux/Session/selectors';

interface CleaningRuleTypeItem {
  title: string;
  cleaningRuleType: CleaningRuleType;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<{ organisationId: string }> &
  MapStateToProps &
  InjectedIntlProps &
  InjectedNotificationProps;

interface State {
  filter: CleaningRulesFilter;
  cleaningRules: ExtendedCleaningRuleResourceWithFilter[];
  totalCleaningRules: number;
  isFetchingCleaningRules: boolean;
}

class CleaningRulesDashboardPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);

    const {
      location: { search },
    } = this.props;

    this.state = {
      filter: this.getCleaningRulesFilterFromSearch(search),
      cleaningRules: [],
      totalCleaningRules: 0,
      isFetchingCleaningRules: false,
    };
  }

  componentDidMount() {
    this.refreshCleaningRule()
  }

  refreshCleaningRule = () => {
    const { filter } = this.state;
    this.fetchCleaningRules(filter);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId
    ) {
      if (!isSearchValid(search, CLEANING_RULES_SEARCH_SETTINGS)) {
        history.replace({
          pathname,
          search: buildDefaultSearch(search, CLEANING_RULES_SEARCH_SETTINGS),
        });
      } else {
        const computedFilter = this.getCleaningRulesFilterFromSearch(search);
        this.fetchCleaningRules(computedFilter);
      }
    }
  }

  getCleaningRulesFilterFromSearch = (search: string): CleaningRulesFilter => {
    const {
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const parsedFilter = parseSearch(search, this.getSearchSettings());

    const computedFilter: CleaningRulesFilter = {
      currentPage: parsedFilter.currentPage ? parsedFilter.currentPage : 1,
      pageSize: parsedFilter.pageSize ? parsedFilter.pageSize : 10,
      type: parsedFilter.type
        ? parsedFilter.type
        : this.getCleaningRuleTypeItems()[0].cleaningRuleType,
      datamartId: parsedFilter.datamartId
        ? parsedFilter.datamartId
        : workspace(organisationId).datamarts[0].id,
    };

    return computedFilter;
  };

  getSearchSettings(): SearchSetting[] {
    return [...CLEANING_RULES_SEARCH_SETTINGS];
  }

  onFilterChange = (newFilter: Partial<CleaningRulesFilter>) => {
    const {
      history,
      location: { search, pathname },
    } = this.props;
    const { filter } = this.state;

    const computedFilter: CleaningRulesFilter = {
      ...filter,
      ...newFilter,
    };

    const nextLocation = {
      pathname,
      search: updateSearch(search, computedFilter, this.getSearchSettings()),
    };

    history.push(nextLocation);
  };

  getCleaningRuleTypeItems = (): CleaningRuleTypeItem[] => {
    const { intl } = this.props;
    const items: CleaningRuleTypeItem[] = [
      {
        title: intl.formatMessage(messages.EventBasedCleaningRulesTabTitle),
        cleaningRuleType: 'USER_EVENT_CLEANING_RULE',
      },
      {
        title: intl.formatMessage(messages.ProfileBasedCleaningRulesTabTitle),
        cleaningRuleType: 'USER_PROFILE_CLEANING_RULE',
      },
    ];

    return items;
  };

  fetchCleaningRules = (filter: CleaningRulesFilter) => {
    const { notifyError } = this.props;

    this.setState({ isFetchingCleaningRules: true, filter }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        type: filter.type,
      };
      this._datamartService
        .getCleaningRules(filter.datamartId, options)
        .then(resultCleaningRules => {
          const cleaningRulesP: Array<Promise<
            ExtendedCleaningRuleResourceWithFilter
          >> = resultCleaningRules.data.map(cleaningRule => {
            return filter.type === 'USER_EVENT_CLEANING_RULE'
              ? this._datamartService
                  .getContentFilter(filter.datamartId, cleaningRule.id)
                  .then(resFilter => {
                    const contentFilter = resFilter.data;
                    const cleaningRuleWithFilter: ExtendedCleaningRuleResourceWithFilter = {
                      ...cleaningRule,
                      ...contentFilter,
                    };

                    return cleaningRuleWithFilter;
                  })
                  .catch(err => Promise.resolve(cleaningRule))
              : Promise.resolve(cleaningRule);
          });

          Promise.all(cleaningRulesP)
            .then(cleaningRules => {
              this.setState({
                isFetchingCleaningRules: false,
                cleaningRules,
                totalCleaningRules: resultCleaningRules.total || resultCleaningRules.count,
              });
            })
            .catch(err => {
              notifyError(err);
              this.setState({isFetchingCleaningRules: false});
            });
        });
    });
  };

  onChangeCleaningRuleType = (newActiveKey: string) => {
    this.onFilterChange({ type: newActiveKey });
  };

  render() {
    const {
      filter,
      cleaningRules,
      totalCleaningRules,
      isFetchingCleaningRules,
    } = this.state;

    const cleaningRuleType = filter.type;

    const items = this.getCleaningRuleTypeItems().map(
      (typeItem: CleaningRuleTypeItem) => {
        return {
          title: typeItem.title,
          display: (
            <CleaningRulesContainer
              filter={filter}
              cleaningRules={cleaningRules}
              total={totalCleaningRules}
              isFetchingCleaningRules={isFetchingCleaningRules}
              onFilterChange={this.onFilterChange}
              onCleaningRuleUpdate={this.refreshCleaningRule}
            />
          ),
          key: typeItem.cleaningRuleType,
        };
      },
    );

    return (
      <div className="ant-layout">
        <div className="ant-layout-content">
          <Row>
            <McsTabs
              items={items}
              activeKey={cleaningRuleType}
              onChange={this.onChangeCleaningRuleType}
            />
          </Row>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(CleaningRulesDashboardPage);
