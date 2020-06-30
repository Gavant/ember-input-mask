# ember-input-mask

Ember input masks built without jQuery
[Docs Page](https://gavant.github.io/ember-input-mask/versions/feature/initial-creation/)

## Compatibility

-   Ember.js v3.8 or above
-   Ember CLI v2.13 or above
-   Node.js v8 or above

## Installation

```
ember install @gavant/ember-input-mask
```

## Usage

For this addon to work properly, you must use SASS:

```
ember install ember-cli-sass
```

Upon addon installation, add an import to your app.scss if it isn't already there.

```
@import 'gavant-ember-input-mask';
```

A basic date-input-mask can be created in the following way:

Template

```
<DateInputMask />
```

This will create a date input mask that displays `mm/dd/YYYY` on focus and uses `99/99/9999` for input validation. (9 represents a digit).

A custom mask can be implemented like this:

Template

```
<DateInputMask
    @mask="99-99-9999"
    @maskPlaceholder="mm-dd-YYYY"
/>
```

This will display `mm-dd-YYYY` on focus and uses `99-99-9999` for input validation. It is important that the placeholders (dashes) here are the same character value. Using `@mask="99/99/9999` here would cause some unexpected behavior.

Data can also be updating using standard Octane DDAU patterns:

Template

```
<DateInputMask
    @onUpdate={{this.updateValue}}
    @value={{this.myValue}}
/>
```

Component

```
export default class CustomController extends Controller {
    myValue = '01012020';

    @action
    updateValue(newValue) {
        this.myValue = newValue;
    }
}
```

`newValue` is the the current unmasked value.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
