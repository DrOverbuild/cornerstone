import Category from "./category";
import utils from '@bigcommerce/stencil-utils';
import {defaultModal} from "./global/modal";

export default class GoatthroatCat extends Category {

	onReady() {
		super.onReady();

		let chemicals;
		var oldWidth = $(window).width();
		const modal = defaultModal();

		$('.body').on('click','.hello-there', event =>{
			modal.open({ size: 'normal' });

			utils.api.getPage("https://chemistryconnection.com/api/goatthroat/?q=gly", {}, (err, response) => {
				if (err) {
					console.log("Big Error");
					console.log(err);
				} else {
					const $compatContents = $('.compat-contents').clone();
					if (response.error) {
						$compatContents.find('.compat-err-message').text(response.error).show();
					} else {
						const $chemList = $compatContents.find('.compat-chem-list');
						const $dummy = $chemList.find('.dummy');
						chemicals = response.chemicals;

						chemicals.forEach((value, index, array) => {
							const $newElement = $($dummy.html());
							$newElement.find('.compat-chem-name').text(value.chemical);
							$newElement.attr('data-chem-idx',index);
							$chemList.append($newElement);
						});
					}

					modal.updateContent($compatContents.html());
				}
			})
		});

		modal.$modal.on('click', '.compat-list-item', event => {
			const $target = $(event.currentTarget);

			if (this.hideChemDetails($target)){
				return;
			}

			$target.addClass('active');

			const idx = $target.attr('data-chem-idx');
			const chem = chemicals[idx];

			const $chemDetails = $('.compat-chem-details');

			$chemDetails.find('.compat-header.chemname').text(chem.chemical);
			$chemDetails.find('.compat-gt100').text(chem.gt100);
			$chemDetails.find('.compat-gt200').text(chem.gt200);
			$chemDetails.find('.compat-gt300').text(chem.gt300);
			$chemDetails.find('.compat-hose1').text(chem.hose_rec_1);
			$chemDetails.find('.compat-hose2').text(chem.hose_rec_2);
			$chemDetails.find('.compat-notes').text(chem.notes);

			if (checkMobile()) {
				this.showChemDetailsMobile($chemDetails, $target);
			} else {
				$chemDetails.show();
			}

		});

		$(window).resize(() => {
			const newWidth = $(window).width();
			if (oldWidth !== newWidth) {
				this.hideChemDetails();
				$('.compat-chem-details').removeAttr('style');
			}
			oldWidth = newWidth;
		});
	}

	showChemDetailsMobile($chemDetails, $target) {
		const $mobileChemDeets = $(`<div class="compat-chem-details mobile" style="display: none">${$chemDetails.html()}</div>`);
		$target.after($mobileChemDeets);
		$mobileChemDeets.slideDown();
	}


	hideChemDetails($target) {
		if(checkMobile()) {
			const $mobileChemDeets = $('.compat-chem-details.mobile');
			$mobileChemDeets.slideUp(() => {
				$mobileChemDeets.remove();
			});

			if ($target) {
				if ($target.hasClass('active')) {
					$target.removeClass('active');
					return true;
				}
			}
		}

		$('.compat-list-item.active').removeClass('active');
	}
}

function checkMobile() {
	const query = window.matchMedia("(max-width: 600px)");
	return query.matches;
}