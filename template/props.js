const kebabCase = require('lodash').kebabCase;

module.exports = {
  props: function props(props, opt) {
    const propNames = Object.keys(props);
    if (!propNames.length) {
      return ''; // if no props avoid creating the section
    }
    return `
## Props

  | Prop name  | Description  | Type  | Values | Default | Required |
  | ---------- | ------------ | ----- | ------ | ------- | -------- |
${propNames
  .map(propName => {
    const { name, description, type, values, defaultValue, tags } = props[propName];

    const containsProps = tags && Object.keys(tags).length ? true : false;
    let ignoreProps = false;
    if (containsProps) {
      if ('ignore' in tags) {
        ignoreProps = true;
      }
    }

    if (!ignoreProps) {
      const vueTypeNativeValidators = [
        'any',
        'array',
        'bool',
        'func',
        'number',
        'integer',
        'object',
        'string',
        'symbol'
      ];
      const vueTypeCustomValidators = ['instanceOf', 'oneOf', 'oneOfType', 'arrayOf', 'objectOf', 'shape', 'custom'];
      let functionType = false;
      let vueType = false;
      let vueTypeValidatorName = '';
      let vueTypeNativeValidator = false;
      let vueTypeCustomValidator = false;
      let vueTypeValidatorContainsModifiers = false;
      let vueTypeValidatorContainsFlag = false;
      let vueTypeValidatorFlag = ''; // .isRequired, loose
      let vueTypeIsRequired = false;
      let vueTypeDefaultSet = false; // .def(any)
      let vueTypeDefault = '';
      let vueTypeNativeCustomValidatorSet = false; // .validate(function)
      let vueTypeNativeCustomValidator = '';
      let vueTypeDefaultFlagType = false; // Remove?
      let extractedValues = '';
      const joinedTypes = [].concat(vueTypeNativeValidators, vueTypeCustomValidators);

      if (type && type.func) {
        functionType = true;

        let explodedVueTypeExpression = type.name.split('.');
        if (explodedVueTypeExpression !== 'undefined' && explodedVueTypeExpression.length > 1) {
          vueTypeValidatorName =
            explodedVueTypeExpression[0] === 'VueTypes' ? explodedVueTypeExpression[1] : explodedVueTypeExpression[0];
          vueType = joinedTypes.some(element => vueTypeValidatorName.includes(element));
        }

        if (vueType) {
          if (vueTypeValidatorName.includes('shape')) {
            vueTypeValidatorName = 'shape';
          }
          if (vueTypeValidatorName.includes('oneOf')) {
            if (vueTypeValidatorName.includes('oneOfType')) {
              vueTypeValidatorName = 'oneOfType';
            } else {
              vueTypeValidatorName = 'oneOf';
            }
            const startIndex = type.name.indexOf(vueTypeValidatorName) + vueTypeValidatorName.length + 1;
            const endIndex = type.name.indexOf(')', startIndex);

            extractedValues = type.name.substring(startIndex, endIndex);
            if (vueTypeValidatorName.includes('oneOfType')) {
              extractedValues = extractedValues.split('VueTypes.').join('');
            }
          }

          // #1 Check if native or custom Validator
          if (vueTypeNativeValidators.includes(vueTypeValidatorName)) {
            vueTypeNativeValidator = true;
          } else if (vueTypeCustomValidators.includes(vueTypeValidatorName)) {
            vueTypeCustomValidator = true;
          }

          // Check if expression contains one or more VueType-modifiers
          if (explodedVueTypeExpression.length > 2) {
            vueTypeValidatorContainsModifiers = true;

            // Go through all modifiers and check for def(any)
            let defIndex = explodedVueTypeExpression.findIndex(element => element.includes('def'));
            if (defIndex >= 0) {
              vueTypeValidatorContainsFlag = true;
              vueTypeValidatorFlag = 'def';
              vueTypeDefaultSet = true;
              vueTypeDefaultFlagType = true;
              let defModifer = explodedVueTypeExpression[defIndex];

              let leftParenthesis = defModifer.indexOf('(');
              let rightParenthesis = defModifer.indexOf(')');
              vueTypeDefault = defModifer.substring(leftParenthesis + 1, rightParenthesis);
            }

            // Go through all modifiers and check for def(any)
            let requiredIndex = explodedVueTypeExpression.indexOf('isRequired');
            if (requiredIndex >= 0) {
              vueTypeIsRequired = true;
            }
          }
        }
      }

      let readableDescription = description ? description : '';
      let readableValues = '';
      let readableDefaultValue = '';

      if (vueType) {
        readableValues = extractedValues.split('\n').join(''); // TODO: Not correct. Renders Default value with oneOf..
        readableDefaultValue = vueTypeDefault.split('\n').join('');
      } else {
        if (typeof values !== 'undefined' && Object.keys(values).length) {
          readableValues = JSON.stringify(values);
        }
        if (typeof defaultValue !== 'undefined' && defaultValue.hasOwnProperty('value')) {
          readableDefaultValue = defaultValue.value;
        }
      }

      let readableTags = tags && Object.keys(tags).length ? JSON.stringify(tags) : ''; // serialize values to display them in a readable manner

      return `| ${kebabCase(name)} | ${readableDescription} | ${
        vueType ? vueTypeValidatorName : type.name
      } | ${readableValues} | ${readableDefaultValue} | ${vueTypeIsRequired} | <br>`;
    } else {
      return '';
    }
  })
  .join('\n')}
  `;
  }
};

const vueTypes = {
  native: 'native',
  custom: 'custom'
};

const vueTypeNativeValidators = [
  { validator: 'any', type: vueTypes.native },
  { validator: 'array', type: vueTypes.native },
  { validator: 'bool', type: vueTypes.native },
  { validator: 'func', type: vueTypes.native },
  { validator: 'number', type: vueTypes.native },
  { validator: 'integer', type: vueTypes.native },
  { validator: 'object', type: vueTypes.native },
  { validator: 'string', type: vueTypes.native },
  { validator: 'symbol', type: vueTypes.native },
  { validator: 'instanceOf', type: vueTypes.custom },
  { validator: 'oneOf', type: vueTypes.custom },
  { validator: 'oneOfType', type: vueTypes.custom },
  { validator: 'arrayOf', type: vueTypes.custom },
  { validator: 'objectOf', type: vueTypes.custom },
  { validator: 'shape', type: vueTypes.custom },
  { validator: 'custom', type: vueTypes.custom }
];

function isVueType(type) {
  let isVueType = false;

  if (typeof type != 'undefined' && type && type.length >= 0) {
    isVueType = vueTypeNativeValidators.some(vueType => vueType.validator === type[0]);
  }

  return isvueType;
}
