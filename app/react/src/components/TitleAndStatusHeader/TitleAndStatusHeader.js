import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

class TitleAndStatusHeader extends Component {

  constructor(props) {
    super(props);
    this.buildStatusElement = this.buildStatusElement.bind(this);
    this.buildAttributesElement = this.buildAttributesElement.bind(this);
  }

  render() {

    const {
      headerTitle,
      headerStatus,
      headerAttibutes
    } = this.props;

    let statusElements;
    if (headerStatus.value !== null) {
      statusElements = this.buildStatusElement();
    } else {
      statusElements = <div />;
    }
    let attibutesElement;
    if (headerAttibutes !== []) {
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

  buildAttributesElement() {
    const {
      headerAttibutes
    } = this.props;

    return (<div className="mcs-title-status-header-attributes">
      {headerAttibutes.map((attribute) => {
        return (<div key={attribute.toString()} >{attribute}</div>);
      })}
    </div>);
  }

}

TitleAndStatusHeader.defaultProps = {
  headerStatus: { value: null },
  headerAttibutes: []
};

TitleAndStatusHeader.propTypes = {
  headerTitle: PropTypes.string.isRequired,
  headerStatus: PropTypes.shape({
    translationKeyPrefix: PropTypes.string,
    value: PropTypes.string
  }),
  headerAttibutes: PropTypes.arrayOf(PropTypes.element)
};

export default TitleAndStatusHeader;
