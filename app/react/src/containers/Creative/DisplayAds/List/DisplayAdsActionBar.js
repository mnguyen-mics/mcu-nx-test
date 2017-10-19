import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';
import { withTranslations } from '../../../Helpers';

class ListCreativesDisplay extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const breadcrumbPaths = [{ name: translations.DISPLAY_ADS, url: `/v2/o/${organisationId}/creatives/display` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/creatives/display/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_DISPLAY_AD" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

ListCreativesDisplay.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

ListCreativesDisplay = compose(
  withTranslations,
  withRouter,
)(ListCreativesDisplay);

export default ListCreativesDisplay;
