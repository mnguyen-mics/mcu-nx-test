import * as React from 'react';
import _ from 'lodash';
import { Dropdown, Menu, Tooltip } from 'antd';
import { compose } from 'recompose';
import { messages } from '../constants';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { CalendarOutlined, DownOutlined } from '@ant-design/icons';
import { truncate } from './AudienceFeatureSelectionTag';
import { AudienceFeatureSelection, FinalValueResource } from './AudienceFeatureSelector';

export interface AudienceFeatureCardProps {
  audienceFeature: AudienceFeatureResource;
  onSelectFeature: (
    audienceFeature: AudienceFeatureResource,
    finalValue?: FinalValueResource,
  ) => () => void;
  searchValue?: string;
  audienceFeatureSelection: AudienceFeatureSelection;
  finalValues: FinalValueResource[];
  isSettingsMode?: boolean;
}

type Props = AudienceFeatureCardProps & WrappedComponentProps;

interface State {
  cardToggled: boolean;
  dropdownVisible: boolean;
}

class AudienceFeatureCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cardToggled: false,
      dropdownVisible: false,
    };
  }

  toggleCard = () => {
    this.setState({
      cardToggled: !this.state.cardToggled,
    });
  };

  render() {
    const { audienceFeature, intl, searchValue, onSelectFeature, finalValues, isSettingsMode } =
      this.props;
    const { cardToggled, dropdownVisible } = this.state;
    const onCardClick = (e: any) => {
      if (e.target.className === 'mcs-standardSegmentBuilder_featureCardFinalValue') {
        e.stopPropagation();
      } else {
        onSelectFeature(audienceFeature)();
      }
    };
    const returnNoFilterMessage = () => {
      return <div>{intl.formatMessage(messages.noAvailableFilters)}</div>;
    };

    const isFinaValueSelected = (audienceFeatureId: string, finalValue: FinalValueResource) => {
      const { audienceFeatureSelection } = this.props;
      const featureKey = Object.keys(audienceFeatureSelection).find(k => k === audienceFeatureId);
      if (featureKey) {
        return audienceFeatureSelection[featureKey].finalValues
          ?.map(finalValueResource => finalValueResource.value)
          .includes(finalValue.value);
      }
      return false;
    };

    const isAudienceFeatureSelected = () => {
      const { audienceFeatureSelection } = this.props;
      const featureKey = Object.keys(audienceFeatureSelection).find(k => k === audienceFeature.id);
      return !!featureKey && !audienceFeatureSelection[featureKey].finalValues;
    };

    const menu = (
      <Menu className='mcs-standardSegmentBuilder_finalValuesMenu'>
        {finalValues.slice(5, finalValues.length).map((value, i) => {
          const isSelected = isFinaValueSelected(audienceFeature.id, value);
          return (
            <Menu.Item
              key={i}
              onClick={isSettingsMode ? undefined : onSelectFeature(audienceFeature, value)}
            >
              <span
                className={`mcs-standardSegmentBuilder_featureCardFinalValue ${
                  isSelected ? 'mcs-standardSegmentBuilder_featureCardSelectedFinalValue' : ''
                }`}
              >
                {value.value}
              </span>
            </Menu.Item>
          );
        })}
      </Menu>
    );

    const onMoreClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleVisibleChange = (visible: boolean) => {
      return this.setState({ dropdownVisible: visible });
    };

    return (
      <div
        className={`${'mcs-standardSegmentBuilder_featureCard'} 
            ${isAudienceFeatureSelected() ? 'selected' : ''} ${!!cardToggled && 'toggled'}`}
      >
        {cardToggled ? (
          <McsIcon
            className='mcs-standardSegmentBuilder_featureCardClose'
            type='close'
            onClick={this.toggleCard}
          />
        ) : (
          <McsIcon
            className='mcs-standardSegmentBuilder_featureCardInfo'
            type='info'
            onClick={this.toggleCard}
          />
        )}
        {cardToggled ? (
          <React.Fragment>
            <span className='mcs-standardSegmentBuilder_featureCardToggledTitle'>
              {intl.formatMessage(messages.availableFilters)}
            </span>
            <div className='mcs-standardSegmentBuilder_featureCardDescription'>
              {audienceFeature.variables
                ? audienceFeature.variables.map(v => {
                    return (
                      <div key={v.parameter_name}>
                        <CalendarOutlined />
                        &nbsp;
                        <Tooltip color='#E8F7FC' title={v.parameter_name}>
                          {truncate(50, v.parameter_name)}
                        </Tooltip>
                      </div>
                    );
                  })
                : returnNoFilterMessage()}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span onClick={onCardClick} className='mcs-standardSegmentBuilder_featureCardTitle'>
              {audienceFeature.name}
            </span>

            <div className='mcs-standardSegmentBuilder_featureCardDescription'>
              {audienceFeature.description}
            </div>
            {searchValue && (
              <div className='mcs-standardSegmentBuilder_featureCardFinalValues'>
                {finalValues.slice(0, 5).map((value, index, values) => {
                  const isSelected = isFinaValueSelected(audienceFeature.id, value);
                  return (
                    <Tooltip title={value.value} key={value.value}>
                      <span
                        onClick={
                          isSettingsMode ? undefined : onSelectFeature(audienceFeature, value)
                        }
                        className={`mcs-standardSegmentBuilder_featureCardFinalValue ${
                          isSelected
                            ? 'mcs-standardSegmentBuilder_featureCardSelectedFinalValue'
                            : ''
                        } ${isSettingsMode ? 'notAllowed' : ''}`}
                      >
                        {truncate(18, value.value)}
                      </span>
                      {index === values.length - 1 ? '' : ', '}
                    </Tooltip>
                  );
                })}
                {finalValues.length > 5 && (
                  <Dropdown
                    overlay={menu}
                    trigger={['click']}
                    onVisibleChange={handleVisibleChange}
                    visible={dropdownVisible}
                  >
                    <div
                      className='ant-dropdown-link mcs-standardSegmentBuilder_featureCardMore'
                      onClick={onMoreClick}
                    >
                      {intl.formatMessage(messages.more)} <DownOutlined />
                    </div>
                  </Dropdown>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default compose<Props, AudienceFeatureCardProps>(injectIntl)(AudienceFeatureCard);
