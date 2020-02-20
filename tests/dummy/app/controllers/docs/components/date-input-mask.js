import Controller from '@ember/controller';
import { set, action } from '@ember/object';

// BEGIN-SNIPPET date-input-update.js
export default class DateInputMaskController extends Controller {
    customValue = '01012020';

    @action
    updateValue(newValue) {
        set(this, 'customValue', newValue);
    }
}
// END-SNIPPET
