import * as React from 'react';
import { Button, Modal } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';

import Actionbar from '../../../../components/ActionBar';
import { withTranslations } from '../../../Helpers';
import McsIcon from '../../../../components/McsIcon';
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { TranslationProps } from '../../../Helpers/withTranslations';
import Slider from '../../../../components/Transition/Slide';

const messages = defineMessages({
  archiveEmailsModalTitle: {
    id: 'archive.emails.modal.title',
    defaultMessage: 'Archive Emails',
  },
  archiveEmailsModalMessage: {
    id: 'archive.emails.modal.message',
    defaultMessage: 'Are you sure to archive all the selected emails ?',
  },
});

interface EmailActionBarProps {
  rowSelection: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    unselectAllItemIds: () => void;
  };
  multiEditProps: {
    archiveEmails: () => void;
    isArchiveModalVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    isArchiving: boolean;
  };
}
type JoinedProps = EmailActionBarProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps &
  TranslationProps;

class EmailActionBar extends React.Component<JoinedProps> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      translations,
      rowSelection,
      multiEditProps: {
        archiveEmails,
        isArchiveModalVisible,
        handleCancel,
        handleOk,
        isArchiving,
      },
      intl,
    } = this.props;

    const breadcrumbPaths = [
      {
        name: translations.EMAILS_TEMPLATES,
        url: `/v2/o/${organisationId}/creatives/email`,
      },
    ];

    const hasSelected = !!(
      rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0
    );

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/creatives/email/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_EMAIL_TEMPLATE" />
          </Button>
        </Link>
        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              onClick={archiveEmails}
              className="button-slider button-glow"
            >
              <McsIcon type="delete" />
              <FormattedMessage id="ARCHIVE" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={intl.formatMessage(messages.archiveEmailsModalTitle)}
            visible={isArchiveModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={isArchiving}
          >
            <p>{intl.formatMessage(messages.archiveEmailsModalMessage)}</p>
          </Modal>
        ) : null}
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, EmailActionBarProps>(
  withRouter,
  injectIntl,
  withTranslations,
)(EmailActionBar);
