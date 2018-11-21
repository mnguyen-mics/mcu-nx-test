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
import {
  StorylineNodeResource,
  EdgeHandler,
} from '../../../models/automations/automations';

export interface AutomationBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface State {
  automationData?: StorylineNodeResource;
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

class AutomationBuilderPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      automationData: undefined,
    };
  }
  componentDidMount() {
    const onVisit: EdgeHandler = 'ON_VISIT';
    this.setState({
      automationData: {
        node: {
          id: '001',
          name: 'Start',
          scenario_id: 'scenario_id_01',
          type: 'DISPLAY_CAMPAIGN',
          campaign_id: 'campaign_id_456',
          ad_group_id: 'ad_group_id_789',
        },
        out_edges: [
          {
            node: {
              id: '002',
              name: 'WAIT 1',
              scenario_id: 'scenario_id_01',
              type: 'QUERY_INPUT',
              query_id: 'query_id_1212',
              evaluation_mode: '000',
            },
            in_edge: {
              id: '222',
              source_id: '33',
              target_id: '44',
              handler: onVisit,
              scenario_id: 'scenario_id_004',
            },
            out_edges: [
              {
                node: {
                  id: '003',
                  name: 'IF',
                  scenario_id: 'scenario_id_004',
                  type: 'QUERY_INPUT',
                  query_id: 'query_id_55',
                  evaluation_mode: '000',
                },
                out_edges: [
                  {
                    node: {
                      id: '004',
                      name: 'Send Email',
                      scenario_id: '14147',
                      type: 'EMAIL_CAMPAIGN',
                      campaign_id: '2525',
                    },
                    in_edge: {
                      id: '222',
                      source_id: '33',
                      target_id: '44',
                      handler: onVisit,
                      scenario_id: 'scenario_id_004',
                    },
                    out_edges: [], // to continue
                  },
                  {
                    node: {
                      id: '005',
                      name: 'End Node',
                      scenario_id: 'scenario_id_0878',
                      type: 'FAILURE',
                    },
                    in_edge: {
                      id: '222',
                      source_id: '33',
                      target_id: '44',
                      handler: onVisit,
                      scenario_id: 'scenario_id_004',
                    },
                    out_edges: [],
                  },
                  
                ],
              },
            ],
          },
          {
            node: {
              id: '002',
              name: 'WAIT 2',
              scenario_id: 'scenario_id_01',
              type: 'QUERY_INPUT',
              query_id: 'query_id_1212',
              evaluation_mode: '000',
            },
            in_edge: {
              id: '222',
              source_id: '33',
              target_id: '44',
              handler: onVisit,
              scenario_id: 'scenario_id_004',
            },
            out_edges: [
              {
                node: {
                  id: '003',
                  name: 'IF',
                  scenario_id: 'scenario_id_004',
                  type: 'QUERY_INPUT',
                  query_id: 'query_id_55',
                  evaluation_mode: '000',
                },
                out_edges: [
                  {
                    node: {
                      id: '004',
                      name: 'Send Email',
                      scenario_id: '14147',
                      type: 'EMAIL_CAMPAIGN',
                      campaign_id: '2525',
                    },
                    in_edge: {
                      id: '222',
                      source_id: '33',
                      target_id: '44',
                      handler: onVisit,
                      scenario_id: 'scenario_id_004',
                    },
                    out_edges: [],
                  },
                  {
                    node: {
                      id: '005',
                      name: 'End Node',
                      scenario_id: 'scenario_id_0878',
                      type: 'FAILURE',
                    },
                    in_edge: {
                      id: '222',
                      source_id: '33',
                      target_id: '44',
                      handler: onVisit,
                      scenario_id: 'scenario_id_004',
                    },
                    out_edges: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
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
          selectedDatamart.storage_model_version === 'v201709' &&
          this.state.automationData && (
            <AutomationBuilderContainer
              datamartId={selectedDatamart.id}
              renderActionBar={automationActionBar}
              automationData={this.state.automationData}
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
