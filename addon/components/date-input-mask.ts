import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';

interface DateInputMaskArgs {
    mask?: string;
    mutedMask?: string;
    unmaskedValue?: string;
}

export default class DateInputMask extends Component<DateInputMaskArgs> {
    mask: string;
    defaultMask: string = '99/99/9999';
    mutedMask: string;
    defaultMutedMask: string = 'mm/dd/YYYY';
    unmaskedValue: string;
    defaultUnMaskedValue: string = '';

    // tracked properties
    @tracked mutedMaskVisible: boolean = false;

    // constant properties
    maskMaps: Object = {
        '9': /\d/,
        a: /\w/,
        '*': /[\w\d]/
    };

    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        this.mask = args.mask || this.defaultMask;
        this.mutedMask = args.mutedMask || this.defaultMutedMask;
        this.unmaskedValue = args.unmaskedValue || this.defaultUnMaskedValue;
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
        const newData = event.data as string;
        const inputElement = event.target as HTMLInputElement;
        let currentValue = inputElement.value;
        if (currentValue.length + newData.length > this.mask.length) {
            this.mutedMaskVisible = false;
        } else {
            const newValue = currentValue + newData;
            //TODO algorithm for adding masked data to input
        }
    }

    maskValue(unmaskedValue: string) {
        if (unmaskedValue.length > 0) {
            for (let i = 0; i < this.mask.length; i++) {
                const currentChar = unmaskedValue.charAt(i);
                if (currentChar) {
                }
            }
        } else {
            return unmaskedValue;
        }
    }
}
