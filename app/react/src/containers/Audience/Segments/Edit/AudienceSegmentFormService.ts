import moment from 'moment';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import { AudienceSegmentFormData } from './domain';
import QueryService from '../../../../services/QueryService';
import { QueryResource, QueryLanguage } from '../../../../models/datamart/DatamartResource';
import { UserQuerySegment, AudienceSegmentShape } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { DataResponse } from '../../../../services/ApiService';


export const AudienceSegmentFormService = {
  loadSegmentInitialValue(
    segmentId: string,
  ): Promise<AudienceSegmentFormData> {
    return AudienceSegmentService
      .getSegment(segmentId)
      .then((res) => {
        if (res.data.type === 'USER_QUERY' && res.data.query_id) {
          return QueryService
            .getQuery(res.data.datamart_id, res.data.query_id)
            .then(r => r.data)
            .then(r => {
              const formattedResponse: AudienceSegmentFormData = {
                audienceSegment: res.data,
                query: r
              }
              return formattedResponse;
            })
        }
        const response: AudienceSegmentFormData = {
          audienceSegment: res.data
        }
        return response
      })
  },

  saveOrCreateAudienceSegment(
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
    queryLanguage?: QueryLanguage,
    queryContainer?: any,
  ): Promise<DataResponse<AudienceSegmentShape> | void> {
    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LOOKALIKE':
        return createOrUpdateAudienceSegmentUserLookAlike(organisationId, audienceSegmentFormData)
      case 'USER_LIST':
        return createOrUpdateAudienceSegmentUserList(organisationId, audienceSegmentFormData)
      case 'USER_QUERY':
        return createOrUpdateAudienceSegmentUserQuery(organisationId, audienceSegmentFormData, queryLanguage as QueryLanguage, queryContainer)
      default:
        return Promise.resolve()
    }
  }
}

function createOrUpdateAudienceSegmentUserList(
  organisationId: string,
  audienceSegmentFormData: AudienceSegmentFormData
): Promise<DataResponse<AudienceSegmentShape>> {
  const formattedResponse = {
    ...audienceSegmentFormData.audienceSegment,
    techincal_name: fillTechnicalNameForUserPixel(audienceSegmentFormData)
  }
  return AudienceSegmentService.saveSegment(organisationId, formattedResponse)
    .then(response => {
      if (audienceSegmentFormData.userListFiles !== undefined) {
        Promise.all(
          audienceSegmentFormData.userListFiles.map(item => {
            const formData = new FormData();
            formData.append('file', item as any, item.name);
            return AudienceSegmentService.importUserListForOneSegment(
              audienceSegmentFormData.audienceSegment
                .datamart_id as string,
              audienceSegmentFormData.audienceSegment.id as string,
              formData,
            );
          }),
        ).then(() => response);
      }
      return response
    })
}

function createOrUpdateAudienceSegmentUserLookAlike(
  organisationId: string,
  audienceSegmentFormData: AudienceSegmentFormData
): Promise<DataResponse<AudienceSegmentShape>> {
  return AudienceSegmentService.saveSegment(organisationId, audienceSegmentFormData.audienceSegment)
}

function createOrUpdateAudienceSegmentUserQuery(
  organisationId: string,
  audienceSegmentFormData: AudienceSegmentFormData,
  queryLanguage: QueryLanguage,
  queryContainer: any,
): Promise<DataResponse<AudienceSegmentShape>> {
  return createOrUpdateQuery(
    queryContainer,
    queryLanguage,
    audienceSegmentFormData,
  ).then(query => {
    const formattedResponse: Partial<UserQuerySegment> = { ...audienceSegmentFormData.audienceSegment as Partial<UserQuerySegment>, query_id: query.id }
    return AudienceSegmentService.saveSegment(organisationId, formattedResponse)
  })
}


function createOrUpdateQuery(
  queryContainer: any,
  queryLanguage: QueryLanguage,
  audienceSegmentFormData: AudienceSegmentFormData,
): Promise<QueryResource> {
  const datamartId = audienceSegmentFormData.audienceSegment
    .datamart_id as string;

  if (queryLanguage === 'SELECTORQL') {
    return queryContainer.saveOrUpdate() as Promise<QueryResource>
  } else {
    if (audienceSegmentFormData.query && audienceSegmentFormData.query.id) {
      return QueryService.updateQuery(
        datamartId,
        audienceSegmentFormData.query.id,
        audienceSegmentFormData.query
      ).then(query => query.data)
    }
    return QueryService.createQuery(datamartId, {
      query_language: queryLanguage,
      query_text: (audienceSegmentFormData.query as QueryResource)
        .query_text,
      datamart_id: datamartId,
    }).then(query => query.data)
  }
};

function fillTechnicalNameForUserPixel(
  formData: AudienceSegmentFormData,
) {
  const technicalName = formData.audienceSegment.technical_name;
  if (
    formData.audienceSegment.type === 'USER_LIST' &&
    formData.audienceSegment.feed_type === 'TAG'
  ) {
    if (
      technicalName === undefined ||
      technicalName === null ||
      technicalName === ''
    ) {
      return `${formData.audienceSegment.name}-${moment().unix()}`;
    }
  }

  return technicalName;
};