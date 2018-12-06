import queryString from 'query-string';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { DatamartSelector } from '../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import SaveQueryAsActionBar from '../../QueryTool/SaveAs/SaveQueryAsActionBar';
import {
  UserProfileResource,
  UserWorkspaceResource,
} from '../../../models/directory/UserProfileResource';
import AutomationBuilderContainer from './AutomationBuilderContainer';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

type Props = RouteComponentProps<AutomationBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps;

const messages = defineMessages({
  automationBuilder: {
    id: 'automation-builder-page-actionbar-title',
    defaultMessage: 'Automation Builder',
  },
});

class AutomationBuilderPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

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
      (w: UserWorkspaceResource) =>
        w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (
      orgWp !== undefined &&
      orgWp.datamarts &&
      orgWp.datamarts.length === 1
    ) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString && orgWp !== undefined) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    const automationActionBar = (datamartId: string) => {
      return (
        <SaveQueryAsActionBar
          breadcrumb={[
            {
              name: intl.formatMessage(messages.automationBuilder),
            },
          ]}
        />
      );
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
            <AutomationBuilderContainer
              datamartId={selectedDatamart.id}
              renderActionBar={automationActionBar}
            />
          )}
        {selectedDatamart &&
          selectedDatamart.storage_model_version === 'v201506' &&
          history.push(
            `/v2/o/${
              this.props.match.params.organisationId
            }/automations/create`,
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
