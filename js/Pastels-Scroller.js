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
        var self = this;
        self.options = {}.extend(Scroller.prototype.defaults, opt);
        
        if (self.options.preventOnMobile && $.browser.mobile) {
            obj.removeClass('scroller content');
            return self;
        }
        
        if (!(obj.item() instanceof HTMLDivElement) && !(obj.item() instanceof HTMLBodyElement)) {
            self.content = obj;
            self.object = $.create('div.scroller');
            self.content.wrap(self.object);
        } else {
            var content = obj.children('.content');
            if (content.length > 0) {
                self.content = content.eq(0).removeClass('content');
            } else {
                self.content = $.create('div');
                obj.nodes().appendTo(self.content);
                obj.append(self.content);
            }
            self.object = obj.addClass('scroller');
        }
        
        self.scroll_x = $.create('div.scroll-x');
        self.scroll_x.slider = $.create('div.slider');
        self.scroll_x.append(self.scroll_x.slider);
        self.object.append(self.scroll_x);
        
        self.scroll_y = $.create('div.scroll-y');
        self.scroll_y.slider = self.scroll_x.slider.clone();
        self.scroll_y.append(self.scroll_y.slider);
        self.object.append(self.scroll_y);
        
        self.scrolls = $(self.scroll_x, self.scroll_y);
        self.prepare();
        
        return self;
    };
    
    Scroller.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            duration: 300,
            timeout: 800,
            showOnStart: false,
            showOnHover: true,
            showAlways: false,
            autoColor: true,
            vertical: true,
            horizontal: false,
            preventOnMobile: false
        },
        
        prepare: function() {
            var self = this;
            
            if (self.object.parent().isInFlow() === false) {
                self.options.width = self.content.offsetWidth();
                self.options.height = self.content.offsetHeight();
                self.restoreSize();
            }
            self.content.addClass('content');
            if (self.options.vertical) {
                self.content.css({ overflowY: 'scroll' });
            }
            if (self.options.horizontal) {
                self.content.css({ overflowX: 'scroll' });
            }
            self.scrolls.css({ opacity: 0 });
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
                if (self.object.item() === document.body) {
                    $('html').css({ overflow:'hidden' });
                    $().css({ overflow:'hidden' });
                    self.content.children().css({ marginRight: '--15' });
                }
                self.content.css({ marginRight: '--20', paddingRight: '++20',
                                marginBottom: '--20', paddingBottom: '++20' });
            }
            if ($.browser.firefox && self.content.item() === document.body) {
                self.content.css({ overflowY: 'hidden', overflowX: 'hidden' });
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
                self.content.mouseover(function() { self.update().show(); })
                    .mouseout($.invoke(self.hide, self));
            }
            
            if (self.options.showOnStart || self.options.showAlways) {
                self.update().show();
            } else {
                self.hide();
            }
            
            self.content.on('touchstart', function(e) {
                self.update().show();
            });
            self.content.scroll(function(e) {
                self.touch();
            });
            self.update();
        },
        update: function() {
            var self = this;
            if (self.options.horizontal) {
                self.scroll_x.slider.css({
                    width: parseInt(self.content.clientWidth() * self.scroll_x.width() / self.content.scrollWidth()),
                    left: parseInt(self.content.scrollLeft() * self.scroll_x.width() / self.content.scrollWidth())
                });
            }
            if (self.options.vertical) {
                self.scroll_y.slider.css({
                    height: parseInt(self.content.clientHeight() * self.scroll_y.height() / self.content.scrollHeight()),
                    top: parseInt(self.content.scrollTop() * self.scroll_y.height() / self.content.scrollHeight())
                });
            }
            
            return this;
        },
        show: function() {
            if (this.timeout) {
                this.timeout = clearTimeout(this.timeout);
            }
            if (this.options.horizontal && this.content.scrollWidth() > this.content.clientWidth()) {
                this.scroll_x.show().fadeIn(this.options.duration);
            }
            if (this.options.vertical && this.content.scrollHeight() > this.content.clientHeight()) {
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
            this.update().show().hide();
            return this;
        },
        restoreSize: function(z) {
            var self = this;
            if (!z && self.options.width && self.options.height) {
                self.object.css({ width: self.options.width, height: self.options.height });
            } else {
                self.object.css({ width: null, height: null });
            }
            return self;
        }
    });
    
    window.Scroller = Scroller;
    Pastels.push('Scroller');
})(window);