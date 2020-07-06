import Category from "./category";
import utils from '@bigcommerce/stencil-utils';
import {defaultModal} from "./global/modal";

export default class GoatthroatCat extends Category {

	onReady() {
		super.onReady();

		const modal = defaultModal();
		console.log("All the benefits of a real category page plus this extra little message you see in your console.");

		$('.body').on('click','.hello-there', event =>{
			modal.open({ size: 'normal' });

			utils.api.getPage("https://chemistryconnection.com/api/goatthroat/", {}, (err, response) => {
				if (err) {
					console.log("Big Error");
					console.log(err);
				} else {
					var compatContents = $('.compat-contents');
					if (response.error) {
						compatContents.find('.compat-err-message').text(response.error);
					}

					modal.updateContent(compatContents.html());
				}
			})
		});
	}
}