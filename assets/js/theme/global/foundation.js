import 'foundation-sites/js/foundation';
import 'foundation-sites/js/foundation.dropdown';
import 'foundation-sites/js/foundation.reveal';
import 'foundation-sites/js/foundation.tabs';
import modalFactory from './modal';
import revealCloseFactory from './reveal-close';

export default function ($element) {
    // $element.foundation({
    //     dropdown: {
    //         // specify the class used for active dropdowns
    //         active_class: 'is-open',
    //     },
    //     reveal: {
    //         bg_class: 'modal-background',
    //         dismiss_modal_class: 'modal-close',
    //         close_on_background_click: true,
    //     },
    //     tab: {
    //         active_class: 'is-active',
    //     },
    // });

    $element.foundation()

    modalFactory('[data-reveal]', { $context: $element });
    revealCloseFactory('[data-reveal-close]', { $context: $element });
}
