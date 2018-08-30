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
import ResourceTimelinePage, { ResourceTimelinePageProps } from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import formatAdGroupProperty from '../../../../../messages/campaign/display/adgroupMessages';

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
  buildActionElement = () => {
    const { adGroup, updateAdGroup } = this.props;

    const onClickElement = (status: AdGroupStatus) =>
      adGroup && updateAdGroup(adGroup.id, {
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
      match: { params: { organisationId, campaignId, adGroupId } },
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
          params: { adGroupId },
        },
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
                  resourceName: 'AD_GROUP',
                  resourceId: adGroupId,
                  handleClose: () => this.props.closeNextDrawer(),
                  formatProperty: formatAdGroupProperty,
                },
                size: 'small',
              }
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
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? <Menu.Item key="DUPLICATE">
          <FormattedMessage {...messages.duplicate} />
        </Menu.Item> : null}
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
      match: { params: { organisationId, campaignId, adGroupId } },
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
        {displayCampaign && displayCampaign.model_version !== 'V2014_06' ? <Link
          to={{
            pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/edit/${adGroupId}`,
            state: { from: `${location.pathname}${location.search}` },
          }}
        >
          <Button>
            <McsIcon type="pen" />
            <FormattedMessage {...messages.editAdGroup} />
          </Button>
        </Link> : null}
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
  connect(mapStateToProps, mapDispatchToProps),
  injectDrawer,
)(AdGroupActionbar);
