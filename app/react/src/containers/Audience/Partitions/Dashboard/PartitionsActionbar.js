import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Icon, Button } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as ActionbarActions from '../../../../state/Actionbar/actions';


class PartitionsActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.AUDIENCE_PARTITIONS
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
        <Menu.Item key="RANDOM_SPLIT">
          <Link to={`${organisationId}/datamart/partitions/RANDOM_SPLIT`}>
            <FormattedMessage id="RANDOM_SPLIT" />
          </Link>
        </Menu.Item>
        <Menu.Item key="CLUSTERING">
          <Link to={`${organisationId}/datamart/partitions/CLUSTERING`}>
            <FormattedMessage id="CLUSTERING" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_PARTITION" />
          </Button>
        </Dropdown>
      </Actionbar>
    );

  }

}

PartitionsActionbar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  translations: state.translationsState.translations
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

PartitionsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(PartitionsActionbar);

export default PartitionsActionbar;
