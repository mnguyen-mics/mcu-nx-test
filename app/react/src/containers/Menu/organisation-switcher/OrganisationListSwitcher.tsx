import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { getWorkspace } from '../../../redux/Session/selectors';
import { Dropdown } from 'antd';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import SwitchBySearch from './SwitchBySearch';
import SwitchByList from './SwitchByList';

export interface OrganizationListSwitcherState {
  isVisible: boolean;
}

export interface StoreProps {
  workspaces: UserWorkspaceResource[];
  workspace: (organisationId: string) => UserWorkspaceResource;
}

const maxOrgOrCommunity = 6;

type Props = StoreProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class OrganizationListSwitcher extends React.Component<
  Props,
  OrganizationListSwitcherState
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isVisible: false,
    };
  }

  handleVisibleChange = (visible: boolean) => {
    this.setState({ isVisible: visible });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      workspace,
      workspaces,
    } = this.props;

    const { isVisible } = this.state;

    const currentWorkspace = workspace(organisationId);
    const workspaceNb = workspaces.length;

    return (
      <Dropdown
        overlay={
          isVisible ? (
            workspaceNb < maxOrgOrCommunity * 2 ? (
              <SwitchByList workspaces={workspaces} />
            ) : (
              <SwitchBySearch
                workspaces={workspaces}
                shouldDropdownBeVisible={this.handleVisibleChange}
                maxOrgOrCommunity={maxOrgOrCommunity}
              />
            )
          ) : (
            <div />
          )
        }
        trigger={['click']}
        placement="bottomRight"
        onVisibleChange={this.handleVisibleChange}
      >
        <div className="mcs-organisationListSwitcher_component">
          <hr />
          <div className="mcs-organisationListSwitcher_currentOrg_box">
            <div className="mcs-organisationListSwitcher_currentOrg">
              <p className="mcs-organisationListSwitcher_orgName">
                {currentWorkspace.organisation_name}
              </p>
              <p className="mcs-organisationListSwitcher_orgId">
                {currentWorkspace.organisation_id}
              </p>
            </div>
            <div className="mcs-organisationListSwitcher_downlogo">
              <i className="ant-menu-submenu-arrow" />
            </div>
          </div>
          <hr />
        </div>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspaces: state.session.connectedUser.workspaces,
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(OrganizationListSwitcher);
