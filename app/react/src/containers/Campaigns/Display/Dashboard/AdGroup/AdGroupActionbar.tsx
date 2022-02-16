import * as React from 'react';
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Menu, Modal } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import messages from '../messages';
import { RouteComponentProps } from 'react-router';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display/index';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import { formatAdGroupProperty } from '../../../Display/messages';
import resourceHistoryMessages from '../../../../ResourceHistory/ResourceTimeline/messages';
import { creativeIsDisplayAdResource } from '../../../../Creative/DisplayAds/Edit/domain';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IDisplayNetworkService } from '../../../../../services/DisplayNetworkService';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { AdexInventoryServiceItemPublicResource } from '../../../../../models/servicemanagement/PublicServiceItemResource';
import { IGeonameService } from '../../../../../services/GeonameService';
import { ICatalogService } from '../../../../../services/CatalogService';
import { ICreativeService } from '../../../../../services/CreativeService';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';
import { IResourceHistoryService } from '../../../../../services/ResourceHistoryService';

const { Dropdown } = PopupContainer;

interface AdGroupActionbarProps {
  adGroup?: AdGroupResource;
  displayCampaign?: Omit<DisplayCampaignInfoResource, 'ad_groups'>;
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

  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @lazyInject(TYPES.IGeonameService)
  private _geonameService: IGeonameService;

  @lazyInject(TYPES.ICatalogService)
  private _catalogService: ICatalogService;

  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

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
      <Button className='mcs-primary' type='primary' onClick={onActiveClick}>
        <McsIcon type='play' />
        <FormattedMessage {...messages.activateAdGroup} />
      </Button>
    );
    const onPauseClick = () => {
      onClickElement('PAUSED');
    };
    const pauseCampaignElement = (
      <Button className='mcs-primary' type='primary' onClick={onPauseClick}>
        <McsIcon type='pause' />
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
    history.push(editUrl, {
      from: `${location.pathname}${location.search}`,
      adGroupId: adGroupId,
    });
  };

  buildMenu = () => {
    const { adGroup, archiveAdGroup, intl, displayCampaign } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      Modal.confirm({
        title: intl.formatMessage(messages.archiveAdGroupModalTitle),
        content: intl.formatMessage(messages.archiveAdGroupModalMessage),
        icon: <ExclamationCircleOutlined />,
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
          return this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
            additionalProps: {
              resourceType: 'AD_GROUP',
              resourceId: adGroupId,
              handleClose: () => this.props.closeNextDrawer(),
              formatProperty: formatAdGroupProperty,
              resourceLinkHelper: {
                DISPLAY_CAMPAIGN: {
                  // this one is only kept for backward compatibility, all the new events are related to "CAMPAIGN"
                  direction: 'PARENT',
                  getType: () => {
                    return (
                      <FormattedMessage {...resourceHistoryMessages.displayCampaignResourceType} />
                    );
                  },
                  getName: (id: string) => {
                    return this._displayCampaignService.getCampaignName(id);
                  },
                  goToResource: (id: string) => {
                    history.push(`/v2/o/${organisationId}/campaigns/display/${id}`);
                  },
                },
                CAMPAIGN: {
                  direction: 'PARENT',
                  getType: () => {
                    return (
                      <FormattedMessage {...resourceHistoryMessages.displayCampaignResourceType} />
                    );
                  },
                  getName: (id: string) => {
                    return this._displayCampaignService.getCampaignName(id);
                  },
                  goToResource: (id: string) => {
                    history.push(`/v2/o/${organisationId}/campaigns/display/${id}`);
                  },
                },
                AUDIENCE_SEGMENT_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return <FormattedMessage {...resourceHistoryMessages.segmentResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'AUDIENCE_SEGMENT_SELECTION',
                        id,
                        'AUDIENCE_SEGMENT',
                      )
                      .then(audienceSegmentId => {
                        return this._audienceSegmentService
                          .getSegment(audienceSegmentId)
                          .then(response => {
                            return response.data.name;
                          });
                      });
                  },
                  goToResource: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'AUDIENCE_SEGMENT_SELECTION',
                        id,
                        'AUDIENCE_SEGMENT',
                      )
                      .then(audienceSegmentId => {
                        history.push(
                          `/v2/o/${organisationId}/audience/segments/${audienceSegmentId}`,
                        );
                      });
                  },
                },
                DISPLAY_NETWORK_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return (
                      <FormattedMessage {...resourceHistoryMessages.displayNetworkResourceType} />
                    );
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'DISPLAY_NETWORK_SELECTION',
                        id,
                        'DISPLAY_NETWORK',
                      )
                      .then(displayNetworkId => {
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
                    return <FormattedMessage {...resourceHistoryMessages.creativeResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(organisationId, 'AD', id, 'CREATIVE')
                      .then(adId => {
                        return this._creativeService.getCreative(adId).then(creativeResponse => {
                          return creativeResponse.data.name;
                        });
                      });
                  },
                  goToResource: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(organisationId, 'AD', id, 'CREATIVE')
                      .then(adId => {
                        return this._creativeService.getCreative(adId).then(creativeResponse => {
                          if (creativeIsDisplayAdResource(creativeResponse.data)) {
                            return history.push(
                              `/v2/o/${organisationId}/creatives/display/edit/${creativeResponse.data.id}`,
                            );
                          } else {
                            return history.push(
                              `/v2/o/${organisationId}/creatives/email/edit/${creativeResponse.data.id}`,
                            );
                          }
                        });
                      });
                  },
                },
                AD_EXCHANGE_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return <FormattedMessage {...resourceHistoryMessages.adExchangeResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'AD_EXCHANGE_SELECTION',
                        id,
                        'AD_EXCHANGE',
                      )
                      .then(adExchangeId => {
                        return this._catalogService
                          .getServices(organisationId, {
                            serviceType: ['DISPLAY_CAMPAIGN.INVENTORY_ACCESS'],
                          })
                          .then(res => {
                            const inventoryAccessExchanges = res.data.filter(
                              r => r.type === 'inventory_access_ad_exchange',
                            ) as AdexInventoryServiceItemPublicResource[];
                            const adexExchange = inventoryAccessExchanges.find(
                              r => r.ad_exchange_id === adExchangeId,
                            );
                            if (adexExchange !== undefined) {
                              return adexExchange.name;
                            } else return intl.formatMessage(resourceHistoryMessages.deleted);
                          });
                      });
                  },
                  goToResource: (id: string) => {
                    return;
                  },
                },
                GEO_TARGETING_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return 'Location';
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'GEO_TARGETING_SELECTION',
                        id,
                        'GEONAME',
                      )
                      .then(geonameId => {
                        return this._geonameService.getGeoname(geonameId).then(res => {
                          return res.data.name;
                        });
                      });
                  },
                  goToResource: (id: string) => {
                    return;
                  },
                },
              },
            },
            size: 'small',
          });
        default:
          return () => {
            //
          };
      }
    };

    const addMenu = (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='HISTORY'>
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? (
          <Menu.Item key='DUPLICATE'>
            <FormattedMessage {...messages.duplicate} />
          </Menu.Item>
        ) : null}
        <Menu.Item key='ARCHIVED'>
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
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/display`}>
        {formatMessage(messages.display)}
      </Link>,
      <Link key='2' to={`/v2/o/${organisationId}/campaigns/display/${campaignId}`}>
        {displayCampaign ? displayCampaign.name : ''}
      </Link>,
      adGroup ? adGroup.name || adGroup.id : '',
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        {actionElement}
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? (
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/edit/${adGroupId}`,
              state: { from: `${location.pathname}${location.search}` },
            }}
          >
            <Button>
              <McsIcon type='pen' />
              <FormattedMessage {...messages.editAdGroup} />
            </Button>
          </Link>
        ) : null}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, AdGroupActionbarProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(AdGroupActionbar);
