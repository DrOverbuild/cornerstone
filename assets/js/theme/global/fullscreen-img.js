import $ from 'jquery';
import 'foundation-sites/js/foundation/foundation';
import { defaultModal } from './modal';

export default function () {
    const modal = defaultModal();
    let modalDOM;
    let imgSRC;

    $('#tab-description').find('img').addClass('fullscreen-img');
    $('.cat-desc').find('img').addClass('fullscreen-img');

    $('body').on('click', '.fullscreen-img', event => {
        if (!$(event.target).parent().is('a')) {
            event.preventDefault();

            modal.open({ size: 'large' });

            imgSRC = $(event.target).attr('src');
            modal.updateContent(`<div style='height: 90vh; overflow: hidden; text-align: center;'><img id='fullscreen-img' style='height: 100%; width: 100%; object-fit: contain;' src='${imgSRC}'></div>`);

            modalDOM = $('#modal');
            modalDOM.css('background', 'none');
			// modalDOM.width($('#fullscreen-img').width());
        }
    });

    $('body').on('click', '#fullscreen-img', () => {
        modal.close();
    });
}
