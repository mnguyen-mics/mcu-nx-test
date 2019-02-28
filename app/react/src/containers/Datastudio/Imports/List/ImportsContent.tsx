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
} from '../../../../utils/LocationSearchHelper';
import { IMPORTS_SEARCH_SETTINGS } from './constants';
import { Index } from '../../../../utils';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import ImportsContentContainer from './ImportsContentContainer';
import { Filters } from '../../../../components/ItemList';

interface ImportContentState {
  loading: boolean;
  selectedDatamartId: string;
  filter: Filters;
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
      const {
        currentPage,
        pageSize,
        status,
        keywords,
        archived
      } = parseSearch(search, this.getSearchSetting(organisationId));
      this.setState({
        filter: {
          currentPage: currentPage,
          pageSize: pageSize,
          status: status,
          keywords: keywords,
          archived: archived
        }
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state: nextState,
      },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId ||
      (nextState && nextState.reloadDataSource === true)
    ) {
      if (
        !isSearchValid(nextSearch, this.getSearchSetting(nextOrganisationId))
      ) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            this.getSearchSetting(nextOrganisationId),
          ),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const {
          currentPage,
          pageSize,
          status,
          keywords,
          archived
        } = parseSearch(search, this.getSearchSetting(organisationId));
        this.setState({
          filter: {
            currentPage: currentPage,
            pageSize: pageSize,
            status: status,
            keywords: keywords,
            archived: archived
          }
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
    const {
      type,
      currentPage,
      pageSize,
    } = newFilter;

    const importsContentFilter = {
      type: type,
      currentPage: currentPage,
      pageSize: pageSize
    };

    this.setState({
      filter: importsContentFilter
    })
  }

  getSearchSetting(organisationId: string): SearchSetting[] {
    return [...IMPORTS_SEARCH_SETTINGS];
  }

  render() {
    const { filter,
      selectedDatamartId,
    } = this.state;

    return (
      <ImportsContentContainer
        datamartId={selectedDatamartId}
        filter={filter}
        onFilterChange={this.onFilterChange}
        noFilterDatamart={false}
      />
    )

  }
}

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
});

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(ImportContent);
