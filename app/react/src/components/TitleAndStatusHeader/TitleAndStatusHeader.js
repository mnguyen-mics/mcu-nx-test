import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

class TitleAndStatusHeader extends Component {

  constructor(props) {
    super(props);
    this.buildStatusElement = this.buildStatusElement.bind(this);
  }

  render() {

    const {
      headerTitle
    } = this.props;

    const statusElements = this.buildStatusElement();

    return (
      <div className="mcs-title-status-header">
        <span className="mcs-title-status-header-title">
          {headerTitle}
        </span>
        {statusElements}
      </div>
    );

  }

  buildStatusElement() {
    const {
      headerStatus
    } = this.props;

    const statusIndicatorClass = `mcs-indicator-${headerStatus.value.toLowerCase()}`;
    const statusTranslationKey = `${headerStatus.translationKeyPrefix}_${headerStatus.value}`;

    return headerStatus.value ? (
      <div className="mcs-title-status-header-status">
        <div className={statusIndicatorClass} />
        <span className="mcs-title-status-header-status-divider">|</span>
        <div className="mcs-title-status-header-status-title">
          <FormattedMessage id={statusTranslationKey} />
        </div>
      </div>
    ) : null;
  }

}

TitleAndStatusHeader.propTypes = {
  headerTitle: PropTypes.string.isRequired,
  headerStatus: PropTypes.shape({
    translationKeyPrefix: PropTypes.string,
    value: PropTypes.string
  }).isRequired
};

export default TitleAndStatusHeader;
