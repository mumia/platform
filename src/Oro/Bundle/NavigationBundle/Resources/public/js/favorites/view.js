/*global define*/
define(['underscore', 'backbone', 'oroui/js/app', 'oroui/js/mediator', 'oroui/js/error',
        '../abstract-view', '../model', '../collection'
    ], function (_, Backbone, app, mediator, error,
        AbstractView, NavigationModel, NavigationCollection) {
    'use strict';

    /**
     * @export  oronavigation/js/favorites/view
     * @class   oronavigation.favorites.View
     * @extends oronavigation.AbstractView
     */
    return AbstractView.extend({
        el: '.favorite-button',
        options: {
            tabTitle: 'Favorites',
            tabIcon: 'icon-star-empty',
            tabId: 'favorite'
        },

        events: {
            'click': 'toggleItem'
        },

        initialize: function() {
            AbstractView.prototype.initialize.apply(this, arguments);
            if (!this.options.collection) {
                /** @type {oronavigation.Collection} */
                this.options.collection = new NavigationCollection();
            }

            this.listenTo(this.getCollection(), 'add', this.addItemToTab);
            this.listenTo(this.getCollection(), 'reset', this.addAll);
            this.listenTo(this.getCollection(), 'all', this.render);

            this.$icon = this.$('i');

            this.registerTab();
            this.cleanupTab();
            /**
             * Render links in favorites menu after hash navigation request is completed
             */
            mediator.bind(
                "hash_navigation_request:complete",
                function() {
                    this.render();
                },
                this
            );
        },

        activate: function() {
            this.$icon.addClass('icon-gold');
        },

        inactivate: function() {
            this.$icon.removeClass('icon-gold');
        },

        toggleItem: function(e) {
            var self = this;
            var current = this.getItemForCurrentPage();
            if (current.length) {
                _.each(current, function(item) {
                    item.destroy({
                        wait: false, // This option affects correct disabling of favorites icon
                        error: function(model, xhr) {
                            if (xhr.status == 404 && !app.debug) {
                                // Suppress error if it's 404 response and not debug mode
                                self.inactivate();
                            } else {
                                error.handle({}, xhr, {enforce: true});
                            }
                        }
                    });
                });
            } else {
                var itemData = this.getNewItemData(Backbone.$(e.currentTarget));
                itemData.type = 'favorite';
                itemData.position = this.getCollection().length;
                /** @type {oronavigation.Model} */
                var currentItem = new NavigationModel(itemData);
                this.getCollection().unshift(currentItem);
                currentItem.save();
            }
        },

        addAll: function(items) {
            items.each(function(item) {
                this.addItemToTab(item);
            }, this);
        },

        render: function() {
            this.checkTabContent();
            if (this.getItemForCurrentPage().length) {
                this.activate();
            } else {
                this.inactivate();
            }
            /**
             * Backbone event. Fired when tab is changed
             * @event tab:changed
             */
            mediator.trigger("tab:changed", this.options.tabId);
            return this;
        }
    });
});
