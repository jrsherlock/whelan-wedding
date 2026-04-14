/**
 * RSVP form: two-step flow with server-side name validation.
 *
 * Step 1: Guest enters name + email → "Find My Invitation" validates
 *         the name against the server-side guest list.
 * Step 2: If validated, the rest of the form (attendance, dietary,
 *         message) slides in. Final submit records the RSVP.
 */

// ─── Configuration ───
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx9L8MiT_Maq6ByAdTmWQarEtoc4CF2KjKAO1Z3bkhxWOcL5VGNGfKNCey0PVg9OiCmNg/exec';

export function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const lookupBtn = document.getElementById('rsvp-lookup');
  const submitBtn = document.getElementById('rsvp-submit');
  const step1 = document.getElementById('rsvp-step-1');
  const step2 = document.getElementById('rsvp-step-2');
  const successEl = document.getElementById('rsvp-success');
  const errorBanner = document.getElementById('rsvp-error-banner');
  const otherCheck = document.getElementById('dietary-other-check');
  const otherField = document.getElementById('dietary-other-field');

  // ─── Clear browser autofill background ───
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

  // ─── Attendance toggle: show/hide details ───
  const attendingDetails = document.getElementById('attending-details');
  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'accepts') {
        attendingDetails.classList.add('visible');
      } else {
        attendingDetails.classList.remove('visible');
        const countInput = document.getElementById('guest-count');
        if (countInput) countInput.value = '';
        const selectEl = document.getElementById('guest-count-select');
        if (selectEl) {
          selectEl.classList.remove('has-value');
          selectEl.querySelector('.custom-select-value').textContent = 'Number of Guests';
          selectEl.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
        }
        form.querySelectorAll('input[name="dietary"]').forEach(cb => { cb.checked = false; });
        if (otherField) {
          otherField.classList.remove('visible');
          const otherInput = otherField.querySelector('input');
          if (otherInput) otherInput.value = '';
        }
        const msg = document.getElementById('guest-message');
        if (msg) msg.value = '';
      }
    });
  });

  // ─── Custom select (guest count) ───
  const customSelect = document.getElementById('guest-count-select');
  const hiddenInput = document.getElementById('guest-count');
  if (customSelect && hiddenInput) {
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const valueDisplay = customSelect.querySelector('.custom-select-value');
    const options = customSelect.querySelectorAll('.custom-select-options li');

    trigger.addEventListener('click', () => {
      customSelect.classList.toggle('open');
      trigger.setAttribute('aria-expanded', customSelect.classList.contains('open'));
    });

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        hiddenInput.value = opt.dataset.value;
        valueDisplay.textContent = opt.textContent;
        customSelect.classList.add('has-value');
        customSelect.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    document.addEventListener('click', (e) => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── Bot detection ───
  const loadedAt = Date.now();

  // ─── Step 1: Find My Invitation ───
  lookupBtn.addEventListener('click', async () => {
    clearErrors();

    // Client-side validation — name + email only
    let valid = true;
    const name = form.querySelector('#guest-name');
    if (!name.value.trim()) {
      showError('name-error', 'Please enter your name');
      valid = false;
    }
    const email = form.querySelector('#guest-email');
    if (!email.value.trim() || !email.value.includes('@')) {
      showError('email-error', 'Please enter a valid email address');
      valid = false;
    }
    if (!valid) return;

    // Honeypot
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    // Bot timing check
    if (Date.now() - loadedAt < 3000) return;

    // Show loading
    lookupBtn.classList.add('loading');
    lookupBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.set('guest_name', name.value.trim());
      formData.set('email', email.value.trim());
      formData.set('action', 'validate');

      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      const result = await response.json();

      if (!result.ok) {
        if (result.error === 'name_not_found') {
          showError('name-error', result.message);
          lookupBtn.classList.remove('loading');
          lookupBtn.disabled = false;
          return;
        }
        if (result.error === 'rate_limited') {
          showBannerError(result.message);
          lookupBtn.classList.remove('loading');
          lookupBtn.disabled = false;
          return;
        }
        throw new Error(result.error || 'Validation failed');
      }

      // Name validated — transition to step 2
      lookupBtn.classList.remove('loading');
      step1.querySelector('.form-actions').style.display = 'none';
      step2.classList.add('visible');
    } catch {
      showBannerError();
      lookupBtn.classList.remove('loading');
      lookupBtn.disabled = false;
    }
  });

  // ─── Step 2: Submit RSVP ───
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateStep2()) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    errorBanner.hidden = true;

    try {
      const formData = new FormData(form);

      // Combine dietary selections
      const dietaryValues = formData.getAll('dietary');
      formData.delete('dietary');
      if (dietaryValues.length > 0) {
        formData.set('dietary_restrictions', dietaryValues.join(', '));
      }

      // Remove the validate action so backend records the RSVP
      formData.delete('action');

      if (FORM_ENDPOINT) {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        const result = await response.json();

        if (!result.ok) {
          if (result.error === 'name_not_found') {
            showError('name-error', result.message);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            return;
          }
          if (result.error === 'rate_limited') {
            showBannerError(result.message);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            return;
          }
          throw new Error(result.error || 'Submission failed');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Show success
      form.querySelectorAll('#rsvp-step-1, #rsvp-step-2, .form-actions').forEach(el => {
        el.style.display = 'none';
      });
      successEl.hidden = false;
    } catch {
      showBannerError();
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  // ─── Validation ───
  function validateStep2() {
    let valid = true;

    const attendance = form.querySelector('input[name="attendance"]:checked');
    if (!attendance) {
      showError('attendance-error', 'Please select your attendance');
      valid = false;
    }

    if (attendance && attendance.value === 'accepts') {
      const count = form.querySelector('#guest-count');
      if (!count.value) {
        showError('count-error', 'Please select number of guests');
        valid = false;
      }
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

  function showBannerError(message) {
    const textEl = document.getElementById('rsvp-error-text');
    if (textEl && message) textEl.textContent = message;
    errorBanner.hidden = false;
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('active');
    });
    errorBanner.hidden = true;
  }
}
