import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Tooltip } from 'antd';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import messages from '../messages';
import { Card } from '../../../../components/Card';

class ProfileCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  render() {
    const {
      profile,
      intl: {
        formatMessage,
      },
    } = this.props;

    const convertedObjectToArray = Object.keys(profile.items).map(key => {
      return [key, profile.items[key]];
    });

    const profileFormatted = (convertedObjectToArray.length > 5 && !this.state.showMore) ? convertedObjectToArray.splice(0, 5) : convertedObjectToArray;
    const canViewMore = convertedObjectToArray.length > 5 ? true : false;

    return (
      <Card title={formatMessage(messages.profileTitle)} isLoading={profile.isLoading}>
        { profileFormatted && profileFormatted.map(profil => {
          return (
            <Row gutter={10} key={profil} className="table-line">
              <Col className="table-left" span={12}>
                <Tooltip title={profil[0]}>
                  {profil[0]}
                </Tooltip>
              </Col>
              <Col className="table-right" span={12}>
                <Tooltip title={profil[1]}>
                  {profil[1]}
                </Tooltip>
              </Col>
            </Row>);
        })}
        { (profileFormatted.length === 0 || profile.hasItems === false) && (<span><FormattedMessage {...messages.emptyProfile} /></span>) }
        { (canViewMore) ? (
           (!this.state.showMore) ? (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: true }); }}><FormattedMessage {...messages.viewMore} /></button>
             </div>
           ) : (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: false }); }}><FormattedMessage {...messages.viewLess} /></button>
             </div>
          )
          ) : null }
      </Card>
    );
  }
}

ProfileCard.propTypes = {
  intl: intlShape.isRequired,
  profile: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
};

export default injectIntl(ProfileCard);
