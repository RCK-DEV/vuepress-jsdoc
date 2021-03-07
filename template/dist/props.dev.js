"use strict";

var kebabCase = require('lodash').kebabCase;

module.exports = {
  props: function props(props, opt) {
    var propNames = Object.keys(props);

    if (!propNames.length) {
      return ''; // if no props avoid creating the section
    }

    return "\n## Props\n\n  | Prop name  | Description  | Type  | Values | Default | Required |\n  | ---------- | ------------ | ----- | ------ | ------- | -------- |\n".concat(propNames.map(function (propName) {
      var _props$propName = props[propName],
          name = _props$propName.name,
          description = _props$propName.description,
          type = _props$propName.type,
          values = _props$propName.values,
          defaultValue = _props$propName.defaultValue,
          tags = _props$propName.tags;
      var containsProps = tags && Object.keys(tags).length ? true : false;
      var ignoreProps = false;

      if (containsProps) {
        if ('ignore' in tags) {
          ignoreProps = true;
        }
      }

      if (!ignoreProps) {
        var _vueTypeNativeValidators = ['any', 'array', 'bool', 'func', 'number', 'integer', 'object', 'string', 'symbol'];
        var vueTypeCustomValidators = ['instanceOf', 'oneOf', 'oneOfType', 'arrayOf', 'objectOf', 'shape', 'custom'];
        var functionType = false;
        var vueType = false;
        var vueTypeValidatorName = '';
        var vueTypeNativeValidator = false;
        var vueTypeCustomValidator = false;
        var vueTypeValidatorContainsModifiers = false;
        var vueTypeValidatorContainsFlag = false;
        var vueTypeValidatorFlag = ''; // .isRequired, loose

        var vueTypeIsRequired = false;
        var vueTypeDefaultSet = false; // .def(any)

        var vueTypeDefault = '';
        var vueTypeNativeCustomValidatorSet = false; // .validate(function)

        var vueTypeNativeCustomValidator = '';
        var vueTypeDefaultFlagType = false; // Remove?

        var extractedValues = '';
        var joinedTypes = [].concat(_vueTypeNativeValidators, vueTypeCustomValidators);

        if (type && type.func) {
          functionType = true;
          var explodedVueTypeExpression = type.name.split('.');

          if (explodedVueTypeExpression !== 'undefined' && explodedVueTypeExpression.length > 1) {
            vueTypeValidatorName = explodedVueTypeExpression[0] === 'VueTypes' ? explodedVueTypeExpression[1] : explodedVueTypeExpression[0];
            vueType = joinedTypes.some(function (element) {
              return vueTypeValidatorName.includes(element);
            });
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

              var startIndex = type.name.indexOf(vueTypeValidatorName) + vueTypeValidatorName.length + 1;
              var endIndex = type.name.indexOf(')', startIndex);
              extractedValues = type.name.substring(startIndex, endIndex);

              if (vueTypeValidatorName.includes('oneOfType')) {
                extractedValues = extractedValues.split('VueTypes.').join('');
              }
            } // #1 Check if native or custom Validator


            if (_vueTypeNativeValidators.includes(vueTypeValidatorName)) {
              vueTypeNativeValidator = true;
            } else if (vueTypeCustomValidators.includes(vueTypeValidatorName)) {
              vueTypeCustomValidator = true;
            } // Check if expression contains one or more VueType-modifiers


            if (explodedVueTypeExpression.length > 2) {
              vueTypeValidatorContainsModifiers = true; // Go through all modifiers and check for def(any)

              var defIndex = explodedVueTypeExpression.findIndex(function (element) {
                return element.includes('def');
              });

              if (defIndex >= 0) {
                vueTypeValidatorContainsFlag = true;
                vueTypeValidatorFlag = 'def';
                vueTypeDefaultSet = true;
                vueTypeDefaultFlagType = true;
                var defModifer = explodedVueTypeExpression[defIndex];
                var leftParenthesis = defModifer.indexOf('(');
                var rightParenthesis = defModifer.indexOf(')');
                vueTypeDefault = defModifer.substring(leftParenthesis + 1, rightParenthesis);
              } // Go through all modifiers and check for def(any)


              var requiredIndex = explodedVueTypeExpression.indexOf('isRequired');

              if (requiredIndex >= 0) {
                vueTypeIsRequired = true;
              }
            }
          }
        }

        var readableDescription = description ? description : '';
        var readableValues = '';
        var readableDefaultValue = '';

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

        var readableTags = tags && Object.keys(tags).length ? JSON.stringify(tags) : ''; // serialize values to display them in a readable manner

        return "| ".concat(kebabCase(name), " | ").concat(readableDescription, " | ").concat(vueType ? vueTypeValidatorName : type.name, " | ").concat(readableValues, " | ").concat(readableDefaultValue, " | ").concat(vueTypeIsRequired, " | <br>");
      } else {
        return '';
      }
    }).join('\n'), "\n  ");
  }
};
var vueTypes = {
  "native": 'native',
  custom: 'custom'
};
var vueTypeNativeValidators = [{
  validator: 'any',
  type: vueTypes["native"]
}, {
  validator: 'array',
  type: vueTypes["native"]
}, {
  validator: 'bool',
  type: vueTypes["native"]
}, {
  validator: 'func',
  type: vueTypes["native"]
}, {
  validator: 'number',
  type: vueTypes["native"]
}, {
  validator: 'integer',
  type: vueTypes["native"]
}, {
  validator: 'object',
  type: vueTypes["native"]
}, {
  validator: 'string',
  type: vueTypes["native"]
}, {
  validator: 'symbol',
  type: vueTypes["native"]
}, {
  validator: 'instanceOf',
  type: vueTypes.custom
}, {
  validator: 'oneOf',
  type: vueTypes.custom
}, {
  validator: 'oneOfType',
  type: vueTypes.custom
}, {
  validator: 'arrayOf',
  type: vueTypes.custom
}, {
  validator: 'objectOf',
  type: vueTypes.custom
}, {
  validator: 'shape',
  type: vueTypes.custom
}, {
  validator: 'custom',
  type: vueTypes.custom
}];

function isVueType(type) {
  var isVueType = false;

  if (typeof type != 'undefined' && type && type.length >= 0) {
    isVueType = vueTypeNativeValidators.some(function (vueType) {
      return vueType.validator === type[0];
    });
  }

  return isvueType;
}