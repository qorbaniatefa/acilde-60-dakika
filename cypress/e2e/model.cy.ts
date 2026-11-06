/// <reference types="cypress" />
const ctl = (name: string) => cy.get(`[data-cy="${name}"]`);
function start() {
  for (const name of ['profile-level', 'profile-role', 'profile-goal']) ctl(name).find('button').first().click();
  ctl('start').click();
}

describe('Primer v2 — gerçek tarayıcı ONNX diferansiyel testi', () => {
  for (const count of [5, 300]) {
    it(`${count} Python oracle girdisi WASM ile <1e-4 toleransta eşleşir`, () => {
      // ONNX and probabilities are deliberately NOT stubbed.
      cy.visit('/?parite');
      ctl(`parity-${count}`).click();
      ctl('parity-results').should('have.attr', 'data-count', String(count));
      ctl('parity-results').should('have.attr', 'data-pass', 'true');
      ctl('parity-row').each(row => expect(Number(row.attr('data-delta'))).to.be.lessThan(.0001));
      cy.window().then(async win => {
        const file = count === 5 ? 'parite.json' : 'parite-300.json';
        return (await win.fetch(`/model/${file}`)).json();
      }).then(reference => ctl('parity-row').then(elements => cy.task('recordParity', {
        count, model_sha256: reference.model_sha256,
        deltas: [...elements].map(element => Number(element.getAttribute('data-delta'))),
      })));
    });
  }
  it('aynı sahnede iki davranış profili farklı destek açar', () => {
    cy.visit('/?parite');
    ctl('p').should('exist').invoke('text').then(p => expect(Number(p)).to.be.lessThan(.5));
    ctl('adaptive-hint').should('not.exist');
    ctl('demo-deep').click();
    ctl('adaptive-hint').should('be.visible');
    ctl('p').invoke('text').then(p => expect(Number(p)).to.be.at.least(.5));
  });
});

describe('Primer v2 — veri ve geri dönüş davranışı', () => {
  it('model indirme hatası kararları engellemez', () => {
    // The manifest is used for both local and commit-pinned HF models.
    cy.intercept('GET', '**/model-release.json', {statusCode: 503});
    cy.visit('/'); start();
    ctl('model-status').should('contain.text', 'Model kullanılamıyor');
    ctl('choice-A').click();
    ctl('feedback-what').should('be.visible');
  });
  it('rıza ve üç öz bildirim olmadan tamamlanmış veri üretmez', () => {
    cy.visit('/');
    ctl('collection-consent').check(); start();
    for (const scene of [1, 2, 3]) {
      ctl('choice-A').click();
      ctl('feedback-what').should('not.exist');
      ctl('support-label').should('be.visible');
      ctl('label-yes').click();
      ctl('feedback-what').should('be.visible');
      ctl('collection-count').should('contain.text', scene === 3 ? '1 / 15' : '0 / 15');
      ctl('continue').click();
    }
    ctl('download-data').should('not.be.disabled');
    ctl('restart').click();
    ctl('collection-consent').should('not.be.checked');
  });
});
