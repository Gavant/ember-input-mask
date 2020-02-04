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
    mask: string;
    defaultMask: string = '99/99/9999';
    defaultMutedMask: string = 'mm/dd/YYYY';
    unmaskedValue: string;
    defaultUnMaskedValue: string = '';
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
    @tracked mutedMask: string;

    // constant attributes
    maskMaps: any = {
        // TODO: fix type
        '9': /\d/,
        a: /\w/,
        '*': /[\w\d]/
    };
    maskPlaceholders = RegExp(/[\W\D]/);

    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        this.mask = args.mask || this.defaultMask;
        this.mutedMask = args.mutedMask || this.defaultMutedMask;
        this.unmaskedValue = args.unmaskedValue || this.defaultUnMaskedValue;
        this.maskedValue = this.maskValue(this.unmaskedValue);
        this.updateValue = args.updateValue;
    }

    @action
    showMask(event: FocusEvent) {
        this.mutedMaskVisible = true;
    }

    @action
    hideMask(event: FocusEvent) {
        this.mutedMaskVisible = false;
    }

    @action
    updateInput(event: InputEvent) {
        const inputElement = event.target as HTMLInputElement;
        const newValue = inputElement.value as string;
        if (newValue.length > this.mask.length && this.updateValue) {
            return this.updateValue();
        } else {
            this.maskedValue = this.maskValue(newValue);
            this.mutedMask = this.createMutedMask(this.maskedValue);
        }
    }

    maskValue(unmaskedValue: string): string {
        if (unmaskedValue.length > 0) {
            let maskedValue = '';
            let i = 0;
            let j = 0;
            while (i < unmaskedValue.length && j < this.mask.length) {
                const currentChar = unmaskedValue.charAt(i);
                const currentMaskValue = this.mask[j];
                const matchingRegexpValue = get(this.maskMaps, this.mask[j]);
                const currentRegexp = matchingRegexpValue
                    ? RegExp(matchingRegexpValue)
                    : RegExp('this will never match');
                if (currentRegexp.test(currentChar)) {
                    maskedValue += currentChar;
                    i++;
                    j++;
                } else if (this.maskPlaceholders.test(currentChar) && currentMaskValue === currentChar) {
                    maskedValue += currentChar;
                    i++;
                    j++;
                } else if (this.maskPlaceholders.test(currentChar) && currentMaskValue !== currentChar) {
                    break;
                }
            }
            return maskedValue;
        } else {
            return unmaskedValue;
        }
    }

    createMutedMask(maskedValue: string): string {
        if (this.maskedValue.length >= this.mutedMask.length) {
            this.mutedMaskVisible = false;
            return '';
        }
        this.mutedMaskVisible = true;
        return this.maskedValue + this.mutedMask.substring(this.maskedValue.length);
    }
}
