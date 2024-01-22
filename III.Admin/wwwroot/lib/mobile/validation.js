function Validator(options){

	var selectorRules = {};

	function validate(inputElement, rule){
		var erroElement = inputElement.parentElement.querySelector(options.errorSelector);
		var erroMessage;

		var rules = selectorRules[rule.selector];
		for(var i = 0; i < rules.length; i++) {
			erroMessage = rules[i](inputElement.value);
			if(erroMessage) break;
		}

		if(erroMessage){
			erroElement.innerHTML = erroMessage;
			inputElement.parentElement.classList.add('invalid');
		}else{
			erroElement.innerHTML =  '';
			inputElement.parentElement.classList.remove('invalid');
		}

		return !erroElement;
	}

	var formElement = document.querySelector(options.form);

	if(formElement){
		// submit form
		formElement.onsubmit = function(e){
			e.preventDefault();
			var isFormValid = true;
			// 	lặp qua từng rule và validate luôn
			options.rules.forEach(function(rule){
				var inputElement = formElement.querySelector(rule.selector);
				var isValid = validate(inputElement, rule);
				if(!isValid){
					isFormValid = false;
				}
			});
			if(isFormValid){
				if(typeof options.onSubmit === 'function'){
					options.onSubmit({
						name: 'data'
					});
				}
				console.log('k có lỗi');
			}
		}

  		// lặp qua mỗi rule và lắng nghe sự kiện(blur, oninput,..)
  		options.rules.forEach(function(rule){
			// luu lai cac rules
			// selectorRules[rule.selector] = rule.test;

			if(Array.isArray(selectorRules[rule.selector])){
				selectorRules[rule.selector].push(rule.test);
			}else{
				selectorRules[rule.selector] = [rule.test];
			}

			var inputElement = formElement.querySelector(rule.selector);
			// console.log(inputElement);
			if(inputElement){
				//xu ly khi nguoi dung blur ra ngoai
				inputElement.onblur = function(){
					validate(inputElement, rule);
				}
				// xu ly khi nguoi dung  nhap input thi phai mat erroMessage
				inputElement.oninput = function(){
					var erroElement = inputElement.parentElement.querySelector(options.errorSelector);
					erroElement.innerHTML =  '';
					inputElement.parentElement.classList.remove('invalid');
				}
			}
		});
  	}
  }

  Validator.isRequired = function(selector, message){
  	return {
  		selector: selector,
  		test: function(value){
  			return value.trim() ? undefined : message || 'vui lòng nhập trường này'
  		}
  	};
  }
  Validator.isEmail = function(selector){
  	return {
  		selector: selector,
  		test: function(value){
  			var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  			return regex.test(value) ? undefined : 'trường này phải là email'
  		}
  	};
  }
  Validator.minLength = function(selector, min){
  	return {
  		selector: selector,
  		test: function(value){
  			return value.length >= min ? undefined : 'vui lòng nhập tối thiểu ' + min + ' kí tự'
  		}
  	};
  }
  Validator.isConfirmed = function(selector, getConfirmValue, message){
  	return {
  		selector: selector,
  		test: function(value){
  			return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
  		}
  	}
  }