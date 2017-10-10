import * as React from 'react';
import { FormattedMessage } from 'react-intl';

interface TitleAndStatusHeaderProps {
  headerTitle: string;
  headerStatus?: {
    value?: string;
    translationKeyPrefix?: string;
  };
  translationKeyPrefix?: string;
  value?: string;
  headerAttributes: Element[];
}

class TitleAndStatusHeader extends React.Component<TitleAndStatusHeaderProps> {

  static defaultProps: Partial<TitleAndStatusHeaderProps> = {
    headerStatus: { value: undefined },
    headerAttributes: [],
  };

  buildStatusElement = () => {
    const { headerStatus } = this.props;
    const statusIndicatorClass = `mcs-indicator-${headerStatus!.value!.toLowerCase()}`;
    const statusTranslationKey = `${headerStatus!.translationKeyPrefix}_${headerStatus!.value}`;

    return (headerStatus!.value
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
  }

  buildAttributesElement = () => {
    const { headerAttributes } = this.props;

    return (
      <div className="mcs-title-status-header-attributes">
        {headerAttributes.map((attribute) => {
          return <div key={attribute.toString()} >{attribute}</div>;
        })}
      </div>
    );
  }

  render() {
    const {
      headerTitle,
      headerStatus,
      headerAttributes,
    } = this.props;

    const statusElements = headerStatus!.value ? this.buildStatusElement() : <div />;

    const attibutesElement = (headerAttributes &&  headerAttributes.length > 0) ? this.buildAttributesElement() : <div />;

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

export default TitleAndStatusHeader;
