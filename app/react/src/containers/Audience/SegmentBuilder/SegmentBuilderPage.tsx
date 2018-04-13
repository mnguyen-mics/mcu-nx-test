import * as React from 'react';
import queryString from 'query-string';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Loading } from '../../../components';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { DatamartSelector } from '../../Datamart';
import SelectorQLBuilderContainer from '../../QueryTool/SelectorQL/SelectorQLBuilderContainer';
import JSONQLBuilderContainer from '../../QueryTool/JSONOTQL/JSONQLBuilderContainer';

export interface QueryBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: any;
}

interface State {
  loading: boolean;
  datamart?: DatamartResource;
}

type Props = RouteComponentProps<QueryBuilderPageRouteParams> &
  MapStateToProps &
  InjectedIntlProps;

class QueryBuilderPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    const { intl, connectedUser, location, history } = this.props;
    const { loading } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      // this.setState({ datamart: selection });
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
    };

    const handleOnSave = () => {
      // TODO create a segment
    };

    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: any) => w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (orgWp.datamarts && orgWp.datamarts.length === 1) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        {loading && <Loading className="loading-full-screen" />}
        {!selectedDatamart && (
          <DatamartSelector
            onSelectDatamart={handleOnSelectDatamart}
            actionbarProps={{
              paths: [
                {
                  name: intl.formatMessage({
                    id: 'query-builder-page-actionbar-title',
                    defaultMessage: 'Query Builder',
                  }),
                },
              ],
            }}
          />
        )}
        {selectedDatamart &&
          selectedDatamart.storage_model_version === 'v201709' && (
            <JSONQLBuilderContainer
              datamartId={selectedDatamart.id}
              onSave={handleOnSave}
              actionbarProps={{
                paths: [
                  {
                    name: intl.formatMessage({
                      id: 'query-builder-page-actionbar-title',
                      defaultMessage: 'Query Builder',
                    }),
                  },
                ],
              }}
            />
          )}
        {selectedDatamart &&
          selectedDatamart.storage_model_version === 'v201506' && (
            <SelectorQLBuilderContainer datamartId={selectedDatamart.id} />
          )}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  connect((state: any) => ({
    connectedUser: state.session.connectedUser,
  })),
)(QueryBuilderPage);
