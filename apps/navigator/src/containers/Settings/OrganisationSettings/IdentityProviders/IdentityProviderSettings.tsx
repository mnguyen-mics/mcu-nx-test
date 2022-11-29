import { IdentityProviderResource } from '@mediarithmics-private/advanced-components';
import { Layout } from 'antd';
import * as React from 'react';
import { compose } from 'recompose';
import { Subject } from 'rxjs';
import IdentityProviderAssociationForm from './IdentityProviderAssociationList';
import IdentityProviderList from './IdentityProviderList';

type Props = {};

class IdentityProviderSettings extends React.Component<Props, {}> {
  private newIdentityProviderSubject: Subject<IdentityProviderResource>;

  constructor(props: Props) {
    super(props);

    this.newIdentityProviderSubject = new Subject<IdentityProviderResource>();
  }

  render() {
    return (
      <Layout className='ant-layout-content mcs-content-container'>
        <div className='mcs-table-container'>
          <IdentityProviderList newIdentityProviderSubject={this.newIdentityProviderSubject} />
        </div>
        <div className='mcs-table-container'>
          <IdentityProviderAssociationForm
            newIdentityProviderSubject={this.newIdentityProviderSubject}
          />
        </div>
      </Layout>
    );
  }
}

export default compose<Props, {}>()(IdentityProviderSettings);
