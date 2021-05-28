
/**
 * @description Makes the given section in focus.
 * This triggers CSS state to highlight the section in the focus.
 * @param {Element} section - Section to focus on.
 * @param {Element[]} contentSections - List of all content sections.
 * Used to remove focus from other sections.
 * @param {Navigation} navigation - Navigation list to update to match.
 */
function focusSection(section, contentSections, navigation) {

    // Remove focus from all sections.
    for (const s of contentSections) {
        s.classList.remove('focus');
    }

    // Remove focus from all nav items.
    for (const item of navigation.items) {
        item.classList.remove('focus');
    }

    // Focus on the section.
    section.classList.add('focus');

    // Focus on nav item.
    const navItem = navigation.getItem(section.id);
    navItem.classList.add('focus');
}

/**
 * @description Describes navigation list elements.
 * @constructor
 * @param {Element} container - Navigation list container.
 * @param {Element[]} items - Navigation list items.
 */
function Navigation(container, items) {
    this.container = container;
    this.items = items;

    /** Retrieves a navigation item by section ID.
     *
     * @param {string} sectionId - ID of the section.
     * @returns {element} - Navigation item with ID matching the section ID.
     */
    this.getItem = function(sectionId) {
        for (const item of items) {
            if (item.id === sectionId) {
                return item;
            }
        }
    };
}

/**
 * @description Build navigation list items based on given content.
 * @param {Element[]} contentSections - Build navigation based on this list of content sections.
 * @param {Element} navContainer - Created navigation list items are added as children to this container.
 * @returns {Navigation} - Returns the newly created navigation list data.
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
    return new Navigation(navContainer, items);
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {

    // Build navigation.
    const navContainer = document.querySelector('#nav-menu');
    const contentSections = document.querySelectorAll('#content > .section');

    const nav = buildNavigation(contentSections, navContainer);

    // Focus on the first section initially.
    if (contentSections.length > 0) {
        focusSection(contentSections[0], contentSections, nav);
    }
}

pageSetup();