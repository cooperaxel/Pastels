/* Pastels - JavaScript User Interface Library */

"use strict";

(function(window) {
    
    var Pastels = (function() {}).extend({
        
        version: '0.2.6',
        codename: 'Heat Wave',
        
        includes: [],
        require: function(component, callback) {
            if (this.has(component) === false) {
                $.require('js/Pastels-'+component+'.js', function(window) {
                    if (callback) {
                        callback.apply(window);
                    }
                });
            } else if (callback) {
                callback.apply($.window);
            }
        },
        push: function(a) {
            if (this.includes.indexOf(a) === -1) {
                Array.prototype.push.call(this.includes, a);
                this.emit('pushed', { value: a });
            }
        },
        load: function(a, b) {
            if (typeof a === 'string') {
                a = [a];
            }
            if (this.includes.contains.apply(this.includes, a) === false) {
                for (var i = 0; i < a.length; i++) {
                    if (this.has(a[i]) === false) {
                        this.require(a[i]);
                    }
                }
                this.on('pushed', function() {
                    if (Pastels.includes.contains.apply(Pastels.includes, a)) {
                        b.apply(Pastels);
                    }
                }, false);
            } else {
                b.apply(this);
            }
        },
        has: function(a) {
            return (this.includes.indexOf(a) !== -1);
        },
        media: {
            micro: 'screen and (max-width:320px)',
            mini: 'screen and (max-width:480px)',
            small: 'screen and (max-width:640px)',
            medium: 'screen and (max-width:960px)',
            large: 'screen and (max-width:1025px)',
            xl: 'screen and (max-width:1280px)',
            xxl: 'screen and (min-width:1281px)'
        }
    });
    
    Pastels.prototype = {
        
        setOptions: function(o) {
            this.options = this.options.extend(o);
            this.insertToDOM();
            if(this.prepare)
                this.prepare();
            if(this.setPosition)
                this.setPosition();
            this.removeFromDOM();
        },
        inDOM: function() {
            return this.object.item(0).parentNode ? true : false;
        },
        insertToDOM: function(p) {
            if(! this.inDOM() && this.object) {
                if(!p) p = $();
                p.append(this.object);
            }
        },
        removeFromDOM: function() {
            if(this.inDOM() && this.object) {
                this.object.remove();
            }
        },
        destroy: function() {
            this.object.emit('destroy');
        },
        send: function(event, extra) {
            this.emit('Pastels.'+event, extra);
            if (this.object) {
                this.object.emit('Pastels.'+event, extra);
            }
            return this;
        }
    };
    
    $.each(['Alert','Hint','ImageSlider','Notification','PopOver','Scroller','Selectable','Switch','Typeahead'], function(k) {
        window[k] = function() {
            var $this = this,
                args = arguments;
            return Pastels.require(k, function() {
                if (window[k] !== $this) {
                    return window[k].apply(window, args);
                }
            });
        };
        $.prototype[k] = function(a1, a2, a3) {
            var self = this,
            fu = function(k) {
                $.each(self, function(n) {
                    n[k] = eval("new "+k+"(this, a1, a2, a3);");
                });
            };
            if (!Pastels.has(k) && self.length > 0) {
                Pastels.require(k, $.invoke(fu, window, k));
            } else if (self.length > 0) {
                fu(k);
            }
            return this;
        };
    });
    
    $.prototype.PastelsListener = function(event, callback) {
        return this.on('Pastels.'+event, callback);
    };
    
    $.prototype.dragNdrop = function() {
        var self = this;
        
        self.mousedown(function(e) {
            var $this = $(this), pos = { x: e.clientX, y: e.clientY };
            
            $this.css({ position:'absolute' });
            if($this.parent().css('position') == 'static') {
                $this.parent().css({ position: 'relative' });
            }
            pos.x = pos.x - $this.origin().x - $this.parent().origin().x;
            pos.y = pos.y - $this.origin().y - $this.parent().origin().y;               
            
            $.document.on('mousemove', function(e) {
                var x = e.clientX - pos.x, y = e.clientY - pos.y;
                
                $this.css({ left: x, top: y });
                
                if(x < 0) 
                    $this.css({ left: 0 });
                else if(x+$this.clientWidth() >= $().clientWidth()) 
                    $this.css({ left: $().clientWidth()-$this.clientWidth() });
                
                if(y < 0) 
                    $this.css({ top: 0 });
                else if(y+$this.clientHeight() >= $().clientHeight())
                    $this.css({ top: $().clientHeight()-$this.clientHeight()-1 });
                
            }).on('mouseup', function() {
                $.document.off('mousemove mouseup');
            });
        });
        return this;
    };
    
    $.loadLocalValues = function() {
        if($.localValues) {
            $('*[name][data-local-value]').each(function() {
                this.value = localStorage.getObject(this.tagName+'-'+this.name);
            }).on('change', function() {
                localStorage.setObject(this.tagName+'-'+this.name, this.value);
            });
        }
    };
    
    window.Pastels = Pastels;
})(window);

$(function() {
    $().removeClass('preload');
    if ($.browser.mobile) {
        window.scrollTo(0, 0);
    }
    
    $('.popover-handler').PopOver();
    $('.selectable-handler').Selectable();
    $('.typeahead-handler').Typeahead();
    $('.scroller').Scroller();
    $('[data-hint]').Hint();
    $('.switch, .switch-input').Switch();
    $('.image-slider').ImageSlider();
    
    var navs = $('nav.bar, .navbar');
    navs.each(function() {
        var $this = this,
            li = $this.find('li'),
            li_a = $this.find('li a');
        
        $this.find('a').each(function() {
            if (this.attr('href') == window.location.hash) {
                li.removeClass('active');
                this.parents('li').addClass('active');
                return false;
            }
        });
        
        li_a.mousedown(function(e) {
            li.removeClass('active');
            $(this).parent().addClass('active');
        });
        li.mousedown(function(e) {
            var self = $(this);
            if (e.target != self.children('a').item(0))
                self.children('a').emit('mousedown');
        });
    });
    
    if ($.browser.webkit !== true) {
        $('input[type=checkbox]', 'input[type=radio]').each(function(n) {
            var type = n.type,
                span = $.create('span.'+type);
            
            span.addClass(n.className);
            this.hide().after(span);
            
            span.mouseup($.invoke(this.click, this));
        });
    }
});