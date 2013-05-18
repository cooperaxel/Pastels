/* Pastels Hint */

"use strict";

(function(window) {
    
    var Hint = function(handler, opt) {
        if (!(this instanceof Hint)) {
            return new Hint(handler, opt);
        }
        var self = this, s, e;
        
        self.options = {}.extend(Hint.prototype.defaults, opt);
        
        var dir = handler.data('hintDirection');
        if (dir) {
            self.options.direction = dir;
        }
        
        var trigger = handler.data('hintTrigger');
        if (trigger) {
            self.options.trigger = trigger;
        }
        
        self.object = $.create('div.hint');
        self.handler = handler;
        self.object.html(handler.attr(self.options.catch));
                
        switch (self.options.trigger) {
            case 'click': {
                s = 'mousedown';
                e = 'mouseup';
                break;
            }
            case 'hover': {
                s = 'mouseover';
                e = 'mouseout';
                break;
            }
            case 'focus': {
                s = 'focus';
                e = 'blur';
                break;
            }
            default: {
                s = 'mouseover';
                e = 'mouseout';
            }
        }
        handler.on(s, $.invoke(self.show, self)).on(e, $.invoke(self.close, self));
        
        return self;
    };
    
    Hint.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            catch:'data-hint',
            direction:'bottom',
            trigger:'hover',
            delay: 200,
            delayOnClose: 1000,
            margin: 15,
            duration: 400
        },
        setPosition: function() {
            var self = this,
                object = self.object,
                handler = self.handler,
                posX = 0, posY = 0, 
                offset = handler.offset(),
                origin = handler.origin();
            
            origin.x = origin.x - offset.parent.parentNode.scrollLeft;
            origin.y = origin.y - offset.parent.parentNode.scrollTop;
            
            if (this.options.direction == 'left') {
                posX = parseInt(origin.x - object.clientWidth() - self.options.margin);
                posY = parseInt(origin.y + (handler.clientHeight() - object.clientHeight())/2);
            } else if (this.options.direction == 'bottom') {
                posX = parseInt(origin.x + (handler.clientWidth() - object.clientWidth())/2);
                posY = parseInt(origin.y + handler.clientHeight() + self.options.margin);
            } else if (this.options.direction == 'top') {
                posX = parseInt(origin.x + (handler.clientWidth() - object.clientWidth())/2);
                posY = parseInt(origin.y - object.clientHeight() - self.options.margin);
            } else if (this.options.direction == 'overlay') {
                posX = parseInt(origin.x + (handler.clientWidth() - object.clientWidth())/2);
                posY = parseInt(origin.y + (handler.clientHeight() - object.clientHeight())/2);
            } else {
                posX = parseInt(origin.x + handler.clientWidth() + self.options.margin);
                posY = parseInt(origin.y + (handler.clientHeight() - object.clientHeight())/2);   
            }
            
            var m = 5;
            
            if (posX < m) { posX = m; }
            if (posY < m) { posY = m; }
            
            if (posX + object.clientWidth() > document.width - m) {
                posX = document.width - m;
            }
            if (posY + object.clientHeight() > document.height - m) {
                posY = document.height - m;
            }
            
            object.css({ position:'absolute', top: posY+'px', left: posX+'px' });
        },
        
        show: function() {
            var self = this;
            self.object.opacity(0);
            self.insertToDOM();
            self.setPosition();
            
            if (self.timeout) {
                self.timeout = clearTimeout(self.timeout);
            }
            self.timeout = setTimeout($.invoke(self.object.fadeIn, self.object, [self.options.duration]), self.options.delay);
        },
        
        close: function() {
            var self = this;
            clearTimeout(self.timeout);
            self.timeout = setTimeout(function() {
                self.object.fadeOut(self.options.duration, $.invoke(self.removeFromDOM, self));
            }, self.options.delayOnClose);
        }
    });
    
    window.Hint = Hint;
    Pastels.push('Hint');
})(window);