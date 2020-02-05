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
    @tracked maskRaw: string;
    @tracked mutedMask: string;
    @tracked unmaskedValue: string;
    @tracked invisibleMask: string;
    @tracked visibleMask: string;

    get hasContent() {
        return this.unmaskedValue.length > 0 ?? false;
    }

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
        this.maskRaw = this.mask.replace(/[\W\D]/g, '');
        this.mutedMask = args.mutedMask || this.defaultMutedMask;
        this.visibleMask = this.mutedMask;
        this.unmaskedValue = args.unmaskedValue || this.defaultUnMaskedValue;
        this.maskedValue = args.unmaskedValue || '';
        this.indexMasks();
        this.maskValue();
        this.invisibleMask = this.createInvisibleMask();
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
        let newInputValue = inputElement.value as string;
        const newInputUnmasked = newInputValue.replace(/[\W\D]/g, '');
        if (newInputUnmasked.length > this.maskRaw.length) {
            inputElement.value = this.maskedValue;
        } else {
            this.updateUnmaskedValue(newInputUnmasked);
            this.maskValue();
            this.visibleMask = this.createMutedMask();
            this.invisibleMask = this.createInvisibleMask();
        }
    }

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

    createMutedMask(): string {
        if (this.maskedValue.length >= this.mutedMask.length) {
            this.mutedMaskVisible = false;
            return '';
        }
        this.mutedMaskVisible = true;
        return this.mutedMask.substring(this.maskedValue.length);
    }

    createInvisibleMask(): string {
        return this.maskedValue;
    }

    indexMasks() {
        const maskChars = this.mask.match(/([\W\D]{1,})/) ?? '';
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
