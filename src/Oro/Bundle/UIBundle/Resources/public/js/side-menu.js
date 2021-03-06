/*global define*/
/*jslint nomen: true*/
define(['jquery', 'backbone', './mediator', 'jquery-ui'], function ($, Backbone, mediator) {
    'use strict';

    $.widget('oroui.sideMenu', {
        options: {
            menuPrefix: 'main-menu-group',
            rootElement: '.main-menu',
            toggleSelector: '',
            autoCollapse: true
        },

        /**
         * Creates side menu
         *
         * @private
         */
        _create: function () {
            this.listener = $.extend({}, Backbone.Events);
            this.listener.listenTo(mediator, 'hash_navigation_request:refresh', $.proxy(this._init, this));

            this.$toggle = $(this.options.toggleSelector);
            this._on(this.$toggle, {click: this.onToggle});
        },

        /**
         * Destroys widget's references
         *
         * @private
         */
        _destroy: function () {
            this.listener.stopListening(mediator);
        },

        /**
         * Do initial changes
         *
         * @private
         */
        _init: function () {
            // should be implemented in descendant
        },

        /**
         * Converts menu's markup from dropdown to accordion
         *
         * @private
         */
        _convertToAccordion: function () {
            var $groups, $root, self;

            $root = this.element.find(this.options.rootElement).first();
            $root.attr('id', this._getGroupId(0)).addClass('accordion');
            $groups = $root.find('.dropdown');

            $root.find('.dropdown-menu').removeClass('dropdown-menu').addClass('accordion-body collapse');
            $groups.removeClass('dropdown').addClass('accordion-group');

            self = this;
            $groups.add($root).each(function (i) {
                var $group, $header, $target, targetId;

                $group = $(this);
                $header = $group.find('a[href=#]>span').first();
                $target = $group.find('.accordion-body').first();

                targetId = self._getGroupId(i + 1);
                $target.attr('id', targetId);

                $header.addClass('accordion-toggle')
                    .attr({
                        'data-toggle': 'collapse',
                        'data-target': '#' + targetId
                    })
                    .closest('a').addClass('accordion-heading');

                if (self.options.autoCollapse) {
                    $header.attr('data-parent', '#' + $header.closest('.accordion').attr('id'));
                }

                if ($group.hasClass('active')) {
                    $target.addClass('in');
                } else {
                    $header.addClass('collapsed');
                }

                if ($target.has('.accordion-group')) {
                    $target.addClass('accordion');
                }
            });
        },

        /**
         * Converts menu's markup from accordion to dropdown
         *
         * @private
         */
        _convertToDropdown: function () {
            this.element.find('.accordion').removeClass('accordion');
            this.element.find('.accordion-body')
                .removeClass('accordion-body collapse in')
                .removeAttr('id')
                .removeAttr('style')
                .addClass('dropdown-menu');
            this.element.find('.accordion-group').removeClass('accordion-group').addClass('dropdown');
            this.element.find('.accordion-toggle').removeClass('accordion-toggle collapsed');
            this.element.find('.accordion-heading').removeClass('accordion-heading');
        },

        /**
         * Handles menu toggle state action
         *
         * @param {jQuery.Event} e
         */
        onToggle: function (e) {
            e.stopPropagation();
            this._toggle();
        },

        /**
         * Implements toggling process
         */
        _toggle: function () {
            // should be implemented in descendant
        },

        /**
         * Generates id value for sub-menu group
         *
         * @param {number} i
         * @returns {string}
         * @private
         */
        _getGroupId: function (i) {
            return this.options.menuPrefix + '_' + i;
        }
    });

    return $;
});
