import * as React from 'react';
import { WrappedFieldArrayProps, InjectedFormProps } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Switch } from 'antd';
import { Form, TableSelector } from '../../../../../../components';
import { McsIconType } from '../../../../../../components/McsIcons';
import messages from '../../messages';
import { getPaginatedApiParam } from '../../../../../../utils/ApiHelper';
import { formatMetric, normalizeReportView } from '../../../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../../../utils/Normalizer';
import { generateFakeId } from '../../../../../../utils/FakeIdHelper';
import log from '../../../../../../utils/Logger';
import AudienceSegmentService from '../../../../../../services/AudienceSegmentService';
import ReportService from '../../../../../../services/ReportService';

import {
  AudienceSegmentFieldModel,
} from './AudienceCatalog/AudienceCatalogContainer';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord/index';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../../components/Drawer';
import McsMoment from '../../../../../../utils/McsMoment';

const { FormSection } = Form;

interface SectionHandlerProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
}

const AudienceRecordElement = RecordElement as new() => RecordElement<AudienceSegmentFieldModel>;

export interface AudienceProps {
  formValues: AudienceSegmentFieldModel[];
  RxF: InjectedFormProps;
  handlers: SectionHandlerProps;
  organisationId: string;
  datamartId: string;
}

interface AudienceStats {
  audience_segment_id: string;
  desktop_cookie_ids: string;
  user_points: string;
}

interface AudienceState {
  loading: boolean;
  stats: {
    [segmentId: string]: AudienceStats;
  };
}

interface FilterProps {
  currentPage: number;
  pageSize: number;
  keywords: string;
}

type JoinedProps = InjectedIntlProps & AudienceProps & WrappedFieldArrayProps<AudienceSegmentFieldModel>;

class Audience extends React.Component<JoinedProps, AudienceState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: false,
      stats: {},
    };
  }

  componentDidMount() {
    if ((this.props.fields.getAll() || []).length !== 0) {
      this.fetchAll();
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    if ((nextProps.fields.getAll() || []).length && !this.state.stats.length) {
      this.fetchAll();
    }
  }

  fetchAll = () => {
    ReportService.getAudienceSegmentReport(
      this.props.organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
      ['desktop_cookie_ids', 'user_points'],
    )
      .then(res => res.data)
      .then(res => {
        // todo
        this.setState({
          stats: normalizeArrayOfObject(normalizeReportView(res.report_view) as AudienceStats[], 'audience_segment_id'),
        });
      })
      .catch(err => log.error(err));
  }

  getAudience = (filterOptions: FilterProps) => {
    const { organisationId, datamartId } = this.props;
    const { currentPage, keywords, pageSize } = filterOptions;
    const params = getPaginatedApiParam(currentPage, pageSize);
    let options: any = {
      ...params,
    };

    if (keywords) {
      options = {
        ...options,
        name: keywords,
      };
    }

    return AudienceSegmentService.getSegmentsWithMetadata(organisationId, datamartId, options);
  }

  openWindow = () => {
    const { handlers } = this.props;
    const selectedIds = this.props.fields.getAll() &&
      this.props.fields.getAll().filter(elem => !elem.deleted).map(elem => elem.resource.audience_segment_id);

    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'name',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleUserPoints,
        key: 'user_points',
        isHideable: false,
        render: (text: string) => <span>{formatMetric(text, '0,0')}</span>,
      },
      {
        intlMessage: messages.sectionSelectorTitleCookieIds,
        key: 'desktop_cookie_ids',
        isHideable: false,
        render: (text: string) => <span>{formatMetric(text, '0,0')}</span>,
      },
    ];

    const additionalProps = {
      actionBarTitle: 'Add an Audience',
      close: handlers.closeNextDrawer,
      columnsDefinitions,
      displayFiltering: true,
      fetchSelectorData: this.getAudience,
      save: this.updateData,
      selectedIds,
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (selectedIds: string[]) => {
    const { handlers, fields } = this.props;
    const fetchSelectedSegments = Promise.all(selectedIds.map(segmentId => {
      return AudienceSegmentService.getSegment(segmentId).then(res => res.data);
    }));

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    fetchSelectedSegments
      .then(segments => {
        return segments.map(segment => {

          const prevSeg =  (this.props.fields.getAll() || []).find(elem => elem.resource.audience_segment_id === segment.id);
          const exclude = (prevSeg ? prevSeg.resource.exclude : false);

          return {
            id: prevSeg && prevSeg.id ? prevSeg.id : generateFakeId(),
            resource: { audience_segment_id: segment.id, name: segment.name, exclude: exclude },
            deleted: prevSeg && prevSeg.deleted ? prevSeg.deleted : false };
        });
      })
      .then(newFields => {
        this.props.RxF.change((fields as any).name, newFields);
        this.setState({ loading: false });
      });
  }

  removeItem = (item: AudienceSegmentFieldModel) => {
    const newFields = this.props.fields.getAll().map(field => {
      return field.id === item.id ? {
        ...item,
        deleted: true,
      } : {...field};
    });
    this.props.RxF.change((this.props.fields as any).name, newFields);
  }

  excludeTargetItem = (item: AudienceSegmentFieldModel) => {
    const newFields = this.props.fields.getAll().map(field => {
      return field.id === item.id ? {
        ...item,
        resource: {
          ...item.resource,
          exclude: !item.resource.exclude,
        },
      } : {...field};
    });
    this.props.RxF.change((this.props.fields as any).name, newFields);
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const { stats } = this.state;

    const emptyOption = {
      iconType: 'users' as McsIconType,
      message: formatMessage(messages.contentSectionAudienceEmptyTitle),
    };

    const titleRender = (record: AudienceSegmentFieldModel) => {
        return <span>{record.resource.name}</span>;
    };

    const additionalDataRender = (record: AudienceSegmentFieldModel) => {
      const hasStats = stats && stats[record.resource.audience_segment_id];
      return hasStats ? (
        <span>
          <span className="m-r-20">Cookies: {hasStats.desktop_cookie_ids ? formatMetric(hasStats.desktop_cookie_ids, '0,00') : '-'}</span>
          <span>User Points: {hasStats.user_points ? formatMetric(hasStats.user_points, '0,00') : '-'}</span>
        </span>
      ) : null;
    };

    const additionnalActionButtonRender = (record: AudienceSegmentFieldModel) => {
      const onClick = () => this.excludeTargetItem(record);
      const exclude = record.resource.exclude;
      return (
        <span>
          <Switch defaultChecked={!exclude} onChange={onClick} className="mcs-table-switch m-r-10" />
          {exclude ? 'Exclude' : 'Target'}
        </span>
      );
    };

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleAudience}
          title={messages.sectionTitleAudience}
        />

        <RelatedRecords emptyOption={emptyOption} isLoading={this.state.loading}>
          { (this.props.fields.getAll() ||
              (this.props.fields.getAll() || []).find(f => !f.deleted)) ? this.props.fields.getAll().map(item => {
            return item.deleted ? null : (
              <AudienceRecordElement
                key={item.id}
                recordIconType="users"
                title={titleRender}
                onRemove={this.removeItem}
                additionalData={additionalDataRender}
                additionalActionButtons={additionnalActionButtonRender}
                record={item}
              />
            );
          }) : null }
        </RelatedRecords>
      </div>
    );
  }
}

export default injectIntl(Audience);
