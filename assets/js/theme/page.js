import PageManager from './page-manager';
import $ from 'jquery';

export default class Page extends PageManager {
    before(next) {
        if ($('.page_banner').length) {
            // if($('.page-content').has('page-banner')) {
            // if(false) {
            $('.page-heading').hide();
        }

        next();
    }

    loaded(next) {
        next();
    }

}
