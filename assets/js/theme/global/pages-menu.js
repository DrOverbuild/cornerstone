import collapsibleFactory from '../common/collapsible';

const PLUGIN_KEY = 'pages-menu';


class PagesMenu {
    constructor($pagesMenu) {
        this.$pagesMenu = $pagesMenu;
        this.$body = $('body');

        // Init collapsible
        this.collapsibles = collapsibleFactory(
            '[data-collapsible]',
            {
                $context: this.$pagesMenu,
                hover: true,
                hoverBreakpoint: 'large',
            });
    }
}

/*
 * Create a new Page Menu instance
 * @param {string} [selector]
 * @return {PagesMenu}
 */
export default function pagesMenuFactory(selector = `[data-${PLUGIN_KEY}]`) {
    const $pagesMenu = $(selector).eq(0);
    const instanceKey = `${PLUGIN_KEY}Instance`;
    const cachedMenu = $pagesMenu.data(instanceKey);

    if (cachedMenu instanceof PagesMenu) {
        return cachedMenu;
    }

    const pagesMenu = new PagesMenu($pagesMenu);

    $pagesMenu.data(instanceKey, pagesMenu);

    return pagesMenu;
}
