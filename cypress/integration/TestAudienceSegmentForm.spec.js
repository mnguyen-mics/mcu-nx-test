/// <reference types="Cypress" />
/// <reference path="../support/index.d.ts" />

/*
    Cypress e2e test in Audience Segment form
*/

describe('Cypress e2e test in Audience Segment form', function() {

    /*
            Define usefull Values 
    */
    const second = 1000;
    const organisationName = "yellow velvet";

    const segmentName = 'Test';
    const segmentDesc = 'Test Decription';

    const datamartName = 'YV Pionus'

    before(() => {
      cy.viewport(1920, 1080)
      // Login
      cy.login()
      cy.url({timeout: 10*second}).should('contain', Cypress.config().baseUrl + '/#/v2/o/1/campaigns/display')

      // Switch organisation
      cy.switchOrg(organisationName)

       //Go to Audience menu
      //cy.get('[class="ant-menu-submenu-title"]')
        //.first()
        //.click()

      //Go to Segment menu
      cy.contains("Audience")
        .click();

      cy.contains("Segments")
        .click();
    })

    
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('access_token', 'access_token_expiration_date');
    })


  it('User List',function() { 
    createSegment('User List',datamartName)

   })

  it('User Pixel',function() { 
    createSegment('User Pixel',datamartName)

  })

  it('User Expert Query',function() { 
    createSegment('User Expert Query',datamartName)

  })


})

/*
    This function create a segment
    @in type : the type of the segment created ('pixel', 'list', 'expert query')
    @in datamart : the name of the datamart we use to create the segment
*/
function createSegment(type,datamart)
{
    //Click on "new Segment"
    cy.contains("New Segment")
      .click({force : true});

    //Select one Datamarts
    cy.contains(datamart)
      .click({force : true});

    //Select Segment Types
    cy.contains(type)   
      .click();

    //Fill the name of the segement
    cy.get('[id="audienceSegment.name"]')
      .type('Test Audience Segment Form - Test '+type, {force : true})

    //Fill the descritpion
    cy.get('[id="audienceSegment.short_description"]')
      .type('This segment was created to test the creation of segment.', {force : true})

    //click on advanced
    cy.get('[class="button-styleless optional-section-title"]')
        .click()

    //Fill the technical name
    cy.get('[id="audienceSegment.technical_name"]')
      .type('technical name test ' + type)

    //Fill the default life time 
    cy.get('[id="audienceSegment.defaultLiftime"]')
      .type('1')

    //Choose day as the lifetime
    cy.get('[class ="ant-select ant-select-enabled"]')
      .click()

    cy.contains('Days')
      .click()

    //In the case that we are in user expert query, we have to write a moke query to validate
    if(type=='User Expert Query')
    {
      cy.get('[id="brace-editor"]')
        .find('[class="ace_text-input"]')
        .type('SELECT @count {} FROM ActivityEvent WHERE date <= "now-120d/d"', {force : true})
    }
    
    //Save the new segment
    cy.contains("Save")
        .click()
    //Get back on the main page
    cy.contains("Audience")
      .click();

    cy.contains("Segments")
      .first()
      .click();

    cy.url().should('include', 'audience/segments')
    cy.wait(250)
}
