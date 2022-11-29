import {
  Actionbar,
  Loading,
  McsIcon,
  MenuList,
} from '@mediarithmics-private/mcs-components-library';
import { Col, Layout, Row } from 'antd';
import * as React from 'react';
import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { ConfigProps } from 'redux-form';
import { FormTitle } from '../../../components/Form';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import {
  StandardSegmentBuilderFormData,
  StandardSegmentBuilderQueryDocument,
  StandardSegmentBuilderResource,
} from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { IStandardSegmentBuilderService } from '../../../services/StandardSegmentBuilderService';
import StandardSegmentBuilderContainer from './StandardSegmentBuilderContainer';

const messages = defineMessages({
  standardBuilderSelectorTitle: {
    id: 'segment.edit.builderSelectorTitle',
    defaultMessage: 'Standard Segment Builders',
  },
  standardBuilderSelectorSubtitle: {
    id: 'segment.edit.builderSelectorSubtitle',
    defaultMessage: 'Choose your builder template',
  },
  noStandardBuildersBeginning: {
    id: 'segment.edit.noStandardBuilderBeginning',
    defaultMessage: 'This segment was created with a standard segment builder, you should ',
  },
  noStandardBuildersLink: {
    id: 'segment.edit.noStandardBuilderLink',
    defaultMessage: 'create a template',
  },
  noStandardBuildersEnd: {
    id: 'segment.edit.noStandardBuilderEnd',
    defaultMessage: ' to edit this segment.',
  },
});

export interface StandardSegmentBuilderPreviewProps
  extends Omit<ConfigProps<StandardSegmentBuilderFormData>, 'form'> {
  renderActionBar: (
    queryDocument: StandardSegmentBuilderQueryDocument,
    datamartId: string,
  ) => React.ReactNode;
  datamartId: string;
  handleClose: () => void;
}

type Props = StandardSegmentBuilderPreviewProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  selectedStandardSegmentBuilder?: StandardSegmentBuilderResource;
  standardSegmentBuilders?: StandardSegmentBuilderResource[];
  isLoadingBuilders: boolean;
}

class StandardSegmentBuilderPreview extends React.Component<Props, State> {
  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _standardSegmentBuilderService: IStandardSegmentBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingBuilders: true,
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this._standardSegmentBuilderService.getStandardSegmentBuilders(datamartId).then(response =>
      this.setState({
        standardSegmentBuilders: response.data,
        isLoadingBuilders: false,
        selectedStandardSegmentBuilder: response.total === 1 ? response.data[0] : undefined,
      }),
    );
  }

  handleSelect = (builder: StandardSegmentBuilderResource) => () => {
    this.setState({ selectedStandardSegmentBuilder: builder });
  };

  getMenu = () => {
    const { standardSegmentBuilders } = this.state;

    return (
      <React.Fragment>
        {standardSegmentBuilders?.map(b => {
          return (
            <MenuList
              className='mcs-standardSegmentBuilderSelector_standardSegmentBuilderList_element'
              key={b.id}
              title={b.name}
              select={this.handleSelect(b)}
            />
          );
        })}
      </React.Fragment>
    );
  };

  render() {
    const {
      renderActionBar,
      intl: { formatMessage },
      initialValues,
      handleClose,
      datamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { selectedStandardSegmentBuilder, standardSegmentBuilders, isLoadingBuilders } =
      this.state;

    return isLoadingBuilders ? (
      <Loading isFullScreen={true} />
    ) : selectedStandardSegmentBuilder ? (
      <StandardSegmentBuilderContainer
        standardSegmentBuilder={selectedStandardSegmentBuilder}
        renderActionBar={renderActionBar}
        initialValues={initialValues}
      />
    ) : (
      <Layout>
        <Actionbar edition={true} pathItems={[]}>
          <McsIcon
            type='close'
            className='close-icon'
            style={{ cursor: 'pointer' }}
            onClick={handleClose}
          />
        </Actionbar>
        <Layout.Content className='mcs-content-container mcs-form-container text-center'>
          <FormTitle
            title={messages.standardBuilderSelectorTitle}
            subtitle={messages.standardBuilderSelectorSubtitle}
          />

          {standardSegmentBuilders?.length === 0 ? (
            <Row className='mcs-segmentEditionStandardSegmentBuilderSelector_container'>
              <Col className='mcs_segmentEditionStandardSegmentBuilderSelector_emptyCard'>
                <div>
                  {formatMessage(messages.noStandardBuildersBeginning)}
                  <Link
                    onClick={handleClose}
                    to={`/v2/o/${organisationId}/settings/datamart/${datamartId}/standard_segment_builder/create`}
                  >
                    {formatMessage(messages.noStandardBuildersLink)}
                  </Link>
                  {formatMessage(messages.noStandardBuildersEnd)}
                </div>
              </Col>
            </Row>
          ) : (
            <Row className='mcs-selector_container mcs-standardSegmentBuilderSelector_standardSegmentBuilderList_container'>
              <Row className='menu'>{this.getMenu()}</Row>
            </Row>
          )}
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, StandardSegmentBuilderPreviewProps>(
  injectIntl,
  withRouter,
)(StandardSegmentBuilderPreview);
