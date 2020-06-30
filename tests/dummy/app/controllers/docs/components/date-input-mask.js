import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// BEGIN-SNIPPET date-input-update.js
export default class DateInputMaskController extends Controller {
    @tracked customValue = '01012020';

    @action
    updateValue(newValue) {
        this.customValue = newValue;
    }
}
// END-SNIPPET
