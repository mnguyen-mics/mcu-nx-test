import * as React from 'react';
import { Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';

import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import Slider from '../../../../components/Transition/Slide';

const messages = defineMessages({
  archiveNativesModalTitle: {
    id: 'creatives.native.list.multiArchive.modal.title',
    defaultMessage: 'Archive Native Creatives',
  },
  archiveNativesModalMessage: {
    id: 'creatives.native.list.multiArchive.modal.message',
    defaultMessage:
      'Are you sure to archive all the selected native creatives ?',
  },
  breadCrumbNativeListTitle: {
    id: 'creatives.native.list.actionBar.breadCrumb.title',
    defaultMessage: 'Natives',
  },
  newNativeCreativeButton: {
    id: 'creatives.native.list.actionBar.new.Native',
    defaultMessage: 'New Native',
  },
});

interface NativeAdsActionBarProps {
  rowSelection: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    unselectAllItemIds: () => void;
  };
  multiEditProps: {
    archiveNatives: () => void;
    isArchiveModalVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    isArchiving: boolean;
  };
}
type JoinedProps = NativeAdsActionBarProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class NativeAdsActionBar extends React.Component<JoinedProps> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      rowSelection,
      multiEditProps: {
        archiveNatives,
        isArchiveModalVisible,
        handleCancel,
        handleOk,
        isArchiving,
      },
      intl,
      location: { pathname },
      history,
    } = this.props;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.breadCrumbNativeListTitle),
        path: `/v2/o/${organisationId}/creatives/native`,
      },
    ];

    const hasSelected = !!(
      rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0
    );

    const newnativeLink = () => {
      history.push({
        pathname: `/v2/o/${organisationId}/creatives/native/create`,
        state: { from: `${pathname}` },
      });
    };

    return (
      <Actionbar paths={breadcrumbPaths}>
        <a onClick={newnativeLink}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage {...messages.newNativeCreativeButton} />
          </Button>
        </a>
        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              onClick={archiveNatives}
              className="button-slider button-glow"
            >
              <McsIcon type="delete" />
              <FormattedMessage id="creatives.native.list.actionbar.archive" defaultMessage="Archive" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={intl.formatMessage(messages.archiveNativesModalTitle)}
            visible={isArchiveModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={isArchiving}
          >
            <p>{intl.formatMessage(messages.archiveNativesModalMessage)}</p>
          </Modal>
        ) : null}
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, NativeAdsActionBarProps>(
  withRouter,
  injectIntl,
)(NativeAdsActionBar);
