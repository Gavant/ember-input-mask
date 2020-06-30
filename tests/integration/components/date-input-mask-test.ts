import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, focus, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | date-input-mask', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`<DateInputMask/>`);

        assert.equal(this.element.textContent?.trim(), '');
    });

    test('the input mask works with basic number inputs', async function(assert) {
        await render(hbs`<DateInputMask/>`);
        await fillIn('input', '12345678');

        const inputMask = this.element.querySelector('.input-mask input') as HTMLInputElement;

        assert.equal(inputMask?.value?.trim(), '12/34/5678');
    });

    test('the input mask works with a custom mask and custom mutedMask', async function(assert) {
        this.set('mask', '99-99-9999');
        this.set('maskPlaceholder', 'mm-dd-YYYY');

        await render(hbs`<DateInputMask @mask={{this.mask}} @maskPlaceholder={{this.maskPlaceholder}}/>`);
        await fillIn('input', '12345678');

        const inputMask = this.element.querySelector('.input-mask input') as HTMLInputElement;

        assert.equal(inputMask?.value?.trim(), '12-34-5678');
    });

    test('the mask placeholder is visible on focus and invisible on lost focus', async function(assert) {
        await render(hbs`<DateInputMask/>`);
        await focus('input');

        let mutedMask = this.element.querySelector('.input-mask span') as HTMLInputElement;
        assert.equal(mutedMask?.textContent?.trim(), 'mm/dd/YYYY');

        await triggerEvent('input', 'focusout');
        mutedMask = this.element.querySelector('.input-mask span') as HTMLInputElement;
        assert.equal(mutedMask, null);
    });

    test('the mask placeholder, invisible placeholder and mask values update on basic input', async function(assert) {
        await render(hbs`<DateInputMask/>`);
        await fillIn('input', '1');
        await focus('input');

        let inputMask = this.element.querySelector('.input-mask input') as HTMLInputElement;
        let maskPlaceholder = this.element.querySelector('.input-mask span.input-mask-value') as HTMLSpanElement;
        let invisiblePlaceholder = this.element.querySelector('.input-mask span span') as HTMLSpanElement;

        assert.equal(inputMask?.value.trim(), '1');
        assert.equal(maskPlaceholder?.innerText?.trim(), 'm/dd/YYYY');
        assert.equal(invisiblePlaceholder?.textContent?.trim(), '1');

        await fillIn('input', '123');

        assert.equal(inputMask?.value.trim(), '12/3');
        assert.equal(maskPlaceholder?.innerText?.trim(), 'd/YYYY');
        assert.equal(invisiblePlaceholder?.textContent?.trim(), '12/3');

        await fillIn('input', '12345');

        assert.equal(inputMask?.value.trim(), '12/34/5');
        assert.equal(maskPlaceholder?.innerText?.trim(), 'YYY');
        assert.equal(invisiblePlaceholder?.textContent?.trim(), '12/34/5');
    });
});
