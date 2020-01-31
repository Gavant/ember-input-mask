import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface DateInputMaskArgs {
    mask?: string;
}

export default class DateInputMask extends Component<DateInputMaskArgs> {
    defaultMask: string = 'mm/dd/YYYY';
    mask: string;
    @tracked maskVisible: boolean = false;

    constructor(owner: unknown, args: DateInputMaskArgs) {
        super(owner, args);
        this.mask = args.mask || this.defaultMask;
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
        const newData = event.data;
        let currentValue = event.target?.value;
        if (currentValue.length + newData?.length > this.mask.length) {
            this.maskVisible = false;
            //TODO
        }
    }
}
