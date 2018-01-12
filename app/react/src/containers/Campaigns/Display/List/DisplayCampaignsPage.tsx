import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout } from 'antd';
import { compose } from 'redux';

import DisplayCampaignsActionbar from './DisplayCampaignsActionbar';
import DisplayCampaignsTable from './DisplayCampaignsTable';
import { DrawableContentProps } from '../../../../components/Drawer/index';

const { Content } = Layout;

interface DisplayCampaignsPageProps extends DrawableContentProps {}

interface DisplayCampaignsPageState {
	selectedRowKeys: string[];
}

type JoinedProps = DisplayCampaignsPageProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsPage extends React.Component<
	JoinedProps,
	DisplayCampaignsPageState
> {

	constructor(props: JoinedProps) {
		super(props);
		this.state = {
			selectedRowKeys: [],
		};
  }
  
  onSelectChange = (selectedRowKeys: string[]) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  render() {
		const { openNextDrawer, closeNextDrawer } = this.props;

		const {
      selectedRowKeys,
    } = this.state;
		
		const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
		};
		
    return (
      <div className="ant-layout">
        <DisplayCampaignsActionbar
          openNextDrawer={openNextDrawer}
          closeNextDrawer={closeNextDrawer}
          hasSelected={rowSelection.selectedRowKeys.length > 0}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <DisplayCampaignsTable
              rowSelection={rowSelection}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(DisplayCampaignsPage);
