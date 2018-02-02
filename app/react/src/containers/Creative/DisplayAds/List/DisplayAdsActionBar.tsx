import * as React from 'react';
import { Button, Modal } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import { withTranslations } from '../../../Helpers';
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import Slider from '../../../../components/Transition/Slide';

interface ListCreativesDisplayProps {
  selectedRowKeys?: string[];
  multiEditProps: {
    archiveCreatives: () => void;
    isArchiveModalVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
  };
}

const messages = defineMessages({
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
    defaultMessage: 'Are you sure to archive all the selected creatives ?',
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
        handleOk,
      },
    } = this.props;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const { match: { params: { organisationId } }, intl } = this.props;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.displayAds),
        url: `/v2/o/${organisationId}/creatives/display`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/creatives/display/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_DISPLAY_AD" />
          </Button>
        </Link>

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={archiveCreatives} className="button-slider">
              <McsIcon type="delete" />
              <FormattedMessage id="ARCHIVE" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={intl.formatMessage(messages.archiveCreativesModalTitle)}
            visible={isArchiveModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>{intl.formatMessage(messages.archiveCreativesModalMessage)}</p>
          </Modal>
        ) : null}
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, ListCreativesDisplayProps>(
  withTranslations,
  withRouter,
  injectIntl,
)(ListCreativesDisplay);
