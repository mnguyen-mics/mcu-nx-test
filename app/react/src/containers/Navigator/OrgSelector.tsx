import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Input, Card } from 'antd';
import { connect } from 'react-redux';
import log from '../../utils/Logger';
import _ from 'lodash'

import * as SessionHelper from '../../state/Session/selectors';
import pathToRegexp from 'path-to-regexp';
import { ButtonStyleless } from '../../components/index';

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
    console.log(props.workspaces)
  }

  changeWorkspace = ({ key }: { key: string }) => {
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

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: e.target.value })
  }

  onCardClick = (key: string) => {
    return () => this.changeWorkspace({ key })
  }

  render() {

    return (
      <div>
        <Search
          placeholder="Search Organisation"
          onSearch={this.onSearch}
          style={{ width: 160, marginLeft: 20, marginRight: 20, marginTop: 20 }}
          onChange={this.onChange}
        />
        {this.props.workspaces &&
            this.props.workspaces
              .filter(item => {
                if (this.state.search !== '') {
                  return _.includes(item.organisation_name.toUpperCase(), this.state.search.toUpperCase())
                }
                return true;
              })
              .map(item =>
                <ButtonStyleless
                  key={item.organisation_id}
                  onClick={this.onCardClick(item.organisation_id)}
                >
                  <Card
                    hoverable={true}
                    style={{ width: 160, marginLeft: 20, marginTop: 20 }}
                    cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                  >
                    <Meta
                      description={item.organisation_name}
                    />
                  </Card>
                </ButtonStyleless>,
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
