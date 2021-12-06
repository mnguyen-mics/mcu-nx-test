import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Row, Col, Tooltip, Modal, Tag } from 'antd';
import messages from '../messages';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import moment from 'moment';
import CustomObjectRendererWrapper, {
  RenderingTemplates,
  TemplateDefinitions,
} from '../../../../components/CustomObjectRendererWrapper';
import { ProcessingResource } from '../../../../models/processing';
import { UserChoicesWithProcessings } from '../../../../models/timeline/timeline';
import UserChoiceResource from '../../../../models/userchoice/UserChoiceResource';

interface UserChoicesCardProps {
  dataSource: UserChoicesWithProcessings;
  isLoading: boolean;
}

interface ProcessingUserChoice {
  processing: ProcessingResource;
  userChoice: UserChoiceResource;
}

interface State {}

type Props = UserChoicesCardProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  InjectedThemeColorsProps;

class UserChoicesCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  buildData = (data: UserChoicesWithProcessings): ProcessingUserChoice[] => {
    const associatedProcessingUserChoices: ProcessingUserChoice[] = data.processings.reduce(
      (accumulator: ProcessingUserChoice[], processing: ProcessingResource) => {
        const associatedConsent = data.userChoices.find(userChoice => {
          return userChoice.$processing_id === processing.id;
        });

        if (associatedConsent) {
          accumulator.push({
            processing: processing,
            userChoice: associatedConsent,
          });
        }

        return accumulator;
      },
      [],
    );

    return associatedProcessingUserChoices;
  };

  renderUserChoice = (userChoice: UserChoiceResource): JSX.Element => {
    const { colors } = this.props;

    const functionChoiceAcceptanceValue = (choiceAcceptanceValue: boolean) => {
      return choiceAcceptanceValue ? (
        <Tag color={colors['mcs-success']}>True</Tag>
      ) : (
        <Tag color={colors['mcs-error']}>False</Tag>
      );
    };

    const functionTimestamp = (timestampValue: number) =>
      moment(timestampValue).format('YYYY-MM-DD, hh:mm:ss');

    const absoluteTemplates: TemplateDefinitions = {
      $choice_acceptance_value: functionChoiceAcceptanceValue,
      $creation_ts: functionTimestamp,
      $choice_ts: functionTimestamp,
    };

    const renderingTemplates: RenderingTemplates = {
      absoluteTemplates: absoluteTemplates,
      relativeTemplates: {},
    };

    return (
      <CustomObjectRendererWrapper
        customRenderingTemplates={renderingTemplates}
        customObject={userChoice}
      />
    );
  };

  uppercaseFirstLetter = (toBeUppercased: string) => {
    return toBeUppercased.charAt(0).toUpperCase() + toBeUppercased.slice(1);
  };

  renderProcessing = (processingUserChoice: ProcessingUserChoice) => {
    const processing = processingUserChoice.processing;
    const legalBasis = this.uppercaseFirstLetter(
      processing.legal_basis.toLowerCase().replace(/_/gi, ' '),
    );
    const userChoice = processingUserChoice.userChoice;
    return (
      <Row gutter={10} key={processingUserChoice.processing.id} className='table-line border-top'>
        <Row>
          <Col span={21}>
            <span className='title'>
              {processing.name} ({legalBasis})
            </span>
          </Col>
          <Col span={3}>
            <Tooltip title={processing.purpose} placement='right'>
              <McsIcon className='mcs-timeline-info' type='info' />
            </Tooltip>
          </Col>
        </Row>
        {userChoice && this.renderUserChoice(userChoice)}
      </Row>
    );
  };

  createHandleJSONViewModal = (filteredData: ProcessingUserChoice[]) => {
    return () => {
      const { intl } = this.props;

      Modal.info({
        title: intl.formatMessage(messages.userChoicesJson),
        okText: intl.formatMessage(messages.userChoicesJsonModalOkText),
        width: '650px',
        content: (
          <SyntaxHighlighter language='json' style={docco}>
            {JSON.stringify(filteredData, undefined, 4)}
          </SyntaxHighlighter>
        ),
        onOk() {
          //
        },
      });
    };
  };

  render() {
    const {
      intl: { formatMessage },
      dataSource,
      isLoading,
      hasFeature,
    } = this.props;

    if (hasFeature('datamart-user_choices')) {
      const filteredData = this.buildData(dataSource);

      const handleViewJsonModal = this.createHandleJSONViewModal(filteredData);

      const viewJsonButton =
        filteredData.length !== 0 ? (
          <Row>
            <button className='button-sm' onClick={handleViewJsonModal}>
              <FormattedMessage {...messages.userChoicesviewJsonButton} />
            </button>
          </Row>
        ) : null;

      return (
        <Card
          title={formatMessage(messages.userChoicesTitle)}
          isLoading={isLoading}
          className={'mcs-userChoicesCard'}
          buttons={viewJsonButton}
        >
          {filteredData.length !== 0 ? (
            filteredData.map(this.renderProcessing)
          ) : (
            <span>
              <FormattedMessage {...messages.emptyUserChoices} />
            </span>
          )}
        </Card>
      );
    }
    return null;
  }
}

export default compose<Props, UserChoicesCardProps>(
  injectFeatures,
  injectIntl,
  injectThemeColors,
)(UserChoicesCard);
