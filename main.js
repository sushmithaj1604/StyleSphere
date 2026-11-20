
// =====================================
// CONTACT AND NEWSLETTER FORMS
// =====================================

document.querySelectorAll('form[data-demo-form]').forEach(form => {

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const note = form.querySelector('.notice');

        if (note) note.textContent = 'Please wait...';

        const isContact = form.querySelector('[name="message"]');

        const endpoint = isContact
            ? '/api/contact'
            : '/api/subscribe';

        const data = isContact
            ? {
                name: form.querySelector('[name="name"]').value,
                email: form.querySelector('[name="email"]').value,
                message: form.querySelector('[name="message"]').value
            }
            : {
                email: form.querySelector('[name="email"]').value
            };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            if (note) note.textContent = result.message;

            form.reset();

        } catch (error) {
            if (note) note.textContent = error.message;
        }
    });

});


// =====================================
// USER REGISTRATION
// =====================================

document.querySelectorAll('form[data-auth-form="register"]').forEach(form => {

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const note = form.querySelector('.notice');

        if (note) note.textContent = 'Creating your account...';

        const data = {
            name: form.querySelector('[name="name"]').value,
            email: form.querySelector('[name="email"]').value,
            password: form.querySelector('[name="password"]').value
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            if (note) note.textContent = result.message;

            form.reset();

        } catch (error) {
            if (note) note.textContent = error.message;
        }
    });

});


// =====================================
// USER LOGIN
// =====================================

document.querySelectorAll('form[data-auth-form="login"]').forEach(form => {

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const note = form.querySelector('.notice');

        if (note) note.textContent = 'Logging in...';

        const data = {
            email: form.querySelector('[name="email"]').value,
            password: form.querySelector('[name="password"]').value
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            if (note) note.textContent = result.message;

            window.location.href = 'index.html';

        } catch (error) {
            if (note) note.textContent = error.message;
        }
    });

});


// =====================================
// DISPLAY LOGGED-IN USER AND LOGOUT
// =====================================

document.addEventListener('DOMContentLoaded', async () => {

    document.querySelectorAll('.nav').forEach(nav => {
        if (!nav.querySelector('#loginLink')) {
            const link = document.createElement('a');
            link.href = 'login.html';
            link.id = 'loginLink';
            link.textContent = 'Login';
            nav.appendChild(link);
        }

        if (!nav.querySelector('#registerLink')) {
            const link = document.createElement('a');
            link.href = 'register.html';
            link.id = 'registerLink';
            link.textContent = 'Register';
            nav.appendChild(link);
        }

        if (!nav.querySelector('#welcomeUser')) {
            const welcome = document.createElement('span');
            welcome.id = 'welcomeUser';
            nav.appendChild(welcome);
        }

        if (!nav.querySelector('#logoutBtn')) {
            const logout = document.createElement('button');
            logout.id = 'logoutBtn';
            logout.type = 'button';
            logout.textContent = 'Logout';
            logout.style.display = 'none';
            logout.style.cursor = 'pointer';
            nav.appendChild(logout);
        }
    });

    const welcomeUser = document.getElementById('welcomeUser');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (welcomeUser && logoutBtn) {

        try {
            const response = await fetch('/api/me');
            const user = await response.json();

            if (user.logged_in) {

                welcomeUser.textContent = 'Welcome, ' + user.name + '!';

                if (loginLink) {
                    loginLink.style.display = 'none';
                }

                if (registerLink) {
                    registerLink.style.display = 'none';
                }

                logoutBtn.style.display = 'inline-block';
            }

        } catch (error) {
            console.error('Could not check login status:', error);
        }

        // LOGOUT BUTTON

        logoutBtn.addEventListener('click', async () => {

            try {
                const response = await fetch('/api/logout', {
                    method: 'POST'
                });

                if (response.ok) {
                    window.location.href = 'index.html';
                }

            } catch (error) {
                alert('Logout failed. Please try again.');
            }

        });

    }

});


// =====================================
// FASHION TRENDS CATEGORY FILTER
// =====================================

document.addEventListener('DOMContentLoaded', function () {

    const filterButtons = document.querySelectorAll('.filter');
    const trendCards = document.querySelectorAll('.cards .card');
    const searchInput = document.getElementById('lookSearch');

    // Stop if this page does not contain trend filters

    if (!filterButtons.length || !trendCards.length) {
        return;
    }

    let selectedCategory = 'all';

    // FILTER CARDS

    function filterCards() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : '';

        trendCards.forEach(card => {

            const category = card.dataset.category;
            const cardText = card.innerText.toLowerCase();

            const matchesCategory =
                selectedCategory === 'all' ||
                category === selectedCategory;

            const matchesSearch =
                cardText.includes(searchText);

            if (matchesCategory && matchesSearch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }

        });

    }

    // CATEGORY BUTTON CLICK

    filterButtons.forEach(button => {

        button.addEventListener('click', function () {

            selectedCategory = this.dataset.filter;

            // Remove active class from all buttons

            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Activate clicked button

            this.classList.add('active');

            // Show matching cards

            filterCards();

        });

    });

    // SEARCH FUNCTIONALITY

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    // SHOW ALL CARDS INITIALLY

    filterCards();

});


// =====================================
// MOBILE NAVIGATION MENU
// =====================================

document.addEventListener('DOMContentLoaded', function () {

    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.querySelector('.nav');

    if (menuBtn && nav) {

        menuBtn.addEventListener('click', function () {
            nav.classList.toggle('open');
        });

    }

});


// =====================================
// COMBINED INSPIRATION NAVIGATION
// =====================================

document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.nav a[href="collections.html"], .footer-links a[href="collections.html"]').forEach(link => {
        link.href = 'trends.html';
        link.textContent = 'Trends & Collections';
    });

    document.querySelectorAll('.nav a[href="lookbook.html"], .footer-links a[href="lookbook.html"]').forEach(link => {
        link.href = 'designers.html';
        link.textContent = 'Designers & Looks';
    });

    document.querySelectorAll('.nav, .footer-links').forEach(nav => {
        [['trends.html', 'Trends & Collections'], ['designers.html', 'Designers & Looks']].forEach(([destination, label]) => {
            const links = Array.from(nav.querySelectorAll('a[href="' + destination + '"]'));
            if (links.length > 1) {
                if (links.some(link => link.classList.contains('active'))) {
                    links[0].classList.add('active');
                }
                links[0].textContent = label;
                links.slice(1).forEach(link => link.remove());
            }
        });
    });

    document.querySelectorAll('.nav').forEach(nav => {
        if (!nav.querySelector('a[href="saved.html"]')) {
            const savedLink = document.createElement('a');
            savedLink.href = 'saved.html';
            savedLink.textContent = 'Saved';
            nav.insertBefore(savedLink, nav.querySelector('a[href="about.html"]'));
        }
    });

});


// =====================================
// SAVED LOOKS AND STYLE BUILDER
// =====================================

document.addEventListener('DOMContentLoaded', function () {

    const savedLooksKey = 'styleAtelierSavedLooks';

    function getSavedLooks() {
        try {
            const saved = JSON.parse(localStorage.getItem(savedLooksKey) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error('Could not read saved looks:', error);
            return [];
        }
    }

    function setSavedLooks(looks) {
        try {
            localStorage.setItem(savedLooksKey, JSON.stringify(looks));
        } catch (error) {
            console.error('Could not save this look:', error);
            alert('This look could not be saved. Check your browser storage settings.');
            return false;
        }

        return true;
    }

    function saveLook(look) {
        const looks = getSavedLooks();
        const existingIndex = looks.findIndex(item => item.id === look.id);

        if (existingIndex === -1) {
            looks.unshift(look);
        } else {
            looks[existingIndex] = look;
        }

        return setSavedLooks(looks);
    }

    function getCardLook(card) {
        const image = card.querySelector('.card-image');
        const imageStyle = image ? image.style.backgroundImage : '';
        const imageUrl = imageStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

        return {
            id: card.dataset.lookId || card.dataset.designerId || card.dataset.category + '-' + card.querySelector('h3').textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: card.querySelector('h3').textContent.trim(),
            description: card.querySelector('p') ? card.querySelector('p').textContent.trim() : '',
            image: imageUrl,
            category: card.dataset.category || 'all',
            designer: card.dataset.designer || '',
            lookDetails: card.dataset.lookDetails || ''
        };
    }

    document.querySelectorAll('.card .save-btn').forEach(button => {
        const card = button.closest('.card');
        const saved = getSavedLooks().some(look => look.id === getCardLook(card).id);
        if (saved) {
            button.textContent = '✓ Saved';
            button.classList.add('saved');
        }
    });

    document.addEventListener('click', function (event) {
        const saveButton = event.target.closest('.card .save-btn');
        if (saveButton) {
            const card = saveButton.closest('.card');
            if (saveLook(getCardLook(card))) {
                saveButton.textContent = '✓ Saved';
                saveButton.classList.add('saved');
            }
            return;
        }

        const styleButton = event.target.closest('[data-style-look]');
        if (styleButton) {
            const look = getCardLook(styleButton.closest('.card'));
            const params = new URLSearchParams({
                title: look.title,
                description: look.description,
                image: look.image,
                category: look.category,
                id: look.id
            });
            window.location.href = 'styling.html?' + params.toString();
        }
    });

    const styleBuilder = document.querySelector('[data-style-builder]');
    if (styleBuilder) {
        const params = new URLSearchParams(window.location.search);
        const lookTitle = params.get('title');
        const lookDescription = params.get('description');
        const lookImage = params.get('image');
        const lookCategory = params.get('category') || 'minimal';
        const lookId = params.get('id') || 'custom-look';
        const title = document.getElementById('selectedLookTitle');
        const description = document.getElementById('selectedLookDescription');
        const preview = document.getElementById('selectedLookImage');
        const styleSelect = styleBuilder.elements.namedItem('style');

        if (lookTitle) {
            title.textContent = lookTitle;
            description.textContent = lookDescription || 'Choose the pieces and finishing details for this look.';
            preview.style.backgroundImage = 'url("' + lookImage + '")';
            styleSelect.value = lookCategory;
        }

        styleBuilder.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(styleBuilder);
            const options = {
                style: formData.get('style'),
                outfit: formData.get('outfit'),
                accessories: formData.get('accessories'),
                shoes: formData.get('shoes'),
                finishing: formData.get('finishing')
            };
            const customizedTitle = (lookTitle || 'My style') + ' · ' + options.style + ' styling';

            if (saveLook({
                id: 'styled-' + lookId + '-' + Object.values(options).join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                title: customizedTitle,
                description: [
                    options.outfit,
                    'Accessories: ' + options.accessories,
                    'Shoes: ' + options.shoes,
                    'Finishing touch: ' + options.finishing
                ].join(' · '),
                image: lookImage || '',
                category: options.style,
                designer: '',
                lookDetails: ''
            })) {
                const notice = document.getElementById('styleSaveNotice');
                notice.textContent = 'Your styled look is saved. Find it on your Saved page.';
            }
        });
    }

    const savedGrid = document.getElementById('savedLooks');
    if (savedGrid) {
        const looks = getSavedLooks();
        const emptyMessage = document.getElementById('savedEmpty');

        if (looks.length) {
            emptyMessage.hidden = true;
            looks.forEach(look => {
                const card = document.createElement('article');
                card.className = 'card saved-card';
                const image = document.createElement('div');
                image.className = 'card-image';
                if (look.image) image.style.backgroundImage = 'url("' + look.image + '")';
                const heading = document.createElement('h3');
                heading.textContent = look.title;
                const details = document.createElement('p');
                details.textContent = look.description;
                const removeButton = document.createElement('button');
                removeButton.className = 'save-btn remove-saved';
                removeButton.type = 'button';
                removeButton.textContent = 'Remove saved look';
                removeButton.addEventListener('click', function () {
                    if (setSavedLooks(getSavedLooks().filter(item => item.id !== look.id))) {
                        card.remove();
                        if (!savedGrid.children.length) emptyMessage.hidden = false;
                    }
                });
                card.append(image, heading, details, removeButton);
                savedGrid.appendChild(card);
            });
        } else {
            emptyMessage.hidden = false;
        }
    }

});
