import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { action, get } from '@ember/object';
import { assert } from '@ember/debug';

export interface DateInputMaskArgs {
    mask?: string;
    maskPlaceholder?: string;
    value?: string;
    onUpdate?: Function;
    containerClass?: string;
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
     * A class string used to style the input and label container
     *
     * @readonly
     * @argument containerClass
     * @type {string}
     */
    get containerClass(): string {
        return this.args.containerClass || '';
    }

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
     * @argument maskPlaceholder
     * @type {string}
     */
    get maskPlaceholder(): string {
        return this.args.maskPlaceholder ?? 'mm/dd/YYYY';
    }

    /**
     * Returns true if the `value` has at least
     * one character
     *
     * @readonly
     * @property hasContent
     * @type {boolean}
     */
    get hasContent(): boolean {
        return this.value.length > 0;
    }

    defaultValue: string = '';
    maskIndices: MaskIndices;

    // tracked properties

    /**
     * Whether or not the `maskPlaceholder` is visible
     *
     * @property maskPlaceholderVisible
     * @type {boolean}
     */
    @tracked maskPlaceholderVisible: boolean = false;

    /**
     * The input's value after masking that is visible
     * within the input
     *
     * @property maskedValue
     * @type {string}
     */
    @tracked maskedValue: string;

    /**
     * The portion of the `maskPlaceholder` that is hidden.
     * Used to create proper spacing within the input
     *
     * @property invisiblePlaceholder
     * @type {string}
     */
    @tracked invisiblePlaceholder: string;

    /**
     * The portion of the `maskPlaceholder` that is still visible
     *
     * @property visiblePlaceholder
     * @type {string}
     */
    @tracked visiblePlaceholder: string;

    /**
     * The value that is updated after stripping
     * additional mask characters
     *
     * @argument value
     * @type {string}
     */
    @tracked value: string;

    // constants
    maskMaps: any = {
        // TODO: fix type
        '9': /\d/,
        a: /\w/,
        '*': /[\w\d]/
    };
    maskPlaceholders = RegExp(/[\W\D]/);

    /**
     * Creates an instance of DateInputMask.
     * Masks the initial `value`, sets the `visiblePlaceholder` and `invisiblePlaceholder`,
     * and sets the indices for the placeholder values
     *
     * @method constructor
     * @param {unknown} owner
     * @param {DateInputMaskArgs} args
     */
    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        if (args.mask) {
            assert(
                'When providing a mask, a maskPlaceholder argument must also be provided to ensure their values are consistent.',
                args.maskPlaceholder
            );
        } else if (args.maskPlaceholder) {
            assert(
                'When providing a maskPlaceholder, a mask argument must also be provided to ensure their values are consistent.',
                args.mask
            );
        }
        this.maskIndices = {};
        this.value = args.value?.toString() ?? '';
        this.maskedValue = args.value ?? '';
        this.indexMasks();
        this.updateValue(this.value);
        this.maskValue();
        this.invisiblePlaceholder = this.maskedValue;
        this.visiblePlaceholder = this.value ? this.createVisiblePlaceholder() : this.maskPlaceholder;
    }

    /**
     * Show the `maskPlaceholder`
     *
     * @method showMask
     * @return {void}
     */
    @action
    showMask(): void {
        this.maskPlaceholderVisible = true;
    }

    /**
     * Hide the `maskPlaceholder`
     *
     * @method hideMask
     * @return {void}
     */
    @action
    hideMask(): void {
        this.maskPlaceholderVisible = false;
    }

    /**
     * Update the input, mask and unmasked values.
     * Set the caret position accordingly.
     *
     * @param {InputEvent} event
     * @method updateInput
     * @return {void}
     */
    @action
    updateInput(event: InputEvent): void {
        const inputElement = event.target as HTMLInputElement;
        let newInputValue = inputElement.value as string;
        const newInputUnmasked = newInputValue.replace(/[\W\D]/g, '');
        if (newInputUnmasked.length > this.maskRaw.length) {
            inputElement.value = this.maskedValue;
        } else {
            this.updateValue(newInputUnmasked);
            this.maskValue();
            this.visiblePlaceholder = this.createVisiblePlaceholder();
            this.invisiblePlaceholder = this.maskedValue;
        }
        if (this.args.onUpdate) {
            this.args.onUpdate(this.value);
        }
        const currentCaret = inputElement.selectionStart || 0;
        inputElement.focus();
        if (event.inputType === 'deleteContentBackward' && (currentCaret || currentCaret === 0)) {
            later(
                this,
                () => {
                    inputElement.setSelectionRange(currentCaret, currentCaret);
                },
                0
            );
        }
    }

    /**
     * Update `value` based on the latest
     * input value
     *
     * @private
     * @method updateValue
     * @param {string} newInputUnmasked
     * @return {void}
     */
    private updateValue(newInputUnmasked: string): void {
        let tempUnmaskedValue = '';
        for (let i = 0; i < newInputUnmasked.length; i++) {
            const currentChar = newInputUnmasked[i];
            const currentRegexp = RegExp(get(this.maskMaps, this.maskRaw[i]));
            if (currentRegexp.test(currentChar)) {
                tempUnmaskedValue += currentChar;
            }
        }
        this.value = tempUnmaskedValue;
    }

    /**
     * Update `maskedValue` base on the latest unmasked input
     * value and the original `mask`
     *
     * @private
     * @method maskValue
     * @return {void}
     */
    private maskValue(): void {
        let tempMaskedValue = '';
        for (let i = 0; i < this.value.length; i++) {
            if (get(this.maskIndices, `${i}`)) {
                tempMaskedValue += get(this.maskIndices, `${i}`);
            }
            tempMaskedValue += this.value[i];
        }
        this.maskedValue = tempMaskedValue;
    }

    /**
     * Update `visiblePlaceholder` to be displayed within the input
     * Sets `maskPlaceholderVisible` to false if the `maskedValue`
     * is greater in length than the `maskPlaceholder`
     *
     * @private
     * @method createVisiblePlaceholder
     * @return {string}
     */
    private createVisiblePlaceholder(): string {
        if (this.maskedValue.length >= this.maskPlaceholder.length) {
            this.maskPlaceholderVisible = false;
            return '';
        }
        this.maskPlaceholderVisible = true;
        return this.maskPlaceholder.substring(this.maskedValue.length);
    }

    /**
     * Update `maskIndices` to declare where mask placeholders
     * will be placed during input updates
     *
     * @private
     * @method indexMasks
     * @return {void}
     */
    private indexMasks(): void {
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
