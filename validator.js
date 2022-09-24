function Validator(formSelector, options = {}) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      } else {
        element = element.parentElement;
      }
    }
  }
  const formRules = {};
  /**
   * Quy ước tạo rules:
   * - nếu có lỗi thì return `error message`
   *  - nếu không có lỗi thì return undefined
   */
  const validatorRules = {
    required: function (value) {
      return value ? undefined : " Vui lòng nhập trường này";
    },
    email: function (value) {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : "Trường này phải là email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : ` Vui lòng  nhập ít nhất ${min} ký tự`;
      };
    },
  };

  // lấy ra form element trong Dom theo formSelector
  var formElement = document.querySelector(formSelector);

  // chỉ xử lý khi có element trong Dom
  if (formElement) {
    let inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      const rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        const isRuleHasValue = rule.includes(":");
        let ruleInfo;
        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }
        let ruleFunc = validatorRules[rule];

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // Lắng nghe sự kiện để Validate (blur , change....)
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    // hàm thực hiện validate
    function handleValidate(event) {
      const rules = formRules[event.target.name];
      let errorMessage;
      rules.find(function (rule) {
        errorMessage = rule(event.target.value);
        return errorMessage;
      });
      // nếu có lỗi thì hiển thị message lỗi

      if (errorMessage) {
        const formGroup = getParent(event.target, ".form-group");
        if (formGroup) {
          formGroup.classList.add("invalid");
          var formMessage = formGroup.querySelector(".form-message");
          if (formMessage) {
            formMessage.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    }
    // hàm clear message lỗi
    function handleClearError(event) {
      const formGroup = getParent(event.target, ".form-group");
      if (formGroup.classList.contains("invalid")) {
        formGroup.classList.remove("invalid");
        var formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = "";
        }
      }
    }
  }
  // xử lý hành vi submit form
  formElement.onsubmit = function (e) {
    e.preventDefault();

    let inputs = formElement.querySelectorAll("[name][rules]");
    let isValid = true;
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }
    // khi không có lỗi thì submit form
    if (isValid) {
      if (typeof options.onSubmit === "function") {
        var enabledInputs = formElement.querySelectorAll("[name]");
        var formValues = Array.from(enabledInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = "";
                return values;
              }
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        },
        {});
        options.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
