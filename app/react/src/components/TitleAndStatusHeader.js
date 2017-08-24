import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class TitleAndStatusHeader extends Component {

  buildStatusElement = () => {
    const { headerStatus } = this.props;
    const statusIndicatorClass = `mcs-indicator-${headerStatus.value.toLowerCase()}`;
    const statusTranslationKey = `${headerStatus.translationKeyPrefix}_${headerStatus.value}`;

    return (headerStatus.value
      ? (
        <div className="mcs-title-status-header-status">
          <div className={statusIndicatorClass} />
          <span className="mcs-title-status-header-status-divider">|</span>
          <div className="mcs-title-status-header-status-title">
            <FormattedMessage id={statusTranslationKey} />
          </div>
        </div>
      )
      : null
    );
  };

  buildAttributesElement = () => {
    const { headerAttributes } = this.props;

    return (
      <div className="mcs-title-status-header-attributes">
        {headerAttributes.map((attribute) => {
          return <div key={attribute.toString()} >{attribute}</div>;
        })}
      </div>
    );
  };

  render() {
    const {
      headerTitle,
      headerStatus,
      headerAttributes,
    } = this.props;
    let statusElements;

    if (headerStatus.value !== null) {
      statusElements = this.buildStatusElement();
    } else {
      statusElements = <div />;
    }

    let attibutesElement;

    if (headerAttributes !== []) {
      attibutesElement = this.buildAttributesElement();
    } else {
      attibutesElement = <div />;
    }

    return (
      <div className="mcs-title-status-header">
        {attibutesElement}
        {statusElements}
        <div className="mcs-title-status-header-title">
          {headerTitle}
        </div>
      </div>
    );

  }
}

TitleAndStatusHeader.defaultProps = {
  headerStatus: { value: null },
  headerAttributes: [],
};

TitleAndStatusHeader.propTypes = {
  headerTitle: PropTypes.string.isRequired,
  headerStatus: PropTypes.shape({
    translationKeyPrefix: PropTypes.string,
    value: PropTypes.string,
  }),
  headerAttributes: PropTypes.arrayOf(PropTypes.element),
};

export default TitleAndStatusHeader;
