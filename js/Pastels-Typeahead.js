/* Pastels Typeahead */

"use strict";

(function(window) {
    
    var Typeahead = function(input, list, opt) {
        if(!(this instanceof Typeahead)) {
            return new Typeahead(handler, list, opt);
        }

        var self = this, data = input.data('typeahead');
        
        this.options = {}.extend(Typeahead.prototype.defaults, opt);
        this.input = input;
        this.list = list;
        
        if(data) {
            var m = parseInt(data);
            if(m > 0) {
                this.options.visibleElements = m;
            }
            if(data.indexOf('inheritWidth') !== -1) {
                this.options.inheritWidth = true;
            }
            if(data.indexOf('onfocus') !== -1) {
                this.options.showOnFocus = true;
            }
            if(data.indexOf('asc') !== -1) {
                this.options.sort = 'asc';
            } else if(data.indexOf('desc') !== -1) {
                this.options.sort = 'desc';
            }
        }

        this.prepare();

        return this;
    };
    
    $.prototype.Typeahead = function(opt) {
        $.each(this, function() {
            var name = this.getAttribute('name'),
                obj = name ? $('ul#typeahead-'+name) : null;
                
            this.typeahead = new Typeahead($(this), obj, opt);
        });
        return this;
    };
    
    Typeahead.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            align: 'left',
            inheritWidth: false,
            showOnFocus: false,
            showAllValues: false,
            enterToComplete: false,
            visibleElements: 0,
            sort: false
        },
        prepare: function() {
            var self = this;
            this.input.popover = new PopOver(this.list, this.input, { position:'below', arrow: false, inheritWidth: this.options.inheritWidth, align: this.options.align, defaultsActions: false, translateY: 0 });
            
            if(! this.list)
                this.list = this.input.popover.selectList;
            
            if(this.options.sort == 'asc') {
                this.list.children('li').sort();
            } else if(this.options.sort == 'desc') {
                this.list.children('li').sort().reverse();
            }
            
            if(self.options.visibleElements > 0 && li.length > self.options.visibleElements) {
                self.input.popover.object.show();
                self.list.css({ maxHeight: li.clientHeight()*self.options.visibleElements });
                self.input.popover.object.hide();
            }
            
            this.input.mousedown(function() {
                self.show();
            });
            
            self.input.keyup(function(e) {
                var k = e.keyCode;
                if(k == 27)
                    self.close();
                else if(k != 38 && k != 40)
                    self.show();
                //e.preventDefault();
            }).keydown(function(e) {
                var k = e.keyCode;
                if(k == 13 || k == 38 || k == 40) {
                    var act = self.input.popover.selectList.children('li.active!.hidden');
                    
                    if(act.length == 0) {
                        if(k == 38)
                            act = self.input.popover.selectList.children('li!.hidden').eq(-1).addClass('active');
                        if(k == 40)
                            act = self.input.popover.selectList.children('li!.hidden').eq(0).addClass('active');
                    } else {
                        if(k == 13) {
                            act.emit('mouseup');
                            return 0;
                        } else if(k == 38) {
                            var n = act.prev('!.hidden').addClass('active');
                            self.list.scrollTop(n.offset().top - self.list.clientHeight()/2);
                        } else if(k == 40) {
                            var n = act.next('!.hidden').addClass('active');
                            self.list.scrollTop(n.offset().top - self.list.clientHeight()/2);
                        }
                        act.removeClass('active');
                    }
                    e.preventDefault();
                }
            }).blur(function() {
                self.close();
            });
            
            self.input.popover.selectList.children('li').mouseup(function() {
                self.input.value(this.innerHTML).focus().change();
            });
        },
        
        refresh: function() {
            var self = this, li = this.list.children('li').removeClass('active');
            
            if(!this.options.showAllValues) {
                li.filter(function() { return (this.innerHTML.indexOf(self.input.value()) === 0 ? true : false); }).show().removeClass('hidden');
                li.filter(function() { return (this.innerHTML.indexOf(self.input.value()) !== 0 ? true : false); }).hide().addClass('hidden');
            }
            
            var nh = li.not('.hidden');
            
            if(nh.length > 0 && nh.filter('.active').length === 0) {
                this.input.popover.object.show();
                nh.first().addClass('active');
            } else {
                this.input.popover.object.hide();
                nh.removeClass('active');
            }
        },
        
        show: function() {
            var self = this;
            this.input.popover.show();
            this.refresh();
        },
        
        close: function() {
            var self = this;
            
            self.input.popover.close();
        }
    });
    window.Typeahead = Typeahead;
    
})(window);