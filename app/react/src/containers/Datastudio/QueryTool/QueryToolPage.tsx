import * as React from 'react';
import queryString from 'query-string';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { DatamartSelector } from '../../Datamart';
import SelectorQLBuilderContainer from '../../QueryTool/SelectorQL/SelectorQLBuilderContainer';
import OTQLConsoleContainer from '../../QueryTool/OTQL/OTQLConsoleContainer';

export interface QueryToolPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: any;
}

type Props = RouteComponentProps<QueryToolPageRouteParams> &
  MapStateToProps &
  InjectedIntlProps;

class QueryToolPage extends React.Component<Props> {

  getSelectedDatamart = () => {
    const { connectedUser, location } = this.props;
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
    return selectedDatamart;
  }

  render() {
    const { intl, location, history } = this.props;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
    };    

    const selectedDatamart = this.getSelectedDatamart();

    return (
      <div style={{ height: '100%', display: 'flex' }}>
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
            <OTQLConsoleContainer
              datamartId={selectedDatamart.id}
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
)(QueryToolPage);
