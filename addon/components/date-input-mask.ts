import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface DateInputMaskArgs {
    mask?: string;
}

export default class DateInputMask extends Component<DateInputMaskArgs> {
    defaultMask: string = 'mm/dd/YYYY';
    mask: string;
    visibleMask: string;
    @tracked maskVisible: boolean = false;

    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        this.mask = args.mask || this.defaultMask;
        this.visibleMask = this.mask;
    }

    @action
    showMask(event: FocusEvent) {
        this.maskVisible = true;
    }

    @action
    hideMask(event: FocusEvent) {
        this.maskVisible = false;
    }

    @action
    updateInput(event: InputEvent) {
        const newData = event.data as string;
        const inputElement = event.target as HTMLInputElement;
        let currentValue = inputElement.value;
        if (currentValue.length + newData.length > this.mask.length) {
            this.maskVisible = false;
        } else {
            const newValue = currentValue + newData;
            //TODO algorithm for adding masked data to input
        }
    }
}
