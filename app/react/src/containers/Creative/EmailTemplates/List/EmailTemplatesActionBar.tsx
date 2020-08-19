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
import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import McsIcon from '../../../../components/McsIcon';
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import Slider from '../../../../components/Transition/Slide';

const messages = defineMessages({
  archiveEmailsModalTitle: {
    id: 'creatives.email.list.archiveModal.title',
    defaultMessage: 'Archive Emails',
  },
  archiveEmailsModalMessage: {
    id: 'creatives.email.list.archiveModal.message',
    defaultMessage: 'Are you sure to archive all the selected emails ?',
  },
  emailTemplates: {
    id: 'creatives.email.list.actionbar.breadCrumbPath.emailTemplates',
    defaultMessage: 'Email Templates',
  },
});

interface EmailTemplatesActionBarProps {
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
type JoinedProps = EmailTemplatesActionBarProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class EmailTemplatesActionBar extends React.Component<JoinedProps> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
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
        name: intl.formatMessage(messages.emailTemplates),
        path: `/v2/o/${organisationId}/creatives/email`,
      },
    ];

    const hasSelected = !!(
      rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0
    );

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/creatives/email/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" />{' '}
            <FormattedMessage
              id="creatives.email.list.actionbar.newEmailTemplate"
              defaultMessage="New Email Template"
            />
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
              <FormattedMessage
                id="creatives.email.list.actionbar.deleteEmailTemplate"
                defaultMessage="Archive"
              />
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

export default compose<JoinedProps, EmailTemplatesActionBarProps>(
  withRouter,
  injectIntl,
)(EmailTemplatesActionBar);
