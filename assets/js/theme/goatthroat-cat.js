import Category from "./category";
import utils from '@bigcommerce/stencil-utils';
import {defaultModal} from "./global/modal";

export default class GoatthroatCat extends Category {
	onReady() {
		super.onReady();

		let query;
		let chemicals;
		let currentTimeout;
		let oldWidth = $(window).width();
		const modal = defaultModal();

		$('.body').on('click','.hello-there', event =>{
			modal.open({ size: 'normal' });
			const $compatContents = $('.compat-contents').clone();
			$compatContents.find('.compat-err-message').text("Enter your chemical name.");
			modal.updateContent($compatContents.html());
			modal.$modal.find('.compat-err-message').show();
		});

		modal.$modal.on('click', '.compat-list-item', event => {
			this.listItemClicked(chemicals, event);
		});

		modal.$modal.on('keyup paste', '.compat-search-input', event => {
			query = modal.$modal.find('.compat-search-input').val().replace(/ /g, '+');

			if (currentTimeout) {
				clearTimeout(currentTimeout);
			}

			currentTimeout = setTimeout(() => {
				this.makeAPICall(query, modal, (chemList) => {
					chemicals = chemList;
				});
			}, 500);
		});

		modal.$modal.on('submit', '.compat-search-form', event => {
			event.preventDefault();
		});

		$(window).resize(() => {
			const newWidth = $(window).width();
			if (oldWidth !== newWidth) {
				this.hideChemDetails();

				// reset jquery modifications & return to CSS defined rules
				$('.compat-chem-details').removeAttr('style');
			}
			oldWidth = newWidth;
		});
	}

	makeAPICall(query, modal, callback) {
		console.log(`Making API request: ${query}`);

		utils.api.getPage(`https://chemistryconnection.com/api/goatthroat/?q=${query}`, {}, (err, response) => {
			const $compatContents = modal.$modal.find('.compat-main-content');
			
			this.hideChemDetails();
			$('.compat-chem-details').removeAttr('style');

			const $chemList = $compatContents.find('.compat-chem-list');
			$chemList.children('.compat-list-item').remove();
			if (err) {
				console.log("Big Error");
				console.log(err);
				$compatContents.find('.compat-err-message').text("Could not get chemical data.").show();
				$chemList.hide();
			} else {
				if (response.error) {
					$compatContents.find('.compat-err-message').text(response.error).show();
					$chemList.hide();
				} else {
					$compatContents.find('.compat-err-message').hide();
					const $dummy = $chemList.find('.dummy');
					const chemicals = response.chemicals;

					if (chemicals.length === 0) {
						$compatContents.find('.compat-err-message').text("No results match your search query.").show();
						$chemList.hide();
						return;
					}

					chemicals.forEach((value, index, array) => {
						const $newElement = $($dummy.html());
						$newElement.find('.compat-chem-name').text(value.chemical);
						$newElement.attr('data-chem-idx',index);
						$chemList.append($newElement);
					});

					$chemList.show();

					console.log(chemicals);
					callback(chemicals);
				}
			}
		});
	}

	listItemClicked(chemicals, event) {
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
	}

	showChemDetailsMobile($chemDetails, $target) {
		const $mobileChemDeets = $(`<div class="compat-chem-details mobile" style="display: none">${$chemDetails.html()}</div>`);
		$target.after($mobileChemDeets);
		$mobileChemDeets.slideDown();
	}

	/**
	 *  This method is called from two scenarios:
	 *  1) When the viewport width is changed or the chem list data has updated, in which case we want to remove .active
	 *     from all elements and we don't care which ones
	 *  2) When the user clicks on a chemical list item, in which case we need to know if the clicked chemical is
	 *     already active or not. If the clicked chemical list item is active already, we do not want to reopen the
	 *     clicked chemical. This method runs the logic that determines if the click event handler will continue on to
	 *     show the new chemical details or stop with execution.
	 *
	 * @param $target The clicked list item. If null, we assume scenario 1 above. If not null, we assume scenario 2 and
	 * run the logic to decide whether the click event handler continues.
	 * @returns {boolean} Returns true if $target is not null and has class active. Returns false otherwise.
	 */
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