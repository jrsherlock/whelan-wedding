/**
 * RSVP form: validation, dietary "Other" toggle, and Formspree submission.
 */

// ─── Configuration ───
// Google Apps Script web app that appends submissions to the RSVP Sheet.
// Source: Apps Script project "Whelan Wedding RSVP Backend" in the dev's
// Google account. Set to null to switch back to demo (no-network) mode.
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx9L8MiT_Maq6ByAdTmWQarEtoc4CF2KjKAO1Z3bkhxWOcL5VGNGfKNCey0PVg9OiCmNg/exec';

export function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const submitBtn = document.getElementById('rsvp-submit');
  const successEl = document.getElementById('rsvp-success');
  const errorBanner = document.getElementById('rsvp-error-banner');
  const otherCheck = document.getElementById('dietary-other-check');
  const otherField = document.getElementById('dietary-other-field');

  // ─── Clear browser autofill background ───
  // When the browser pre-fills inputs, the autofill pseudo-class sticks
  // and forces a UA background. Re-setting the value programmatically
  // removes the autofill state while keeping the filled text.
  setTimeout(() => {
    form.querySelectorAll('input:-webkit-autofill').forEach(input => {
      const val = input.value;
      input.value = '';
      input.value = val;
    });
  }, 50);

  // ─── Dietary "Other" toggle ───
  if (otherCheck && otherField) {
    otherCheck.addEventListener('change', () => {
      otherField.classList.toggle('visible', otherCheck.checked);
      if (!otherCheck.checked) {
        const input = otherField.querySelector('input');
        if (input) input.value = '';
      }
    });
  }

  // ─── Bot detection: track when page loaded ───
  const loadedAt = Date.now();

  // ─── Form submission ───
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validate
    if (!validate()) return;

    // Check honeypot
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    // Reject suspiciously fast submissions (< 3 seconds)
    if (Date.now() - loadedAt < 3000) return;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    errorBanner.hidden = true;

    try {
      const formData = new FormData(form);

      // Combine dietary selections into a single field
      const dietaryValues = formData.getAll('dietary');
      formData.delete('dietary');
      if (dietaryValues.length > 0) {
        formData.set('dietary_restrictions', dietaryValues.join(', '));
      }

      if (FORM_ENDPOINT) {
        // Live mode — send to real backend
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error('Submission failed');
      } else {
        // Demo mode — simulate network delay then succeed
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Show success
      form.querySelectorAll('.form-group, .form-actions, fieldset').forEach(el => {
        el.style.display = 'none';
      });
      successEl.hidden = false;
    } catch {
      errorBanner.hidden = false;
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  // ─── Validation ───
  function validate() {
    let valid = true;

    // Guest name
    const name = form.querySelector('#guest-name');
    if (!name.value.trim()) {
      showError('name-error', 'Please enter your name');
      valid = false;
    }

    // Email
    const email = form.querySelector('#guest-email');
    if (!email.value.trim() || !email.value.includes('@')) {
      showError('email-error', 'Please enter a valid email address');
      valid = false;
    }

    // Guest count
    const count = form.querySelector('#guest-count');
    if (!count.value) {
      showError('count-error', 'Please select number of guests');
      valid = false;
    }

    // Attendance
    const attendance = form.querySelector('input[name="attendance"]:checked');
    if (!attendance) {
      showError('attendance-error', 'Please select your attendance');
      valid = false;
    }

    return valid;
  }

  function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.classList.add('active');
    }
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('active');
    });
  }
}
