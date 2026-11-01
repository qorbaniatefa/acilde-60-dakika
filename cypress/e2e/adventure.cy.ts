/// <reference types="cypress" />

const control = (name: string) => cy.get(`[data-cy="${name}"]`);
function profile(level = 0, role = 0, goal = 0) {
  control('profile-level').find('button').eq(level).click();
  control('profile-role').find('button').eq(role).click();
  control('profile-goal').find('button').eq(goal).click();
  control('start').click();
}
function choose(choice: string) {
  noOverflow();
  control('feedback-what').should('not.exist');
  control('continue').should('not.exist');
  control(`choice-${choice}`).click();
  control('choice-A').should('be.disabled');
  control('choice-B').should('be.disabled');
  control('feedback-what').should('be.visible');
  control('feedback-why').should('be.visible');
  noOverflow();
  control('continue').click();
}
function noOverflow() {
  cy.document().then(doc => expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth));
}

describe('Acilde 60 Dakika — tüm yollar', () => {
  beforeEach(() => cy.visit('/'));
  for (const path of ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB']) {
    it(`${path}: üç karar, doğru son ve temiz yeniden başlatma`, () => {
      control('start').should('be.disabled');
      profile(path[0] === 'A' ? 0 : 1, path[0] === 'A' ? 0 : 1, path[2] === 'A' ? 0 : 2);
      cy.focused().should('have.prop', 'tagName', 'H1');
      noOverflow();
      for (const choice of path) choose(choice);
      control('ending').should('have.text', path === 'AAA' ? 'Nöbet Kontrol Altında' : 'Krizin Bedeli');
      cy.contains(path[0] === 'A' ? 'KONTROLLÜ' : 'DARBOĞAZ VAR').should('be.visible');
      if (path === 'AAB') cy.contains('Sistem kontrollü çalışıyor').should('be.visible');
      if (path === 'ABA') cy.contains('VERİ İHLALİ').parent().should('contain.text', '0 KAYIT');
      noOverflow();
      control('restart').click();
      control('start').should('be.disabled');
      cy.get('[aria-pressed="true"]').should('not.exist');
    });
  }
  it('eksik profil ile başlamaz', () => {
    control('profile-level').find('button').first().click();
    control('profile-role').find('button').first().click();
    control('start').should('be.disabled');
  });
  it('öğretmen hatası oyunu engellemez', () => {
    cy.intercept('POST', '/api/tutor', { statusCode: 503, body: { error: 'unavailable' } }).as('hint');
    profile();
    control('tutor-input').type('Bu durumda hangi olguyu inceleyebilirim?');
    control('tutor-submit').click();
    cy.wait('@hint');
    control('tutor-error').should('be.visible');
    choose('A');
    cy.focused().should('have.prop', 'tagName', 'H1');
    cy.contains('Müdahaleyi Doğrula').should('be.visible');
  });
  it('deneyimli anlatımında başlangıç açıklaması bulunmaz', () => {
    profile(1, 1, 1);
    cy.contains('YENİ BAŞLAYAN İÇİN TERİM').should('not.exist');
    cy.contains('Test mühendisi bakışı').should('be.visible');
  });
  it('masaüstünde iyi son oynanır', () => {
    cy.viewport(1280, 800);
    profile();
    for (const c of 'AAA') choose(c);
    control('ending').should('have.text', 'Nöbet Kontrol Altında');
    noOverflow();
  });
});
