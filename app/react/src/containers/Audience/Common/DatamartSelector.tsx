import * as React from 'react';
import { Layout, Row } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FormTitle } from '../../../components/Form';
import { MenuList } from '../../../components/FormMenu';
import { defineMessages } from 'react-intl';
import { getWorkspace } from '../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { RouteComponentProps, withRouter } from 'react-router';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { MicsReduxState } from '../../../utils/ReduxHelper';

const { Content } = Layout;

const messages = defineMessages({
  listTitle: {
    id: 'audience.segment.form.datamart.selector.list.title',
    defaultMessage: 'Datamarts',
  },
  listSubtitle: {
    id: 'audience.segment.form.datamart.selector.list.subtitle',
    defaultMessage: 'Choose your datamart',
  },
});

interface DatamartSelectorProps {
  onSelect: (item: DatamartResource) => void;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = DatamartSelectorProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class DatamartSelector extends React.Component<Props> {
  onSelect = (item: DatamartResource) => () => {
    this.props.onSelect(item);
  };

  render() {
    const { workspace, match: { params: { organisationId } } } = this.props;
    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.listTitle}
                subtitle={messages.listSubtitle}
              />
              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  {workspace(organisationId).datamarts.map(item => {
                    return (
                      <MenuList
                        title={item.name}
                        key={item.id}
                        select={this.onSelect(item)}
                      />
                    );
                  })}
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, DatamartSelectorProps>(
  withRouter,
  connect(mapStateToProps, undefined),
)(DatamartSelector);
