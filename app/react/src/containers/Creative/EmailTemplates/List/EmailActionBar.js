import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import { withTranslations } from '../../../Helpers';
import McsIcons from '../../../../components/McsIcons.tsx';

class EmailActionBar extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const breadcrumbPaths = [{ name: translations.EMAILS_TEMPLATES, url: `/v2/o/${organisationId}/creatives/email` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/creatives/display-ad/default-editor/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_EMAIL_TEMPLATE" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

EmailActionBar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

EmailActionBar = compose(
  withTranslations,
  withRouter,
)(EmailActionBar);

export default EmailActionBar;
