import $ from 'jquery';

export default function () {
    const $quickSearchDiv = $('#quickSearch');

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', event => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });
}
