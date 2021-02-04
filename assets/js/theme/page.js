import PageManager from './page-manager';
import $ from 'jquery';

export default class Page extends PageManager {
    onReady() {
        // hide the heading if page has an image with the page_banner class
        if ($('.page_banner').length) {
            $('.page-heading').hide();
        }

        // make iframes responsive and constrained to aspect ratio
        const iframe = $('.page-content').find('iframe');
        if (iframe.length != 0) {
            const aspect169 = $('<div class="aspect-16-9"></div>');
            aspect169.append(iframe.clone());
            iframe.replaceWith(aspect169);
        }
    }
}
