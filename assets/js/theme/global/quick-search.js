import $ from 'jquery';
import urlUtils from './../common/utils/url-utils';

export default function () {
    const $quickSearchDiv = $('.quickSearch-form');

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const searchQuery = $target.find('input').val();
        const searchUrl = $target.data('url');

        if (searchQuery.length === 0) {
            return;
        }

        urlUtils.goToUrl(`${searchUrl}?search_query=${searchQuery}`);
        window.location.reload();
    });
}
