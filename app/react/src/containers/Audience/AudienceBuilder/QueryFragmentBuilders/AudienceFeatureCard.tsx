import * as React from 'react';
import { compose } from 'recompose';
import { messages } from '../constants';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

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
    const {
      audienceFeature,
      selectedAudienceFeature,
      onSelectFeature,
      intl,
    } = this.props;
    const { cardToggled } = this.state;
    return (
      <div
        className={`mcs-audienceBuilder_featureCard ${selectedAudienceFeature &&
          selectedAudienceFeature.id === audienceFeature.id &&
          'selected'} ${cardToggled && 'toggled'}`}
        onClick={onSelectFeature(audienceFeature.id)}
      >
        {cardToggled ? (
          <McsIcon type="close" onClick={this.toggleCard} />
        ) : (
          <McsIcon type="info" onClick={this.toggleCard} />
        )}

        {cardToggled ? (
          <React.Fragment>
            <span>{intl.formatMessage(messages.availableFilters)}</span>
            <div className="mcs-audienceBuilder_featureCardDescritpion">
              <ul>
                {audienceFeature.variables.map(v => {
                  return <li key={v.parameter_name}>- {v.parameter_name} </li>;
                })}
              </ul>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span>{audienceFeature.name}</span>

            <div className="mcs-audienceBuilder_featureCardDescritpion">
              {audienceFeature.description}
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default compose<Props, AudienceFeatureCardProps>(injectIntl)(
  AudienceFeatureCard,
);
