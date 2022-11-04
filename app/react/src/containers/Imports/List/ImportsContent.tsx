import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { getWorkspace } from '../../../redux/Session/selectors';
import {
  parseSearch,
  SearchSetting,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
  LabelsSearchSettings,
} from '../../../utils/LocationSearchHelper';
import { IMPORTS_SEARCH_SETTINGS } from './constants';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import ImportsContentContainer from './ImportsContentContainer';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

export interface ImportFilterParams
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    LabelsSearchSettings,
    DatamartSearchSettings {}

interface State {
  loading: boolean;
  selectedDatamartId?: string;
}

interface RouterProps {
  organisationId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps & MapStateToProps;

class ImportContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
      workspace,
    } = this.props;

    if (!isSearchValid(search, this.getSearchSetting())) {
      history.push({
        pathname: pathname,
        search: buildDefaultSearch(search, this.getSearchSetting()),
      });
    } else {
      const { datamartId } = parseSearch(search, this.getSearchSetting());
      const selectedDatamartId = datamartId
        ? datamartId
        : workspace(organisationId).datamarts[0].id;
      this.setState({
        selectedDatamartId: selectedDatamartId,
      });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      history,
      workspace,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, this.getSearchSetting())) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, this.getSearchSetting()),
        });
      } else {
        const { datamartId } = parseSearch(search, this.getSearchSetting());
        const selectedDatamartId = datamartId
          ? datamartId
          : workspace(organisationId).datamarts[0].id;
        this.setState({
          selectedDatamartId,
        });
      }
    }
  }

  getSearchSetting(): SearchSetting[] {
    return [...IMPORTS_SEARCH_SETTINGS];
  }

  render() {
    const { selectedDatamartId } = this.state;

    return selectedDatamartId ? (
      <ImportsContentContainer datamartId={selectedDatamartId} noFilterDatamart={false} />
    ) : null;
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose(withRouter, injectIntl, connect(mapStateToProps))(ImportContent);
