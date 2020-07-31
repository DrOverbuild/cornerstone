import _ from 'lodash';
import mediaQueryListFactory from './media-query-list';

const PLUGIN_KEY = 'collapsible';

export const CollapsibleEvents = {
    open: 'open.collapsible',
    close: 'close.collapsible',
    toggle: 'toggle.collapsible',
    click: 'click.collapsible',
    mouseenter: 'mouseenter.collapsible',
    mouseleave: 'mouseleave.collapsible',
};

const CollapsibleState = {
    closed: 'closed',
    open: 'open',
};

function prependHash(id) {
    if (id && id.indexOf('#') === 0) {
        return id;
    }

    return `#${id}`;
}

function optionsFromData($element) {
    return {
        disabledBreakpoint: $element.data(`${PLUGIN_KEY}DisabledBreakpoint`),
        disabledState: $element.data(`${PLUGIN_KEY}DisabledState`),
        enabledState: $element.data(`${PLUGIN_KEY}EnabledState`),
        openClassName: $element.data(`${PLUGIN_KEY}OpenClassName`),
        hover: $element.data(`${PLUGIN_KEY}Hover`),
    };
}

/**
 * Collapse/Expand toggle
 */
export class Collapsible {
    /**
     * @param {jQuery} $toggle - Trigger button
     * @param {jQuery} $target - Content to collapse / expand
     * @param {Object} [options] - Configurable options
     * @param {Object} [options.$context]
     * @param {Object} [options.disabledBreakpoint]
     * @param {Object} [options.disabledState]
     * @param {Object} [options.enabledState]
     * @param {Object} [options.openClassName]
     * @param {boolean} [options.hover]
     * @param {string} [options.hoverBreakpoint] - Converts to hoverable if screen size is equal to or greater
     *        than this breakpoint
     * @example
     *
     * <button id="#more">Collapse</button>
     * <div id="content">...</div>
     *
     * new Collapsible($('#more'), $('#content'));
     */
    constructor($toggle, $target, {
        disabledBreakpoint,
        disabledState,
        enabledState,
        openClassName = 'is-open',
        hover = false,
        hoverBreakpoint,
    } = {}) {
        this.$toggle = $toggle;
        this.$target = $target;
        this.targetId = $target.attr('id');
        this.openClassName = openClassName;
        this.disabledState = disabledState;
        this.enabledState = enabledState;
        this.hover = hover;
        this.hoverBreakpoint = hoverBreakpoint;

        if (disabledBreakpoint) {
            this.disabledMediaQueryList = mediaQueryListFactory(disabledBreakpoint);
        }

        if (this.disabledMediaQueryList) {
            this.disabled = this.disabledMediaQueryList.matches;
        } else {
            this.disabled = false;
        }

        if (this.hoverBreakpoint) {
            this.hoverMediaQueryList = mediaQueryListFactory(this.hoverBreakpoint);

            this.hover = this.hoverMediaQueryList.matches;
        }

        // Auto-bind
        this.bindToggleEvents = this.bindToggleEvents.bind(this);
        this.unbindToggleEvents = this.unbindToggleEvents.bind(this);
        this.onClicked = this.onClicked.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onDisabledMediaQueryListMatch = this.onDisabledMediaQueryListMatch.bind(this);
        this.onHoverMediaQueryListMatch = this.onHoverMediaQueryListMatch.bind(this);

        // Assign DOM attributes
        this.$target.attr('aria-hidden', this.isCollapsed);
        this.$toggle
            .attr('aria-controls', $target.attr('id'))
            .attr('aria-expanded', this.isOpen);

        // Listen
        this.bindEvents();
    }

    get isCollapsed() {
        return !this.$target.hasClass(this.openClassName) || this.$target.is(':hidden');
    }

    get isOpen() {
        return !this.isCollapsed;
    }

    set disabled(disabled) {
        this._disabled = disabled;

        if (disabled) {
            this.toggleByState(this.disabledState);
        } else {
            this.toggleByState(this.enabledState);
        }
    }

    get disabled() {
        return this._disabled;
    }

    open({ notify = true } = {}) {
        this.$toggle
            .addClass(this.openClassName)
            .attr('aria-expanded', true);

        this.$target
            .addClass(this.openClassName)
            .attr('aria-hidden', false);

        if (notify) {
            this.$toggle.trigger(CollapsibleEvents.open, [this]);
            this.$toggle.trigger(CollapsibleEvents.toggle, [this]);
        }
    }

    close({ notify = true } = {}) {
        this.$toggle
            .removeClass(this.openClassName)
            .attr('aria-expanded', false);

        this.$target
            .removeClass(this.openClassName)
            .attr('aria-hidden', true);

        if (notify) {
            this.$toggle.trigger(CollapsibleEvents.close, [this]);
            this.$toggle.trigger(CollapsibleEvents.toggle, [this]);
        }
    }

    toggle() {
        if (this.isCollapsed) {
            this.open();
        } else {
            this.close();
        }
    }

    toggleByState(state, ...args) {
        switch (state) {
        case CollapsibleState.open:
            return this.open.apply(this, args);

        case CollapsibleState.closed:
            return this.close.apply(this, args);

        default:
            return undefined;
        }
    }

    hasCollapsible(collapsibleInstance) {
        return $.contains(this.$target.get(0), collapsibleInstance.$target.get(0));
    }

    bindEvents() {
       this.bindToggleEvents();

        if (this.disabledMediaQueryList && this.disabledMediaQueryList.addListener) {
            this.disabledMediaQueryList.addListener(this.onDisabledMediaQueryListMatch);
        }

        if (this.hoverMediaQueryList && this.hoverMediaQueryList.addListener) {
            this.hoverMediaQueryList.addListener(this.onHoverMediaQueryListMatch);
        }
    }

    unbindEvents() {
        this.unbindToggleEvents();

        if (this.disabledMediaQueryList && this.disabledMediaQueryList.removeListener) {
            this.disabledMediaQueryList.removeListener(this.onDisabledMediaQueryListMatch);
        }

        if (this.hoverMediaQueryList && this.hoverMediaQueryList.removeListener()) {
            this.hoverMediaQueryList.removeListener(this.onHoverMediaQueryListMatch);
        }
    }

    bindToggleEvents() {
        if (this.hover) {
            this.$toggle.on(CollapsibleEvents.mouseenter, this.onMouseEnter);
            this.$toggle.on(CollapsibleEvents.mouseleave, this.onMouseLeave);
        } else {
            this.$toggle.on(CollapsibleEvents.click, this.onClicked);
        }
    }

    unbindToggleEvents() {
        this.$toggle.off(CollapsibleEvents.click, this.onClicked);
        this.$toggle.off(CollapsibleEvents.mouseenter, this.onMouseEnter);
        this.$toggle.off(CollapsibleEvents.mouseleave, this.onMouseLeave);
    }

    onClicked(event) {
        // sometimes $target is nested inside of $toggle and when this happens we don't do anything
        if (event.target.id == this.$target.attr('id') || $(event.target).parents(`#${this.$target.attr('id')}`).length) {
            return;
        }

        if (this.disabled) {
            return;
        }

        event.preventDefault();

        this.toggle();
    }

    onMouseEnter(event) {
        if (this.disabled) {
            return;
        }

        event.preventDefault();

        this.open();
    }

    onMouseLeave(event) {
        if (this.disabled) {
            return;
        }

        event.preventDefault();

        this.close();
    }

    onDisabledMediaQueryListMatch(media) {
        this.disabled = media.matches;
    }

    onHoverMediaQueryListMatch(media) {
        this.unbindToggleEvents();

        this.hover = media.matches;

        console.log(`Switching hover to ${this.hover}`);

        this.bindToggleEvents();
    }
}

/**
 * Convenience method for constructing Collapsible instance
 *
 * @param {string} [selector]
 * @param {Object} [options]
 * @param {Object} [options.$context]
 * @param {Object} [options.disabledBreakpoint]
 * @param {Object} [options.disabledState]
 * @param {Object} [options.enabledState]
 * @param {Object} [options.openClassName]
 * @return {Array} array of Collapsible instances
 *
 * @example
 * <a href="#content" data-collapsible>Collapse</a>
 * <div id="content">...</div>
 *
 * collapsibleFactory();
 */
export default function collapsibleFactory(selector = `[data-${PLUGIN_KEY}]`, overrideOptions = {}) {
    const $collapsibles = $(selector, overrideOptions.$context);

    return $collapsibles.map((index, element) => {
        const $toggle = $(element);
        const instanceKey = `${PLUGIN_KEY}Instance`;
        const cachedCollapsible = $toggle.data(instanceKey);

        if (cachedCollapsible instanceof Collapsible) {
            return cachedCollapsible;
        }

        const targetId = prependHash($toggle.data(PLUGIN_KEY) ||
            $toggle.data(`${PLUGIN_KEY}Target`) ||
            $toggle.attr('href'));
        const options = _.extend(optionsFromData($toggle), overrideOptions);
        const collapsible = new Collapsible($toggle, $(targetId, overrideOptions.$context), options);

        $toggle.data(instanceKey, collapsible);

        return collapsible;
    }).toArray();
}
