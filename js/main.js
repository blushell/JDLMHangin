// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileMenuBars = document.querySelectorAll('.mobile-menu-btn span');
const phoneInput = document.querySelector('#phone');

mobileMenuBtn.addEventListener('click', () => {
	mobileNav.classList.toggle('active');
	// Animate hamburger to X
	mobileMenuBars[0].style.transform = mobileNav.classList.contains('active')
		? 'rotate(45deg) translate(5px, 6px)'
		: 'none';
	mobileMenuBars[1].style.opacity = mobileNav.classList.contains('active')
		? '0'
		: '1';
	mobileMenuBars[2].style.transform = mobileNav.classList.contains('active')
		? 'rotate(-45deg) translate(5px, -6px)'
		: 'none';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
	if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
		mobileNav.classList.remove('active');
		mobileMenuBars[0].style.transform = 'none';
		mobileMenuBars[1].style.opacity = '1';
		mobileMenuBars[2].style.transform = 'none';
	}
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) {
			// Close mobile menu if open
			mobileNav.classList.remove('active');
			mobileMenuBars[0].style.transform = 'none';
			mobileMenuBars[1].style.opacity = '1';
			mobileMenuBars[2].style.transform = 'none';

			// Smooth scroll to target
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	});
});

// Intersection Observer for fade-in animations
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
			}
		});
	},
	{
		threshold: 0.1,
	}
);

fadeElements.forEach((element) => {
	fadeObserver.observe(element);
});

// Hero mascot image rotator
(() => {
	const heroMascot = document.getElementById('heroMascot');
	if (!heroMascot) return;

	const images = [
		'img/mascot_cleaner.png',
		'img/mascot_hammer.png',
		'img/mascot_pool.png',
	];

	// Preload images
	images.forEach((src) => {
		const img = new Image();
		img.src = src;
	});

	let index = 0;
	const intervalMs = 3500;

	setInterval(() => {
		index = (index + 1) % images.length;
		// Fade out
		heroMascot.style.opacity = '0';
		setTimeout(() => {
			heroMascot.src = images[index];
			// Fade in
			heroMascot.style.opacity = '1';
		}, 200);
	}, intervalMs);
})();

// Phone input formatter: (###) ###-####
if (phoneInput) {
	const formatPhone = (raw) => {
		const digits = raw.replace(/\D/g, '').slice(0, 10);
		if (digits.length === 0) return '';
		if (digits.length < 4) return `(${digits}`;
		if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	};

	phoneInput.addEventListener('input', () => {
		phoneInput.value = formatPhone(phoneInput.value);
	});

	phoneInput.addEventListener('blur', () => {
		// Ensure stable formatting on blur
		phoneInput.value = formatPhone(phoneInput.value);
	});
}

// Form validation and submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		// Basic form validation
		const formData = new FormData(contactForm);
		let isValid = true;
		let errorMessage = '';

		// Only validate required visible fields
		const requiredFields = ['name', 'email', 'message'];
		for (const fieldName of requiredFields) {
			const value = (formData.get(fieldName) || '').toString();
			if (!value.trim()) {
				isValid = false;
				errorMessage = 'Please fill in all required fields';
				break;
			}
			if (fieldName === 'email' && !isValidEmail(value)) {
				isValid = false;
				errorMessage = 'Please enter a valid email address';
				break;
			}
		}

		if (!isValid) {
			showNotification(errorMessage, 'error');
			return;
		}

		try {
			if (!window.emailjs || !window.EMAILJS_CONFIG) {
				throw new Error('Email service not configured');
			}

			// Initialize EmailJS once per page load
			if (!window.__emailjsInitialized) {
				emailjs.init({ publicKey: window.EMAILJS_CONFIG.PUBLIC_KEY });
				window.__emailjsInitialized = true;
			}

			// Map fields to EmailJS template variables
			const nameValue = contactForm.querySelector('#name')?.value || '';
			const emailValue = contactForm.querySelector('#email')?.value || '';
			const phoneValue = contactForm.querySelector('#phone')?.value || '';
			contactForm.querySelector('input[name="from_name"]').value = nameValue;
			contactForm.querySelector('input[name="reply_to"]').value = emailValue;
			contactForm.querySelector('input[name="from_email"]').value = emailValue;
			contactForm.querySelector('input[name="from_phone"]').value = phoneValue;
			contactForm.querySelector('input[name="phone_number"]').value =
				phoneValue;

			// Send the form using EmailJS
			await emailjs.sendForm(
				window.EMAILJS_CONFIG.SERVICE_ID,
				window.EMAILJS_CONFIG.TEMPLATE_ID,
				contactForm
			);

			showNotification('Message sent successfully!', 'success');
			contactForm.reset();
		} catch (error) {
			console.error(error);
			showNotification('Failed to send message. Please try again.', 'error');
		}
	});
}

// Helper functions
function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type) {
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.textContent = message;
	document.body.appendChild(notification);

	// Remove notification after 3 seconds
	setTimeout(() => {
		notification.remove();
	}, 3000);
}
