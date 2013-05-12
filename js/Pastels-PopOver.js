/* Pastels PopOver */

"use strict";

(function(window) {
    
    var PopOver = function(handler, opt) {
        if(!(this instanceof PopOver)) {
            return new PopOver(handler, opt);
        }
        var self = this,
            data = handler.data('popover'),
            name = handler.data('popover-name'),
            values = handler.data('values'),
            obj;
        
        this.options = {}.extend(PopOver.prototype.defaults, opt);
        this.handler = handler;
        
        if(data) {
            if(data.indexOf('no-arrow') !== -1) {
                this.options.arrow = false;
            }
            if(data.indexOf('no-round-corner') !== -1) {
                this.options.roundCorner = false;
            }
            if(data.indexOf('inherit-width') !== -1) {
                this.options.inheritWidth = true;
            }
            if(data.indexOf('overlay') !== -1) {
                this.options.overlay = true;
            }
            if (data.indexOf('no-animation') !== -1) {
                this.options.duration = 0;
            }
            if (data.indexOf('change-on-select') !== -1) {
                this.options.changeValueOnSelect = true;
            }
            if (data.indexOf('dark') !== -1) {
                this.options.dark = true;
            }
        }
        
        if (name && name.length > 0) {
            obj = $('#'+name);
        } else if (handler.hasAttr('id')) {
            obj = $('#popover-'+handler.attr('id'));
        }
        
        if(obj && obj.length > 0) {
            obj.addClass('popover');
            if(obj.item(0).tagName.toLowerCase() == 'ul') {
                this.object = $.create('div.popover.selectable');
                this.selectList = obj;
                obj.wrap(this.object);
                this.options.selectList = true;
            } else if(this.options.selectList) {
                this.object = obj;
                this.selectList = $.create('ul');
                this.object.prepend(this.selectList).addClass('selectable');
            } else if(obj.children('ul').length > 0) {
                this.object = obj.addClass('selectable');
                this.selectList = obj.children('ul');
                this.options.selectList = true;
            } else {
                this.object = obj;
                this.body = this.object.children('section');
            }
        } else {
            this.object = $.create('.popover');
            if(!values) {
                this.body = $.create('section');
                this.object.append(this.body);
            } else {
                this.selectList = $.create('ul');
                this.object.prepend(this.selectList).addClass('selectable');
                this.options.selectList = true;
            }
        }
        
        if (values) {
            var arr = values.split(','), li = $.create('li');
            for(var i = 0; i < arr.length; i++) {
                this.selectList.append(li.clone().html(arr[i]));
            }
        }

        this.insertToDOM();
        this.prepare();
        if (! this.options.refreshPosition) {
            this.setPosition();
        }
        this.removeFromDOM();
        
        return this;
    };
    
    PopOver.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            align: false,
            dark: false,
            effect: 'slide',
            position: 'auto',
            parentPositioning: true,
            duration: 300,
            refreshPosition: true,
            arrow: true,
            roundCorner: true,
            inheritWidth: false,
            overlay: false,
            closeOthers: true,
            selectList: false,
            changeValueOnSelect: false,
            defaultsActions: true,
            movementX: 0,
            movementY: 0,
            margin: 1
        },
        prepare: function() {
            var self = this,
                object = self.object,
                handler = self.handler;
            
            if (self.options.arrow) {
                if(object.children('.popover-arrow').length == 0) {
                    self.arrow = $.create('.popover-arrow');
                    object.append(self.arrow);
                } else {
                    self.arrow = object.children('.popover-arrow');
                }
            }
            if (! self.options.roundCorner) {
                object.css({ borderRadius: 0, paddingTop: 0, paddingBottom: 0 });
            }
            if (self.options.inheritWidth) {
                object.css({ minWidth: handler.clientWidth() - (object.clientWidth() - object.width()) });
            }
            if (self.options.dark) {
                object.addClass('dark');
            }
            if (self.options.defaultsActions) {
                object.mousedown(function(e) {
                    e.stopPropagation();
                });
                
                handler.mousedown(function(e) {
                    e.stopPropagation();
                    if (self.options.closeOthers) {
                        $.document.emit('mousedown');
                    }
                    if (object.hasClass('active')) {
                        self.close();
                    } else {
                        if(self.options.refreshPosition) {
                            self.insertToDOM();
                            self.setPosition();
                        }
                        self.show();
                    }
                });
                
                object.find('button[type=cancel]').mouseup(function() {
                    object.emit('cancel');
                    self.close();
                });
                object.find('button[type=submit]').mouseup(function() {
                    object.emit('submit');
                    self.close();
                });
            
            }
            if (self.options.selectList) {
                var c = self.selectList.children('li');
                
                if (! self.selectList.parent().item().Scroller) {
                    self.selectList.Scroller();
                }
                
                c.mouseup(function(e) {
                    e.stopPropagation();
                    var n = this.attr('name');
                    object.emit('selected', { index: c.indexOf(this), value: (n ? n : this.html()) });
                    self.close();
                }).mouseover(function(e) {
                    e.stopPropagation();
                    c.removeClass('active');
                    this.addClass('active');
                }).mouseout(function() {
                    this.removeClass('active');
                }).click(function(e) {
                    var a = this.children('a');
                    if (a.length === 1) {
                        a.active().click();
                    }
                });
            } else if (this.object.hasClass('tabbed')) {
                var aside = object.children('aside'),
                    sections = object.children('section'),
                    li = aside.find('li');
                
                sections.hide();
                
                li.mouseup(function() {
                    var id = this.attr('id'),
                        max = 0;
                    
                    sections.css({ opacity: 0 }).show().each(function(e,i) {
                        var height = this.clientHeight();
                        if (max < height) {
                            max = height;
                        }
                    }).hide().css({ opacity: 1 });
                    aside.css({ height: max });
                    
                    li.removeClass('active');
                    this.addClass('active');
                    sections.filter('#section-'+id).show();
                });
                
                li.get(0).mouseup();
            }
        },
        
        setPosition: function() {
            var self = this,
                object = self.object,
                handler = self.handler, 
                arrow = self.arrow, 
                posX = 0, posY = 0, arrowX = 0, arrowY = 0, arrowLength = 0, arrowRadius = 0,
                position = 'below',
                origin = handler.origin();
            
            object.show().opacity(0);
            
            if(self.options.arrow) {
                arrowLength = parseInt(arrow.height()/2)+1;
                arrowRadius = parseInt(Math.ceil((Math.sqrt(2) * arrow.clientHeight())/2))+1;
            } else {
                arrowLength = 1;
                arrowRadius = 1;
            }           
            
            if(self.options.position === 'auto') {
                var bh = $().clientHeight();
                if (object.clientHeight() > origin.y || origin.y + handler.clientHeight() + object.clientHeight() < bh/2) {
                    position = 'below';
                } else {
                    position = 'above';
                }
            } else {
                position = self.options.position;
            }
            
            if (position === 'below') {
                posX = origin.x + handler.clientWidth()/2 - object.clientWidth()/2;
                posY = origin.y + handler.clientHeight() + arrowRadius + self.options.margin;
                arrowX = object.clientWidth()/2 - arrowLength;
                arrowY = -arrowLength-1;
                self.radio = -1;
                if (self.options.parentPositioning) {
                    posY += handler.parent().clientHeight() - handler.clientHeight() - handler.offset().top;
                }
            } else if (position === 'above') {
                posX = origin.x + handler.clientWidth()/2 - object.clientWidth()/2;
                posY = origin.y - object.clientHeight() - arrowRadius - self.options.margin;
                arrowX = object.clientWidth()/2 - arrowLength;
                arrowY = object.clientHeight() - arrowLength;
                self.radio = 1;
                if (self.options.parentPositioning) {
                    posY -= handler.offset().top;
                }
            } else if (position === 'right') {
                posX = origin.x + handler.clientWidth() + arrowRadius + self.options.margin;
                posY = origin.y + handler.clientHeight()/2 - object.clientHeight()/2;
                arrowX = -arrowLength-1;
                arrowY = object.clientHeight()/2 - arrowLength;
                
            } else if (position === 'left') {
                posX = origin.x - object.clientWidth() - arrowRadius - self.options.margin;
                posY = origin.y + handler.clientHeight()/2 - object.clientHeight()/2;
                arrowX = object.clientWidth() - arrowLength;
                arrowY = object.clientHeight()/2 - arrowLength;
            }
            
            if (self.options.align === 'left') {
                posX = origin.x;
            } else if (self.options.align === 'right') {
                posX = origin.x + handler.clientWidth() - object.clientWidth();
            }
            
            if (posX < 0) {
                arrowX = arrowX + posX;
                posX = handler.offset().left;
            }
            var diff = posX + object.clientWidth() - window.outerWidth;
            if (diff > 0) {
                arrowX = arrowX + diff + handler.offset().right;
                posX = window.outerWidth - object.clientWidth() - handler.offset().right;
            }
            
            if (self.options.arrow) {
                arrow.css({ left: arrowX, top: arrowY });
            }
            if (self.options.overlay) {
                posY = posY - handler.clientHeight();
            }
            
            self.options.translateY = self.options.translateY * self.radio;
            object.removeClass('below above right left').addClass(position);
            
            if (handler.parents('.fixed').length > 0) {
                object.css({ position:'fixed' });
            } else {
                object.css({ position:'absolute' });
            }
            object.css({ left: posX+self.options.movementX, top: posY+self.options.movementY, opacity:0, translateY: self.options.translateY, scale: self.options.scale }).hide();
            
            if(['below','above'].indexOf(position) !== -1) {
                object.transformOrigin(arrowX+arrowLength+2, arrowY);
            } else {
                object.transformOrigin(arrowX, arrowY+arrowRadius+2);
            }
        },
        show: function() {
            var self = this,
                object = self.object;
            
            if(! object.hasClass('active')) {
                self.insertToDOM();
                object.addClass('active');
                object.show().effect(self.getEffect(), self.options.duration, function() {
                    object.find('input, textarea').focus();
                    object.emit('appear');
                });
                
                $.document.on('mouseup', function() {
                    $.document.on('mousedown', function(e) {
                        if (e.target !== object.item()) {
                            self.close();
                            $.document.off('mousedown mouseup');
                        }
                    });
                });
            }
            return self;
        },
        close: function() {
            var self = this,
                object = self.object;
            if(object.hasClass('active')) {
                object.closeEffect(self.getEffect(), self.options.duration, function() {
                    object.emit('disappear');
                    object.removeClass('active');
                    object.hide();
                    self.removeFromDOM();
                });
            }
            return self;
        },
        getEffect: function() {
            if (this.options.effect === 'slide') {
                if (this.object.hasClass('below')) {
                    return 'slideDown';
                } else {
                    return 'slideUp';
                }
            }
            return this.options.effect;
        }
    }); 
    window.PopOver = PopOver;
    
})(window);