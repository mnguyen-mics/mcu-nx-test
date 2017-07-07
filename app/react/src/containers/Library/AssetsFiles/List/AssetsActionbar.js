import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import { withTranslations } from '../../../Helpers';
import { McsIcons } from '../../../../components/McsIcons';

class AssetsActionbar extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId
        }
      },
      translations
    } = this.props;

    const breadcrumbPaths = [{ name: translations.ASSETS, url: `/v2/o/${organisationId}/library/assets` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/library/keywordslists/new`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_ASSET" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

AssetsActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

AssetsActionbar = compose(
  withTranslations,
  withRouter,
)(AssetsActionbar);

export default AssetsActionbar;
