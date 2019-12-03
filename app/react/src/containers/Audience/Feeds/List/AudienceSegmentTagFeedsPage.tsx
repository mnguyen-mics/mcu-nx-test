import * as React from 'react';
import AudienceFeedsTable from './AudienceFeedsTable';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AudienceSegmentTagFeedsActionBar from './AudienceSegmentTagFeedsActionBar';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class AudienceSegmentTagFeedsPage extends React.Component<Props, {}> {
  render() {
    return (
      <div className="ant-layout">
        <AudienceSegmentTagFeedsActionBar />
        <div className="ant-layout">
          <Layout className="mcs-content-container">
            <AudienceFeedsTable feedType="TAG_FEED" />
          </Layout>
        </div>
      </div>
    );
  }
}

export default compose<{}, {}>(
  withRouter,
  injectIntl,
)(AudienceSegmentTagFeedsPage);
