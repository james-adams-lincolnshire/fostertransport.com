window.onload = function(e) {
	app.init(true);
};

var app = {
	debug: true,

	init: function(debugging) {
		app.debug = debugging;

		menu.events();
		loading.events();
	}
}

var tool = {
	ajaxPost: function (form, callback) {
		var url = form.action,
			xhr = new XMLHttpRequest();

		var params = [].filter.call(form.elements, function (el) {
			return ((['checkbox', 'radio'].indexOf(el.type) > -1) && el.checked) || !(['checkbox', 'radio'].indexOf(el.type) > -1); })
		.filter(function(el) { 
			return !!el.name; }) //Nameless elements die.
		.filter(function(el) { 
			return !el.disabled; }) //Disabled elements die.
		.map(function(el) {
			return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
		}).join('&');

		xhr.open('POST', url);
		// Changed from application/x-form-urlencoded to application/x-form-urlencoded
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		//.bind ensures that this inside of the function is the XHR object.
		xhr.onload = callback.bind(xhr); 

		//All preperations are clear, send the request!
		xhr.send(params);
	}
}

var menu = {
	mobile: {
		toggle: function() {
			var header = document.getElementById('ft-header');
			var background = document.getElementById('ft-header-background');

			header.classList.toggle('ft-open');
			background.classList.toggle('ft-menu-open');

			setTimeout(function() { // Allow menu closing.
				if (background.classList.contains('ft-menu-open'))
					background.addEventListener('click', menu.mobile.toggle);
				else
					background.removeEventListener('click', menu.mobile.toggle);
			}, 100);
		},
		events: function() {
			var menuBtn = document.getElementById('ft-menu-btn');
			if (menuBtn) menuBtn.addEventListener('click', menu.mobile.toggle);
		}
	},
	events: function () {
		var saveBtn = document.getElementById('ft-save-btn');
		if (saveBtn) saveBtn.addEventListener('click', menu.editSection);
		
		menu.mobile.events();
	},
	editSection: function (e) {
		e.preventDefault();
		
		var editSectionForm = document.getElementById('ft-edit-section-form');
		
		var btn = document.getElementById('ft-save-btn');
		
		btn.disabled = true;
		btn.value = '....';
		
		tool.ajaxPost(editSectionForm, function () {
			btn.disabled = false;
			btn.value = 'Save';
		});
	}
};

var loading = {
	toggle: function() {
		var loading = document.getElementById('ft-loading');
		loading.classList.toggle('ft-visible');

		var header = document.getElementById('ft-header');
		if (header.classList.contains('ft-open'))
			menu.mobile.toggle();
	},
	events: function() {
		var links = document.getElementsByTagName('a');

		for (var i = 0; i < links.length; i++)
			if (!links[i].classList.contains('ft-menu') &&
					!links[i].hasAttribute('target'))
				links[i].addEventListener('click', loading.toggle);
	}
}
