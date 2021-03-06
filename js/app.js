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
    navContainer.classList.remove('fade');
    navContainer.classList.remove('fade--slow');
    if (!navContainer.classList.contains('open')) {
        navContainer.classList.add('hidden');
    }
}

/**
 * @description Hides invisble main content from interaction when transition ends.
 * @param {Element} contentContainer The main content.
 */
function onContentTransitionEnd(contentContainer) {
    contentContainer.classList.remove('fade');
    if (!contentContainer.classList.contains('open')) {
        contentContainer.classList.add('hidden');
    }
}

/**
 * @description Get the section with a given ID.
 * @param {string} sectionId - ID of the section to search for.
 * @param {Element[]} contentSections - List of sections to search.
 * @returns {Element} - The section element found. Returns undefined if not found.
 */
function getSectionWithId(sectionId, contentSections) {
    for (const section of contentSections) {
        if (section.id === sectionId) {
            return section;
        }
    }
    return undefined;
}

/**
 * @description Converts a time value in seconds to milliseconds.
 * @param {string|number} seconds - Value to convert from.
 * Could be a string (e.g. '3.2s') or a number (e.g. 3.2).
 * @returns {number} - Converted value in milliseconds.
 */
function secondsToMs(seconds) {
    const secondValue = parseFloat(seconds);
    return secondValue * 1000;
}

/**
 * @description Determines which section is currently in view.
 * @param {Element[]} - List of sections.
 * @returns {Element} - The element in view.
 */
function getSectionInView(contentSections) {
    const WITHIN_SCREEN_PERCENT = 0.5; // 50%
    for (const section of contentSections) {
        if (isSectionInView(section, WITHIN_SCREEN_PERCENT)) {
            return section;
        }
    }
};

/**
 * @description Checks if a section is in view.
 * @param {Element} section - Section to check.
 * @param {number} withinScreenPercent - The section must be within percentage of screen from the centre.
 * Expects normalized value between 0 and 1.
 * @returns {boolean} - True if the given section is within view, false otherwise.
 */
function isSectionInView(section, withinScreenPercent) {
    const windowHeight = window.innerHeight;
    const windowYCenter = windowHeight / 2;
    const { y, height } = section.getBoundingClientRect();
    const yCenter = y + height / 2;

    return Math.abs(yCenter - windowYCenter) < withinScreenPercent * windowHeight;
}

/* -------------------------------------------------------------------------
 * Object constructors
 */

// ScrollManager functionality below is based on code by Rafael Marini R??lo (username ????????????????????) (2021),
// Stack Overflow [https://stackoverflow.com/a/50590388] (retrieved 31/05/2021).

/**
 * @description Manages scroll behaviour.
 *
 * Supports scrolling to an element over a custom time (note: the default window.scrollTo() does not support this).
 * @constructor
 * @param {number} defaultDuration - The default time which scrolls will take to complete in milliseconds. Defaults to 1000.
 */
function ScrollManager(defaultDuration = 1000) {
    this.defaultDuration = defaultDuration;
    this.triggeredScrollEvent = false;
    this._timeOutId = undefined;

    /**
     * @description Scrolls to an element over time vertically.
     *
     * @param {Element} target - Target element to scroll to.
     * @param {number} duration - Total time which the scroll will take to complete in milliseconds.
     * Defaults to the default duration time if undefined.
     * If set to 0 we jump straight to the target.
     * @param {boolean} smoothly - If true, scroll with easing, otherwise scroll linearly. Defaults to true.
     */
    this.scrollTo = function (target, duration = undefined, smoothly = true) {
        const targetY = target.offsetTop;
        const easeFunction = smoothly ? (t) => {
            t--;
            return t * t * t + 1;
        } : (t) => {
            return t;
        };

        clearTimeout(this._timeOutId);
        if (duration === undefined) {
            duration = this.defaultDuration;
        }
        if (duration > 0) {
            this._scrollToPosition(window.scrollY, targetY, 0, 1 / duration, easeFunction);
        } else {
            this.triggeredScrollEvent = true;
            window.scrollTo(0, targetY);
        }
    }

    /**
     * @description Interrupts any current scrolling, stopping it immediately.
     */
    this.interruptScroll = function() {
        clearTimeout(this._timeOutId);
    }

    this._scrollToPosition = function (from, to, timeSinceStart, speed, motion) {
        this.triggeredScrollEvent = true;

        if (timeSinceStart < 0 || timeSinceStart > 1 || speed <= 0) {
            window.scrollTo(0, to);
            return;
        }
        const STEP = 20;

        window.scrollTo(0, from - (from - to) * motion(timeSinceStart));
        timeSinceStart += speed * STEP;
        this._timeOutId = setTimeout(() => {
            this._scrollToPosition(from, to, timeSinceStart, speed, motion);
        }, STEP);
    };
}

/**
 * @description Holds information about the nav menu.
 * @constructor
 * @param {Element} navContainer - Container for the nav items.
 * @param {Element} navToggle - Button to toggle nav menu.
 * @param {Element} navMarker - Marker used to indicate current nav item.
 * @param {Element} navHotspot - Cursor area that covers the nav menu.
 * @param {Element} body - HTML body element. Used to prevent page scrolling in mobile while nav menu open.
 * @param {number} inactivityTimeout - Closes the nav menu after a time of inactivity. Time is in milliseconds.
 * If zero, do not close the menu due to inactivity.
 */
function Navigation(navContainer, navToggle, navMarker, navHotspot, body, inactivityTimeout = 0) {
    this.navContainer = navContainer;
    this.navToggle = navToggle;
    this.navMarker = navMarker;
    this.navHotspot = navHotspot;
    this.body = body;
    this.inactivityTimeout = inactivityTimeout;
    this.navItems = [];
    this._onNavTransitionEnd = null;
    this._onContentTransitionEnd = null;
    this._fadeTimeoutId = null;
    this._inactivityTimerId = null;
    this._isCursorOverNavMenu = false;

    /**
     * @description Build navigation list items based on content.
     * The newly created navigation items are added to this.navItems.
     * @param {Element} contentContainer - Container for content.
     * @param {Element[]} contentSections - Build navigation based on this list of content sections.
     * @param {Element} scrollManager - Reference to the scroll manager.
     */
    this.buildNavigation = function (contentContainer, contentSections, scrollManager) {

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

            // When nav item clicked focus on the corresponding section and scroll to it.
            navItem.addEventListener('click', (event) => {
                event.preventDefault();

                const section = getSectionWithId(navItem.dataset.sectionId, contentSections);
                if (section) {
                    focusSection(section, contentContainer, contentSections, this, this.body, scrollManager, true);
                    scrollManager.scrollTo(section);
                }
            }, false);

            // On transition end move the nav marker to the focused nav item.
            navItem.addEventListener('transitionend', () => {
                if (navItem.classList.contains('focus')) {
                    this.moveNavMarker(navItem);
                }
            }, false);
        }

        // Toggle navigation menu on button click.
        this.navToggle.addEventListener('click', () => {
            this.toggleNavMenu(contentContainer, scrollManager, true);
        }, false);

        // Update visibility state on start and on resize events.
        // When we are on a mobile screen hide the nav menu by default.
        const updateVisibilityState = () => {
            if (hasSmallScreen()) {
                this.closeNavMenu(contentContainer, scrollManager, false);
            } else {
                this.openNavMenu(contentContainer, scrollManager, false);
            }
        };
        updateVisibilityState();
        window.addEventListener('resize', updateVisibilityState, false);

        // Monitor if mouse is over the nav menu hotspot.
        this.navHotspot.addEventListener('mouseover', () => {
            this._isCursorOverNavMenu = true;
        }, false);
        this.navHotspot.addEventListener('mouseleave', () => {
            this._isCursorOverNavMenu = false;
        }, false);

        // Close the nav menu when clicking outside of the hotspot (mobile only).
        window.addEventListener('click', () => {
            if (!this._isCursorOverNavMenu && hasSmallScreen()) {
                this.closeNavMenu(contentContainer, scrollManager, true);
            }
        }, false);

        // Move the marker to the current nav item on scrolling the nav list.
        const updateMarker = () => {
            for (const navItem of this.navItems) {
                if (navItem.classList.contains('focus')) {
                    this.moveNavMarker(navItem);
                    break;
                }
            }
        };
        navContainer.addEventListener('scroll', updateMarker, false);

        // Hide the nav menu initially on mobile.
        if (hasSmallScreen()) {
            this.closeNavMenu(contentContainer, scrollManager, false);
        }
    }

    /**
     * @description Toggles navigation menu visibility.
     * Main content is hidden while the menu is open (mobile only).
     * @param {Element} contentContainer - Used to hide content while menu is open.
     * @param {ScrollManager} scrollManager - Manager for scrolling behaviour. Provide if using fade.
     * @param {boolean} fade - Should a fade transition be used?
     */
    this.toggleNavMenu = function (contentContainer, scrollManager = undefined, fade = false) {
        if (this.navContainer.classList.contains('open')) {
            this.closeNavMenu(contentContainer, scrollManager, fade);
        } else {
            this.openNavMenu(contentContainer, scrollManager, fade);
        }
    }

    /**
     * @description Makes the navigation menu visible.
     * Main content is hidden while the menu is open (mobile only).
     * @param {Element} contentContainer - Used to hide content while menu is open.
     * @param {ScrollManager} scrollManager - Manager for scrolling behaviour. Provide if using fade.
     * @param {boolean} fade - Should a fade transition be used?
     */
    this.openNavMenu = function (contentContainer, scrollManager = undefined, fade = false) {
        const mobile = hasSmallScreen();

        // Show nav menu.
        this.navContainer.classList.add('open');
        this.navContainer.classList.remove('hidden');
        if (fade) {
            this.navContainer.classList.add('fade');
        }

        // Hide content.
        contentContainer.classList.remove('open');
        contentContainer.classList.remove('hidden');
        if (fade && mobile) {
            contentContainer.classList.add('fade');
        }

        // Prevent page scrolling while menu open (mobile only).
        if (mobile) {
            this.body.classList.add('disable-scroll');
        }

        // Hide invisible elements once fade-outs are complete.
        if (fade) {
            this.handleFadeEnd(contentContainer, scrollManager);
        }

        // Hide the menu after a while of inactivity.
        this.resetInactivityTimer(contentContainer, scrollManager);

        // Toggle menu button.
        this.navToggle.classList.add('nav-toggle--toggled');
        this.navToggle.classList.remove('fade--slow');
    }

    /**
     * @description Makes the navigation menu hidden.
     * Main content is made visible as menu closes (mobile only).
     * @param {Element} contentContainer - Used to make content visible as menu closes.
     * @param {ScrollManager} scrollManager - Manager for scrolling behaviour. Provide if using fade.
     * @param {boolean} fade - Should a fade transition be used?
     * @param {boolean} slowFade - If true we use a slow fade transition. Default is false.
     */
    this.closeNavMenu = function (contentContainer, scrollManager = undefined, fade = false, slowFade = false) {
        const mobile = hasSmallScreen();

        // Hide nav menu.
        this.navContainer.classList.remove('open');
        if (fade) {
            this.navContainer.classList.remove('hidden');
            this.navContainer.classList.add('fade');
            if (slowFade) {
                this.navContainer.classList.add('fade--slow');
            }
        } else {
            this.navContainer.classList.add('hidden');
        }

        // Show content.
        contentContainer.classList.add('open');
        contentContainer.classList.remove('hidden');
        if (fade && mobile) {
            contentContainer.classList.add('fade');
        }

        // Re-enable page scrolling.
        this.body.classList.remove('disable-scroll');

        // Hide invisible elements once fade-outs are complete.
        if (fade) {
            this.handleFadeEnd(contentContainer, scrollManager);
        }

        // Untoggle menu button.
        this.navToggle.classList.remove('nav-toggle--toggled');
        if (fade && slowFade) {
            this.navToggle.classList.add('fade--slow');
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
    }

    /**
     * @description Handles fade end behaviour.
     * Disables interaction with nav menu and main content when they are invisible.
     * @param {Element} contentContainer The main content.
     * @param {ScrollManager} scrollManager - Manager for scrolling behaviour.
     */
    this.handleFadeEnd = function (contentContainer, scrollManager) {
        window.clearTimeout(this._fadeTimeoutId);
        this._fadeTimeoutId = window.setTimeout(() => {
            onNavTransitionEnd(this.navContainer);
            onContentTransitionEnd(contentContainer);
        }, scrollManager.defaultDuration);
    }

    /**
     * @description Reset timer which monitors how long the user has not interacted with the navigation menu (or scrolled).
     * Closes the navigation menu after a while of inactivity.
     * @param {Element} contentContainer The main content. Use for transitions on mobile.
     * @param {ScrollManager} scrollManager - Manager for scrolling behaviour.
     */
    this.resetInactivityTimer = function (contentContainer, scrollManager) {
        window.clearTimeout(this._inactivityTimerId);
        if (this.inactivityTimeout !== 0) {
            const onTimeout = () => {

                // Reset timer if the cursor is over the menu, otherwise close the menu.
                if (!hasSmallScreen()) {
                    if (this._isCursorOverNavMenu) {
                        this._inactivityTimerId = window.setTimeout(onTimeout, this.inactivityTimeout);
                    } else {
                        this.closeNavMenu(contentContainer, scrollManager, true, true);
                    }
                }
            };
            this._inactivityTimerId = window.setTimeout(onTimeout, this.inactivityTimeout);
        }
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
 * The background gradient effect changes to match the focused section.
 * @param {string} section - Section to focus on.
 * @param {Element} contentContainer - Container for content.
 * @param {Element[]} contentSections - List of all content sections.
 * @param {Navigation} nav - Navigation menu.
 * @param {Element} body - HTML body element.
 * @param {ScrollManager} scrollManager - Manager for scrolling behaviour. Provide if using transitions.
 * @param {boolean} useTransitions - Should transitions be used? Default true.
 */
function focusSection(section, contentContainer, contentSections, nav, body,
        scrollManager = undefined, useTransitions = true) {

    // Remove focus from all sections except for the current one.
    for (const s of contentSections) {
        if (s.id === section.id) {
            s.classList.add('focus');
        } else {
            s.classList.remove('focus');
        }
    }

    // Remove focus from all nav items except for the current one.
    for (const item of nav.navItems) {
        if (item.dataset.sectionId === section.id) {
            item.classList.add('focus');
        } else {
            item.classList.remove('focus');
        }
    }

    // Close the nav menu if on mobile.
    if (hasSmallScreen()) {
        nav.closeNavMenu(contentContainer, scrollManager, useTransitions);
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
 * @description Updates rotation effects on sections. *
 * The focused section faces the view.
 * Sections above the view rotate counter-clockwise.
 * Sections below the view rotate clockwise.
 * @param {Element} sectionInView - The section currently in view.
 * @param {Element[]} contentSections - List of all content sections.
 * @param {ScrollManager} scrollManager - Manager for scrolling behaviour.
 */
function updateRotationEffects(sectionInFocus, contentSections, scrollManager) {
    for (const section of contentSections) {
        const element = document.querySelector(`#${section.id} .rotates`);
        if (section.id === sectionInFocus.id) {

            // Face the view.
            element.classList.remove('rotate-cw');
            element.classList.remove('rotate-ccw');
        } else {

            // Rotation direction is based on section position relative to window center.
            const windowYCenter = window.innerHeight / 2;
            const { y, height } = section.getBoundingClientRect();
            const yCenter = y + height / 2;

            if (windowYCenter < yCenter) {
                element.classList.add('rotate-ccw');
            } else {
                element.classList.add('rotate-cw');
            }
        }
    }
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {

    // Set up scroll manager.
    const scrollDuration = secondsToMs(
        getComputedStyle(document.documentElement).getPropertyValue('--section-transition-time'));
    const scrollManager = new ScrollManager(scrollDuration);

    // Set up navigation menu.
    const navContainer = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navMarker = document.getElementById('nav-marker');
    const navHotspot = document.getElementById('site-header');
    const body = document.querySelector('body');
    const nav = new Navigation(navContainer, navToggle, navMarker, navHotspot, body, 0);

    // Build navigation from content.
    const contentContainer = document.getElementById('content');
    const contentSections = document.querySelectorAll('#content > .section');
    nav.buildNavigation(contentContainer, contentSections, scrollManager);

    // Focus on the section in view on page scroll.
    const onScroll = () => {

        // Open the nav menu on scroll (large screens only).
        // Do not use an inactivity timeout initially on page load.
        if (!hasSmallScreen()) {
            nav.openNavMenu(contentContainer, scrollManager, true);
        }

        // Determine which section is currently in view.
        const sectionInView = getSectionInView(contentSections);

        // Focus on the section currently in view, as long as the view was scrolled by user input (or the browser),
        // rather than being animated by the scroll manager.
        if (!scrollManager.triggeredScrollEvent) {

            // Interrupt any previous scrolling on user input.
            scrollManager.interruptScroll();

            focusSection(sectionInView, contentContainer, contentSections, nav, body, scrollManager, true);
        }
        scrollManager.triggeredScrollEvent = false;

        // Update section rotation effects.
        updateRotationEffects(sectionInView, contentSections, scrollManager);
    };
    window.addEventListener('scroll', onScroll, false);

    // Initially focus on section in view and open the nav menu on large screens.
    const sectionInView = getSectionInView(contentSections);
    focusSection(sectionInView, contentContainer, contentSections, nav, body, scrollManager, false);
    if (!hasSmallScreen()) {
        nav.openNavMenu(contentContainer, scrollManager, false);
    }

    // Enable inactivity timeout on scroll after a short time.
    const INACTIVITY_TIMEOUT = 1000;
    window.setTimeout(() => {
        nav.inactivityTimeout = INACTIVITY_TIMEOUT;
    }, 500);
}

pageSetup();