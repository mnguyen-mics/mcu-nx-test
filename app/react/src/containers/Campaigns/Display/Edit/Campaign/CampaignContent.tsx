import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { Layout } from 'antd';
import { injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import { EditContentLayout } from '../../../../../components/Layout/index';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import CampaignForm from './CampaignForm';
import { withMcsRouter } from '../../../../Helpers';
import messages from './messages';
import { Loading } from '../../../../../components/index';

const formId = 'campaignForm';

interface CampaignContentProps {
  closeNextDrawer: () => void;
  editionMode: boolean;
  initialValues: object;
  loading?: boolean;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  breadcrumbPaths: Array<{
    name: string,
    url?: string,
  }>;
}

interface RouterMatchParams {
  organisationId: string;
}

interface MapStateProps {
  submitting: boolean;
}

type JoinedProps = CampaignContentProps & MapStateProps & RouteComponentProps<RouterMatchParams>;

class CampaignContent extends React.Component<JoinedProps> {

  static defaultProps = {
    editionMode: false,
    initialValues: {},
    loading: false,
    submitting: false,
  };

  render() {
    const {
      editionMode,
      history,
      location,
      initialValues,
      loading,
      match: {
        params: { organisationId },
        url,
      },
      submitting,
      breadcrumbPaths,
    } = this.props;

    let sidebarItems = {};

    sidebarItems = {
      general: messages.sectionTitle1,
      goals: messages.sectionTitle2,
      adGroups: messages.sectionTitle3,
    };

    const buttonMetadata = {
      formId,
      message: messages.saveAdGroup,
      onClose: () => (location.state && location.state.goBack
            ? history.goBack()
            : history.push(`/v2/o/${organisationId}/campaigns/display/`)
          ),
    };

    return (
      <Layout>
        { (loading || submitting) &&
          <Loading className={'loading-full-screen'} />
        }

        <div className={(!loading && !submitting ? 'ant-layout' : 'hide-section')}>
          <EditContentLayout
            breadcrumbPaths={breadcrumbPaths}
            sidebarItems={sidebarItems}
            buttonMetadata={buttonMetadata}
            url={url}
          >
            <CampaignForm
              closeNextDrawer={this.props.closeNextDrawer}
              editionMode={editionMode}
              formId={formId}
              initialValues={initialValues}
              openNextDrawer={this.props.openNextDrawer}
            />
          </EditContentLayout>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  submitting: isSubmitting(formId)(state),
});

export default compose<JoinedProps, CampaignContentProps>(
  injectIntl,
  withMcsRouter,
  connect(mapStateToProps),
)(CampaignContent);
