
/**
 * @description Returns the element in elementList with the given ID.
 * @param {Element[]} elementList List of elements.
 * @param {string} id Element ID to search for.
 * @returns The element if found, null if not found.
 */
function getElementWithId(elementList, id) {
    for (const element of elementList) {
        if (element.id === id) {
            return element;
        }
    }
    return null;
}

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

    // Focus on the section.
    const section = getElementWithId(contentSections, sectionId);
    if (section) {
        section.classList.add('focus');
    }

    // Focus on nav item.
    const navItem = getElementWithId(navItems, sectionId);
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
    const items = [];
    for (const section of contentSections) {

        // Create nav li.
        const navItem = document.createElement('LI');
        const sectionId = section.id;

        navItem.classList.add('nav-menu__item');
        navItem.id = sectionId;

        // Create nav li a.
        const navAnchor = document.createElement('A');
        const sectionName = section.dataset.nav;

        navAnchor.classList.add('nav-link');
        navAnchor.textContent = `${sectionName}`;
        navAnchor.setAttribute('href', `#${sectionId}`);
        navItem.appendChild(navAnchor);

        // Append nav li to container.
        const addedItem = navContainer.appendChild(navItem);
        items.push(addedItem);
    }
    return items;
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