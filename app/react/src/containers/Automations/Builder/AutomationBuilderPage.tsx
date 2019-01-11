import queryString from 'query-string';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  UserProfileResource,
  UserWorkspaceResource,
} from '../../../models/directory/UserProfileResource';
import AutomationBuilderContainer from './AutomationBuilderContainer';
import { DatamartSelector } from '../../Datamart';
import AutomationEditPage from '../Edit/AutomationEditPage';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
  scenarioId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

type Props = RouteComponentProps<AutomationBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps;

export const messages = defineMessages({
  automationBuilder: {
    id: 'automation.builder.page.actionbar.title',
    defaultMessage: 'Automation Builder',
  },
  savingInProgress: {
    id: 'automation.builder.page.actionbar.save.in.progress',
    defaultMessage: 'Saving in progress',
  },
  automationSaved: {
    id: 'automation.builder.page.automation.saved',
    defaultMessage: 'Automation Saved',
  },
});

class AutomationBuilderPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    const { connectedUser, location, intl, history } = this.props;

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

    return selectedDatamart ? (
      selectedDatamart.storage_model_version === 'v201709' ? (
        <AutomationBuilderContainer datamartId={selectedDatamart.id} />
      ) : (
        <AutomationEditPage />
      )
    ) : (
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
