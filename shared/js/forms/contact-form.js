(function() {
    const CONTACT_API = '/api/contact';

    function bindContactFormSubmit(contactForm) {
        if (!contactForm || contactForm.dataset.contactFormBound === 'true') {
            return;
        }

        contactForm.dataset.contactFormBound = 'true';

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = contactForm.querySelector('button[type="submit"]');
            if (!button) {
                return;
            }
            const defaultLabel = button.dataset.labelDefault || button.textContent.trim();
            const successLabel = button.dataset.labelSuccess || 'Message sent!';
            const errorLabel = button.dataset.labelError || 'Error';

            const formData = new FormData(contactForm);

            // Honeypot — _honey is hidden; if a bot fills it, pretend success and bail.
            if (formData.get('_honey')) {
                button.textContent = successLabel;
                button.style.background = 'var(--green)';
                contactForm.reset();
                button.disabled = false;
                setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.style.background = '';
                }, 3000);
                return;
            }

            // Require Turnstile token — widget injects cf-turnstile-response into FormData.
            if (!formData.get('cf-turnstile-response')) {
                button.textContent = errorLabel;
                button.style.background = 'var(--rose)';
                setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.style.background = '';
                }, 3000);
                return;
            }

            // Build a clean JSON payload — strip FormSubmit-style underscore-prefixed fields.
            const payload = {};
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('_')) continue;
                payload[key] = value;
            }

            // n8n's classifier expects a `subject` — pull from the hidden _subject field.
            payload.subject = formData.get('_subject') || payload.subject || '';

            // Fold optional metadata (company / intent / page_context) into the message
            // so the LLM has full context for classification and reply.
            const extras = [];
            if (payload.company) extras.push(`Bedrijf: ${payload.company}`);
            if (payload.intent) extras.push(`Intentie: ${payload.intent}`);
            if (payload.page_context) extras.push(`Context: ${payload.page_context}`);
            if (extras.length) {
                payload.message = `${payload.message || ''}\n\n— ${extras.join(' · ')}`;
            }

            button.disabled = true;
            button.textContent = '...';

            fetch(CONTACT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            }).then((response) => {
                if (response.ok) {
                    button.textContent = successLabel;
                    button.style.background = 'var(--green)';
                    contactForm.reset();
                } else {
                    button.textContent = errorLabel;
                    button.style.background = 'var(--rose)';
                }

                button.disabled = false;
                setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.style.background = '';
                }, 3000);
            }).catch(() => {
                button.textContent = errorLabel;
                button.style.background = 'var(--rose)';
                button.disabled = false;
                setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.style.background = '';
                }, 3000);
            });
        });
    }

    document.querySelectorAll('.contact-form').forEach(bindContactFormSubmit);

    document.querySelectorAll('.contact-form').forEach((form) => {
        form.addEventListener('pointermove', (e) => {
            const rect = form.getBoundingClientRect();
            form.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(1)}px`);
            form.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(1)}px`);
            form.classList.add('is-lit');
        });

        form.addEventListener('pointerleave', () => {
            form.classList.remove('is-lit');
        });
    });
})();
