/* Note: Does not support Internet Explorer. */


/**
 * @description Makes the given section in focus.
 * The section in focus has the class 'focus' added to it.
 * 'focus' is also added to the associated navigation list item.
 * All other sections and navigation items lose focus.
 * @param {string} sectionId - ID of the section to focus on.
 * @param {Element[]} contentSections - List of all content sections.
 * @param {Element[]} navItems - List of navigation items.
 */
function focusSection(sectionId, contentSections, navItems) {

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
 * @description Build navigation list items based on given content.
 * @param {Element[]} contentSections - Build navigation based on this list of content sections.
 * @param {Element} navContainer - Created navigation list items are added as children to this container.
 * @returns {Element[]} - Returns the newly created navigation items.
 */
function buildNavigation(contentSections, navContainer) {

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
        const focusOnSection = focusSection.bind(null, navItem.dataset.sectionId, contentSections, navItems);
        navItem.addEventListener('click', focusOnSection, false);
    }

    // Return created nav list.
    return navItems;
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {

    // Build navigation.
    const navContainer = document.querySelector('#nav-menu');
    const contentSections = document.querySelectorAll('#content > .section');
    const navItems = buildNavigation(contentSections, navContainer);

    // Focus on the first section initially.
    if (contentSections.length > 0) {
        focusSection(contentSections[0].id, contentSections, navItems);
    }
}

pageSetup();