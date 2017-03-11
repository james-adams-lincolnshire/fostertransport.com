window.onload = function(e) {
	app.init(true);
};

var app = {
	debug: true,

	init: function(debugging) {
		app.debug = debugging;

		tool.init(); // Must be first
		menu.events();
		loading.events();
	}
}

var tool = {
	init: function () {
		tool.setupEditors();
	},
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
	},
	animateLoop: function () {
		function animate() {
		  // Do whatever
		  requestAnimationFrame(animate);
		}
		animate();
	},
	htmlEditor: {},
	cssEditor: {},
	jsEditor: {},
	setupEditors: function () {
		if (!document.getElementById("htmlEditor"))
			return false;
		
		tool.htmlEditor = ace.edit("htmlEditor");
		tool.cssEditor = ace.edit("cssEditor");
		tool.jsEditor =  ace.edit("jsEditor");
		
		tool.htmlEditor.setOptions({
			maxLines: 1000,
			autoScrollEditorIntoView: true,
			wrap: true,
			theme: "ace/theme/monokai",
			showPrintMargin: true,
			mode: "ace/mode/html"
		});

		tool.cssEditor.setOptions({
			maxLines: 1000,
			autoScrollEditorIntoView: true,
			theme: "ace/theme/monokai",
			showPrintMargin: true,
			mode: "ace/mode/css"
		});

		tool.jsEditor.setOptions({
			maxLines: 1000,
			autoScrollEditorIntoView: true,
			theme: "ace/theme/monokai",
			showPrintMargin: true,
			mode: "ace/mode/javascript"
		});
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
		if (saveBtn) saveBtn.addEventListener('click', function(e) {
			saveBtn.disabled = true;
			saveBtn.value = '...';
			
			var callback = function(e) {
				e.value = 'Save';
				e.disabled = false;
			};
			
			document.getElementById('html').value = tool.htmlEditor.getValue();
			document.getElementById('css').value = tool.cssEditor.getValue();
			document.getElementById('javascript').value = tool.jsEditor.getValue();
			
			menu.editSection.submit('ft-edit-section-form', e, callback, saveBtn);
		});
		
		var quickSaveBtns = document.getElementsByClassName('ft-save-btn');
		if (quickSaveBtns) {
			for (var i = 0; i < quickSaveBtns.length; i++) {
				var quickSaveBtn = quickSaveBtns[i];
				
				quickSaveBtn.addEventListener('click', function(e) {
					this.disabled = true;
					this.classList.add('ft-loading-animation');
					
					var formId = this.getAttribute("data-form-id");
					
					var callback = function(clickedBtn) {
						console.log('clicked!!');
						//clickedBtn.classList.remove('ft-loading-animation');
						clickedBtn.disabled = false;
					};
					
					menu.editSection.quickSave.captureHtml(formId);
					menu.editSection.submit('ft-save-form-' + formId, e, callback, this);
				});
			}
		}
		
		menu.mobile.events();
	},
	editSection: {
		quickSave: {
			captureHtml: function (formId) {
				var formInputElement = document.getElementById('ft-save-html-' + formId);
				var htmlContainer = document.getElementById('ft-html-container-' + formId);
				
				formInputElement.value = htmlContainer.innerHTML;
			}
		},
		submit: function (formId, e, callback, clickedBtn) {
			e.preventDefault();
			
			var editSectionForm = document.getElementById(formId);
			
			tool.ajaxPost(editSectionForm, function () {
				if (callback) callback(clickedBtn);
			});
		}
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
			if (!links[i].classList.contains('ft-no-loading') && !links[i].hasAttribute('target') && /(?:^|\s)ft-\S*(?:$|\s)/.test(links[i].className))
				links[i].addEventListener('click', loading.toggle);
	}
}
