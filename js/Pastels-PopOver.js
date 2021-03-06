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
            obj;
        
        if (opt && opt.object instanceof Swordfish) {
            if (opt.object.is('div')) {
                obj = opt.object;
            } else {
                obj = $.create('div.popover');
                obj.append(opt.object);
            }
            delete opt.object;
        } else if (name && name.length > 0) {
            obj = $('#'+name);
        } else if (handler.hasAttr('id')) {
            obj = $('#popover-'+handler.attr('id'));
        }
        
        self.options = {}.extend(PopOver.prototype.defaults, opt, $.parseData(data));
        self.handler = handler;
        
        if(obj && obj.length > 0) {
            self.object = obj.addClass('popover');
        } else {
            self.object = $.create('div.popover');
        }
        
        self.insertToDOM();
        self.prepare();
        self.removeFromDOM();
        
        return self;
    };
    
    PopOver.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            align: false,
            dark: false,
            effect: 'slide',
            position: 'auto',
            parentPositioning: false,
            duration: 300,
            refreshPosition: true,
            setPosition: true,
            arrow: true,
            roundCorner: true,
            inheritWidth: false,
            overlay: false,
            closeOthers: true,
            allowReclick: true,
            selectList: false,
            changeValueOnSelect: false,
            defaultActions: true,
            fullscreen: false,
            movementX: 0,
            movementY: 0,
            margin: 1
        },
        prepare: function() {
            var self = this,
                object = self.object,
                handler = self.handler;
            
            if (this.object.hasClass('tabbed')) {
                var aside = object.children('aside'),
                    sections = object.children('section'),
                    li = aside.find('li');
                
                sections.hide();
                
                li.mouseup(function() {
                    var id = $(this).attr('id'),
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
            
            if (self.options.arrow) {
                if(object.children('.popover-arrow').length == 0) {
                    self.arrow = $.create('.popover-arrow');
                    object.append(self.arrow);
                } else {
                    self.arrow = object.children('.popover-arrow');
                }
            }
            if (! self.options.roundCorner) {
                object.css({ borderRadius: 0, paddingTop: 1, paddingBottom: 0 });
            }
            if (self.options.inheritWidth) {
                object.css({ minWidth: handler.clientWidth() - (object.clientWidth() - object.width()) });
            }
            if (self.options.dark) {
                object.addClass('dark');
            }
            if (self.options.defaultActions) {
                self.handler.mousedown(function() {
                    self.show();
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
            if (self.options.fullscreen) {
                $.mediaListener(Pastels.media.small, $.invoke(self.setPosition, self), false, false);
            }
            if (! self.options.refreshPosition) {
                self.setPosition();
            }
            object.mousedown(function(e) {
                e.stopPropagation();
            });
        },
        
        setPosition: function() {
            var self = this,
                object = self.object;
            
            if (self.options.fullscreen) {
                var mql = $.media(Pastels.media.small),
                    hc = object.hasClass('fullscreen');
                
                if (mql === true && hc === false) {
                    object.addClass('fullscreen');
                    self.emit('fullscreen.entered');
                } else if (mql === false && hc === true) {
                    object.removeClass('fullscreen');
                    self.emit('fullscreen.leaved');
                }
                if (mql === true) {
                    return self;
                }
            }
            
            var handler = self.handler, 
                arrow = self.arrow, 
                posX = 0, posY = 0, arrowX = 0, arrowY = 0, arrowLength = 0, arrowRadius = 0,
                position = '',
                origin = handler.origin();
            
            object.show().opacity(0);
            
            if (self.options.arrow) {
                arrowLength = parseInt(arrow.height()/2)+1;
                arrowRadius = parseInt(Math.ceil((Math.sqrt(2) * arrow.clientHeight())/2))+1;
            } else {
                arrowLength = 1;
                arrowRadius = 1;
            }           
            
            if (['auto','vertical'].contains(self.options.position)) {
                var bh = $().clientHeight();
                if (object.clientHeight() > origin.y || origin.y + handler.clientHeight() + object.clientHeight() < bh/2) {
                    position = 'below';
                } else {
                    position = 'above';
                }
            } else if (self.options.position === 'horizontal') {
                var bw = $().clientWidth();
                if (object.clientWidth() > origin.x || origin.x + handler.clientWidth() + object.clientWidth() < bw) {
                    position = 'right';
                } else {
                    position = 'left';
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
                if (self.options.parentPositioning || handler.offset().bottom < 10) {
                    posY += handler.parent().clientHeight() - handler.clientHeight() - handler.offset().top;
                }
            } else if (position === 'above') {
                posX = origin.x + handler.clientWidth()/2 - object.clientWidth()/2;
                posY = origin.y - object.clientHeight() - arrowRadius - self.options.margin;
                arrowX = object.clientWidth()/2 - arrowLength;
                arrowY = object.clientHeight() - arrowLength;
                self.radio = 1;
                if (self.options.parentPositioning || handler.offset().top < 10) {
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
            
            if (['below','above'].contains(position)) {
                if (self.options.align === 'left') {
                    posX = origin.x;
                } else if (self.options.align === 'right') {
                    posX = origin.x + handler.clientWidth() - object.clientWidth();
                }
            } else if (['left','right'].contains(position)) {
                if (self.options.align === 'top') {
                    posY = origin.y;
                } else if (self.options.align === 'bottom') {
                    posY = origin.y + handler.clientHeight() - object.clientWidth();
                }
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
            
            object.removeClass('below above right left').addClass(position);
            self.position = position;
            
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
            self.emit('position.changed');
            return self;
        },
        show: function() {
            var self = this,
                object = self.object;
            
            if (object.hasClass('active')) {
                if (self.options.allowReclick !== true) {
                    self.close();
                }
                return self;
            }
            if (self.options.closeOthers) {
                $().emit('mousedown');
            }
            self.insertToDOM();
            if(self.options.refreshPosition) {
                self.setPosition();
            }
            object.addClass('active');
            object.show().effect(self.getEffect(), self.options.duration, function() {
                object.find('input, textarea').focus();
                object.emit('appear');
                
                var mousedown = function(e) {
                    if (e.target !== object.item()) {
                        $().off('mousedown', mousedown).off('mouseup', mouseup);
                        self.close();
                    }
                };
                var mouseup = function() {
                    $().on('mousedown', mousedown, false);
                };
                
                $().on('mousedown', mousedown, false);
            });
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
                switch (this.position) {
                    case 'below':
                        return 'slideDown';
                    case 'above':
                        return 'slideUp';
                    case 'left':
                        return 'slideLeft';
                    case 'right':
                        return 'slideRight';
                }
            }
            return this.options.effect;
        },
        isActive: function() {
            return this.object.hasClass('active');
        }
    });
    
    window.PopOver = PopOver;
    Pastels.push('PopOver');
})(window);