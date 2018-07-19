import * as React from 'react';
import { DisplayCampaignInfoResource, AdInfoResource } from '../../../../../models/campaign/display';
import { Actionbar } from '../../../../Actionbar';
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

export interface AdServingActionBarProps {
  campaign: DisplayCampaignInfoResource;
  archiveCampaign: (campaignId: string) => void
}

type Props = AdServingActionBarProps & RouteComponentProps<{ organisationId: string, campaignId: string }> & InjectedIntlProps;

class AdServingActionBar extends React.Component<Props> {

  getSnippet = (type: ClickParam) => {
    const { campaign, intl: { formatMessage }, match: { params: { organisationId } } } = this.props;
    const ads: AdInfoResource[] = [];
    campaign.ad_groups.forEach(adGroup => {
      return adGroup.ads.forEach(ad => ads.push(ad))
    });
    generateCsvData(organisationId, campaign, type.key as ExportType, ads, formatMessage)
  }

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
      switch (event.key) {
        case 'ARCHIVED':
          return campaign ? handleArchiveCampaign(campaign.id) : null;
        case 'DUPLICATE':
          return this.duplicateCampaign();
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick}>
        {campaign && campaign.model_version === 'V2014_06' ? null : <Menu.Item key="DUPLICATE">
          <FormattedMessage {...messages.duplicate} />
        </Menu.Item>}
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
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      { name: campaign && campaign.name ? campaign.name : '' },
    ];

    const downloadMenu = (
      <Menu onClick={this.getSnippet}>
        <Menu.Item key="GOOGLE">
          <FormattedMessage {...messages.google} />
        </Menu.Item>
        <Menu.Item key="APX">
          <FormattedMessage {...messages.apx} />
        </Menu.Item>
        <Menu.Item key="NONE">
          <FormattedMessage {...messages.none} />
        </Menu.Item>
      </Menu>
    )

    return (
      <Actionbar path={breadcrumbPaths}>
        <Dropdown overlay={downloadMenu} trigger={['click']}>
          <Button className='mcs-primary' type="primary" >
            <McsIcon type="download" />
            <FormattedMessage {...messages.adServingDownload} />
          </Button>
        </Dropdown>
        {(campaign && campaign.model_version === 'V2014_06') ? null : <Button onClick={this.editCampaign}>
          <McsIcon type="pen" />
          <FormattedMessage {...messages.editCampaign} />
        </Button>}

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
  injectIntl
)(AdServingActionBar)
