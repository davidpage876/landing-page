# Landing Page by David Page

Hosted at https://davidpage876.github.io/landing-page/

This project demonstrates my learning efforts in using JavaScript to manipulate the DOM and achieve complex dynamic effects.

All HTML, CSS and JS code was written by me, except where noted. Where relevant I cited the original source for code derived from elsewhere.

## Features

My project implements some ambitious (and somewhat experimental) special effects and user interaction features. These include:

### Content

* Dynamic gradient background that changes on section change.
* 3D rotation effect for content on section change.
* Automatically detects which section is in view and updates the navigation menu and section appearance accordingly.

### Navigation

* Dynamically filled based on content.
* The currently selected navigation item is indicated by an animated marker (as well as expanding that nav item).
* Clicking a navigation item scrolls to the section smoothly over time (supports custom scroll time).
* After a short delay the nav menu automatically hides itself.

### Responsiveness

* All functionality works across desktop, tablet and mobile screens.
* On mobile, navigation menu is hidden by default.
* On mobile, opening the navigation menu causes a crossfade between content and the menu, while keeping the background visible.
* Where the nav menu overflows the user is able to scroll it.

## Known Issues

Note that I only support modern browsers. Specifically, my JavaScript functionality is not supported on IE.

The website has not been tested on iOS browsers (I do not have access to them).

## Design Review

For reference my initial design mockup animatic can be seen below. Most effects have been replicated closely, except for the "dot grid" effect, which I discarded.

[Project 2 - Landing Page - Mockup.mp4](media/project2-landing-page-mockup.mp4) (1.29MB)

## Conclusion

Thanks for reading.