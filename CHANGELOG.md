# Changelog

### 4.2.3

* Add: React example in README.md
* Change: Move changelog to separate file to make README.md more compact
* Fix: ThumbnailPlugin not setting first item active when navigatin back to it when thumbnails are not overflowing
* Fix: moving slider to keyboard focused item work better with slide's inner focusable elements

### 4.2.2

* Add: `justify-content: flex-start` to overflow-slider base styles to prevent centering of slides or other unexpected behavior when slider container is wider than its content.

### 4.2.1

* Fix: currentPage and amountOfPages not being calculated correctly with FullWidthPlugin causin last page no to activate properly.

### 4.2.0

* Add: View mode in DotsPlugin in addition to previous "slide mode"
* Fix: Remove forgotten console.log from ClassNamesPlugin

### 4.1.0

* Add: ClassNamesPlugin to add classes to visible/partly visible/hidden slides.
* Add: targetWidth property to core level (backwards compatible with FullWidthPlugin implementation)
* Fix: Scroll snapping for FullWidthPlugin
* Fix: Possible issues where plugin changed some details and that was not applied for first render
* Fix: Rendering issue where transition on slides could prevent calculations initially from working

### 4.0.0

* Add: AutoPlayPlugin to allow auto-playing slides
* Add: Mixins that can be imported to SCSS projects
* Add: CSS variable: `--slider-container-height`
* Add: CSS variable: `--slider-x-offset`
* Add: Option `cssVariableContainer` to expose CSS variables for example higher container
* Add: `canMoveToSlide` method to check if slider can move to a specific slide (does it exist, is it already in view)
* Add: `targetWidth` to slider options as relying on `--slider-container-target-width` can be more solid to calculate fractional slide widths on (at least when there is only few slides)
* Fix: Export TypeScript types properly from core and plugins to be available automatically
* Fix: ScrollIndicatorPlugin click to scroll bar didn't always detect click position correctly
* Fix: snapToClosestSlide method edge cases on DragScrollingPlugin sometimes not snapping on right slide

### 3.3.1

* Fix: FullWidthPlugin margin calculation not being run if there's too few slides for overflow and you resize screen without container width changing

### 3.3.0

* Add: Ability to move each direction by one slide at a time via `moveToSlideInDirection` prev/next
* Add: Support for ArrowsPlugin to move by one slide at a time (default is still one view at a time)
* Fix: Remove console logs
* Refactor: Plugin build paths to match import paths. Might fix some eslint warnings. If you are not using import but directly referencing the plugin files under `dist/` you might need to update your paths.

### 3.2.1

* Add: Documentation on plugins
* Fix: Make types more strict and remove all "any" types

### 3.2.0

* Add: RTL support
* Add: `--slider-container-target-width` for FullWidthPlugin to allow CSS based on target size
* Add: Documentation how to set slides per view in CSS
* Fix: Attach ThumbnailsPlugin to scrollEnd which skips in-between slides when multiple slides are scrolled at once

### 3.1.0

* Add: slider.getInclusiveScrollWidth and slider.getInclusiveScrollHeight methods to get widths including outermost childs outermost margins
* Fix: Lot of bugs related to subpixel widths
* Fix: Don't run arrow click action if there are no more slides to scroll to
* Fix: FullWidthPlugin bugs where arrows were not detecting start or end properly (because of child margins not taken into account)
* Fix: Attach ThumbnailsPlugin to activeSlideChanged which is more appropriate hook

### 3.0.0

* Breaking: Change dot plugin to calculate dots based on slides instead of container width "pages"
* Add: FadePlugin to hint that there are more slides to scroll to
* Add: Scroll snap emulation method
* Add: Scroll snap emulation for DragScrollingPlugin
* Add: Hooks for different types of scrolling (any, native, programmatic)
* Add: Hooks for different states of scrolling (start, scroll, end) for above types
* Refactor: Scroll snapping exceptions to be handled by the core slider
* Fix: Enhance performance by hooking some plugins only when scrolling has ended
* Fix: Full width alignment to take into account the container offset

### 2.0.2

* Fix: Import style.css from correct path

### 2.0.1

* Fix: Smooth scrolling for moveToSlide method
* Fix: Prev arrow sometimes leaving visible although there are no more slides to scroll to

### 2.0.0

* Breaking: Separate plugins to their own imports/files
* Add: FullWidthPlugin to allow full width sliders
* Add: ThumbnailsPlugin to show synchronized thumbnails
* Add: Slider container 'data-ready' attribute when initialized to help writing CSS
* Add: Support for optional separate containers for prev and next arrows
* Add: Slides as array to Slider instance
* Add: Active slide ID to Slider instance as activeSlideIdx and hook activeSlideChanged
* Fix: DragScrollingPlugin dragging clickable slides in Firefox
* Fix: DragScrollingPlugin dragging outside of container bugs in Firefox/Safari
* Fix: ScrollIndicatorPlugin width calculation when scrollbar and container are not same width

### 1.1.0

* Add: Grab cursor when hovering slider that has DragScrollingPlugin
* Add: Example of using entrance and exit animations for slides
* Fix: ScrollIndicatorPlugin dragging works now with touch
* Fix: Hide native scrollbar also in Firefox + Edge
* Docs: Add more info on required markup and limitations

