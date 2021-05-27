
/**
 * @description Build navigation list items based on given content.
 * @param {string} contentSelector - Look for children inside the container with this CSS selector.
 * @param {string} contentChildSelector - Look for child elements with this CSS selector inside the contentSelector container.
 * @param {Element} navContainer - Created navigation list items are added as children to this container.
 */
function buildNavigation(contentSelector, contentChildSelector, navContainer) {
    const sections = document.querySelectorAll(`${contentSelector} > ${contentChildSelector}`);

    for (section of sections) {

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
        navContainer.appendChild(navItem);
    }
}

/**
 * @description Perform initial page set up, including building the navigation menu from content.
 */
function pageSetup() {
    const navContainer = document.querySelector('#nav-menu');

    buildNavigation('#content', '.section', navContainer);
}

pageSetup();