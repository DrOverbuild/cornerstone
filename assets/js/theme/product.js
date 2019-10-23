/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;
        let ProductTab;
        let TechDataTab;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        /*
	* --- HOW TO USE THIS CODE ---
	*
	* This jQuery listener goes at the end of the last <script> element of /Panels/ProductTags.html. It will look for a
	* <div> element with the ID #TechInfoContent on the page and if it's not empty, it will add a tab to the tab list
	* and the contents of #TechInfoContent to a previously empty <div> at the end of /Panels/ProductTags.html.
	*
	* This goes at the end of the ProductTags file:
	* <div id="TechInfo" class="Block Panel" style="display:none">
	* </div>
	*/

        // $(document).ready(function () {
        if ($('#TechInfoContent').text().length > 0) {
            ProductTab = '<li class="tab"><a class="tab-title" href="#TechInfo">Technical Data</a></li>';
            TechDataTab = '<div class="tab-content" id="TechInfo"></div>';


            $('#product_description_tab_header').after(ProductTab);

            $('#tabs_contents').append(TechDataTab);
            $('#TechInfo').append($('#TechInfoContent').html());
            $('#TechInfoContent').hide();
        }
        // });

        /* --- END OF PRODUCT TAB MOD --- */

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }
}
