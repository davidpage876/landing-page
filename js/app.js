/* Note: Does not support Internet Explorer. */


/* -------------------------------------------------------------------------
 * Helper functions
 */

/**
 * @returns {boolean} True if we are on small screen.
 */
function hasSmallScreen() {
    return window.matchMedia('(max-width: 960px)').matches;
}

/**
 * @description Hides invisble nav menu from interaction when transition ends.
 * @param {Element} navContainer The nav menu.
 */
function onNavTransitionEnd(navContainer) {
    if (navContainer.classList.contains('open')) {
        navContainer.classList.remove('fade');
    } else {
        navContainer.classList.remove('fade');
        navContainer.classList.add('hidden');
    }
}

/**
 * @description Hides invisble main content from interaction when transition ends.
 * @param {*} contentContainer The main content.
 */
function onContentTransitionEnd(contentContainer) {
    if (contentContainer.classList.contains('open')) {
        contentContainer.classList.remove('fade');
    } else {
        contentContainer.classList.remove('fade');
        contentContainer.classList.add('hidden');
    }
}

/* -------------------------------------------------------------------------
 * Object constructors
 */

/**
 * @description Holds information about the nav menu.
 * @constructor
 * @param {Element} navContainer - Container for the nav items.
 * @param {Element} navToggle - Button to toggle nav menu.
 * @param {Element} navMarker - Marker used to indicate current nav item.
 * @param {Element} body - HTML body element. Used to prevent page scrolling in mobile while nav menu open.
 */
function Navigation(navContainer, navToggle, navMarker, body) {
    this.navContainer = navContainer;
    this.navToggle = navToggle;
    this.navMarker = navMarker;
    this.body = body;
    this.navItems = [];
    this._onNavTransitionEnd = null;
    this._onContentTransitionEnd = null;

    /**
     * @description Build navigation list items based on content.
     * The newly created navigation items are added to this.navItems.
     * @param {Element} contentContainer - Container for content.
     * @param {Element[]} contentSections - Build navigation based on this list of content sections.
     */
    this.buildNavigation = function (contentContainer, contentSections) {

        // Build nav list.
        for (const section of contentSections) {

            // Create nav li.
            const navItem = document.createElement('LI');
            const sectionId = section.id;

            navItem.classList.add('nav-menu__item');
            navItem.dataset.sectionId = sectionId;

            // Create nav li a.
            const navAnchor = document.createElement('A');
            const sectionName = section.dataset.nav;

            navAnchor.classList.add('nav-link');
            navAnchor.textContent = `${sectionName}`;
            navAnchor.setAttribute('href', `#${sectionId}`);
            navItem.appendChild(navAnchor);

            // Append nav li to container.
            const addedItem = this.navContainer.appendChild(navItem);
            this.navItems.push(addedItem);
        }

        // Add event handlers to nav list items.
        for (const navItem of this.navItems) {

            // When nav item clicked focus on the corresponding section.
            const onSectionClick = focusSection.bind(null,
                navItem.dataset.sectionId, contentContainer, contentSections, this, this.body, true);
            navItem.addEventListener('click', onSectionClick, false);

            // On transition end move the nav marker to the focused nav item.
            navItem.addEventListener('transitionend', () => {
                if (navItem.classList.contains('focus')) {
                    this.moveNavMarker(navItem);
                }
            }, false);
        }

        // Toggle navigation visibility on menu button clicked.
        this.navToggle.addEventListener('click', () => {
            this.toggleNavMenu(contentContainer, true);
        }, false);

        // Update visibility state on start and on resize events.
        // When we are on a mobile screen hide the nav menu by default.
        const updateVisibilityState = () => {
            if (hasSmallScreen()) {
                this.closeNavMenu(contentContainer, false);
            } else {
                this.openNavMenu(contentContainer, false);
            }
        };
        updateVisibilityState();
        window.addEventListener('resize', updateVisibilityState, false);
    }

    /**
     * @description Toggles navigation menu visibility.
     * Main content is hidden while the menu is open (mobile only).
     * @param {Element} contentContainer - Used to hide content while menu is open.
     * @param {boolean} fade - Should a fade transition be used?
     */
    this.toggleNavMenu = function (contentContainer, fade) {
        if (this.navContainer.classList.contains('open')) {
            this.closeNavMenu(contentContainer, fade);
        } else {
            this.openNavMenu(contentContainer, fade);
        }
    }

    /**
     * @description Makes the navigation menu visible.
     * Main content is hidden while the menu is open (mobile only).
     * @param {Element} contentContainer - Used to hide content while menu is open.
     * @param {boolean} fade - Should a fade transition be used?
     */
    this.openNavMenu = function (contentContainer, fade) {
        const mobile = hasSmallScreen();

        this.navContainer.classList.add('open');
        this.navContainer.classList.remove('hidden');
        if (fade) {
            this.navContainer.classList.add('fade');
        }

        contentContainer.classList.remove('open');
        contentContainer.classList.remove('hidden');
        if (fade && mobile) {
            contentContainer.classList.add('fade');
        }

        // Prevent page scrolling while menu open (mobile only).
        if (mobile) {
            this.body.classList.add('disable-scroll');
        }

        // Hide invisible elements once transitions are complete.
        if (fade) {
            this.disableInvisibleOnTransitionEnd(contentContainer);
        }
    }

    /**
     * @description Makes the navigation menu hidden.
     * Main content is made visible as menu closes (mobile only).
     * @param {Element} contentContainer - Used to make content visible as menu closes.
     * @param {boolean} fade - Should a fade transition be used?
     */
    this.closeNavMenu = function (contentContainer, fade) {
        const mobile = hasSmallScreen();

        this.navContainer.classList.remove('open');
        this.navContainer.classList.remove('hidden');
        if (fade) {
            this.navContainer.classList.add('fade');
        }

        contentContainer.classList.add('open');
        contentContainer.classList.remove('hidden');
        if (fade && mobile) {
            contentContainer.classList.add('fade');
        }

        // Re-enable page scrolling.
        this.body.classList.remove('disable-scroll');

        // Hide invisible elements once transitions are complete.
        if (fade) {
            this.disableInvisibleOnTransitionEnd(contentContainer);
        }
    }

    /**
     * @description Positions the navigation marker to point to a navigation item.
     * @param {Element} navItem - Navigation item the marker points to.
     */
    this.moveNavMarker = function (navItem) {
        const containerY = this.navContainer.getBoundingClientRect().y;
        const { y: itemY, height: itemHeight } = navItem.getBoundingClientRect();
        const markerHeight = this.navMarker.getBoundingClientRect().height;

        const markerY = itemY - containerY + itemHeight / 2 - markerHeight / 2;
        this.navMarker.style.top = `${markerY}px`;
        /*console.log(`containerY:${containerY} itemY:${itemY} itemHeight:${itemHeight} markerHeight:${markerHeight} markerY:${markerY}`);*/
    }

    /**
     * @description Prevent interaction with nav menu and main content when they are invisible.
     * Used to hide elements after "fade-out" transitions end.
     * @param {Element} contentContainer The main content.
     */
    this.disableInvisibleOnTransitionEnd = function (contentContainer) {
        this.navContainer.removeEventListener('transitionend', this._onNavTransitionEnd, false);
        this._onNavTransitionEnd = onNavTransitionEnd.bind(null, this.navContainer);
        this.navContainer.addEventListener('transitionend', this._onNavTransitionEnd, false);

        contentContainer.removeEventListener('transitionend', this._onContentTransitionEnd, false);
        this._onContentTransitionEnd = onContentTransitionEnd.bind(null, contentContainer);
        contentContainer.addEventListener('transitionend', this._onContentTransitionEnd, false);
    }
}

/* -------------------------------------------------------------------------
 * Main functions
 */

/**
 * @description Makes the given section in focus.
 * The section in focus has the class 'focus' added to it.
 * 'focus' is also added to the associated navigation list item.
 * All other sections and navigation items lose focus.
 * @param {string} sectionId - ID of the section to focus on.
 * @param {Element} contentContainer - Container for content.
 * @param {Element[]} contentSections - List of all content sections.
 * @param {Navigation} nav - Navigation menu.
 * @param {Element} body - HTML body element.
 * @param {boolean} useTransitions - Should transitions be used.
 */
function focusSection(sectionId, contentContainer, contentSections, nav, body, useTransitions) {

    // Remove focus from all sections.
    for (const section of contentSections) {
        section.classList.remove('focus');
    }

    // Remove focus from all nav items.
    for (const item of nav.navItems) {
        item.classList.remove('focus');
    }

    // Find the section with sectionId ID and focus on it.
    const section = Array.from(contentSections).find(function (s) {
        return s.id === sectionId;
    });
    if (section) {
        section.classList.add('focus');
    }

    // Find the navigation item with data-section-id matching our sectionId and focus on it.
    const navItem = Array.from(nav.navItems).find(function (item) {
        return item.dataset.sectionId === sectionId;
    });
    if (navItem) {
        navItem.classList.add('focus');
    }

    // Close the nav menu if on mobile.
    if (hasSmallScreen()) {
        nav.closeNavMenu(contentContainer, useTransitions);
    }

    // Switch background gradient.
    if (section) {
        const gradientBg = document.getElementById('gradient-bg');

        // Clear all classes that start with "gradient-bg--".
        for (const className of gradientBg.classList) {
            if (/^gradient-bg--/.test(className)) {
                gradientBg.classList.remove(className);
                body.classList.remove(className);
            }
        }

        // Use the section's gradient.
        const sectionGradientName = section.dataset.bg.toLowerCase();
        const gradientClass = `gradient-bg--${sectionGradientName}`;
        gradientBg.classList.add(gradientClass);
        body.classList.add(gradientClass);
    }
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {

    // Set up navigation menu.
    const navContainer = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navMarker = document.getElementById('nav-marker');
    const body = document.querySelector('body');
    const nav = new Navigation(navContainer, navToggle, navMarker, body);

    // Build navigation from content.
    const contentContainer = document.getElementById('content');
    const contentSections = document.querySelectorAll('#content > .section');
    nav.buildNavigation(contentContainer, contentSections);

    // Focus on the first section initially.
    if (contentSections.length > 0) {
        focusSection(contentSections[0].id, contentContainer, contentSections, nav, body, false);
    }
}

pageSetup();