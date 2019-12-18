import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartResource } from '../../models/datamart/DatamartResource';
import { FormTitle } from '../../components/Form';
import { MenuList } from '../../components/FormMenu';
import ActionBar, { ActionBarProps } from '../../components/ActionBar';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface DatamartSelectorProps {
  onSelectDatamart: (datamart: DatamartResource) => void;
  actionbarProps: ActionBarProps;
}

interface MapStateToProps {
  connectedUser: any;
}

type Props = DatamartSelectorProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class DatamartSelector extends React.Component<Props> {
  render() {
    const {
      onSelectDatamart,
      connectedUser,
      match: { params: { organisationId } },
      actionbarProps,
    } = this.props;

    let datamarts: DatamartResource[] = [];
    const found = connectedUser.workspaces.find(
      (w: any) => w.organisation_id === organisationId,
    );
    if (found) {
      datamarts = found.datamarts;
    }

    return (
      <Layout>
        <ActionBar {...actionbarProps} />
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitle} />
          <Row style={{ width: '650px', display: 'inline-block' }}>
            <Row className="menu">
              {datamarts.map(d => {
                const handleSelect = () => onSelectDatamart(d);
                return (
                  <MenuList key={d.id} title={d.name || d.token} select={handleSelect} />
                );
              })}
            </Row>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, DatamartSelectorProps>(
  withRouter,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(DatamartSelector);

const messages = defineMessages({
  title: {
    id: 'datamart-selector-title',
    defaultMessage: 'Datamarts',
  },
  subTitle: {
    id: 'datamart-selector-subtitle',
    defaultMessage: 'Choose your datamart',
  },
});
