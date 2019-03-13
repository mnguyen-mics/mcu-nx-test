import * as React from 'react';
import { Button, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { Dropdown } from '../../../../../components/PopupContainers';
import { Actionbar } from '../../../../Actionbar';
import messages from '../messages';
import { McsIcon } from '../../../../../components/index';
import { RouteComponentProps } from 'react-router';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display/index';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import formatAdGroupProperty from '../../../../../messages/campaign/display/adgroupMessages';
import resourceHistoryMessages from '../../../../ResourceHistory/ResourceTimeline/messages';
import CreativeService from '../../../../../services/CreativeService';
import { creativeIsDisplayAdResource } from '../../../../Creative/DisplayAds/Edit/domain';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IDisplayNetworkService } from '../../../../../services/DisplayNetworkService';
import ResourceHistoryService from '../../../../../services/ResourceHistoryService';
import {
  ResourceType,
  isHistoryLinkEvent,
} from '../../../../../models/resourceHistory/ResourceHistory';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { IKeywordListService } from '../../../../../services/Library/KeywordListsService';
import { IDealsListService } from '../../../../../services/Library/DealListsService';
import lodash from 'lodash';
import CatalogService from '../../../../../services/CatalogService';
import { AdexInventoryServiceItemPublicResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';

interface AdGroupActionbarProps {
  adGroup?: AdGroupResource;
  displayCampaign?: DisplayCampaignInfoResource;
  updateAdGroup: (adGroupId: string, body: Partial<AdGroupResource>) => void;
  archiveAdGroup: () => void;
}

type JoinedProps = AdGroupActionbarProps &
  InjectedIntlProps &
  RouteComponentProps<{
    organisationId: string;
    campaignId: string;
    adGroupId: string;
  }> &
  InjectedDrawerProps;

class AdGroupActionbar extends React.Component<JoinedProps> {
  @lazyInject(TYPES.IDisplayNetworkService)
  private _displayNetworkService: IDisplayNetworkService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IKeywordListService)
  private _keywordsListService: IKeywordListService;

  @lazyInject(TYPES.IDealsListService)
  private _dealsListService: IDealsListService;

  buildActionElement = () => {
    const { adGroup, updateAdGroup } = this.props;

    const onClickElement = (status: AdGroupStatus) =>
      adGroup &&
      updateAdGroup(adGroup.id, {
        status,
      });

    const onActiveClick = () => {
      onClickElement('ACTIVE');
    };
    const activeCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={onActiveClick}>
        <McsIcon type="play" />
        <FormattedMessage {...messages.activateAdGroup} />
      </Button>
    );
    const onPauseClick = () => {
      onClickElement('PAUSED');
    };
    const pauseCampaignElement = (
      <Button className="mcs-primary" type="primary" onClick={onPauseClick}>
        <McsIcon type="pause" />
        <FormattedMessage {...messages.pauseAdGroup} />
      </Button>
    );

    return adGroup && adGroup.id
      ? adGroup.status === 'PAUSED' || adGroup.status === 'PENDING'
        ? activeCampaignElement
        : pauseCampaignElement
      : null;
  };

  duplicateAdGroup = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, campaignId, adGroupId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/create`;
    history.push({
      pathname: editUrl,
      state: {
        from: `${location.pathname}${location.search}`,
        adGroupId: adGroupId,
      },
    });
  };

  getLinkedResourceIdInSelection = (
    organisationId: string,
    selectionType: ResourceType,
    selectionId: string,
    linkedResourceType: ResourceType,
  ) => {
    const params = {
      resource_type: selectionType,
      resource_id: selectionId,
      max_results: 10,
    }; // Let's keep 10 for now, selections shouldn't have many events anyway.

    return ResourceHistoryService.getResourceHistory(
      organisationId,
      params,
    ).then(response => {
      const ids = lodash
        .flatMap(response.data, rhr => {
          return rhr.events.map(event =>
            isHistoryLinkEvent(event) &&
              event.resource_type === linkedResourceType
              ? event.resource_id
              : '',
          );
        }).filter((id => id !== ""))
        return ids.length > 0 ? ids[0] : ''
    });
  };

  buildMenu = () => {
    const { adGroup, archiveAdGroup, intl, displayCampaign } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      Modal.confirm({
        title: intl.formatMessage(messages.archiveAdGroupModalTitle),
        content: intl.formatMessage(messages.archiveAdGroupModalMessage),
        iconType: 'exclamation-circle',
        okText: intl.formatMessage(messages.creativeModalConfirmArchivedOk),
        cancelText: intl.formatMessage(messages.cancelText),
        onOk() {
          return archiveAdGroup();
        },
        onCancel() {
          //
        },
      });
    };

    const onClick = (event: any) => {
      const {
        match: {
          params: { organisationId, adGroupId },
        },
        history,
      } = this.props;

      switch (event.key) {
        case 'ARCHIVED':
          return adGroup && handleArchiveGoal(adGroup.id);
        case 'DUPLICATE':
          return this.duplicateAdGroup();
        case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(
            ResourceTimelinePage,
            {
              additionalProps: {
                resourceType: 'AD_GROUP',
                resourceId: adGroupId,
                handleClose: () => this.props.closeNextDrawer(),
                formatProperty: formatAdGroupProperty,
                resourceLinkHelper: {
                  AUDIENCE_SEGMENT_SELECTION: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.segmentResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'AUDIENCE_SEGMENT_SELECTION',
                        id,
                        'AUDIENCE_SEGMENT',
                      ).then(audienceSegmentId => {
                        return this._audienceSegmentService
                          .getSegment(audienceSegmentId)
                          .then(response => {
                            return response.data.name;
                          });
                      });
                    },
                    goToResource: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'AUDIENCE_SEGMENT_SELECTION',
                        id,
                        'AUDIENCE_SEGMENT',
                      ).then(audienceSegmentId => {
                        history.push(
                          `/v2/o/${organisationId}/audience/segments/${audienceSegmentId}`,
                        );
                      });
                    },
                  },
                  KEYWORDS_LIST_SELECTION: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.keywordsListResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'KEYWORDS_LIST_SELECTION',
                        id,
                        'KEYWORDS_LIST',
                      ).then(keywordsListId => {
                        return this._keywordsListService
                          .getKeywordList(keywordsListId)
                          .then(response => {
                            return response.data.name;
                          });
                      });
                    },
                    goToResource: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'KEYWORDS_LIST_SELECTION',
                        id,
                        'KEYWORDS_LIST',
                      ).then(keywordsListId => {
                        history.push(
                          `/v2/o/${organisationId}/library/keywordslist/${keywordsListId}/edit`,
                        );
                      });
                    },
                  },
                  DISPLAY_NETWORK_SELECTION: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.displayNetworkResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'DISPLAY_NETWORK_SELECTION',
                        id,
                        'DISPLAY_NETWORK',
                      ).then(displayNetworkId => {
                        return this._displayNetworkService
                          .getDisplayNetwork(displayNetworkId, organisationId)
                          .then(displayNetworkResponse => {
                            return displayNetworkResponse.data.name;
                          });
                      });
                    },
                    goToResource: (id: string) => {
                      return;
                    },
                  },
                  AD: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.creativeResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'AD',
                        id,
                        'CREATIVE',
                      ).then(adId => {
                        return CreativeService.getCreative(adId).then(
                          creativeResponse => {
                            return creativeResponse.data.name;
                          },
                        );
                      });
                    },
                    goToResource: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'AD',
                        id,
                        'CREATIVE',
                      ).then(adId => {
                        return CreativeService.getCreative(adId).then(
                          creativeResponse => {
                            if (
                              creativeIsDisplayAdResource(creativeResponse.data)
                            ) {
                              if (creativeResponse.data.subtype === 'NATIVE') {
                                return history.push(
                                  `/v2/o/${organisationId}/creatives/native/edit/${
                                  creativeResponse.data.id
                                  }`,
                                );
                              } else {
                                return history.push(
                                  `/v2/o/${organisationId}/creatives/display/edit/${
                                  creativeResponse.data.id
                                  }`,
                                );
                              }
                            } else {
                              return history.push(
                                `/v2/o/${organisationId}/creatives/email/edit/${
                                creativeResponse.data.id
                                }`,
                              );
                            }
                          },
                        );
                      });
                    },
                  },
                  DEAL_LIST_SELECTION: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.dealListResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'DEAL_LIST_SELECTION',
                        id,
                        'DEAL_LIST',
                      ).then(dealListId => {
                        return this._dealsListService
                          .getDealList(organisationId, dealListId)
                          .then(res => {
                            return res.data.name;
                          });
                      });
                    },
                    goToResource: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'DEAL_LIST_SELECTION',
                        id,
                        'DEAL_LIST',
                      ).then(dealListId => {
                        history.push(
                          `/v2/o/${organisationId}/library/deallist/${dealListId}/edit`,
                        );
                      });
                    },
                  },
                  AD_EXCHANGE_SELECTION: {
                    direction: 'CHILD',
                    getType: () => {
                      return <FormattedMessage {...resourceHistoryMessages.adExchangeResourceType} />;
                    },
                    getName: (id: string) => {
                      return this.getLinkedResourceIdInSelection(
                        organisationId,
                        'AD_EXCHANGE_SELECTION',
                        id,
                        'AD_EXCHANGE',
                      ).then(adExchangeId => {
                        return CatalogService.getServices(organisationId, {
                          serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS']
                        })
                          .then(res => {
                            const inventoryAccessExchanges = (res.data.filter(r => r.type === 'inventory_access_ad_exchange') as AdexInventoryServiceItemPublicResource[]);
                            const adexExchange = inventoryAccessExchanges.find(r => r.ad_exchange_id === adExchangeId)
                            if (adexExchange !== undefined) {
                              return adexExchange.name;
                            } else return intl.formatMessage(resourceHistoryMessages.deleted)
                          })
                      });
                    },
                    goToResource: (id: string) => {
                      return
                    }


                  }
                },
              },
              size: 'small',
            },
          );
        default:
          return () => {
            //
          };
      }
    };

    const addMenu = (
      <Menu onClick={onClick}>
        <Menu.Item key="HISTORY">
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? (
          <Menu.Item key="DUPLICATE">
            <FormattedMessage {...messages.duplicate} />
          </Menu.Item>
        ) : null}
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archiveAdGroup} />
        </Menu.Item>
      </Menu>
    );

    return addMenu;
  };

  render() {
    const {
      adGroup,
      displayCampaign,
      intl: { formatMessage },
      match: {
        params: { organisationId, campaignId, adGroupId },
      },
      location,
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.display),
        url: `/v2/o/${organisationId}/campaigns/display`,
        key: formatMessage(messages.display),
      },
      {
        name: displayCampaign && displayCampaign.name,
        url: `/v2/o/${organisationId}/campaigns/display/${campaignId}`,
        key: displayCampaign && displayCampaign.id,
      },
      { name: adGroup && adGroup.name, key: adGroup && adGroup.id },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        {actionElement}
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? (
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/edit/${adGroupId}`,
              state: { from: `${location.pathname}${location.search}` },
            }}
          >
            <Button>
              <McsIcon type="pen" />
              <FormattedMessage {...messages.editAdGroup} />
            </Button>
          </Link>
        ) : null}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
});

const mapDispatchToProps = {};

export default compose<JoinedProps, AdGroupActionbarProps>(
  injectIntl,
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectDrawer,
)(AdGroupActionbar);
