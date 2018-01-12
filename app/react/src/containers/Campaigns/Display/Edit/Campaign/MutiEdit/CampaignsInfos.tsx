import * as React from 'react';
import { Row } from 'antd';
import { InjectedIntlProps } from 'react-intl';
import { CampaignsInfosFieldModel } from '../domain';
export interface CampaignsInfosProps {
  fields: CampaignsInfosFieldModel[];
}

type JoinedProps = CampaignsInfosProps & InjectedIntlProps;

class CampaignsInfos extends React.Component<JoinedProps> {
  render() {
    const { fields } = this.props;
    return (
      <Row type="flex" align="middle" justify="space-between">
       hello
      </Row>
    );
  }
}

export default CampaignsInfos;
