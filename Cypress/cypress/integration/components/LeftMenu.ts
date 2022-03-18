class LeftMenu {
  goToHomePage = () => {
    cy.get('.mcs-sideBar-subMenu_menu\\.audience\\.home').click();
  };
}

export default new LeftMenu();
