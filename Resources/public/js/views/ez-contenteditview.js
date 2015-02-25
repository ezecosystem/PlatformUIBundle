/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditview', function (Y) {
    "use strict";
    /**
     * Provides the Content Edit View class
     *
     * @module ez-contenteditview
     */
    Y.namespace('eZ');

    var IS_SHOWING_TECH = 'is-showing-technicalinfos',
        CONTENT_SEL = '.ez-main-content',
        ESCAPE_KEY = 27,
        FORM_CONTAINER = '.ez-contenteditformview-container',
        ACTION_BAR_CONTAINER = '.ez-editactionbar-container';

    /**
     * The content edit view
     *
     * @namespace eZ
     * @class ContentEditView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-view-close': {'tap': '_closeView'},
            'header': {
                'mouseover': '_showDetails',
                'mouseout': '_hideDetails'
            },
            '.ez-main-content': {
                'keyup': '_handleKeyboard'
            }
        },

        /**
         * Initializer is called upon view's init
         * Creating and managing child views inside it
         *
         * @method initializer
         */
        initializer: function () {
            this.get('formView').addTarget(this);
            this.get('actionBar').addTarget(this);

            this.after('activeChange', function (e) {
                if ( e.newVal ) {
                    this._setFocus();
                }
            });

            this.on(['*:saveAction', '*:publishAction'], this._handleSavePublish);
        },

        /**
         * Event handler for the saveAction and publishAction events. It
         * enriches the event facade with the updated fields and the form
         * validity
         *
         * @method _handleSavePublish
         * @protected
         * @param {Object} e event facade
         */
        _handleSavePublish: function (e) {
            var form = this.get('formView');

            e.fields = form.getFields();
            e.formIsValid = form.isValid();
        },

        /**
         * Destructor is called upon view's destruction
         * Destroying and cleaning up child views
         *
         * @method destructor
         */
        destructor: function () {
            this.get('formView').removeTarget(this);
            this.get('formView').destroy();

            this.get('actionBar').removeTarget(this);
            this.get('actionBar').destroy();
        },

        /**
         * Renders the content edit view
         *
         * @method render
         * @return {eZ.ContentEditView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                content: this.get('content').toJSON(),
                version: this.get('version').toJSON(),
                mainLocation: this.get('mainLocation').toJSON(),
                contentType: this.get('contentType').toJSON(),
                owner: this.get('owner').toJSON()
            }));
            if ( this._isTouch() ) {
                container.addClass('is-using-touch-device');
            }

            container.one(FORM_CONTAINER).append(this.get('formView').render().get('container'));

            // Note: render() is drawing non-height-responsive version of the action bar
            // but handleHeightUpdate() event will be triggered from app.handleContentEdit(), when everything is loaded to draw the responsive version
            container.one(ACTION_BAR_CONTAINER).append(this.get('actionBar').render().get('container'));
            this._uiSetMinHeight();

            return this;
        },

        /**
         * Sets the minimum height of the view
         *
         * @private
         * @method _uiSetMinHeight
         */
        _uiSetMinHeight: function () {
            var container = this.get('container');

            container.one(CONTENT_SEL).setStyle('minHeight', container.get('winHeight') + 'px');
        },

        /**
         * Returns the title of the page when the content edit view is the
         * active view
         *
         * @method getTitle
         * @return String
         */
        getTitle: function () {
            return 'Editing "' + this.get('content').get('name') + '"';
        },

        /**
         * Set current input focus on the view
         *
         * @method setFocus
         * @protected
         */
        _setFocus: function () {
            this.get('container').one(CONTENT_SEL).focus();
        },

        /**
         * Shows the technical infos of the content.
         *
         * @method _showDetails
         * @protected
         */
        _showDetails: function () {
            this.get('container').addClass(IS_SHOWING_TECH);
        },

        /**
         * Hides the technical infos of the content.         *
         *
         * @method _hideDetails
         * @protected
         */
        _hideDetails: function () {
            this.get('container').removeClass(IS_SHOWING_TECH);
        },

        /**
         * Event event handler for the close link in the content edit view
         *
         * @method _closeView
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _closeView: function (e) {
            /**
             * Fired when the close link is clicked
             *
             * @event closeView
             */
            this.fire('closeView');
            e.preventDefault();
        },

        /**
         * Event event handler for any key pressed within the content edit view
         *
         * @method _handleKeyboard
         * @protected
         * @param {Object} e event facade of the keyboard event
         */
        _handleKeyboard: function (e) {
            if (e.keyCode === ESCAPE_KEY) {
                this._closeView(e);
            }

        },

        /**
         * Returns whether the current browser is a touch device or not
         *
         * @method _isTouch
         * @private
         * @return {Boolean}
         */
        _isTouch: function () {
            return Y.UA.touchEnabled;
        }
    }, {
        ATTRS: {
            /**
             * The content being edited
             *
             * @attribute content
             * @default {}
             * @required
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The version being edited
             *
             * @attribute content
             * @default {}
             * @required
             */
            version: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content being edited
             *
             * @attribute contentType
             * @default {}
             * @required
             */
            contentType: {
                writeOnce: "initOnly",
            },

            /**
             * The main location of the content being edited
             *
             * @attribute mainLocation
             * @default {}
             * @required
             */
            mainLocation: {
                writeOnce: "initOnly",
            },

            /**
             * The owner of the content being edited
             *
             * @attribute owner
             * @default {}
             * @required
             */
            owner: {
                writeOnce: "initOnly",
            },

            /**
             * A configuration object coming from the application route configuration
             *
             * @attribute config
             * @type Mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },

            /**
             * The ContentEditFormView (by default) instance which will be used to render form
             *
             * @attribute formView
             * @default new Y.eZ.ContentEditFormView()
             * @type {eZ.ContentEditFormView}
             * @required
             */
            formView: {
                valueFn: function () {
                    return new Y.eZ.ContentEditFormView({
                        config: this.get('config'),
                        contentType: this.get('contentType'),
                        content: this.get('content'),
                        version: this.get('version')
                    });
                }
            },

            /**
             * The EditActionBarView (by default) instance
             *
             * @attribute actionBar
             * @default new Y.eZ.EditActionBarView()
             * @type {eZ.EditActionBarView}
             * @required
             */
            actionBar: {
                valueFn: function () {
                    return new Y.eZ.EditActionBarView({
                        version: this.get('version')
                    });
                }
            }
        }
    });
});
