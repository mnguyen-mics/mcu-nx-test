import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { Card } from '../../../../components/Card';
import SegmentsTag from './SegmentsTag';
import messages from '../messages';

class SegmentsCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }


  render() {
    const {
      segments,
      intl: {
        formatMessage,
      },
    } = this.props;

    let segmentsFormatted = [];
    if (segments.items.length > 5 && !this.state.showMore) {
      segmentsFormatted = segmentsFormatted.concat(segments.items).splice(0, 5);
    } else {
      segmentsFormatted = segmentsFormatted.concat(segments.items);
    }

    const canViewMore = segments.items.length > 5 ? true : false;

    return (
      <Card title={formatMessage(messages.segmentTitle)} isLoading={segments.isLoading}>
        { segmentsFormatted.length && segmentsFormatted.map(segment => {
          return (
            <SegmentsTag key={segment.segment_id} segmentId={segment.segment_id} />
          );
        })}
        { (segmentsFormatted.length === 0 || segments.hasItems === false) && (<span><FormattedMessage {...messages.emptySegment} /></span>) }
        { (canViewMore) ? (
           (!this.state.showMore) ? (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: true }); }}><FormattedMessage {...messages.viewMore} /></button>
             </div>
           ) : (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: false }); }}><FormattedMessage {...messages.viewLess} />.</button>
             </div>
          )
          ) : null }
      </Card>
    );
  }
}

SegmentsCard.propTypes = {
  intl: intlShape.isRequired,
  segments: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
};

export default injectIntl(SegmentsCard);
