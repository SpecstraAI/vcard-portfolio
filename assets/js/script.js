'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

let lastFocusedTrigger = null;

// modal open/close with focus management
const testimonialsModalFunc = function () {
  const isOpening = !modalContainer.classList.contains("active");
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
  if (isOpening) {
    modalCloseBtn.focus();
  } else if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
    lastFocusedTrigger = null;
  }
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    lastFocusedTrigger = this;
    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// modal keyboard handling: Escape closes, Tab is trapped inside
document.addEventListener("keydown", function (e) {
  if (!modalContainer.classList.contains("active")) return;

  if (e.key === "Escape") {
    testimonialsModalFunc();
    return;
  }

  if (e.key === "Tab") {
    var focusable = Array.prototype.slice.call(
      modalContainer.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return el.offsetParent !== null; });

    if (!focusable.length) { e.preventDefault(); return; }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// contact form submission
const formStatus = document.querySelector("[data-form-status]");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var btnLabel = formBtn.querySelector("span");
  formBtn.setAttribute("disabled", "");
  btnLabel.textContent = "Sending…";
  formStatus.className = "form-status";
  formStatus.textContent = "";

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: new FormData(form)
  })
  .then(function (response) { return response.json(); })
  .then(function (json) {
    if (json.success) {
      formStatus.textContent = "Message sent! I’ll get back to you soon.";
      formStatus.className = "form-status form-status-success";
      form.reset();
    } else {
      throw new Error(json.message || "Submission failed.");
    }
  })
  .catch(function (err) {
    formStatus.textContent = err.message || "Something went wrong. Please try again.";
    formStatus.className = "form-status form-status-error";
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    }
  })
  .finally(function () {
    btnLabel.textContent = "Send Message";
  });
});



// theme toggle
const themeBtn = document.querySelector("[data-theme-btn]");

const applyTheme = function (theme) {
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
  }
  localStorage.setItem('theme', theme);
};

themeBtn.addEventListener('click', function () {
  var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// activate a page by name and sync nav link state
const activatePage = function (pageName) {
  for (let i = 0; i < pages.length; i++) {
    if (pageName === pages[i].dataset.page) {
      pages[i].classList.add("active");
      window.scrollTo(0, 0);
    } else {
      pages[i].classList.remove("active");
    }
  }
  for (let i = 0; i < navigationLinks.length; i++) {
    if (pageName === navigationLinks[i].innerHTML.toLowerCase()) {
      navigationLinks[i].classList.add("active");
      navigationLinks[i].setAttribute("aria-current", "page");
    } else {
      navigationLinks[i].classList.remove("active");
      navigationLinks[i].removeAttribute("aria-current");
    }
  }
};

// add event to all nav link — push a history entry so Back/Forward works
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    var pageName = this.innerHTML.toLowerCase();
    // Only push a new entry when the tab actually changes, so repeated clicks
    // on the active tab don't stack dead history entries.
    if (window.location.hash.slice(1) !== pageName) {
      history.pushState(null, '', '#' + pageName);
    }
    activatePage(pageName);
  });
}

// activate the page indicated by the URL hash, falling back to the first page
const handleHash = function () {
  var hash = window.location.hash.slice(1);
  var valid = false;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].dataset.page === hash) { valid = true; break; }
  }
  activatePage(valid ? hash : pages[0].dataset.page);
};

window.addEventListener('hashchange', handleHash);
handleHash();