'use strict';

// Print styles select the resume without changing navigation or theme state.
document.querySelectorAll("[data-resume-export]").forEach(function (button) {
  button.addEventListener("click", function () {
    window.print();
  });
});
