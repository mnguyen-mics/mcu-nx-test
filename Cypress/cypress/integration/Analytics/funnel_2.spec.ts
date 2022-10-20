import FunnelPage from '../../pageobjects/DataStudio/FunnelPage';

describe('Should test the funnel', () => {
  let createdChannelId: string;

  const getDate = (diffDays: number, diffMonths: number, euFormat?: boolean) => {
    const wantedDate = new Date(
      new Date().setDate(new Date().getDate() + diffDays + diffMonths * 30),
    );
    const day = wantedDate.getDate();
    const month = wantedDate.getMonth() + 1;
    const year = wantedDate.getFullYear();
    const formattedDay = day >= 10 ? day : `0${day}`;
    const formattedMonth = month >= 10 ? month : `0${month}`;
    if (euFormat && euFormat === true) {
      return `${formattedDay}/${formattedMonth}/${year}`;
    }
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const funnelStubbedResponse = (stepCount: number) => {
    return {
      status: 200,
      body: {
        status: 'ok',
        data: {
          global: {
            total: stepCount,
            steps: [{ name: 'Step 1', count: stepCount, interaction_duration: 10 }],
            grouped_by: [],
          },
        },
      },
      conversionBody: {
        status: 'ok',
        data: {
          global: {
            total: stepCount,
            steps: [
              {
                name: 'Step 1',
                count: stepCount,
                interaction_duration: 10,
                conversion: 5000,
                amount: 8000,
              },
            ],
            grouped_by: [],
          },
        },
      },
      percentageBody: {
        status: 'ok',
        data: {
          global: {
            total: 100000000,
            steps: [
              {
                name: 'Step 1',
                count: 1,
                interaction_duration: 10,
              },
            ],
            grouped_by: [],
          },
        },
      },
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'UTF-8',
        'access-control-max-age': '600',
        'access-control-allow-origin': '*',
        'access-control-allow-headers':
          'Accept, Content-Type, Origin, Authorization, X-Requested-With, X-Requested-By',
        'access-control-allow-methods': 'POST, GET, PUT, DELETE',
        'content-length': '97',
        'strict-transport-security': 'max-age=63072000;includeSubDomains;preload',
      },
    };
  };

  before(() => {
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test',
          domain: 'test.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(channelResponse => {
        createdChannelId = channelResponse.body.data.id;
      });
    });
  });

  beforeEach(() => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.login();
      cy.switchOrg(data.organisationName);
      funnelPage.goToPage();
      cy.wait(2000);
      funnelPage.clickDimensionCategoryField();
    });
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('should display the amount and conversion when available', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickDateRange();
      funnelPage.typeDate(0, getDate(0, -3));
      funnelPage.typeDate(1, `${getDate(0, -2)}{enter}`);
      funnelPage.clickDimensionCategoryField();
      cy.reload();
      funnelPage.clickDimensionCategoryField();
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);
      funnelPage.clickBtnExecuteQuery();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, -2));
        expect(req.body.in.start_date).to.eq(getDate(0, -3));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(400).status,
            funnelStubbedResponse(400).conversionBody,
            funnelStubbedResponse(400).headers,
          );
        });
      });
      funnelPage.stepInfo.eq(0).should('contain', '400');
      funnelPage.stepInfo.eq(1).should('contain', '5,000');
      funnelPage.stepInfo.eq(1).should('contain', '8,000€');
    });
  });

  it('should test the mathematical notation for percentages', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      funnelPage.clickDateRange();
      funnelPage.typeDate(0, getDate(0, -3));
      funnelPage.typeDate(1, `${getDate(0, -2)}{enter}`);
      funnelPage.clickDimensionCategoryField();
      cy.reload();
      funnelPage.clickDimensionCategoryField();
      funnelPage.clickChannelIdDimension();
      funnelPage.typeDimensionValue(0, createdChannelId);
      funnelPage.clickBtnExecuteQuery();
      cy.intercept({ pathname: /.*\/user_activities_funnel/, method: 'POST' }, req => {
        expect(req.body.in.end_date).to.eq(getDate(1, -2));
        expect(req.body.in.start_date).to.eq(getDate(0, -3));
        req.reply(res => {
          res.send(
            funnelStubbedResponse(400).status,
            funnelStubbedResponse(400).percentageBody,
            funnelStubbedResponse(400).headers,
          );
        });
      });
      funnelPage.conversions.should('contain', '1.00e-6%');
    });
  });
  it('should test the group by feature', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test_splitBy',
          domain: 'test_splitBy.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(channelResp => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test_splitby',
            $type: 'APP_VISIT',
            $site_id: `${channelResp.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime() - 10800000,
            $events: [
              {
                $event_name: '$item_view',
                $ts: new Date().getTime() - 10800000,
                $properties: {
                  $items: [],
                },
              },
            ],
          },
        }).then(() => {
          cy.wait(2000);
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              name: 'test_splitBy_2',
              domain: 'test_splitBy_2.com',
              enable_analytics: false,
              type: 'MOBILE_APPLICATION',
            },
          }).then(secondChannelResp => {
            cy.request({
              url: `${Cypress.env('apiDomain')}/v1/datamarts/${
                data.datamartId
              }/user_activities?processing_pipeline=false`,
              method: 'POST',
              headers: { Authorization: data.accessToken },
              body: {
                $user_account_id: 'test_splitBy_2',
                $type: 'APP_VISIT',
                $site_id: `${secondChannelResp.body.data.id}`,
                $session_status: 'NO_SESSION',
                $ts: new Date().getTime() - 10800000,
                $events: [
                  {
                    $event_name: '$item_view',
                    $ts: new Date().getTime() - 10800000,
                    $properties: {},
                  },
                ],
              },
            }).then(() => {
              funnelPage.clickDateRange();
              funnelPage.typePeriod('Last 30 days');
              cy.reload();
              cy.wait(2000);
              funnelPage.typeDimensionCategory('channel');
              funnelPage.clickChannelIdDimension();
              funnelPage.clickDimensionValueField(0);
              cy.contains(`${secondChannelResp.body.data.id} - test_splitBy_2`).click({
                force: true,
              });
              cy.wait(500);
              cy.contains(`${channelResp.body.data.id} - test_splitBy`).click({ force: true });
              funnelPage.clickBtnExecuteQuery();
              cy.wait(5000);
              funnelPage.clickSplitBy();
              funnelPage.clickSplitByOption();
              funnelPage.stepHover.should('contain', channelResp.body.data.id);
              funnelPage.stepHover.should('contain', secondChannelResp.body.data.id);
            });
          });
        });
      });
    });
  });

  it('should test the funnel complementary', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test_complementary',
          domain: 'test_complementary.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(complementaryChannel => {
        cy.request({
          url: `${Cypress.env('apiDomain')}/v1/datamarts/${
            data.datamartId
          }/user_activities?processing_pipeline=false`,
          method: 'POST',
          headers: { Authorization: data.accessToken },
          body: {
            $user_account_id: 'test_complementary',
            $type: 'APP_VISIT',
            $site_id: `${complementaryChannel.body.data.id}`,
            $session_status: 'NO_SESSION',
            $ts: new Date().getTime() - 10800000,
            $events: [
              {
                $event_name: '$transaction_confirmed',
                $ts: new Date().getTime() - 10800000,
                $properties: {
                  $items: [],
                },
              },
            ],
          },
        }).then(() => {
          cy.request({
            url: `${Cypress.env('apiDomain')}/v1/datamarts/${
              data.datamartId
            }/user_activities?processing_pipeline=false`,
            method: 'POST',
            headers: { Authorization: data.accessToken },
            body: {
              $user_account_id: 'test_other',
              $type: 'APP_VISIT',
              $site_id: `${createdChannelId}`,
              $session_status: 'NO_SESSION',
              $ts: new Date().getTime() - 10800000,
              $events: [
                {
                  $event_name: '$transaction_confirmed',
                  $ts: new Date().getTime() - 10800000,
                  $properties: {
                    $items: [],
                  },
                },
              ],
            },
          }).then(() => {
            cy.wait(30000);
            cy.reload();
            funnelPage.clickDateRange();
            funnelPage.typePeriod('Last 30 days');
            cy.reload();
            funnelPage.typeDimensionCategory('channel');
            funnelPage.clickChannelIdDimension();
            funnelPage.clickDimensionValueField(0);
            cy.contains(`${complementaryChannel.body.data.id} - test_complementary`).click({
              force: true,
            });

            funnelPage.clickBtnExecuteQuery();
            funnelPage.clickBtnAddStep();
            funnelPage.dimensionCategory.eq(1).type('conversion');
            funnelPage.clickHasConversion();
            funnelPage.clickDimensionValueField(1);
            cy.contains('true').click({ force: true });
            funnelPage.clickBtnExecuteQuery();
            cy.wait(5000);
            funnelPage.clickFunnelForOthers();
            funnelPage.funnelChart.its('length').should('be.gte', 3);
          });
        });
      });
    });
  });

  it('should test the autocompletion dropdown display', () => {
    const funnelPage = new FunnelPage();
    cy.readFile('cypress/fixtures/init_infos.json').then(data => {
      cy.request({
        url: `${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
        method: 'POST',
        headers: { Authorization: data.accessToken },
        body: {
          name: 'test_dropdown',
          domain: 'test_dropdown.com',
          enable_analytics: false,
          type: 'MOBILE_APPLICATION',
        },
      }).then(() => {
        cy.wait(2000);
        cy.reload();
        funnelPage.clickDimensionCategoryField();
        funnelPage.clickChannelIdDimension();
        funnelPage.clickDimensionValueField(0);
        cy.wait(3000);
        funnelPage.dropDownDimensionValue.then($el => {
          const top = parseInt($el[0].style.top.substring(0, $el[0].style.top.length - 2));
          funnelPage.clickDimensionValueField(0);
          funnelPage.clickBtnAddStep();
          funnelPage.dimensionCategory.eq(1).type('channel');
          funnelPage.channelIdDimension.eq(1).click();
          funnelPage.clickDimensionValueField(1);
          cy.wait(3000);
          funnelPage.dropDownDimensionValue.eq(1).then($secondEl => {
            const secondTop = parseInt(
              $secondEl[0].style.top.substring(0, $secondEl[0].style.top.length - 2),
            );
            expect(secondTop).to.be.greaterThan(top);
          });
        });
      });
    });
  });
});
