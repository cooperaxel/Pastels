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
        
        var scroll = obj.children('.scroll');
        if (scroll.length > 0) {
            this.scroll = scroll.eq(0);
            var slider = this.scroll.children('.slider');
            if (slider.length > 0) {
                this.slider = slider.eq(0);
                this.scroll.append(this.slider);
            }
        } else {
            this.scroll = $.create('div.scroll');
            this.slider = $.create('div.slider');
            this.scroll.append(this.slider);
            obj.append(this.scroll);
        }
        
        var content = obj.children('.content');
        if (content.length > 0) {
            this.content = content.eq(0);
        } else {
            this.content = $.create('div.content');
            obj.nodes().not('.scroll').appendTo(this.content);
            obj.append(this.content);
        }
        
        this.object = obj;
        this.prepare();
        
        return this;
    };
    
    Scroller.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            duration: 300,
            timeout: 1500,
            showOnStart: false,
            showOnScroll: true,
            showOnHover: true,
            showAlways: false
        },
        
        prepare: function() {
            var self = this;
            
            self.object.css({ overflow:'hidden' });
            self.content.css({ overflow:'scroll' });
            
            if (! $.browser.webkit) {
                var mr = self.content.css('margin-right'),
                    pr = self.content.css('padding-right');
                self.content.css({ marginRight:(mr-30), paddingRight: (pr+30) });
            }
            
            if (self.object.css('position') === 'static') {
                self.object.css({ position: 'relative' });
            }
            self.slider.css({ position:'absolute', top:0 });
            self.update();
            
            if (self.options.showOnHover) {
                self.content.mouseover(function() {
                    self.show();
                }).mouseout(function() {
                    self.hide();
                });
            }
            if (! self.options.showOnStart) {
                self.scroll.fadeOut(1);
            }
            if (self.options.showAlways) {
                self.show();
            } else {
                self.hide();
            }
            
            self.content.scroll(function() {
                self.update();
                if (self.options.showOnScroll) {
                    self.touch();
                }
            });
        },
        update: function() {
            var self = this;
            self.slider.css({
                height: parseInt(self.content.height() * self.scroll.height() / self.content.scrollHeight()),
                top: parseInt(self.content.scrollTop() * self.scroll.height() / self.content.scrollHeight())
            });
            
            return this;
        },
        show: function() {
            if (this.timeout) {
                this.timeout = clearTimeout(this.timeout);
            }
            this.scroll.show().fadeIn(this.options.duration);
            
            return this;
        },
        hide: function() {
            var self = this;
            if (self.timeout) {
                self.timeout = clearTimeout(self.timeout);
            }
            self.timeout = setTimeout(function() {
                self.scroll.fadeOut(self.options.duration);
            }, self.options.timeout);
            
            return this;
        },
        touch: function() {
            this.show().hide();
            return this;
        }
    });
    window.Scroller = Scroller;
    
})(window);