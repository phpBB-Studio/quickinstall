(function (document, window) {

	"use strict";

	let ready = function(fn) {
		if ("function" !== typeof fn) {
			return;
		}
		if (document.readyState === "complete") {
			return fn();
		}
		document.addEventListener("DOMContentLoaded", fn, false);
	};

	ready(function() {

		// create form validation and submit
		const $form = $(".needs-validation");
		if ($form) {
			$form.addEventListener("click", (e) => {
				if (e.target.matches("button[type='submit']")) {
					e.preventDefault();
					let validated = true;
					$$("input[required]").forEach($input => {
						const empty = $input.value === "";
						if (empty) validated = false;
						if (!empty && $input.validity.valid) {
							$input.classList.add("is-valid");
						} else {
							$input.classList.add("is-invalid");
						}
					});
					if (validated) {
						if ($form.getAttribute("data-submit-ajax") !== undefined) {
							ajaxSubmit($form);
						} else {
							$form.submit();
						}
					}
				}
			});
		}

		// submit form via ajax
		let ajaxSubmit = function($form) {
			let $modal = new bootstrap.Modal($("[data-submit-modal]"), {
				keyboard: false,
				backdrop: "static"
			});
			$modal.show();

			let xhr = new XMLHttpRequest();

			xhr.responseType = "json";
			xhr.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
					if (typeof xhr.response.redirect !== "undefined" && xhr.response.redirect) {
						window.location.replace(xhr.response.redirect);
					}
				} else {
					if (typeof xhr.response.responseText !== "undefined" && xhr.response.responseText) {
						$("body").innerHTML = xhr.response.responseText;
					}
				}
				$modal.hide();
			};

			xhr.open("POST", $form.getAttribute("action").replace("&amp;", "&"));
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.send(new FormData($form));
		};

		// submit forms on change
		$$("[data-form-submit=true]").forEach($select => {
			$select.addEventListener("change", (e) => {
				e.target.closest("form").submit();
			});
		});

		// Toggle all checkboxes
		const $toggleAll = $("[data-mark-list]");
		if ($toggleAll) {
			const $targetForm = $toggleAll.closest("form");
			const $checkboxes = $$("[data-mark]", $targetForm);
			const checkboxCount = $checkboxes.length;
			$toggleAll.addEventListener("change", () => {
				for (let i = 0; i < checkboxCount; i++) {
					$checkboxes[i].checked = $toggleAll.checked;
				}
			});
			for (let i = 0; i < checkboxCount; i++) {
				$checkboxes[i].addEventListener("change", (e) => {
					const $check = e.target;
					if ($check.checked === false) {
						$toggleAll.checked = false;
						return;
					}
					if ($$("[data-mark]:checked", $targetForm).length === checkboxCount) {
						$toggleAll.checked = true;
					}
				});
			}
		}

		// confirm alert dialog
		$$("[data-confirm]").forEach($confirmDelete => {
			$confirmDelete.addEventListener("click", (e) => {
				const message = $confirmDelete.getAttribute("data-confirm");
				if (!confirm(message)) {
					e.preventDefault();
				}
			});
		})

		// load new page from menu selection
		const $loadSelection = $("[data-load-selection]");
		if ($loadSelection) {
			$loadSelection.addEventListener("change", () => {
				const url = $loadSelection.getAttribute("data-load-selection");
				const iso = $loadSelection.querySelector(":checked").value;
				window.location.href = url + iso;
			})
		}

		// show config
		const $config = $("#config_text_button");
		if ($config) {
			$config.addEventListener("click", () => {
				$("#config_text_alert").style.display = "none";
				$("#config_text_container").classList.remove("d-none");
			});
		}

		// Copy data from a textarea field
		const $configField = $("[data-copy]");
		if ($configField) {
			$configField.addEventListener("click", (e) => {
				const target = "#" + e.target.getAttribute("data-copy");
				$(target).select();
				document.execCommand("copy");
			});
		}

		// search filter for PHP info table
		const $phpinfo = $("#phpinfo-filter");
		if ($phpinfo) {
			$phpinfo.addEventListener("keyup", (e) => {
				const regex = new RegExp(e.target.value, "i");
				$$(".searchable tr").forEach(row => {
					row.style.display = "none";
				});
				let filtered = Array.prototype.filter.call($$(".searchable tr"), (node) => {
					const text = node.textContent || node.innerText;
					return regex.test(text);
				});
				filtered.forEach(row => {
					row.style.display = "block";
				});
			});
		}

	});

	// select a list of matching elements, context is optional
	function $$(selector, context) {
		return (context || document).querySelectorAll(selector);
	}

	// select the first matching element, context is optional
	function $(selector, context) {
		return (context || document).querySelector(selector);
	}

}(document, window));
