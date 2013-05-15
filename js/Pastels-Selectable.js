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
            allowDividers: true
        },
        prepare: function() {
            var self = this,
                c = self.list.children('li');
                
            c.each(function(n) {
                if (! this.hasClass('divider')) {
                    var children = this.children();
                    
                    if (children.length === 0 || ['span','a'].indexOf(children.item().tagName.toLowerCase()) === -1) {
                        var span = $.create('span');
                        this.nodes().appendTo(span);
                        this.append(span);
                    }
                }
            });
            
            if (! self.object.item().Scroller && self.object.scrollHeight() > self.object.clientHeight()) {
                Pastels.load('Scroller', function() {
                    self.object.item().Scroller = new Scroller(self.object.item().Scroller);
                });
            }
            
            c.mouseup(function(e) {
                e.stopPropagation();
                var $this = $(this),
                    n = $this.attr('name'),
                    value = (n ? n : $this.text());
                if (value !== self.value) {
                    self.send('changed', { index: c.indexOf(this), oldValue: self.value, value: value });
                }
                self.value = value;
                self.send('selected', { index: c.indexOf(this), value: self.value });
            }).mouseover(function(e) {
                c.removeClass('active');
                this.addClass('active');
            }).mouseout(function() {
                this.removeClass('active');
            }).click(function(e) {
                var a = $(this).children('a');
                if (a.length === 1) {
                    a.active().click();
                }
            });
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