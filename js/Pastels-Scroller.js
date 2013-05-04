/* Pastels Scroller */

"use strict";

(function(window) {
    
    var Scroller = function(obj, space, opt) {
        if(!(this instanceof Scroller)) {
            return new Scroller(obj, space, opt);
        }
        
        if(!obj) {
            obj = $.create('nav.scroller');
        }
        
        this.options = {}.extend(Scroller.prototype.defaults, opt);
        this.object = obj;
        this.scrollSpace = space || $();
        this.prepare();
        
        return this;
    };
    
    $.prototype.Scroller = function(opt) {
        $.each(this, function() {
            this.scroller = new Scroller($(this), opt);
        });
        return this;
    };
    
    Scroller.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            
        },
        
        prepare: function() {
            var self = this;
            
            this.object.find('a').click(function(e) {
                var href = this.href.substring(this.href.indexOf('#')),
                    el = self.scrollSpace.find(href);
                
                if(el.length > 0) {
                    self.jumpTo(el, href);
                }
                e.preventDefault(); 
            });
        },
        
        jumpTo: function(el, href) {
            var s = { top: window.scrollTop, left: window.scrollLeft };
            window.location.hash = href;
            window.scrollTo(s.left, s.top);
            this.scrollSpace.scrollTo(0, el.origin().y - this.scrollSpace.offset().top);
        },
        scrollToTop: function() {
            
        }
    });
    window.Scroller = Scroller;
    
})(window);