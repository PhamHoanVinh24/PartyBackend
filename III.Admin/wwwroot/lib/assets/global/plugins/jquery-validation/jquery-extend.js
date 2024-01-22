jQuery.validator.addMethod("regx", function (value, element, regexpr) {
    return this.optional(element) || regexpr.test(value);
}, "Please enter a valid.");