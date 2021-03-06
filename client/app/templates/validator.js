inputFocus = function(input) {
	$("#message").empty();
	//input.removeClass("isInvalid");
	//input.removeClass("isValid");
}

isValid = function() {
	var invalids = 0;
	$("#message").empty();

	$(".appEmail").each(function() {
		if (!isValidEmailAddress($(this).val())) {
			invalids++;
			$(this).removeClass("isValid");
			$(this).addClass("isInvalid");
			$("#message").append("Please enter a valid e-mail address. <br>");
		} else {
			$(this).removeClass("isInvalid");
			$(this).addClass("isValid");
		}
	});

	$(".appId").each(function() {
		if (!isValidId($(this).val())) {
			invalids++;
			$(this).removeClass("isValid");
			$(this).addClass("isInvalid");
			$("#message").append("Please enter a valid ID number. <br>");
		} else {
			$(this).removeClass("isInvalid");
			$(this).addClass("isValid");
		}
	});

	$(".appPhone").each(function() {
		if (!isValidPhone($(this).val())) {
			invalids++;
			$(this).removeClass("isValid");
			$(this).addClass("isInvalid");
			$("#message").append("Please enter a valid mobile phone number. <br>");
		} else {
			$(this).removeClass("isInvalid");
			$(this).addClass("isValid");
		}
	});

	$(".appNumber").each(function() {
		if (!isValidNumber($(this).val())) {
			invalids++;
			$(this).removeClass("isValid");
			$(this).addClass("isInvalid");
			$("#message").append("Please enter a valid number. <br>");
		} else {
			$(this).removeClass("isInvalid");
			$(this).addClass("isValid");
		}
	});

	$(".appText").each(function() {
		if (!isValidText($(this).val())) {
			invalids++;
			$(this).removeClass("isValid");
			$(this).addClass("isInvalid");
			$("#message").append("Please enter a valid text (English charachters). <br>");
		} else {
			$(this).removeClass("isInvalid");
			$(this).addClass("isValid");
		}
	});

	return (invalids === 0);
}

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
};

function isValidId(id) {
	var pattern = new RegExp(/^\d{8,9}$/);
	return pattern.test(id);
};

function isValidPhone(phone) {
	var pattern = new RegExp(/^05\d{8}$/);
	return pattern.test(phone);
};

function isValidNumber(number) {
	var pattern = new RegExp(/^\d{1,20}$/);
	return pattern.test(number);
};

function isValidText(text) {
	var pattern = new RegExp(/^[a-zA-Z0-9_-]{1,20}$/);
	return pattern.test(text);
};