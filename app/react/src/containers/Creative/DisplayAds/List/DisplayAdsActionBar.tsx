import * as React from 'react';
import { Button, Modal, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';
import { Dropdown } from '../../../../components/PopupContainers';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import { withTranslations } from '../../../Helpers';
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import Slide from '../../../../components/Transition/Slide';
import { CreativeAuditAction } from '../../../../models/creative/CreativeResource';

interface ListCreativesDisplayProps {
  selectedRowKeys?: string[];
  multiEditProps: {
    archiveCreatives: () => void;
    isArchiveModalVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    handleAuditAction: (action: CreativeAuditAction) => void;
    isArchiving: boolean;
  };
}

const messagesMap = defineMessages({
  displayAds: {
    id: 'display.ads.actionbar.breadcrumb',
    defaultMessage: 'Display Ads',
  },
  archiveCreativesModalTitle: {
    id: 'archive.creatives.modal.title',
    defaultMessage: 'Archive Creatives',
  },
  archiveCreativesModalMessage: {
    id: 'archive.creatives.modal.msg',
    defaultMessage:
      "You can only archive creatives that haven't passed or failed the audit. If you have selected creatives wtih passed or failed audit status, please reset their audit status first before archiving.",
  },
  auditAction: {
    id: 'audit.action',
    defaultMessage: 'Audit Action',
  },
  startAll: {
    id: 'display.campaign.start.all.audits',
    defaultMessage: 'Start',
  },
  resetAll: {
    id: 'display.campaign.reset.all.audits',
    defaultMessage: 'Reset',
  },
});

type JoinedProps = ListCreativesDisplayProps &
  InjectedIntlProps &
  RouteComponentProps<CampaignRouteParams>;

class ListCreativesDisplay extends React.Component<JoinedProps> {
  render() {
    const {
      selectedRowKeys,
      multiEditProps: {
        archiveCreatives,
        isArchiveModalVisible,
        handleCancel,
        handleAuditAction,
        handleOk,
        isArchiving,
      },
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messagesMap.displayAds),
        url: `/v2/o/${organisationId}/creatives/display`,
      },
    ];

    const buildAuditMenu = () => {
      const onClick = (event: any) => {
        switch (event.key) {
          case 'start':
            return handleAuditAction('START_AUDIT');
          case 'reset':
            return handleAuditAction('RESET_AUDIT');
          default:
            break;
        }
      };

      return (
        <Menu onClick={onClick}>
          <Menu.Item key="start">
            <FormattedMessage {...messagesMap.startAll} />
          </Menu.Item>
          <Menu.Item key="reset">
            <FormattedMessage {...messagesMap.resetAll} />
          </Menu.Item>
        </Menu>
      );
    };

    const buildAuditActionAdsElement = () => {
      return (
        <Dropdown overlay={buildAuditMenu()} trigger={['click']}>
          <Button className="button-glow" style={{ marginRight: '20px' }}>
            <McsIcon type="chevron" />
            <FormattedMessage {...messagesMap.auditAction} />
          </Button>
        </Dropdown>
      );
    };

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/creatives/display/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_DISPLAY_AD" />
          </Button>
        </Link>

        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              onClick={archiveCreatives}
              className="button-slider button-glow"
            >
              <McsIcon type="delete" />
              <FormattedMessage id="ARCHIVE" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={intl.formatMessage(messagesMap.archiveCreativesModalTitle)}
            visible={isArchiveModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={isArchiving}
          >
            <p>
              {intl.formatMessage(messagesMap.archiveCreativesModalMessage)}
            </p>
          </Modal>
        ) : null}
        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={buildAuditActionAdsElement()}
        />
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, ListCreativesDisplayProps>(
  withTranslations,
  withRouter,
  injectIntl,
)(ListCreativesDisplay);
