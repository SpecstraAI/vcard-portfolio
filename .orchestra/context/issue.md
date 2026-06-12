# Issue #10: Make the contact form actually submit

The contact form has `action="#"` (`index.html:1158`) — submitting does nothing. The JS (`assets/js/script.js:118-135`) only toggles the button's disabled state based on validity.

Options:
- Wire it to a form backend (Formspree, Web3Forms, Netlify Forms)
- Or replace it with a simple `mailto:` link

Also add success/error feedback after submit.