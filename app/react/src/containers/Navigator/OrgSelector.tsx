import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Card, Row, Col } from 'antd';
import { connect } from 'react-redux';
import log from '../../utils/Logger';
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import pAll from 'p-all';
import * as SessionHelper from '../../redux/Session/selectors';
import OrgLogo from '../Logo/OrgLogo';
import { Button } from '@mediarithmics-private/mcs-components-library';
import Search from 'antd/lib/input/Search';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IOrganisationService } from '../../services/OrganisationService';

const { Meta } = Card;

export interface OrgSelectorProps {
  workspaces: UserWorkspaceResource[];
  workspace: UserWorkspaceResource;
  hasDatamarts: boolean;
  size: number;
  onItemClick: () => void;
}

interface OrgSelectorState {
  search: string;
  orgLogoMap: {
    [orgId: string]: { isLoading: boolean; logoUrl?: string };
  };
}

type InnerProps = InjectedIntlProps &
  OrgSelectorProps &
  RouteComponentProps<{ organisationId: string }>;

class OrgSelector extends React.Component<InnerProps, OrgSelectorState> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;
  private fetchLogosDebounced: (orgLogoToFetch: UserWorkspaceResource[]) => void;

  constructor(props: InnerProps) {
    super(props);
    this.state = {
      search: '',
      orgLogoMap: this.getCachedOrgLogoMap(),
    };
    this.fetchLogosDebounced = _.debounce(this.fetchLogos, 500);
  }

  componentDidMount() {
    if (this.showOrgs()) {
      this.fetchNotInCacheOrgLogoMap();
    }
  }

  showOrgs = () => this.props.workspaces.length < 49 || this.state.search !== '';

  getCachedOrgLogoMap = () => {
    return this.props.workspaces
      .filter(wp => {
        const logoIsInCache = this._organisationService.getLogoCache(wp.organisation_id);
        return !!logoIsInCache;
      })
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr.organisation_id]: {
            logoUrl: URL.createObjectURL(
              this._organisationService.getLogoCache(curr.organisation_id),
            ),
          },
        }),
        {},
      );
  };

  fetchNotInCacheOrgLogoMap = () => {
    const notInCacheLogos = this.getFilteredWorkspaces().filter(wp => {
      const logoIsInCache = this._organisationService.getLogoCache(wp.organisation_id);
      return !logoIsInCache;
    });

    this.setState(
      prev => ({
        orgLogoMap: {
          ...prev.orgLogoMap,
          ...notInCacheLogos.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.organisation_id]: { isLoading: true },
            }),
            {},
          ),
        },
      }),
      () => {
        this.fetchLogosDebounced(notInCacheLogos);
      },
    );
  };

  getFilteredWorkspaces = () => {
    const { workspaces } = this.props;
    if (this.state.search === '') {
      return workspaces;
    }
    return workspaces.filter(wp =>
      wp.organisation_name.toLocaleLowerCase().includes(this.state.search.toLowerCase()),
    );
  };

  fetchLogos = (orgLogoToFetch: UserWorkspaceResource[]) => {
    const promises = orgLogoToFetch.map(r => {
      return () =>
        this._organisationService.getLogo(r.organisation_id).then(blobLogo => {
          this.setState(prev => ({
            orgLogoMap: {
              ...prev.orgLogoMap,
              [r.organisation_id]: {
                isLoading: false,
                logoUrl: URL.createObjectURL(blobLogo),
              },
            },
          }));
        });
    });
    pAll(promises, { concurrency: 4 });
  };

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

  onSearch = (value: string) => {
    this.setState({ search: value });
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value.trim();
    this.setState(
      () => ({ search: searchText }),
      () => this.fetchNotInCacheOrgLogoMap(),
    );
  };

  onCardClick = (key: string) => {
    return () => this.changeWorkspace({ key });
  };

  render() {
    const showOrgs = this.showOrgs();

    const filteredWorkspaces = this.getFilteredWorkspaces();

    let rowSize = 1;

    if (this.props.size === 800) {
      rowSize = 4;
    } else if (this.props.size === 400) {
      rowSize = 2;
    }

    return (
      <div className='mcs-org-selector'>
        <Row gutter={20} style={{ marginRight: 20, marginLeft: 20 }}>
          <Col span={24}>
            <Search
              placeholder='Search Organisation'
              onSearch={this.onSearch}
              className='search-input'
              onChange={this.onChange}
              autoFocus={true}
            />
          </Col>
        </Row>
        <Row gutter={20} style={{ marginRight: 20, marginLeft: 20 }}>
          {showOrgs ? (
            filteredWorkspaces && filteredWorkspaces.length ? (
              filteredWorkspaces.map(item => (
                <Col span={24 / rowSize} key={item.organisation_id}>
                  <Button
                    onClick={this.onCardClick(item.organisation_id)}
                    style={{ height: 134, marginBottom: 20, width: '100%' }}
                  >
                    <Card
                      hoverable={true}
                      className='mcs-org-card'
                      cover={
                        <OrgLogo
                          organisationId={item.organisation_id}
                          isLoading={
                            this.state.orgLogoMap[item.organisation_id]
                              ? this.state.orgLogoMap[item.organisation_id].isLoading
                              : false
                          }
                          logoUrl={
                            this.state.orgLogoMap[item.organisation_id]
                              ? this.state.orgLogoMap[item.organisation_id].logoUrl
                              : null
                          }
                        />
                      }
                      style={{ height: '100%' }}
                    >
                      <Meta className='mcs-card-body' description={item.organisation_name} />
                    </Card>
                  </Button>
                </Col>
              ))
            ) : (
              <div className='mcs-no-results'>
                <FormattedMessage id='orgSelector.noResult' defaultMessage='No Results' />
              </div>
            )
          ) : (
            <Col span={24}>
              <FormattedMessage
                id='orgSelector.tooManyOrgs'
                defaultMessage='You have access to too many organisations, please use the search to narrow your selection down'
              />
            </Col>
          )}
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspaces: state.session.connectedUser.workspaces,
  workspace: SessionHelper.getWorkspace(state),
  hasDatamarts: SessionHelper.hasDatamarts(state),
});

export default compose<InnerProps, OrgSelectorProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(OrgSelector);
