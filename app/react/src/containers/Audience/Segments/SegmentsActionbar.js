import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';

class SegmentsActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.AUDIENCE_SEGMENTS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const addMenu = (
      <Menu>
        <Menu.Item key="USER_LIST">
          <Link to={`${organisationId}/datamart/segments/USER_LIST`}>
            <FormattedMessage id="USER_LIST" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_QUERY">
          <Link to={`${organisationId}/datamart/segments/USER_QUERY`}>
            <FormattedMessage id="USER_QUERY" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_LOOK_ALIKE">
          <Link to={`${organisationId}/datamart/segments/USER_LOOK_ALIKE`}>
            <FormattedMessage id="USER_LOOK_ALIKE" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_SEGMENT" />
          </Button>
        </Dropdown>
      </Actionbar>
    );

  }

}

SegmentsActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

SegmentsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SegmentsActionbar);

export default SegmentsActionbar;
