import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getWorkspace } from '../../../../state/Session/selectors';
import {
  parseSearch,
  updateSearch,
  SearchSetting,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import { IMPORTS_SEARCH_SETTINGS } from './constants';
import { Index } from '../../../../utils';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import ImportsContentContainer from './ImportsContentContainer';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

export interface ImportFilterParams
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {}

interface ImportContentState {
  loading: boolean;
  selectedDatamartId: string;
  filter: ImportFilterParams;
}

interface RouterProps {
  organisationId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  MapStateToProps;

class ImportContent extends React.Component<Props, ImportContentState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      selectedDatamartId: props.workspace(props.match.params.organisationId)
        .datamarts[0].id,
      filter: {
        currentPage: 1,
        pageSize: 10,
        keywords: '',
      },
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (!isSearchValid(search, this.getSearchSetting(organisationId))) {
      history.push({
        pathname: pathname,
        search: buildDefaultSearch(
          search,
          this.getSearchSetting(organisationId),
        ),
        state: { reloadDataSource: true },
      });
    } else {
      const { currentPage, pageSize, datamartId, keywords } = parseSearch(
        search,
        this.getSearchSetting(organisationId),
      );
      const selectedDatamartId = datamartId
        ? datamartId
        : this.state.selectedDatamartId;
      this.setState({
        filter: {
          currentPage: currentPage,
          pageSize: pageSize,
          keywords: keywords,
        },
        selectedDatamartId: selectedDatamartId,
      });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search, state },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: {
        search: previousSearch,
      },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId ||
      (state && state.reloadDataSource === true)
    ) {
      if (
        !isSearchValid(search, this.getSearchSetting(organisationId))
      ) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(
            search,
            this.getSearchSetting(organisationId),
          ),
          state: { reloadDataSource: organisationId !== previousOrganisationId },
        });
      } else {
        const { currentPage, pageSize, datamartId, keywords } = parseSearch(
          search,
          this.getSearchSetting(organisationId),
        );
        const selectedDatamartId = datamartId
          ? datamartId
          : this.state.selectedDatamartId;
        this.setState({
          filter: {
            currentPage: currentPage,
            pageSize: pageSize,
            keywords: keywords,
          },
          selectedDatamartId: selectedDatamartId,
        });
      }
    }
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        this.getSearchSetting(organisationId),
      ),
    };

    history.push(nextLocation);
  };

  onFilterChange = (newFilter: any) => {
    const { datamartId, ...restFilter } = newFilter;

    const calculatedDatamartId = datamartId
      ? datamartId
      : this.state.selectedDatamartId;

    this.updateLocationSearch({
      datamartId: calculatedDatamartId,
      ...restFilter,
    });
  };

  getSearchSetting(organisationId: string): SearchSetting[] {
    return [...IMPORTS_SEARCH_SETTINGS];
  }

  render() {
    const { filter, selectedDatamartId } = this.state;

    return (
      <ImportsContentContainer
        datamartId={selectedDatamartId}
        filter={filter}
        onFilterChange={this.onFilterChange}
        noFilterDatamart={false}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(ImportContent);
