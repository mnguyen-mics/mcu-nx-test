import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import CampaignContent from './CampaignContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import messages from './messages';

interface CreateCampaignPageProps {
  closeNextDrawer: () => void;
  openNextDrawer: () => void;
}

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
  adGroupId?: string;
}

type JoinedProps = CreateCampaignPageProps & InjectedIntlProps & RouteComponentProps<RouterMatchParams>;

class CreateCampaignPage extends React.Component<JoinedProps> {

  render() {

    const {
      closeNextDrawer,
      openNextDrawer,
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const initialValues = {
      model_version: 'V2017_09',
      max_budget_period: 'DAY',
      adGroupsTable: [],
    };

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: formatMessage(messages.createCampaingTitle),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
    ];

    return (
      <CampaignContent
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
        initialValues={initialValues}
        breadcrumbPaths={breadcrumbPaths}
        editionMode={false}
      />
    );
  }
}

export default compose(
  withDrawer,
  injectIntl,
  withMcsRouter,
)(CreateCampaignPage);
