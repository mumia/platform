/*global define*/
define(['jquery', 'backbone', 'underscore', 'orotranslation/js/translator', 'oroui/js/mediator', 'oronavigation/js/navigation', 'oroui/js/delete-confirmation'
    ], function ($, Backbone, _, __, mediator, Navigation, DeleteConfirmation) {
    "use strict";

    /**
     * @export  orointegration/js/channel-view
     * @class   orointegration.channelView
     * @extends Backbone.View
     */
    return Backbone.View.extend({
        /**
         * @const
         */
        UPDATE_MARKER: 'formUpdateMarker',

        /**
         * Array of fields that should be submitted for form update
         * Depends on what exact field changed
         */
        fieldsSets: {
            type:          [],
            transportType: []
        },

        requiredOptions: ['transportTypeSelector', 'typeSelector', 'fieldsSets', 'formSelector'],

        /**
         * @param options Object
         */
        initialize: function (options) {
            this.options = _.defaults(options || {}, this.options);
            var requiredMissed = this.requiredOptions.filter(function (option) {
                return _.isUndefined(options[option]);
            });
            if (requiredMissed.length) {
                throw new TypeError('Missing required option(s): ' + requiredMissed.join(','));
            }

            _.extend(this.fieldsSets, options.fieldsSets);

            this.processSelectorState();
            $(options.typeSelector).on('change', _.bind(this.changeHandler, this));
            $(options.transportTypeSelector).on('change', _.bind(this.changeHandler, this));
            this.memoizeValue(options.typeSelector);
            this.memoizeValue(options.transportTypeSelector);
        },

        /**
         * Hide transport type select element in case when only one type exists
         */
        processSelectorState: function () {
            var $el = $(this.options.transportTypeSelector);

            if ($el.find('option').length < 2) {
                $el.parents('.control-group').hide();
            }
        },

        /**
         * Check whenever form change and shows confirmation
         * @param $.Event e
         */
        changeHandler: function (e) {
            var $el = $(e.currentTarget);
            if ($el.data('cancelled') !== true) {
                var prevVal = $el.data('current');
                if (!this.isEmpty()) {
                    var confirm = new DeleteConfirmation({
                        title:   __('oro.integration.change_type'),
                        okText:  __('Yes, I Agree'),
                        content: __('oro.integration.submit')
                    });
                    confirm.on('ok', _.bind(function () {
                        this.processChange($el);
                    }, this));
                    confirm.on('cancel', _.bind(function () {
                        $el.data('cancelled', true).val(prevVal).trigger('change');
                        this.memoizeValue($el);
                    }, this));
                    confirm.open();
                } else {
                    this.processChange($el);
                }
            } else {
                $el.data('cancelled', false);
            }
        },

        /**
         * Updates form via ajax, renders dynamic fields
         *
         * @param $.element $el
         */
        processChange: function ($el) {
            this.memoizeValue($el);

            var navigation = Navigation.getInstance();
            if (navigation) {
                navigation.loadingMask.show();
            }

            var $form = $(this.options.formSelector),
                data = $form.serializeArray(),
                url = $form.attr('action'),
                fieldsSet = $el.is(this.options.typeSelector)
                    ? this.fieldsSets.type
                    : this.fieldsSets.transportType;

            data = _.filter(data, function (field) {
                return _.indexOf(fieldsSet, field.name) !== -1;
            });
            data.push({name: this.UPDATE_MARKER, value: 1});

            $.post(url, data,function (res, status, jqXHR) {
                var formContent = $(res).find($form.selector);
                if (formContent.length) {
                    $form.replaceWith(formContent);
                    formContent.validate({});

                    // trigger hash navigation event for processing UI decorators
                    navigation.processClicks(formContent.find('a'));
                    // update wdt
                    navigation.updateDebugToolbar(jqXHR);
                    mediator.trigger("hash_navigation_request:complete", this);
                }
            }).always(function () {
                if (navigation) {
                    navigation.loadingMask.hide();
                }
            });
        },

        /**
         * Check whenever form fields are empty
         *
         * @param $.element $el
         *
         * @returns {boolean}
         */
        isEmpty: function () {
            var fields = $(this.options.typeSelector).parents('form').find('input[type="text"]:not([name$="[name]"])');

            fields = fields.filter(function () {
                return this.value != '';
            });

            return !fields.length;
        },

        /**
         * Remember current value in case if in future we will need to undo changes
         *
         * @param HTMLSelectElement el
         */
        memoizeValue: function (el) {
            var $el = $(el);
            $el.data('current', $el.val());
        }
    });
});
