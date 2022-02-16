class DashboardFilter {
  applyFilters = (filters: string[]) => {
    cy.get('.mcs-dashboardFilter').click();
    for (const filter of filters) {
      cy.contains(filter).click();
    }
    cy.get('.mcs-dashboardLayout_filters_applyBtn').click();
  };
}

export default DashboardFilter;
