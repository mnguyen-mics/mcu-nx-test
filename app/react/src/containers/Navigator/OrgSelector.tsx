import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Menu, Input, Card } from 'antd';
import { connect } from 'react-redux';
import log from '../../utils/Logger';

import * as SessionHelper from '../../state/Session/selectors';
import pathToRegexp from 'path-to-regexp';

const Search = Input.Search;
const { Meta } = Card;

export interface Workspace {
  organisation_id: string;
  organisation_name: string;
}

export interface OrgSelectorProps {
  workspaces: Workspace[];
  workspace: Workspace;
  hasDatamarts: boolean;
}

interface OrgSelectorState {
  search: string;
}

type InnerProps = InjectedIntlProps & OrgSelectorProps & RouteComponentProps<{organisationId: string}>;

class OrgSelector extends React.Component<InnerProps, OrgSelectorState> {

  constructor(props: InnerProps) {
    super(props);
    this.state = {
      search: '',
    };
  }

  changeWorkspace = ({ key }) => {
    const {
      history,
      match: {
        path,
        params,
      },
    } = this.props;

    const toPath = pathToRegexp.compile(path);
    const fullUrl = toPath({
      ...params,
      organisationId: key,
    });
    log.debug(`Change workspace, redirect to ${fullUrl}`);
    history.push(fullUrl);
  }

  onSearch = (value: string) => {
    this.setState({ search: value });
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    return (
      <div>
        <Search
          placeholder="input search text"
          onSearch={this.onSearch}
          style={{ width: 160, marginLeft: 20, marginRight: 20 }}
        />
        <Menu
          onClick={this.changeWorkspace}
          selectedKeys={[organisationId]}
        >
          {this.props.workspaces &&
            this.props.workspaces
              .filter(item => this.state.search !== '' && item.organisation_name.includes(this.state.search))
              .map(item =>
              <Menu.Item key={item.organisation_id}>
                {item.organisation_name}
              </Menu.Item>,
            )}
        </Menu>
        {this.props.workspaces &&
            this.props.workspaces
              .filter(item => this.state.search !== '' && item.organisation_name.includes(this.state.search))
              .map(item =>
              <Card
                key={item.organisation_id}
                hoverable={true}
                style={{ width: 240 }}
                cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
              >
                <Meta
                  title="Europe Street beat"
                  description="www.instagram.com"
                />
              </Card>,
            )}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspaces: Object.keys(SessionHelper.getWorkspaces(state)).map(item => SessionHelper.getWorkspaces(state)[item]),
  workspace: SessionHelper.getWorkspace(state),
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

export default compose<InnerProps, OrgSelectorProps>(
  withRouter,
  injectIntl,
  connect(
    mapStateToProps,
    undefined,
  ),
)(OrgSelector);
