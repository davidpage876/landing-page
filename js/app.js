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

// ScrollManager functionality below is based on code by Rafael Marini Rôlo (username ℛɑƒæĿᴿᴹᴿ) (2021),
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
 */
function Navigation(navContainer, navToggle, navMarker, navHotspot, body) {
    this.navContainer = navContainer;
    this.navToggle = navToggle;
    this.navMarker = navMarker;
    this.navHotspot = navHotspot;
    this.body = body;
    this.navItems = [];
    this._onNavTransitionEnd = null;
    this._onContentTransitionEnd = null;
    this._timeOutId = null;
    this._isCursorOverNavMenu = true;

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
                    focusSection(section, contentContainer, contentSections, this, this.body, true, true);
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

        // Monitor if mouse is over the nav menu hotspot.
        this.navHotspot.addEventListener('mouseover', () => {
            this._isCursorOverNavMenu = true;
        }, false);
        this.navHotspot.addEventListener('mouseleave', () => {
            this._isCursorOverNavMenu = false;
        }, false);

        // Close the nav menu when clicking outside of the hotspot.
        window.addEventListener('click', () => {
            if (!this._isCursorOverNavMenu) {
                this.closeNavMenu(contentContainer, true);
            }
        }, false);

        // Hide the nav menu initially on mobile.
        if (hasSmallScreen()) {
            this.closeNavMenu(contentContainer, false);
        }

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
            this.handleTransitionEnd(contentContainer);
        }

        // Hide the menu after a while of inactivity.
        this.resetTimeout(contentContainer);

        // Toggle menu button and remove highlighting effect.
        this.navToggle.classList.add('nav-toggle--toggled');
        this.navToggle.classList.remove('nav-toggle--highlight');
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
        if (fade) {
            this.navContainer.classList.remove('hidden');
            this.navContainer.classList.add('fade');
        } else {
            this.navContainer.classList.add('hidden');
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
            this.handleTransitionEnd(contentContainer);
        }

        // Untoggle menu button and add highlighting effect.
        this.navToggle.classList.remove('nav-toggle--toggled');
        this.navToggle.classList.add('nav-toggle--highlight');
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
     * @description Handles transition end behaviour.
     * Prevents interaction with nav menu and main content when they are invisible.
     * @param {Element} contentContainer The main content.
     */
    this.handleTransitionEnd = function (contentContainer) {
        this.navContainer.removeEventListener('transitionend', this._onNavTransitionEnd, false);
        this._onNavTransitionEnd = onNavTransitionEnd.bind(null, this.navContainer);
        this.navContainer.addEventListener('transitionend', this._onNavTransitionEnd, false);

        contentContainer.removeEventListener('transitionend', this._onContentTransitionEnd, false);
        this._onContentTransitionEnd = onContentTransitionEnd.bind(null, contentContainer);
        contentContainer.addEventListener('transitionend', this._onContentTransitionEnd, false);
    }

    /**
     * @description Reset timeout timer to the initial time.
     * @param {Element} contentContainer The main content. Use for transitions on mobile.
     */
    this.resetTimeout = function (contentContainer) {
        const TIMEOUT_TIME = 1000;

        window.clearTimeout(this._timeOutId);
        const onTimeout = () => {

            // Reset timer if the cursor is over the menu, otherwise close the menu.
            if (!hasSmallScreen()) {
                if (this._isCursorOverNavMenu) {
                    this._timeOutId = window.setTimeout(onTimeout, TIMEOUT_TIME);
                } else {
                    this.navContainer.classList.add('fade--slow');
                    this.closeNavMenu(contentContainer, true);
                }
            }
        };
        this._timeOutId = window.setTimeout(onTimeout, TIMEOUT_TIME);
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
 * @param {boolean} useTransitions - Should transitions be used? Default true.
 * @param {boolean} delayRotation - Should we delay removing the rotation effect from the focused section? Default false.
 */
function focusSection(section, contentContainer, contentSections, nav, body, useTransitions = true, delayRotation = false) {

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

    // Trigger rotation effect.
    // Sections in focus face the view, sections above rotate counter-clockwise and sections below rotate clockwise.
    const scrollDuration = secondsToMs(
        getComputedStyle(document.documentElement).getPropertyValue('--section-transition-time'));
    const rotationDelay = scrollDuration / 2;

    const removeRotation = function (r, timeoutId = undefined) {
        r.classList.remove('rotate-cw');
        r.classList.remove('rotate-ccw');
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    };

    for (const s of contentSections) {
        const r = document.querySelector(`#${s.id} .rotates`);
        if (s.id === section.id) {

            // Delay removing rotation on the focused section.
            if (delayRotation) {
                let timeoutId = undefined;
                timeoutId = setTimeout(removeRotation.bind(null, r, timeoutId), rotationDelay);
            } else {
                removeRotation(r);
            }
        } else {

            // Rotation direction based on section position relative to window center.
            const windowYCenter = window.innerHeight / 2;
            const { y, height } = s.getBoundingClientRect();
            const yCenter = y + height / 2;

            if (windowYCenter < yCenter) {
                r.classList.add('rotate-ccw');
            } else {
                r.classList.add('rotate-cw');
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
    const nav = new Navigation(navContainer, navToggle, navMarker, navHotspot, body);

    // Build navigation from content.
    const contentContainer = document.getElementById('content');
    const contentSections = document.querySelectorAll('#content > .section');
    nav.buildNavigation(contentContainer, contentSections, scrollManager);

    // Open the nav menu to start with.
    nav.openNavMenu(contentContainer, true);

    // Handle scroll event, focusing on the section in view.
    let sectionInView = undefined;
    window.addEventListener('scroll', () => {

        // Open the nav menu on scroll (large screens only).
        if (!hasSmallScreen()) {
            nav.openNavMenu(contentContainer, true);
        }

        // Determine which section is currently in view.
        // If the section changed, focus on it.
        const WITHIN_SCREEN_PERCENT = 0.5; // 50%
        for (const section of contentSections) {
            if (isSectionInView(section, WITHIN_SCREEN_PERCENT)) {
                sectionInView = section;

                // Only focus on the section if the view was scrolled by user input (or the browser),
                // rather than being controlled the scroll manager.
                if (!scrollManager.triggeredScrollEvent) {
                    focusSection(sectionInView, contentContainer, contentSections, nav, body, true);
                }
                scrollManager.triggeredScrollEvent = false;
                break;
            }
        }
    }, false);

    // Initially focus on first section.
    focusSection(contentSections[0], contentContainer, contentSections, nav, body, false);
}

pageSetup();