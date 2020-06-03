beforeEach( () =>{
    cy.initTestContext()
})

// Some of the waits are added to stablize the test to avoid false negatives

it('should test the cleaning rules update form', () => {
    // Using readFile instead of fixtures because fixtures caches the file(this unwanted behavior was fixed on a more recent cypress version)
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.server()
        cy.route('**/**').as('allRoutes')
        cy.login()
        cy.wait('@allRoutes',{timeout:15000})
        cy.wait(1000)
        cy.visit(`${Cypress.config().baseUrl}/#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules`)
        cy.wait(1000)
        // Add cleaning rule
        cy.contains('New Cleaning Rule').parent().click()
        cy.contains(`${data.datamartName}`).click()
        cy.contains('div','for')
        // Using force true because we can get error notifications on a vagrant
        cy.get('button').contains('Save User Event Cleaning Rule').click({force:true})
        cy.get('table').find('tbody>tr').should('have.length',2)
        cy.contains('DRAFT').parent().parent().parent().contains('KEEP')
        cy.contains('DRAFT').parent().parent().parent().contains('1 day')
        cy.contains('DRAFT').parent().parent().parent().get('td').eq(3).contains('span','All')
        cy.contains('DRAFT').parent().parent().parent().get('td').eq(4).contains('span','All')
        cy.contains('DRAFT').parent().parent().parent().contains('No filter')
        cy.request(
            {
                url:`${Cypress.env('apiDomain')}/v1/datamarts/${data.datamartId}/channels`,
                method: 'POST',
                headers: { Authorization: data.accessToken },
                body:{
                    'name': 'test',
                    'domain': 'test.com',
                    'enable_analytics': false,
                    'type': 'SITE'
                }
            }
        )
        .then((response)=>{
            const channelId:number=response.body.data.id
            cy.contains('DRAFT').parent().parent().parent().find('.mcs-chevron').click()
            cy.contains('View').parent().click()
            cy.wait('@allRoutes')
            // Update the cleaning rule
            cy.contains('KEEP').click()
            cy.contains('DELETE').click()
            cy.contains('div','after')
            cy.get('.ant-input-number-input').type('999')
            cy.contains('- Select One -').click()
            cy.contains('APP_VISIT').click()
            cy.get('#eventNameFilter').type('test_1')
            cy.contains('Save User Event Cleaning Rule').click({force:true})
            // Check that the cleaning rule got updated
            cy.contains('DRAFT').parent().parent().parent().contains('DELETE')
            cy.contains('DRAFT').parent().parent().parent().contains('5 years, 5 months, 20 days')
            cy.contains('DRAFT').parent().parent().parent().contains('span',channelId)
            cy.contains('DRAFT').parent().parent().parent().contains('span','APP_VISIT')
            cy.contains('DRAFT').parent().parent().parent().contains('span','test_1')
        })
        })

    })

it('should test that only DRAFT cleaning rules can be deleted and updated',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.server()
        cy.route('**/**').as('allRoutes')
        cy.login()
        cy.wait('@allRoutes',{timeout:10000})
        cy.wait(2000)
        cy.visit(`${Cypress.config().baseUrl}/#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules`)
        cy.wait(3000)
        cy.get('tbody > tr:first').find('.mcs-chevron').click()
        // Check that we can't update and delete the cleaning rule when it's in status DRAFT
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
        cy.get('button').contains('New Cleaning Rule').parent().click()
        cy.get('div.title').contains(`${data.datamartName}`).click()
        cy.get('#eventNameFilter').type('test_1')
        cy.get('button').contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.get('table').find('tbody>tr').should('have.length',2)
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','false')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','false')
        cy.contains('test_1').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').parent().click()
        cy.wait(1000)
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
        cy.contains('test_1').parent().parent().contains('Archive the rule').click()
        cy.contains('Confirm').parent().click()
        cy.wait(1000)
        cy.contains('test_1').parent().parent().find('.mcs-chevron').click()
        cy.contains('View').parent().should('have.attr','aria-disabled','true')
        cy.contains('Delete').parent().should('have.attr','aria-disabled','true')
    })
})

it('should check that we can only have 3 different life durations for user event cleaning rules with content filters',()=>{
    cy.readFile('cypress/fixtures/init_infos.json').then((data) => {
        cy.server()
        cy.route('**/**').as('allRoutes')
        cy.login()
        cy.wait('@allRoutes',{timeout:10000})
        cy.visit(`${Cypress.config().baseUrl}/#/v2/o/${data.organisationId}/settings/datamart/cleaning_rules`)
        cy.wait(1000)
        cy.contains('New Cleaning Rule').parent().click()
        cy.contains(`${data.datamartName}`).parent().click()
        cy.get('#eventNameFilter').type('test_1')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.wait(1000)
        cy.contains('1 day').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').parent().click()
        cy.contains('New Cleaning Rule').parent().click()
        cy.contains(`${data.datamartName}`).parent().click()
        cy.get('input.ant-input-number-input').type('1')
        cy.get('#eventNameFilter').type('test_1')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.wait(1000)
        cy.contains('11 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').parent().click()
        cy.contains('New Cleaning Rule').parent().click()
        cy.contains(`${data.datamartName}`).parent().click()
        cy.get('input.ant-input-number-input').type('2')
        cy.get('#eventNameFilter').type('test_1')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.wait(1000)
        cy.contains('12 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').parent().click()
        cy.contains('New Cleaning Rule').parent().click()
        cy.contains(`${data.datamartName}`).parent().click()
        cy.get('input.ant-input-number-input').type('3')
        cy.get('#eventNameFilter').type('test_1')
        cy.contains('Save User Event Cleaning Rule').click({force:true})
        cy.url().should('contain',`datamart/cleaning_rules`)
        cy.wait(1000)
        cy.contains('13 days').parent().parent().contains('Activate the rule').click()
        cy.contains('Confirm').parent().click()
        cy.wait(2000)
        cy.contains('Maximum 3 different life durations can be used for USER_EVENT_CLEANING_RULE with content filters')
        cy.get('table').find('tbody>tr').should('have.length',5)
        // TODO add the case where we change the event name filter of the previously added cleaning rules
    })
})

// TODO add test that checks that we have to have at least one event cleaning rule with DELETE action