(function() {
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

            button.disabled = true;
            button.textContent = '...';

            fetch('https://formsubmit.co/ajax/info@smartagents.be', {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' }
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
