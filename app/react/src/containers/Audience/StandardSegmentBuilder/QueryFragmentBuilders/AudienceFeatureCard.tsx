import * as React from 'react';
import { compose } from 'recompose';
import { messages } from '../constants';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { CalendarOutlined } from '@ant-design/icons';

export interface AudienceFeatureCardProps {
  audienceFeature: AudienceFeatureResource;
  selectedAudienceFeature?: AudienceFeatureResource;
  onSelectFeature: (featureId: string) => () => void;
}

type Props = AudienceFeatureCardProps & InjectedIntlProps;

interface State {
  cardToggled: boolean;
}

class AudienceFeatureCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cardToggled: false,
    };
  }

  toggleCard = () => {
    this.setState({
      cardToggled: !this.state.cardToggled,
    });
  };

  render() {
    const { audienceFeature, selectedAudienceFeature, onSelectFeature, intl } = this.props;
    const { cardToggled } = this.state;
    return (
      <div
        className={`mcs-standardSegmentBuilder_featureCard ${
          selectedAudienceFeature && selectedAudienceFeature.id === audienceFeature.id && 'selected'
        } ${!!cardToggled && 'toggled'}`}
      >
        {cardToggled ? (
          <McsIcon type='close' onClick={this.toggleCard} />
        ) : (
          <McsIcon type='info' onClick={this.toggleCard} />
        )}
        <div onClick={onSelectFeature(audienceFeature.id)}>
          {cardToggled ? (
            <React.Fragment>
              <span className='mcs-standardSegmentBuilder_featureCardToggledTitle'>
                {intl.formatMessage(messages.availableFilters)}
              </span>
              <div className='mcs-standardSegmentBuilder_featureCardDescritpion'>
                {audienceFeature.variables
                  ? audienceFeature.variables.map(v => {
                      return (
                        <div key={v.parameter_name}>
                          <CalendarOutlined />
                          &nbsp;
                          {v.parameter_name}
                        </div>
                      );
                    })
                  : intl.formatMessage(messages.noAvailableFilters)}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span className='mcs-standardSegmentBuilder_featureCardTitle'>{audienceFeature.name}</span>

              <div className='mcs-standardSegmentBuilder_featureCardDescritpion'>
                {audienceFeature.description}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default compose<Props, AudienceFeatureCardProps>(injectIntl)(AudienceFeatureCard);
