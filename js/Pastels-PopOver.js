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
            if(data.indexOf('refresh') !== -1) {
                this.options.refreshPosition = true;
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
        
        if (name) {
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
        this.setPosition();
        this.removeFromDOM();
        
        return this;
    };
    
    PopOver.prototype = {}.extend(Pastels.prototype, {
        defaults: {
            align: false,
            dark: false,
            effect: 'scale',
            position: 'auto',
            parentPositioning: true,
            duration: 300,
            refreshPosition: false,
            arrow: true,
            roundCorner: true,
            inheritWidth: false,
            overlay: false,
            selectList: false,
            changeValueOnSelect: false,
            defaultsActions: true,
            movementX: 0,
            movementY: 0,
            margin: 1,
            translateY: 0,
            scale: 0.1
        },
        prepare: function() {
            var self = this;
            if(this.options.arrow) {
                if(this.object.children('.popover-arrow').length == 0) {
                    this.arrow = $.create('.popover-arrow');
                    this.object.append(this.arrow);
                } else {
                    this.arrow = this.object.children('.popover-arrow');
                }
            }
            if(! this.options.roundCorner) {
                this.object.css({ borderRadius: 0, paddingTop: 0, paddingBottom: 0 });
            }
            if(this.options.inheritWidth) {
                this.object.css({ minWidth: this.handler.clientWidth() - (this.object.clientWidth() - this.object.width()) });
            }
            if (this.options.dark) {
                this.object.addClass('dark');
            }
            if(this.options.defaultsActions) {
                this.handler.mousedown(function(e) {
                    e.stopPropagation();
                    $.document.emit('mousedown');
                    
                    self.object.mousedown(function(e) {
                        e.stopPropagation();
                    });
                
                    $.document.on('mouseup', function() {
                        $.document.on('mousedown', function() {
                            self.close();
                            $.document.off('mousedown mouseup');
                        });
                    });
                    
                    if(self.options.refreshPosition) {
                        self.insertToDOM();
                        self.setPosition();
                    }
                    
                    self.show();
                });
                
                self.object.find('button[type=cancel]').mouseup(function() {
                    self.object.emit('cancel');
                    self.close();
                });
                self.object.find('button[type=submit]').mouseup(function() {
                    self.object.emit('submit');
                    self.close();
                });
            
            }
            if(this.options.selectList) {
                var c = this.selectList.children('li');

                c.mouseup(function(e) {
                    e.stopPropagation();
                    var n = this.getAttribute('name');
                    self.object.emit('selected', { index: c.indexOf(this), value: (n ? n : this.innerHTML) });
                    self.close();
                }).mouseover(function(e) {
                    e.stopPropagation();
                    c.removeClass('active');
                    this.addClass('active');
                }).mouseout(function() {
                    this.removeClass('active');
                }).click(function(e) {
                    var a = $(this).children('a');
                    if (a.length === 1) {
                        a.item(0).click();
                    }
                });
            } else if (this.object.hasClass('tabbed')) {
                var aside = this.object.children('aside'),
                    sections = this.object.children('section'),
                    li = aside.find('li');
                
                
                sections.hide();
                
                li.mouseup(function() {
                    var $this = $(this),
                        id = $this.attr('id'),
                        max = 0;
                    
                    sections.css({opacity:0}).show().each(function(e,i) {
                        var height = $(this).clientHeight();
                        if (max < height) {
                            max = height;
                        }
                    }).hide().css({opacity:1});
                    aside.css({ height: max });
                    
                    li.removeClass('active');
                    $this.addClass('active');
                    sections.filter('#section-'+id).show();
                });
                
                li.get(0).mouseup();
            }
        },
        
        setPosition: function() {
            var handler = this.handler, 
                self = this, 
                posX = 0, posY = 0, arrowX = 0, arrowY = 0, arrowLength = 0, arrowRadius = 0,
                origin = this.handler.origin();
            
            if(this.options.arrow) {
                arrowLength = parseInt(this.arrow.height()/2)+1;
                arrowRadius = parseInt(Math.ceil((Math.sqrt(2) * this.arrow.clientHeight())/2))+1;
            } else {
                arrowLength = 1;
                arrowRadius = 1;
            }           
            
            if(self.options.position === 'auto') {
                var bh = $().scrollHeight(), bw = $().scrollWidth();
                if(origin.x < bh/2 || this.object.clientHeight() > origin.y) {
                    this.options.position = 'below';
                } else {
                    this.options.position = 'above';
                }
            }
            
            if(self.options.position === 'below') {
                posX = origin.x + handler.clientWidth()/2 - this.object.clientWidth()/2;
                posY = origin.y + handler.clientHeight() + arrowRadius + self.options.margin;
                arrowX = this.object.clientWidth()/2 - arrowLength;
                arrowY = -arrowLength-1;
                this.radio = -1;
                if(self.options.parentPositioning) 
                    posY += handler.parent().clientHeight() - handler.clientHeight() - handler.offset().top;                    
            } else if(self.options.position === 'above') {
                posX = origin.x + handler.clientWidth()/2 - this.object.clientWidth()/2;
                posY = origin.y - this.object.clientHeight() - arrowRadius - self.options.margin;
                arrowX = this.object.clientWidth()/2 - arrowLength;
                arrowY = this.object.clientHeight() - arrowLength;
                this.radio = 1;
                if(self.options.parentPositioning)
                    posY -= handler.offset().top;
            } else if(self.options.position === 'right') {
                posX = origin.x + handler.clientWidth() + arrowRadius + self.options.margin;
                posY = origin.y + handler.clientHeight()/2 - this.object.clientHeight()/2;
                arrowX = -arrowLength-1;
                arrowY = this.object.clientHeight()/2 - arrowLength;
                
            } else if(self.options.position === 'left') {
                posX = origin.x - this.object.clientWidth() - arrowRadius - self.options.margin;
                posY = origin.y + handler.clientHeight()/2 - this.object.clientHeight()/2;
                arrowX = this.object.clientWidth() - arrowLength;
                arrowY = this.object.clientHeight()/2 - arrowLength;
            }
            
            if(this.options.align === 'left') {
                posX = origin.x;
            } else if(this.options.align === 'right') {
                posX = origin.x + handler.clientWidth() - this.object.clientWidth();
            }
            
            if (posX < 0) {
                arrowX = arrowX + posX;
                posX = handler.offset().left;
            }
            var diff = posX + this.object.clientWidth() - window.outerWidth;
            if (diff > 0) {
                arrowX = arrowX + diff + handler.offset().right;
                posX = window.outerWidth - this.object.clientWidth() - handler.offset().right;
            }
            
            if(this.options.arrow) 
                this.arrow.css({ left: arrowX, top: arrowY });
            if(this.options.overlay) 
                posY = posY - handler.clientHeight();
            
            this.options.translateY = this.options.translateY * this.radio;
            this.object.removeClass('below above right left').addClass(self.options.position);
            
            if (this.handler.parents('.fixed').length > 0) {
                this.object.css({ position:'fixed' });
            } else {
                this.object.css({ position:'absolute' });
            }
            this.object.css({ left: posX+self.options.movementX, top: posY+self.options.movementY, opacity:0, translateY: self.options.translateY, scale: self.options.scale }).hide();
            
            if(['below','above'].indexOf(this.options.position) !== -1) {
                this.object.css({ origin: (arrowX+arrowLength+2)+'px '+arrowY+'px' });
            } else {
                this.object.css({ origin: arrowX+'px '+(arrowY+arrowRadius+2)+'px' });
            }
        },
        
        show: function() {
            var self = this;
            this.insertToDOM();
            if(! this.object.hasClass('active')) {
                this.object.show().animate({ opacity:1, translateY:0, scale:1 }, this.options.duration, function() {
                    self.object.find('input, textarea').focus();
                    self.object.addClass('active');
                    self.object.emit('appear');
                });
            }
            return this;
        },
        
        close: function() {
            var self = this;
            if(this.object.hasClass('active')) {
                this.object.animate({ opacity:0, translateY:-self.options.translateY, scale: self.options.scale }, this.options.duration, function() {
                    self.object.removeClass('active');
                    self.object.emit('disappear');
                    self.object.css({ opacity:0, translateY: self.options.translateY, scale: self.options.scale, display:'none' });
                    setTimeout(function() { self.removeFromDOM(); }, 100);
                });
            }
            return this;
        },      
    }); 
    window.PopOver = PopOver;
    
})(window);