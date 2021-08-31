import * as React from 'react';
import {
  DisplayCampaignInfoResource,
  AdInfoResource,
} from '../../../../../models/campaign/display';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Button, Dropdown, message, Menu, Modal } from 'antd';
import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import log from '../../../../../utils/Logger';
import modalMessages from '../../../../../common/messages/modalMessages';
import { generateCsvData, ExportType } from './snippetExport';
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
import ReportService, { ReportViewResponse } from '../../../../../services/ReportService';
import { Index } from '../../../../../utils';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { parseSearch } from '../../../../../utils/LocationSearchHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import ExportService from '../../../../../services/ExportService';
import { Link } from 'react-router-dom';
export interface AdServingActionBarProps {
  campaign: DisplayCampaignInfoResource;
  archiveCampaign: (campaignId: string) => void;
}

type Props = AdServingActionBarProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedIntlProps &
  InjectedDrawerProps;

interface AdServingActionBarState {
  exportIsRunning: boolean;
  loading: boolean;
}

class AdServingActionBar extends React.Component<Props, AdServingActionBarState> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = { exportIsRunning: false, loading: false };
  }

  getSnippet = (type: any) => {
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
    generateCsvData(organisationId, campaign, type.key as ExportType, ads, formatMessage);
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
        icon: <ExclamationCircleOutlined />,
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
          return this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
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
                    return <FormattedMessage {...resourceHistoryMessages.adGroupResourceType} />;
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
          });
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='HISTORY'>
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        {campaign && campaign.model_version === 'V2014_06' ? null : (
          <Menu.Item key='DUPLICATE'>
            <FormattedMessage {...messages.duplicate} />
          </Menu.Item>
        )}
        <Menu.Item key='ARCHIVED'>
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

  exportIsRunningModal = (e: React.MouseEvent) => {
    const {
      intl: { formatMessage },
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.exportIsRunningTitle),
      content: formatMessage(modalMessages.exportIsRunningMessage),
      icon: <ExclamationCircleOutlined />,
      okText: formatMessage(modalMessages.confirm),
      onOk() {
        // closing modal
      },
      // onCancel() {},
    });
  };

  filterValueForCampaign = (normalizedReport: Index<any>, campaignId: string) => {
    return normalizedReport.filter((item: any) => item.campaign_id.toString() === campaignId);
  };

  handleRunExport = (e: React.MouseEvent) => {
    const {
      campaign,
      match: {
        params: { organisationId, campaignId },
      },
      location: { search },
      intl: { formatMessage },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const lookbackWindow = filter.to.toMoment().unix() - filter.from.toMoment().unix();

    const dimensions =
      lookbackWindow > 172800 ? ['day', 'campaign_id'] : ['day,hour_of_day', 'campaign_id'];

    this.setState({ loading: true });

    const promiseArray: Array<Promise<ReportViewResponse>> = [];
    campaign.ad_groups.forEach(adgroup => {
      adgroup.ads.map(ad =>
        promiseArray.push(
          ReportService.getAdDeliveryReport(
            organisationId,
            'creative_id',
            ad.creative_id,
            filter.from,
            filter.to,
            dimensions,
            undefined,
            {
              campaign_id: campaignId,
              ad_group_id: adgroup.id,
            },
          ),
        ),
      );
    });

    const apiResults = Promise.all(promiseArray);

    apiResults.then(responses => {
      const formatedApiResults = responses.map(res => {
        return this.filterValueForCampaign(normalizeReportView(res.data.report_view), campaignId);
      });
      campaign.ad_groups.forEach((adgroup, i) => {
        adgroup.ads.forEach(ad => {
          if (formatedApiResults[i].length > 0) {
            if (formatedApiResults[i][0].message_id.toString() === ad.id.toString()) {
              formatedApiResults[i].forEach((report: any) => (report.adName = ad.name));
            }
          }
        });
      });
      ExportService.exportAdServingCampaing(
        organisationId,
        campaign,
        formatedApiResults,
        filter,
        formatMessage,
      );

      this.setState({
        loading: false,
      });
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
    const { exportIsRunning } = this.state;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/display`}>
        {formatMessage(messages.display)}
      </Link>,
      campaign && campaign.name ? campaign.name : '',
    ];

    const downloadMenu = (
      <Menu onClick={this.getSnippet}>
        <Menu.Item key='GOOGLE_DFP'>
          <FormattedMessage {...messages.googleDfp} />
        </Menu.Item>
        <Menu.Item key='GOOGLE_DBM'>
          <FormattedMessage {...messages.googleDbm} />
        </Menu.Item>
        <Menu.Item key='APX'>
          <FormattedMessage {...messages.apx} />
        </Menu.Item>
        <Menu.Item key='SMART'>
          <FormattedMessage {...messages.smartAdServer} />
        </Menu.Item>
        <Menu.Item key='NONE'>
          <FormattedMessage {...messages.none} />
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Button onClick={exportIsRunning ? this.exportIsRunningModal : this.handleRunExport}>
          <McsIcon type='download' />
          <FormattedMessage id='ad.serving.actionbar.exportButton' defaultMessage='Export' />
        </Button>
        <Dropdown overlay={downloadMenu} trigger={['click']}>
          <Button className='mcs-primary' type='primary'>
            <McsIcon type='download' />
            <FormattedMessage {...messages.adServingDownload} />
          </Button>
        </Dropdown>
        {campaign && campaign.model_version === 'V2014_06' ? null : (
          <Button onClick={this.editCampaign}>
            <McsIcon type='pen' />
            <FormattedMessage {...messages.editCampaign} />
          </Button>
        )}

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <EllipsisOutlined />
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
