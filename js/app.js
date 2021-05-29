/* Note: Does not support Internet Explorer. */


/**
 * @description Makes the given section in focus.
 * The section in focus has the class 'focus' added to it.
 * 'focus' is also added to the associated navigation list item.
 * All other sections and navigation items lose focus.
 * @param {string} sectionId - ID of the section to focus on.
 * @param {Element[]} contentSections - List of all content sections.
 * @param {Element[]} navItems - List of navigation items.
 * @param {Element} navContainer - Container for navigation items.
 * @param {Element} navMarker - Marker indicating current nav item.
 */
function focusSection(sectionId, contentSections, navItems, navContainer, navMarker) {

    // Remove focus from all sections.
    for (const section of contentSections) {
        section.classList.remove('focus');
    }

    // Remove focus from all nav items.
    for (const item of navItems) {
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
    const navItem = Array.from(navItems).find(function (item) {
        return item.dataset.sectionId === sectionId;
    });
    if (navItem) {
        navItem.classList.add('focus');
    }
}

/**
 * @description Positions the navigation marker to point to a navigation item.
 * @param {Element} navMarker - Marker used to indicate current nav item.
 * @param {Element} navContainer - Container for navigation items.
 * @param {Element} navItem - Navigation item the marker points to.
 */
function moveNavMarker(navMarker, navContainer, navItem) {
    const containerY = navContainer.getBoundingClientRect().y;
    const {y: itemY, height: itemHeight} = navItem.getBoundingClientRect();
    const markerHeight = navMarker.getBoundingClientRect().height;

    const markerY = itemY - containerY + itemHeight / 2 - markerHeight / 2;
    navMarker.style.top = `${markerY}px`;
    console.log(`containerY:${containerY} itemY:${itemY} itemHeight:${itemHeight} markerHeight:${markerHeight} markerY:${markerY}`);
}

/**
 * @description Build navigation list items based on given content.
 * @param {Element[]} contentSections - Build navigation based on this list of content sections.
 * @param {Element} navContainer - Created navigation list items are added as children to this container.
 * @param {Element} navMarker - Marker indicating current nav item.
 * @param {Element} navToggle - Button to toggle nav menu.
 * @returns {Element[]} - Returns the newly created navigation items.
 */
function buildNavigation(contentSections, navContainer, navMarker, navToggle) {

    // Build nav list.
    const navItems = [];
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
        const addedItem = navContainer.appendChild(navItem);
        navItems.push(addedItem);
    }

    // Add event handlers to nav list items.
    for (const navItem of navItems) {

        // When nav item clicked focus on the corresponding section.
        const onSectionClick = focusSection.bind(null,
            navItem.dataset.sectionId, contentSections, navItems, navContainer, navMarker);
        navItem.addEventListener('click', onSectionClick, false);

        // On transition end move the nav marker to the focused nav item.
        const onTransitionEnd = function (marker, container, item) {
            if (item.classList.contains('focus')) {
                moveNavMarker(marker, container, item);
            }
        }.bind(null, navMarker, navContainer, navItem);
        navItem.addEventListener('transitionend', onTransitionEnd, false);
    }

    // Toggle navigation on menu button click.
    navToggle.addEventListener('click', function onToggleClick() {
        navContainer.classList.toggle('hidden');
    }, false);

    // Return created nav list.
    return navItems;
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {

    // Build navigation.
    const navContainer = document.getElementById('nav-menu');
    const navMarker = document.getElementById('nav-marker');
    const contentSections = document.querySelectorAll('#content > .section');
    const navToggle = document.getElementById('nav-toggle');
    const navItems = buildNavigation(contentSections, navContainer, navMarker, navToggle);

    // Focus on the first section initially.
    if (contentSections.length > 0) {
        focusSection(contentSections[0].id, contentSections, navItems, navContainer, navMarker);
    }
}

pageSetup();