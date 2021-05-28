
/**
 * @description Describes navigation list elements.
 * @constructor
 * @param {Element} container - Navigation list container.
 * @param {Element[]} items - Navigation list items.
 */
function Navigation(container, items) {
    this.container = container;
    this.items = items;
}

/**
 * @description Build navigation list items based on given content.
 * @param {Element[]} contentSections - Build navigation based on this list of content sections.
 * @param {Element} navContainer - Created navigation list items are added as children to this container.
 * @returns {Navigation} Returns the newly created navigation list data.
 */
function buildNavigation(contentSections, navContainer) {
    const items = [];
    for (const section of contentSections) {

        // Create nav li.
        const navItem = document.createElement('LI');
        navItem.classList.add('nav-menu__item');

        // Create nav li a.
        const navAnchor = document.createElement('A');
        const sectionName = section.dataset.nav;
        const sectionId = section.id;

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
}

pageSetup();