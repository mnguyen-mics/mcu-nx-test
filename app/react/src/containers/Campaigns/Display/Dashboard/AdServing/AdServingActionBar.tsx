import * as React from 'react';
import {
  DisplayCampaignInfoResource,
  AdInfoResource,
} from '../../../../../models/campaign/display';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import { Button, Dropdown, Icon, message, Menu, Modal } from 'antd';
import { McsIcon } from '../../../../../components';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import log from '../../../../../utils/Logger';
import modalMessages from '../../../../../common/messages/modalMessages';
import { generateCsvData, ExportType } from './snippetExport';
import { ClickParam } from 'antd/lib/menu';
import { injectDrawer } from '../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import { formatDisplayCampaignProperty } from '../../../Display/messages';
import resourceHistoryMessages from '../../../../ResourceHistory/ResourceTimeline/messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';

export interface AdServingActionBarProps {
  campaign: DisplayCampaignInfoResource;
  archiveCampaign: (campaignId: string) => void;
}

type Props = AdServingActionBarProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedIntlProps &
  InjectedDrawerProps;

class AdServingActionBar extends React.Component<Props> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  getSnippet = (type: ClickParam) => {
    const {
      campaign,
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;
    const ads: AdInfoResource[] = [];
    campaign.ad_groups.forEach(adGroup => {
      return adGroup.ads.forEach(ad => ads.push(ad));
    });
    generateCsvData(
      organisationId,
      campaign,
      type.key as ExportType,
      ads,
      formatMessage,
    );
  };

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, campaignId },
      },
      campaign,
      intl,
    } = this.props;

    if (campaign && campaign.model_version === 'V2014_06') {
      message.info(intl.formatMessage(messages.editionNotAllowed));
    } else {
      const editUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}/edit`;
      history.push({
        pathname: editUrl,
        state: { from: `${location.pathname}${location.search}` },
      });
    }
  };

  buildMenu = () => {
    const {
      campaign,
      archiveCampaign,
      intl: { formatMessage },
    } = this.props;

    const handleArchiveCampaign = (displayCampaignId: string) => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveCampaign(displayCampaignId);
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      const {
        match: {
          params: { organisationId, campaignId },
        },
        history,
      } = this.props;

      switch (event.key) {
        case 'ARCHIVED':
          return campaign ? handleArchiveCampaign(campaign.id) : null;
        case 'DUPLICATE':
          return this.duplicateCampaign();
        case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(
            ResourceTimelinePage,
            {
              size: 'small',
              additionalProps: {
                resourceType: 'CAMPAIGN',
                resourceId: campaignId,
                handleClose: () => this.props.closeNextDrawer(),
                formatProperty: formatDisplayCampaignProperty,
                resourceLinkHelper: {
                  AD_GROUP: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.adGroupResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this._displayCampaignService
                        .getAdGroup(campaignId, id)
                        .then(response => {
                          return response.data.name || id;
                        });
                    },
                    goToResource: (id: string) => {
                      history.push(
                        `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${id}`,
                      );
                    },
                  },
                },
              },
            },
          );
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="HISTORY">
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        {campaign && campaign.model_version === 'V2014_06' ? null : (
          <Menu.Item key="DUPLICATE">
            <FormattedMessage {...messages.duplicate} />
          </Menu.Item>
        )}
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archiveCampaign} />
        </Menu.Item>
      </Menu>
    );
  };

  duplicateCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;
    history.push({
      pathname: editUrl,
      state: {
        from: `${location.pathname}${location.search}`,
        campaignId: campaignId,
      },
    });
  };

  public render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      campaign,
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.display),
        path: `/v2/o/${organisationId}/campaigns/display`,
      },
      { name: campaign && campaign.name ? campaign.name : '' },
    ];

    const downloadMenu = (
      <Menu onClick={this.getSnippet}>
        <Menu.Item key="GOOGLE_DFP">
          <FormattedMessage {...messages.googleDfp} />
        </Menu.Item>
        <Menu.Item key="GOOGLE_DBM">
          <FormattedMessage {...messages.googleDbm} />
        </Menu.Item>
        <Menu.Item key="APX">
          <FormattedMessage {...messages.apx} />
        </Menu.Item>
        <Menu.Item key="SMART">
          <FormattedMessage {...messages.smartAdServer} />
        </Menu.Item>
        <Menu.Item key="NONE">
          <FormattedMessage {...messages.none} />
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Dropdown overlay={downloadMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="download" />
            <FormattedMessage {...messages.adServingDownload} />
          </Button>
        </Dropdown>
        {campaign && campaign.model_version === 'V2014_06' ? null : (
          <Button onClick={this.editCampaign}>
            <McsIcon type="pen" />
            <FormattedMessage {...messages.editCampaign} />
          </Button>
        )}

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

export default compose<Props, AdServingActionBarProps>(
  withRouter,
  injectIntl,
  injectDrawer,
)(AdServingActionBar);
