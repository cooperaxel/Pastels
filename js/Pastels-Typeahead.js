/* Pastels Typeahead */

"use strict";

(function(window) {
    
    var Typeahead = function(input, opt) {
        if(!(this instanceof Typeahead)) {
            return new Typeahead(input, opt);
        }
        
        var self = this,
            data = input.data('typeahead');
        
        self.options = {}.extend(Typeahead.prototype.defaults, opt);
        self.input = input;
        
        if (data) {
            self.options.extend($.parseData(data));
        }
        
        Pastels.load(self.required, function() {
            self.selectable = new Selectable(self.input, self.options);
            self.selectable.object.addClass('typeahead');
            self.prepare();
        });
        
        return self;
    };
    
    Typeahead.prototype = {}.extend(Pastels.prototype, {
        required: ['PopOver', 'Selectable'],
        defaults: {
            position: 'below',
            align: 'left',
            allowDividers: false,
            allowReclick: true,
            arrow: false,
            inheritWidth: true,
            roundCorner: false,
            defaultActions: false,
            refreshPosition: true,
            sort: false,
            
            showOnFocus: false,
            showAllValues: false,
            autoComplete: false,
            minLength: 1,
            items: 0
        },
        prepare: function() {
            var self = this,
                select = self.selectable,
                list = select.list,
                li = list.children('li');
            
            if (self.options.sort === 'asc') {
                li.sort();
            } else if (self.options.sort === 'desc') {
                li.sort().reverse();
            }
            
            list.css({ minHeight: li.clientHeight() });
            if(self.options.items > 0 && li.length > self.options.items) {
                select.object.show();
                list.css({ maxHeight: li.clientHeight() * self.options.items });
                select.object.hide();
            }
            
            if (self.options.showOnFocus) {
                self.input.focus(function() {
                    self.show();
                });
            }
            self.input.blur(function() {
                self.close();
            });
            
            var li_mouseup = function() {
                self.input.value($(this).text()).change().blur();
            };
            
            select.object.on('appear', function() {
                li.mouseup(li_mouseup);
            }).on('disappear', function() {
                li.off('mouseup', li_mouseup);
            });
            
            self.input.keyup(function(e) {
                var k = e.keyCode;
                if (k == 27) {
                    self.close();
                } else if (k != 38 && k != 40) {
                    self.show();
                }
            }).keydown(function(e) {
                var k = e.keyCode;
                if (k == 13 || k == 38 || k == 40) {
                    var act = list.children('li.active!.hidden');
                    
                    if (act.length == 0) {
                        if (k == 38) {
                            act = list.children('li!.hidden').eq(-1).addClass('active');
                        }
                        if (k == 40) {
                            act = list.children('li!.hidden').eq(0).addClass('active');
                        }
                    } else {
                        if (k == 13) {
                            act.emit('mouseup');
                            return 0;
                        } else if (k == 38) {
                            var n = act.prev('!.hidden').addClass('active');
                            list.scrollTop(n.offset().top - select.list.clientHeight()/2);
                        } else if (k == 40) {
                            var n = act.next('!.hidden').addClass('active');
                            list.scrollTop(n.offset().top - select.list.clientHeight()/2);
                        }
                        act.removeClass('active');
                    }
                    e.preventDefault();
                }
            });
        },
        refresh: function() {
            var self = this,
                select = self.selectable,
                li = select.list.children('li').removeClass('active');
            
            if (! self.options.showAllValues) {
                li.filter(function() { return (this.text().indexOf(self.input.value()) === 0 ? true : false); }).show().removeClass('hidden');
                li.filter(function() { return (this.text().indexOf(self.input.value()) !== 0 ? true : false); }).hide().addClass('hidden');
            }
            
            var nh = li.not('.hidden');
            
            if(nh.length > 0 && nh.filter('.active').length === 0) {
                select.object.show();
                nh.first().addClass('active');
            } else {
                select.object.hide();
                nh.removeClass('active');
            }
        },
        show: function() {
            this.selectable.popover.show();
            this.refresh();
            return this;
        },
        close: function() {
            this.selectable.popover.close();
            return this;
        }
    });
    
    window.Typeahead = Typeahead;
    Pastels.push('Typeahead');
})(window);