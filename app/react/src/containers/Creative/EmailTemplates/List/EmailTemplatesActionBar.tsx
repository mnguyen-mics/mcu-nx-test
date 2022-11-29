import * as React from 'react';
import { Button, Modal } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon, Slide } from '@mediarithmics-private/mcs-components-library';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';

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
  WrappedComponentProps;

class EmailTemplatesActionBar extends React.Component<JoinedProps> {
  render() {
    const {
      match: {
        params: { organisationId },
      },
      rowSelection,
      multiEditProps: { archiveEmails, isArchiveModalVisible, handleCancel, handleOk, isArchiving },
      intl,
    } = this.props;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/creatives/email`}>
        {intl.formatMessage(messages.emailTemplates)}
      </Link>,
    ];

    const hasSelected = !!(rowSelection.selectedRowKeys && rowSelection.selectedRowKeys.length > 0);

    return (
      <Actionbar pathItems={breadcrumbPaths} className='mcs-modal_container'>
        <Link to={`/v2/o/${organisationId}/creatives/email/create`}>
          <Button className='mcs-primary' type='primary'>
            <McsIcon type='plus' />{' '}
            <FormattedMessage
              id='creatives.email.list.actionbar.newEmailTemplate'
              defaultMessage='New Email Template'
            />
          </Button>
        </Link>
        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={archiveEmails} className='button-slider button-glow'>
              <McsIcon type='delete' />
              <FormattedMessage
                id='creatives.email.list.actionbar.deleteEmailTemplate'
                defaultMessage='Archive'
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
