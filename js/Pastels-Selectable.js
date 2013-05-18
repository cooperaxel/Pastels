/* Pastels Selectable */

"use strict";

(function(window) {
    
    var Selectable = function(handler, opt) {
        if (!(this instanceof Selectable)) {
            return new Selectable(handler, opt);
        }
        var self = this,
            values = handler.data('values');
        
        self.options = {}.extend(Selectable.prototype.defaults, opt);
        self.handler = handler;
        self.submenus = [];
        
        Pastels.load(self.required, function() {
            self.popover = new PopOver(handler, self.options);
            self.object = self.popover.object.addClass('selectable');
            
            var ul = self.object.children('ul');
            if (ul.length > 0) {
                self.list = ul.eq(0);
            } else {
                self.list = $.create('ul');
                self.object.prepend(self.list);
            }
            
            self.setValues(values);
            self.prepare();
        });
        return self;
    };
    
    Selectable.prototype = {}.extend(Pastels.prototype, {
        required: ['PopOver'],
        defaults: {
            scroller: true,
            allowDividers: true,
            allowSubmenu: true,
            fullscreen: true
        },
        submenuDefaults: {
            arrow: false,
            closeOthers: false,
            position: 'horizontal',
            align: 'top',
            defaultActions: false,
            margin: 0
        },
        prepare: function() {
            var self = this,
                c = self.list.children('li!.divider');
            
            self.insertToDOM();
            
            c.each(function(n) {
                var children = this.children(),
                    ul = children.filter('ul');
                
                if (children.length === 0 || ['span','a'].indexOf(children.item().tagName.toLowerCase()) === -1) {
                    var span = $.create('span');
                    this.contents().eq(0).appendTo(span);
                    this.prepend(span);
                }
                if (ul.length > 0) {
                    if (self.options.allowSubmenu) {
                        var opt = { object: ul.eq(0), dark: self.object.hasClass('dark'), movementY: -self.object.paddingHeight()/2 };
                        n.Selectable = new Selectable(this, opt.extend(Selectable.prototype.submenuDefaults));
                        n.addClass('submenu');
                    } else {
                        ul.remove();
                    }
                }
            });
            
            if (self.options.scroller && self.scroller == null) {
                Pastels.load(['Scroller'], function() {
                    self.scroller = new Scroller(self.list);
                });
            }
            
            c.mouseup(function(e) {
                e.stopPropagation();
                if (this.Selectable == null) {
                    var $this = $(this),
                        n = $this.attr('name'),
                        value = (n ? n : $this.text()),
                        a = $this.children('a');
                    
                    if (value !== self.value) {
                        self.emit('changed', { index: c.indexOf(this), oldValue: self.value, value: value });
                    }
                    self.value = value;
                    self.emit('selected', { index: c.indexOf(this), value: self.value });
                    
                    if (a.length === 1) {
                        a.active().click();
                    }
                    self.close();
                    $().emit('mousedown');
                } else {
                    if (this.Selectable.popover.isActive()) {
                        this.Selectable.close();
                    } else {
                        this.Selectable.show();
                    }
                }
            }).mouseover(function(e) {
                c.removeClass('active');
                this.addClass('active');
            }).mouseout(function(e) {
                this.removeClass('active');
            });
            
            if (self.options.fullscreen) {
                self.popover.on('fullscreen.entered', function() {
                    if (self.scroller && self.scroller.object) {
                        self.scroller.object.css({
                            width: self.object.width(),
                            height: self.object.height()
                        });
                    }
                    self.list.css({ maxHeight: self.object.width() });
                });
                self.popover.on('fullscreen.leaved', function() {
                    if (self.scroller && self.scroller.object) {
                        self.scroller.restoreSize();
                    }
                    self.list.css({ maxHeight: null });
                });
            }
            
            self.removeFromDOM();
            return self;
        },
        show: function() {
            this.popover.show();
            return this;
        },
        close: function() {
            this.popover.close();
            return this;
        },
        setValues: function(values) {
            var self = this, li;
            if (! values) {
                self.values = [];
                li = self.list.children('li');
                li.each(function() {
                    self.values.push(this.text());
                });
                return self;
            }
            if (typeof values === 'string') {
                values = values.split(',');
            }
            li = $.create('li');
            
            self.values = values;
            
            for (var i = 0; i < values.length; i++) {
                if (values[i].length === 0 && self.options.allowDividers) {
                    self.list.append(li.clone().addClass('divider'));
                } else if (values[i].length > 0) {
                    self.list.append(li.clone().html(values[i]));
                }
            }
            return self;
        }
    });
    
    window.Selectable = Selectable;
    Pastels.includes.push('Selectable');
})(window);