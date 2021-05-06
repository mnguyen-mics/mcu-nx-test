import * as React from 'react';
import { Layout } from 'antd';
import OfferCatalogTable from './OfferCatalogTable';
import OfferCatalogActionBar from './OfferCatalogActionBar';
import { withRouter, RouteComponentProps } from 'react-router';

import { compose } from 'recompose';

const { Content } = Layout;

type JoinedProps = RouteComponentProps<{ organisationId: string }>;

class OfferCatalogPage extends React.Component<JoinedProps> {
  constructor(props: JoinedProps) {
    super(props);
  }
  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    return (
      <div className='ant-layout'>
        <OfferCatalogActionBar organisationId={organisationId} />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <OfferCatalogTable organisationId={organisationId} />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<{}, JoinedProps>(withRouter)(OfferCatalogPage);
