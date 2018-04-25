import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Card, Row, Col } from 'antd';
import { connect } from 'react-redux';
import log from '../../utils/Logger';
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';

import * as SessionHelper from '../../state/Session/selectors';
import OrgLogo from '../Logo/OrgLogo';
import { ButtonStyleless } from '../../components/index';
import { Workspace } from '../../models/organisation/organisation';
import Search from 'antd/lib/input/Search';

const { Meta } = Card;

export interface OrgSelectorProps {
  workspaces: Workspace[];
  workspace: Workspace;
  hasDatamarts: boolean;
  size: number;
  onItemClick: () => void;
}

interface OrgSelectorState {
  search: string;
}

type InnerProps = InjectedIntlProps &
  OrgSelectorProps &
  RouteComponentProps<{ organisationId: string }>;

class OrgSelector extends React.Component<InnerProps, OrgSelectorState> {
  searchInput: React.RefObject<Search>;

  constructor(props: InnerProps) {
    super(props);
    this.searchInput = React.createRef<Search>();
    this.state = {
      search: '',
    };
  }

  changeWorkspace = ({ key }: { key: string }) => {
    const {
      history,
      match: { path, params },
      onItemClick,
    } = this.props;

    const toPath = pathToRegexp.compile(path);
    const fullUrl = toPath({
      ...params,
      organisationId: key,
    });
    log.debug(`Change workspace, redirect to ${fullUrl}`);
    history.push(fullUrl);
    onItemClick();
  };

  componentDidMount() {
    if (this.searchInput.current) {
      console.log('object');
    }
  }

  onSearch = (value: string) => {
    this.setState({ search: value });
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: e.target.value });
  };

  onCardClick = (key: string) => {
    return () => this.changeWorkspace({ key });
  };

  render() {
    const { workspaces } = this.props;

    const showOrgs = workspaces.length > 49 ? false : true;

    const filteredWorkspaces =
      workspaces &&
      workspaces.filter(item => {
        if (this.state.search !== '') {
          return _.includes(
            item.organisation_name.toUpperCase(),
            this.state.search.toUpperCase(),
          );
        }
        return true;
      });

    let rowSize = 1;

    if (this.props.size === 800) {
      rowSize = 4;
    } else if (this.props.size === 400) {
      rowSize = 2;
    }

    return (
      <div className="mcs-org-selector">
        <Row gutter={20} style={{ marginRight: 20, marginLeft: 20 }}>
          <Col span={24}>
            <Search
              ref={this.searchInput}
              placeholder="Search Organisation"
              onSearch={this.onSearch}
              className="search-input"
              onChange={this.onChange}
              autoFocus={true}
            />
          </Col>

          <Row gutter={24}>
            {showOrgs || this.state.search !== '' ? (
              filteredWorkspaces && filteredWorkspaces.length ? (
                filteredWorkspaces.map(item => (
                  <Col span={24 / rowSize} key={item.organisation_id}>
                    <ButtonStyleless
                      onClick={this.onCardClick(item.organisation_id)}
                      style={{ height: 134, marginBottom: 20, width: '100%' }}
                    >
                      <Card
                        hoverable={true}
                        className="mcs-org-card"
                        cover={
                          <OrgLogo organisationId={item.organisation_id} />
                        }
                        style={{ height: '100%' }}
                      >
                        <Meta
                          className="mcs-card-body"
                          description={item.organisation_name}
                        />
                      </Card>
                    </ButtonStyleless>
                  </Col>
                ))
              ) : (
                <div className="mcs-no-results">
                  <FormattedMessage
                    id="orgSelector.noResult"
                    defaultMessage="No Results"
                  />
                </div>
              )
            ) : (
              <div>
                <FormattedMessage
                  id="orgSelector.tooManyOrgs"
                  defaultMessage="You have access to too many organisations, please use the search to narrow your selection down"
                />
              </div>
            )}
          </Row>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspaces: Object.keys(SessionHelper.getWorkspaces(state)).map(
    item => SessionHelper.getWorkspaces(state)[item],
  ),
  workspace: SessionHelper.getWorkspace(state),
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

export default compose<InnerProps, OrgSelectorProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(OrgSelector);
