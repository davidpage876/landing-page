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
                navItem.dataset.sectionId, contentContainer, contentSections, this, this.body);
            navItem.addEventListener('click', onSectionClick, false);

            // On transition end move the nav marker to the focused nav item.
            navItem.addEventListener('transitionend', () => {
                if (navItem.classList.contains('focus')) {
                    this.moveNavMarker(navItem);
                }
            }, false);
        }

        // Toggle navigation menu visibility on toggle button click.
        // Simultaneously toggle content visibility (on mobile).
        this.navToggle.addEventListener('click', () => {
            this.navContainer.classList.remove('hidden');
            this.navContainer.classList.toggle('fade-out');

            contentContainer.classList.remove('hidden');
            contentContainer.classList.toggle('fade-in');

            // Disable scrolling while menu is open (on mobile).
            this.body.classList.toggle('disable-scroll');
        }, false);

        // Hide navigation menu when fade out transition completes
        // and hide content when fade in transition completes.
        this.navContainer.addEventListener('transitionend', () => {
            if (this.navContainer.classList.contains('fade-out')) {
                this.navContainer.classList.add('hidden');
            } else {
                contentContainer.classList.add('hidden');
            }
        }, false);

        // Update visibility state on start and on resize events.
        // When we are on a mobile screen hide the nav menu by default.
        const updateVisibilityState = () => {
            if (hasSmallScreen()) {
                this.navContainer.classList.add('hidden');
                this.navContainer.classList.add('fade-out');

                contentContainer.classList.remove('hidden');
                contentContainer.classList.add('fade-in');

                this.body.classList.remove('disable-scroll');
            } else {
                this.navContainer.classList.remove('hidden');
                this.navContainer.classList.remove('fade-out');

                contentContainer.classList.remove('fade-in');

                this.body.classList.remove('disable-scroll');
            }
        };
        updateVisibilityState();
        window.addEventListener('resize', updateVisibilityState, false);
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
 */
function focusSection(sectionId, contentContainer, contentSections, nav, body) {

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


    if (hasSmallScreen()) {
        nav.navContainer.classList.add('fade-out');
        contentContainer.classList.remove('hidden');
        contentContainer.classList.add('fade-in');
        body.classList.remove('disable-scroll');
    }



    // Switch background gradient.
    if (section) {
        const gradientBg = document.getElementById('gradient-bg');

        // Clear all classes that start with "gradient-bg--".
        for (const className of gradientBg.classList) {
            if (/^gradient-bg--/.test(className)) {
                gradientBg.classList.remove(className);
            }
        }

        // Use the section's gradient.
        const sectionGradientName = section.dataset.bg.toLowerCase();
        gradientBg.classList.add(`gradient-bg--${sectionGradientName}`);
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
        focusSection(contentSections[0].id, contentContainer, contentSections, nav, body);
    }
}

pageSetup();