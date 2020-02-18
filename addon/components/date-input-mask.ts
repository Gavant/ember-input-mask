import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';

interface DateInputMaskArgs {
    mask?: string;
    mutedMask?: string;
    unmaskedValue?: string;
    updateValue?: Function;
}

/**
 * TODO:
 *
 * KNOWN BUGS:
 * 1) Pasting in value freezes the site
 */

export default class DateInputMask extends Component<DateInputMaskArgs> {
    /**
     * The value used by regular expression matching to
     * allow or disallow values from being input
     *
     * @readonly
     * @type {string}
     */
    get mask(): string {
        return this.args.mask || '99/99/9999';
    }

    /**
     * The mask value without any non-alphanumeric values
     *
     * @readonly
     * @type {string}
     */
    get maskRaw(): string {
        return this.mask.replace(/[\W\D]/g, '');
    }

    /**
     * The mask value that appears within the input where
     * values are missing
     *
     * @readonly
     * @type {string}
     */
    get mutedMask(): string {
        return this.args.mutedMask || 'mm/dd/YYYY';
    }

    /**
     * Returns true if the `unmaskedValue` has at least
     * one character
     *
     * @readonly
     * @type {boolean}
     */
    get hasContent(): boolean {
        return this.unmaskedValue.length > 0;
    }

    defaultUnMaskedValue: string = '';
    maskIndices: Object = Object();

    /**
     * A function passed to the component to handle the update of
     * the data passed into the input
     *
     * @type {Function}
     * @memberof DateInputMask
     */
    updateValue?: Function;

    // tracked properties
    @tracked mutedMaskVisible: boolean = false;
    @tracked maskedValue: string;
    @tracked unmaskedValue: string;
    @tracked invisibleMask: string;
    @tracked visibleMask: string;

    // constants
    maskMaps: any = {
        // TODO: fix type
        '9': /\d/,
        a: /\w/,
        '*': /[\w\d]/
    };
    maskPlaceholders = RegExp(/[\W\D]/);

    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        this.visibleMask = this.mutedMask;
        this.unmaskedValue = args.unmaskedValue || this.defaultUnMaskedValue;
        this.maskedValue = args.unmaskedValue || '';
        this.indexMasks();
        this.maskValue();
        this.invisibleMask = this.createInvisibleMask();
        this.updateValue = args.updateValue;
    }

    /**
     * Show the mask on `focusIn` events
     *
     * @param {FocusEvent} _event
     */
    @action
    showMask(_event: FocusEvent) {
        this.mutedMaskVisible = true;
    }

    /**
     * Hide the mask on `focusOut` events
     *
     * @param {FocusEvent} _event
     */
    @action
    hideMask(_event: FocusEvent) {
        this.mutedMaskVisible = false;
    }

    /**
     * Update `unmaskedValue`, `maskedValue`, `visibleMask`,
     * and `invisibleMask` on input change
     *
     * @param {InputEvent} event
     */
    @action
    updateInput(event: InputEvent) {
        const inputElement = event.target as HTMLInputElement;
        let newInputValue = inputElement.value as string;
        const newInputUnmasked = newInputValue.replace(/[\W\D]/g, '');
        if (newInputUnmasked.length > this.maskRaw.length) {
            inputElement.value = this.maskedValue;
        } else {
            this.updateUnmaskedValue(newInputUnmasked);
            this.maskValue();
            this.visibleMask = this.createVisibleMask();
            this.invisibleMask = this.createInvisibleMask();
        }
    }

    /**
     * Update `unmaskedValue` based on the latest
     * unmasked input value
     *
     * @param {string} newInputUnmasked
     */
    updateUnmaskedValue(newInputUnmasked: string): void {
        let tempUnmaskedValue = '';
        for (let i = 0; i < newInputUnmasked.length; i++) {
            const currentChar = newInputUnmasked[i];
            const currentRegexp = RegExp(get(this.maskMaps, this.maskRaw[i]));
            if (currentRegexp.test(currentChar)) {
                tempUnmaskedValue += currentChar;
            }
        }
        this.unmaskedValue = tempUnmaskedValue;
    }

    /**
     * Update `maskedValue` base on the latest unmasked input
     * value and the original `mask`
     *
     */
    maskValue() {
        let tempMaskedValue = '';
        for (let i = 0; i < this.unmaskedValue.length; i++) {
            if (get(this.maskIndices, String(i))) {
                tempMaskedValue += get(this.maskIndices, String(i));
            }
            tempMaskedValue += this.unmaskedValue[i];
        }
        this.maskedValue = tempMaskedValue;
    }

    /**
     * Update `visibleMask` to be displayed within the input
     * Sets `mutedMaskVisible` to false if the `maskedValue`
     * is greater in length than the `mutedMask`
     *
     * @returns {string}
     */
    createVisibleMask(): string {
        if (this.maskedValue.length >= this.mutedMask.length) {
            this.mutedMaskVisible = false;
            return '';
        }
        this.mutedMaskVisible = true;
        return this.mutedMask.substring(this.maskedValue.length);
    }

    /**
     * Update `invisibleMask` which is used to offset
     * the current input values for better UI/UX
     *
     * @returns {string}
     */
    createInvisibleMask(): string {
        return this.maskedValue;
    }

    /**
     * Update `maskIndices` to declare where mask placeholders
     * will be placed during input updates
     *
     */
    indexMasks() {
        const maskChars = this.mask.match(/([\W\D]{1,})/) || '';
        let i = 0;
        let j = 0;
        while (i < maskChars.length && j < this.mask.length) {
            const maskRemaining = 'x'.repeat(j - i) + this.mask.substring(j);
            const maskIndex = maskRemaining.indexOf(maskChars[i]);
            this.maskIndices[maskIndex] = maskChars[i];
            j += this.mask.substring(0, maskIndex).length + maskChars[i].length + 1;
            i++;
        }
    }
}
