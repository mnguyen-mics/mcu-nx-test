import queryString from 'query-string';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { DatamartSelector } from '../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import SaveQueryAsActionBar from '../../QueryTool/SaveAs/SaveQueryAsActionBar';
import JSONQLBuilderContainer from '../../QueryTool/JSONOTQL/JSONQLBuilderContainer';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: any;
}

type Props = RouteComponentProps<AutomationBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps;

const messages = defineMessages({
  automationBuilder: {
    id: 'automation-builder-page-actionbar-title',
    defaultMessage: 'Automation Builder',
  }
})

class AutomationBuilderPage extends React.Component<Props> {


  render() {
    const { intl, connectedUser, location, history } = this.props;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
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

    const jsonQLActionbar = (query: QueryDocument, datamartId: string) => {
      return <SaveQueryAsActionBar breadcrumb={
        [
          {
            name: intl.formatMessage(messages.automationBuilder),
          },
        ]
      } />;
    };


    const style: React.CSSProperties = { height: '100%', display: 'flex' };
    return (
      <div style={style}>
      {!selectedDatamart && (
        <DatamartSelector
          onSelectDatamart={handleOnSelectDatamart}
          actionbarProps={{
            paths: [
              {
                name: intl.formatMessage(messages.automationBuilder),
              },
            ],
          }}
        />
      )}
      {selectedDatamart &&
        selectedDatamart.storage_model_version === 'v201709' && (
          <JSONQLBuilderContainer
            datamartId={selectedDatamart.id}
            renderActionBar={jsonQLActionbar}
          />
        )}
      {selectedDatamart &&
        selectedDatamart.storage_model_version === 'v201506' && (
          history.push(`/v2/o/${this.props.match.params.organisationId}/automations/create`)
        )}
    </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect((state: any) => ({
    connectedUser: state.session.connectedUser,
  })),
)(AutomationBuilderPage);
