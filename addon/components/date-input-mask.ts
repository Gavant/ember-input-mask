import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import { assert } from '@ember/debug';

interface DateInputMaskArgs {
    mask?: string;
    mutedMask?: string;
    unmaskedValue?: string;
    updateValue?: Function;
}

interface MaskIndices {
    [index: number]: string;
    [propName: string]: any;
}

/**
 * Simple usage:
 *
 * ```handlebars
 * <DateInputMask />
 * ```
 *
 * @extends {Component<DateInputMaskArgs>}
 * @class DateInputMask
 * @public
 */
export default class DateInputMask extends Component<DateInputMaskArgs> {
    /**
     * The value used by regular expression matching to
     * allow or disallow values from being input
     *
     * @readonly
     * @argument mask
     * @type {string}
     */
    get mask(): string {
        return this.args.mask ?? '99/99/9999';
    }

    /**
     * The mask value without any non-alphanumeric values
     *
     * @readonly
     * @property maskRaw
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
     * @argument mutedMask
     * @type {string}
     */
    get mutedMask(): string {
        return this.args.mutedMask ?? 'mm/dd/YYYY';
    }

    /**
     * Returns true if the `unmaskedValue` has at least
     * one character
     *
     * @readonly
     * @property hasContent
     * @type {boolean}
     */
    get hasContent(): boolean {
        return this.unmaskedValue.length > 0;
    }

    defaultUnMaskedValue: string = '';
    maskIndices: MaskIndices = Object();

    /**
     * A function passed to the component to handle the update of
     * the data passed into the input
     *
     * @argument updateValue
     * @type {Function}
     * @memberof DateInputMask
     */
    updateValue?: Function;

    // tracked properties

    /**
     * Whether or not the `mutedMask` is visible
     *
     * @property mutedMaskVisible
     * @type {boolean}
     */
    @tracked mutedMaskVisible: boolean = false;

    /**
     * The input's value after masking that is visible
     * within the input
     *
     * @property maskedValue
     * @type {string}
     */
    @tracked maskedValue: string;

    /**
     * The portion of the `mutedMask` that is hidden.
     * Used to create proper spacing within the input
     *
     * @property invisibleMask
     * @type {string}
     */
    @tracked invisibleMask: string;

    /**
     * The portion of the `mutedMask` that is still visible
     *
     * @property visibleMask
     * @type {string}
     */
    @tracked visibleMask: string;

    /**
     * The value that is updated after stripping
     * additional mask characters
     *
     * @argument unmaskedValue
     * @type {string}
     */
    @tracked unmaskedValue: string;

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
        if (args.mask) {
            assert(
                'When providing a mask, a mutedMask argument must also be provided to ensure their values are consistent.',
                args.mutedMask
            );
        } else if (args.mutedMask) {
            assert(
                'When providing a mutedMask, a mask argument must also be provided to ensure their values are consistent.',
                args.mask
            );
        }
        this.visibleMask = this.mutedMask;
        this.unmaskedValue = args.unmaskedValue?.toString() ?? '';
        this.maskedValue = args.unmaskedValue ?? '';
        this.indexMasks();
        this.updateUnmaskedValue(this.unmaskedValue);
        this.maskValue();
        this.invisibleMask = this.createInvisibleMask();
        this.visibleMask = this.unmaskedValue ? this.createVisibleMask() : this.mutedMask;
        this.updateValue = args.updateValue;
    }

    /**
     * Show the `mutedMask`
     *
     * @method showMask
     */
    @action
    showMask() {
        this.mutedMaskVisible = true;
    }

    /**
     * Hide the `mutedMask`
     *
     * @method hideMask
     */
    @action
    hideMask() {
        this.mutedMaskVisible = false;
    }

    /**
     * Update `unmaskedValue`, `maskedValue`, `visibleMask`,
     * and `invisibleMask` on input change
     *
     * @param {InputEvent} event
     * @method updateInput
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
        if (this.updateValue) {
            this.updateValue(this.unmaskedValue);
        }
    }

    /**
     * Update `unmaskedValue` based on the latest
     * input value
     *
     * @private
     * @method updateUnmsakedValue
     * @param {string} newInputUnmasked
     */
    private updateUnmaskedValue(newInputUnmasked: string): void {
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
     * @private
     * @method maskValue
     */
    private maskValue() {
        let tempMaskedValue = '';
        for (let i = 0; i < this.unmaskedValue.length; i++) {
            if (get(this.maskIndices, `${i}`)) {
                tempMaskedValue += get(this.maskIndices, `${i}`);
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
     * @private
     * @method createVisibleMask
     * @return {string}
     */
    private createVisibleMask(): string {
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
     * @private
     * @method createInvisibleMask
     * @return {string}
     */
    private createInvisibleMask(): string {
        return this.maskedValue;
    }

    /**
     * Update `maskIndices` to declare where mask placeholders
     * will be placed during input updates
     *
     * @private
     * @method indexMasks
     */
    private indexMasks() {
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
