import * as React from 'react';
import AudienceFeedsTable from './AudienceFeedsTable';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AudienceSegmentExternalFeedsActionBar from './AudienceSegmentExternalFeedsActionBar';
import { Layout } from 'antd';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class AudienceSegmentExternalFeedsPage extends React.Component<Props, {}> {
  render() {
    return (
      <div className="ant-layout">
        <AudienceSegmentExternalFeedsActionBar />
        <div className="ant-layout">
          <Layout className="mcs-content-container">
            <AudienceFeedsTable feedType="EXTERNAL_FEED" />
          </Layout>
        </div>
      </div>
    );
  }
}

export default compose<{}, {}>(
  withRouter,
  injectIntl,
)(AudienceSegmentExternalFeedsPage);
