/* Pastels Scroller */

"use strict";

(function(window) {
    
    var Scroller = function(obj, opt) {
        if (!(this instanceof Scroller)) {
            return new Scroller(obj, opt);
        }
        if (!obj) {
            return null;
        }
        
        this.options = {}.extend(Scroller.prototype.defaults, opt);
        obj.addClass('scroller');
        
        var content = obj.children('.content');
        if (content.length > 0) {
            this.content = content.eq(0);
        } else {
            this.content = $.create('div.content');
            obj.nodes().appendTo(this.content);
            obj.append(this.content);
        }
        
        this.scroll_x = $.create('div.scroll-x');
        this.scroll_x.slider = $.create('div.slider');
        this.scroll_x.append(this.scroll_x.slider);
        obj.append(this.scroll_x);
        
        this.scroll_y = $.create('div.scroll-y');
        this.scroll_y.slider = this.scroll_x.slider.clone();
        this.scroll_y.append(this.scroll_y.slider);
        obj.append(this.scroll_y);
        
        this.scrolls = $(this.scroll_x, this.scroll_y);
        this.object = obj;
        this.prepare();
        
        return this;
    };
    
    Scroller.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            duration: 300,
            timeout: 1000,
            showOnStart: false,
            showOnHover: true,
            showAlways: false,
            autoColor: true
        },
        
        prepare: function() {
            var self = this;
            
            self.object.css({ overflow:'hidden' });
            self.content.css({ overflow:'scroll' });
            self.scrolls.css({ opacity:0 });
            if (self.object.css('position') === 'static') {
                self.object.css({ position: 'relative' });
            }
            
            if (self.options.autoColor) {
                if ($.isBright(self.object.css('background-color'))) {
                    self.object.removeClass('bright');
                } else {
                    self.object.addClass('bright');
                }
            }
            
            if (! $.browser.webkit) {
                self.content.css({ marginRight: '--20', paddingRight: '++20',
                                  marginBottom: '--20', paddingBottom: '++20' });
            }
            if (self.content.scrollWidth() > self.content.clientWidth()) {
                self.scroll_y.css({ marginBottom: '++7' });
            }
            if (self.content.scrollHeight() > self.content.clientHeight()) {
                self.scroll_x.css({ marginRight: '++7' });
            }
            
            self.scroll_x.slider.css({ position:'absolute', left:0 });
            self.scroll_y.slider.css({ position:'absolute', top:0 });
            self.update();
            
            if (self.options.showOnHover) {
                self.content.mouseover($.invoke(self.show, self))
                    .mouseout($.invoke(self.hide, self));
            }
            
            if (self.options.showOnStart || self.options.showAlways) {
                self.show();
            } else {
                self.hide();
            }
            
            self.content.scroll($.invoke(self.touch, self));
        },
        update: function() {
            var self = this;
            self.scroll_x.slider.css({
                width: parseInt(self.content.clientWidth() * self.scroll_x.width() / self.content.scrollWidth()),
                left: parseInt(self.content.scrollLeft() * self.scroll_x.width() / self.content.scrollWidth())
            });
            self.scroll_y.slider.css({
                height: parseInt(self.content.clientHeight() * self.scroll_y.height() / self.content.scrollHeight()),
                top: parseInt(self.content.scrollTop() * self.scroll_y.height() / self.content.scrollHeight())
            });
            
            return this;
        },
        show: function() {
            if (this.timeout) {
                this.timeout = clearTimeout(this.timeout);
            }
            if (this.content.scrollWidth() > this.content.clientWidth()) {
                this.scroll_x.show().fadeIn(this.options.duration);
            }
            if (this.content.scrollHeight() > this.content.clientHeight()) {
                this.scroll_y.show().fadeIn(this.options.duration);
            }
            
            return this;
        },
        hide: function() {
            var self = this;
            if (self.timeout) {
                self.timeout = clearTimeout(self.timeout);
            }
            self.timeout = setTimeout(function() {
                self.scrolls.fadeOut(self.options.duration);
            }, self.options.timeout);
            
            return this;
        },
        touch: function() {
            if (this.content.scrollHeight() > this.content.height()) {
                this.update().show().hide();
            } else {
                this.hide();
            }
            return this;
        }
    });
    window.Scroller = Scroller;
    
})(window);