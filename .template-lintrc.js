'use strict';

module.exports = {
    extends: 'octane',
    rules: {
        'self-closing-void-elements': false,
        'no-bare-strings': false,
        'block-indentation': 4,
        'no-inline-styles': false,
        'attribute-indentation': {
            indentation: 4,
            'open-invocation-max-len': 120
        }
    }
};
