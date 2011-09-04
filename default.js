function SelectionManager(document, selectedClass, keyManager) {	// SelectionManager
	this.document = document;
	this.body = $(document).find('body');
	this.selection;
	this.selectedClass = selectedClass;
	this.Keys = keyManager;
};
SelectionManager.prototype = {
	select: function(object) {
		if (this.selection != undefined) this.selection.remove();
		this.selection = new Selection(this, object);
	}
};

function getStyle(name, el) {
	return el.ownerDocument.defaultView.getComputedStyle(el,null)[name] || el.style[name] || undefined;
}
function getStyleNum(name, el) {
	var value = getStyle(name, el);
	if (value == undefined) value = 0;
	else value = Number(value.replace('px',''));
	return value;
}

function Handle(settings) {
	this.$controls = settings.controls,
	this.parent = settings.parent || settings.controls,
	this.startDragCallback = settings.startDrag,
	this.dragCallback = settings.drag,
	this.endDragCallback = settings.endDrag,
	this.clickCallback = settings.click,
	this.selection = settings.selection,
	this.object = settings.object,
	this.element = settings.element,
	this.handleCssClass = settings.handleCssClass,
	this.modifyX = settings.modifyX,
	this.modifyY = settings.modifyY,
	this.styles = (settings.handleStyles != undefined) ? settings.handleStyles : {},
	this.cssClass = settings.cssClass,
	this.text = (settings.text != undefined) ? settings.text : '',
	this.objectStyles = {};
	this.dragClass = 'drag';
	
	this.makeHandle();
	
	this.$body = $(this.element.ownerDocument).find('html');
}
Handle.prototype = {
	makeHandle: function() {
		var that = this;
		this.$element = (this.element == undefined) ? $('<span class="handle '+ this.cssClass +'">'+ this.text +'</span>') : $(this.element);
		this.$element.css(this.styles).mousedown(function(event) {
			that.startDrag(event);
			return false;
		}).click(function(event) {
			that.click(event);
			return false;
		});
		this.$element.appendTo(this.parent);
		this.element = this.$element[0];
		
		return false;
	},
	startDrag: function(event) {
		this.isDragging = true;
		this.startMouseX = event.pageX;
		this.startMouseY = event.pageY;
		this.target = event.target;
		this.$target = $(this.target).addClass(this.dragClass);
		this.$body.addClass(this.dragClass).addClass(this.cssClass);
		this.saveInitialProps(this.modifyX);
		this.saveInitialProps(this.modifyY);
		
		var that = this;
		this.$body.mousemove(function(event) { that.drag(event); })
				  .mouseup(function() { that.endDrag(event); });
		var Keys = this.selection.manager.Keys;
		Keys.listen(Keys.ESCAPE, function(event) {
			that.cancelDrag(event);
		});
		this.callFn(this.startDragCallback, event);
	},
	drag: function(event) {
		if (this.isDragging) {
			this.callFn(this.dragCallback, event);
			var css = this.getNewProps(this.modifyX, this.modifyY, event.pageX, event.pageY);
			$(this.object).css(css);
			this.selection.updateControls();
		}
	},
	endDrag: function(event) {
		this.isDragging = false;
		this.$body.unbind('mousemove').unbind('mouseup');
		this.objectStyles = {};
		this.callFn(this.endDragCallback, event);
		this.$body.removeClass(this.dragClass).removeClass(this.cssClass);
		this.$target.removeClass(this.dragClass);
	},
	cancelDrag: function(event) {
		$(this.object).css(this.getInitialProps());
		this.selection.updateControls();
		this.endDrag();
	},
	saveInitialProps: function(obj) {
		for (var prop in obj) {
			console.log(prop);
			console.log(getStyleNum(prop, this.object));
			this.objectStyles[prop] = getStyleNum(prop, this.object);
		}
	},
	getInitialProps: function() {
		var css = {};
		for (var prop in this.modifyX) {
			css[prop] = this.objectStyles[prop];
		}
		for (var prop in this.modifyY) {
			css[prop] = this.objectStyles[prop];
		}
		return css;
	},
	getNewProps: function(objX, objY, mouseX, mouseY) {
		var css = {};
		for (var prop in this.modifyX) {
			css[prop] = this.objectStyles[prop] - (this.startMouseX - mouseX) * this.getPropModX(prop);
		}
		for (var prop in this.modifyY) {
			css[prop] = this.objectStyles[prop] - (this.startMouseY - mouseY) * this.getPropModY(prop);
		}
		return css;
	},
	getPropModX: function(prop) {
		return this.getPropMod(this.modifyX, prop);
	},
	getPropModY: function(prop) {
		return this.getPropMod(this.modifyY, prop);
	},
	getPropMod: function(dir, prop) {
		if (dir != undefined && dir[prop] != undefined) return dir[prop];
		return 1;
	},
	
	click: function(event) {
		this.callFn(this.clickCallback, event);
	},
	callFn: function(fn, event) {
		if (fn != undefined) fn.call(this, event, $(this.object));
	}
};

function Selection(manager, element) {
	var hoverClass = '';
	this.element = element,
	this.$element = $(element),
	this.manager = manager;
	this.$element.removeClass(hoverClass);
	this.makeControls();
	this.showRules();
	$('#controls, #box, #padding').live('mouseover', function() { $(this).addClass(hoverClass); return false; })
		 .live('mouseout', function() { $(this).removeClass(hoverClass); return false; });
	this.$element.addClass(this.manager.selectedClass);
}
Selection.prototype = {
	remove: function() {
		this.$controls.remove();
		$(this.element).removeClass(this.manager.selectedClass);
	},
	showRules: function() {
		var rules = this.element.ownerDocument.defaultView.getMatchedCSSRules(this.element, '');
		var str = '<ul class="sheets">';
		var ruleObj = {};
		var sheet = '';
		for (var i=rules.length-1; i>=0; i--) {
			var sheetHref = rules[i].parentStyleSheet.href.split('/');
			var newSheet = sheetHref[ sheetHref.length-1 ];
			str += '<li>';
			if (newSheet != sheet) {
				str += '<span class="sheet">'+ newSheet +'</span>';
				sheet = newSheet;
			}
			str += '<span class="selector">'+ rules[i].selectorText +'</span><ul class="rules">';
			for (var j=0; j<rules[i].style.length; j++) {
				var attr = rules[i].style[j];
				var val = rules[i].style[attr];
				var strike = '';
				if (attr in ruleObj) {
					strike = ' class="strike"';
				} else {
					ruleObj[attr] = val;
				}
				str += '<li'+strike+'><label>' + attr + ':</label> <!--<input type="text" name="'+ attr +'" class="attr" value="' + val + '">-->'+ val +'</li>';
			}
			str += '</ul></li>';
		}
		str += '</ul>';
		var styles = $('.styles').html(str);
	},
	getStyle: function(name) {
		var el = this.element;
		return getStyle(name, el);
	},
	getStylePixels: function(name) {
		var el = this.element;
		return getStyleNum(name, el);
	},
	getLabel: function() {
		var label = this.element.tagName;
		var id = this.$element.attr('id');
		var classes = this.$element.attr('class');
		label += '<span class="meta">';
		if (id != undefined) label += '#' + id;
		if (classes != undefined) label += '.' + classes.replace(' ', '.');
		label += '</span>';
		return label;
	},
	modifyElement: function($label, selector) {
		var selParts = selector.split(/\.|\#/);
		var tagname = selParts[0];
		var replace = false;
		if (tagname != this.element.tagName) replace = true;
		var id;
		var hash = selector.indexOf('#');
		if (hash != -1) {
			id = selector.substr(hash+1).split('.')[0];
			if (!replace) this.$element.attr('id', id);
		}
		var dot = selector.indexOf('.');
		var classes;
		if (dot != -1) {
			classes = selector.substr(dot+1).split('.');
			if (!replace) this.$element.attr('class', classes.join(' '));
		}
		if (replace) {
			var html = this.$element.html();
			var string = '<' + tagname;
			if (id != undefined) string += ' id="' + id + '"';
			if (classes != undefined) string += ' class="' + classes.join(' ') + '"';
			string += '>' + html + '</' + tagname + '>';
			var $string = $(string);
			this.$element.replaceWith($string);
			this.$element = $string;
			this.element = this.$element[0];
		}
		console.log(this.getLabel());
		$label.html(this.getLabel());
		
	},
	makeControls: function() {
		this.$controls = $('<div id="controls" class="controls margin"><div id="box" class="box"><span class="label">'+this.getLabel()+'</span><div id="padding" class="pad"></div></div></div>')
							.appendTo(this.manager.body);
		this.$box = this.$controls.find('.box');
		this.$padding = this.$controls.find('.pad');
		
		var cornerDist = '7px';
		var sizeHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { 'width':1 },
			modifyY: { 'height':1 },
			cssClass: 'bottom right size',
			text:'WH'
		});
		var moveHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { 'left':1 },
			modifyY: { 'top':1 },
			cssClass: 'top left',
			text:'TL'
		});
		/*var rightHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { 'width':1 },
			cssClass: 'width right',
			text: 'W'
		});
		var bottomHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyY: { 'height':1 },
			cssClass: 'height bottom',
			text: 'H'
		});
		var topHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyY: { 'top':1 },
			cssClass: 'top',
			text: 'T'
		});
		var leftHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { 'left':1 },
			cssClass: 'left',
			text: 'L'
		});*/
		// padding handles
		var topRightPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-top':1 },
			modifyX: { 'padding-right':1 },
			cssClass: 'top right padding',
			text: 'P'
		});
		var botLeftPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-bottom':1 },
			modifyX: { 'padding-left':1 },
			cssClass: 'bottom left padding',
			text: 'P'
		});
		/*var topPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-top':1 },
			cssClass: 'top padding',
			text: 'P'
		});
		var leftPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyX: { 'padding-left':1 },
			cssClass: 'left padding',
			text: 'P'
		});
		var rightPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyX: { 'padding-right':-1 },
			cssClass: 'right padding',
			text: 'P'
		});
		var botPadHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-bottom':-1 },
			cssClass: 'bottom padding',
			text: 'P'
		});*/
		// margin handles
		var topRightMarHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'margin-top':1 },
			modifyX: { 'margin-right':1 },
			cssClass: 'top right margin',
			text: 'M'
		});
		var botLeftMarHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'margin-bottom':1 },
			modifyX: { 'margin-left':1 },
			cssClass: 'bottom left margin',
			text: 'M'
		});
		/*var topMarHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyY: { 'margin-top':1 },
			cssClass: 'top margin',
			text: 'M'
		});
		var leftMarHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyX: { 'margin-left':1 },
			cssClass: 'left margin',
			text: 'M'
		});
		var botMarHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyY: { 'margin-bottom':1 },
			cssClass: 'bottom margin',
			text: 'M'
		});
		var rightMarHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyX: { 'margin-right':1 },
			cssClass: 'right margin',
			text: 'M'
		});*/
		
		/*var cornerHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { '-webkit-border-radius':1 },
			handleStyles: { 'bottom':handleWidth, 'right':0 },
			cssClass: 'corner'
		});*/
		
		// make spans editable
		var that = this;
		
		$(this.manager.body).find('span.label').click(function() {
			if ($(this).find('input').length > 0) return false;
			var $label = $(this);
			var attr = $label.attr('class').replace(' edit');
			var text = $label.text();
			$label.html('');
			$input = $('<input type="text" name="element" value="'+ text +'">').appendTo($label).blur(function() {
				that.modifyElement($label, $input.val());
			}).keyup(function(event) {
				if (event.keyCode == 13) that.modifyElement($label, $input.val());
			});
			console.log('label clicked');
			return false;
		});
		this.updateControls();
	},
	updateControls: function() {
		// make controls align with selected element
		var $element = this.$element;
		var offset = $element.offset(),
			w = $element.width(),
			h = $element.height(),
			t = this.getStylePixels('top'),
			r = this.getStylePixels('right'),
			b = this.getStylePixels('bottom'),
			l = this.getStylePixels('left'),
			mt = this.getStylePixels('marginTop'),
			mr = this.getStylePixels('marginRight'),
			mb = this.getStylePixels('marginBottom'),
			ml = this.getStylePixels('marginLeft'),
			pt = this.getStylePixels('paddingTop'),
			pr = this.getStylePixels('paddingRight'),
			pb = this.getStylePixels('paddingBottom'),
			pl = this.getStylePixels('paddingLeft'),
			bt = this.getStylePixels('borderWidthTop'),
			br = this.getStylePixels('borderWidthRight'),
			bb = this.getStylePixels('borderWidthBottom'),
			bl = this.getStylePixels('borderWidthLeft');
		this.$controls.css({
			'top': offset.top-bt-mt+(mt>0 ? 0 : 1)+'px',
			'left': offset.left-bl-ml+(ml>0 ? 0 : 1)+'px',
			'width': w+pl+pr+bl+br+ml+mr-2+'px',
			'height': h+pt+pb+bt+bb+mt+mb-2+'px',
			'border-top-width': mt>0 ? '1px' : '0',
			'border-right-width': mr>0 ? '1px' : '0',
			'border-bottom-width': mb>0 ? '1px' : '0',
			'border-left-width': ml>0 ? '1px' : '0'
			
		});
		this.$box.css({
			'top': mt+bt-1+'px',
			'left': ml+bl-1+'px',
			'right': mr+br-1+'px',
			'bottom': mb+bb-1+'px'
			
		});
		this.$padding.css({
			'top': pt-1+'px',
			'left': pl-1+'px',
			'right': pr-1+'px',
			'bottom': pb-1+'px',
			'border-top-width': pt>0 ? '1px' : '0',
			'border-right-width': pr>0 ? '1px' : '0',
			'border-bottom-width': pb>0 ? '1px' : '0',
			'border-left-width': pl>0 ? '1px' : '0'
		});
	
	}
}

function KeyManager(selectors) {
	this.BACKSPACE = 8;
	this.TAB = 9;
	this.ENTER = 13;
	this.SHIFT = 16;
	this.CTRL = 17;
	this.ALT = 18;
	this.PAUSE = 19;
	this.CAPS_LOCK = 20;
	this.ESCAPE = 27;
	this.PAGEUP = 33;
	this.SPACE = 33;
	this.PAGEDOWN = 34;
	this.END = 35;
	this.HOME = 36;
	this.LEFT = 37;
	this.UP = 38;
	this.RIGHT = 39;
	this.DOWN = 40;
	this.INSERT = 45;
	this.DELETEKEY = 46;
	this.NUM0 = 48;
	this.NUM1 = 49;
	this.NUM2 = 50;
	this.NUM3 = 51;
	this.NUM4 = 52;
	this.NUM5 = 53;
	this.NUM6 = 54;
	this.NUM7 = 55;
	this.NUM8 = 56;
	this.NUM9 = 57;
	this.A = 65;
	this.B = 66;
	this.C = 67;
	this.D = 68;
	this.E = 69;
	this.F = 70;
	this.G = 71;
	this.H = 72;
	this.I = 73;
	this.J = 74;
	this.K = 75;
	this.L = 76;
	this.M = 77;
	this.N = 78;
	this.O = 79;
	this.P = 80;
	this.Q = 81;
	this.R = 82;
	this.S = 83;
	this.T = 84;
	this.U = 85;
	this.V = 86;
	this.W = 87;
	this.X = 88;
	this.Y = 89;
	this.Z = 90;
	this.OS_LEFT = 91;
	this.OS_RIGHT = 92;
	this.SELECT = 93;
	this.NUMPAD0 = 96;
	this.NUMPAD1 = 97;
	this.NUMPAD2 = 98;
	this.NUMPAD3 = 99;
	this.NUMPAD4 = 100;
	this.NUMPAD5 = 101;
	this.NUMPAD6 = 102;
	this.NUMPAD7 = 103;
	this.NUMPAD8 = 104;
	this.NUMPAD9 = 105;
	this.MULTIPLY = 106;
	this.ADD = 107;
	this.SUBTRACT = 109;
	this.DECIMAL_POINT = 110;
	this.DIVIDE = 111;
	this.F1 = 112;
	this.F2 = 113;
	this.F3 = 114;
	this.F4 = 115;
	this.F5 = 116;
	this.F6 = 117;
	this.F7 = 118;
	this.F8 = 119;
	this.F9 = 120;
	this.F10 = 121;
	this.F11 = 122;
	this.F12 = 123;
	this.NUM_LOCK = 144;
	this.SCROLL_LOCK = 145;
	this.SEMICOLON = 186;
	this.EQUAL = 187;
	this.COMMA = 188;
	this.DASH = 189;
	this.PERIOD = 190;
	this.FORWARDSLASH = 191;
	this.GRACE_ACCENT = 192;
	this.OPEN_BRACKET = 219;
	this.BACKSLASH = 220;
	this.CLOSE_BRACKET = 221;
	this.SINGLE_QUOTE = 222;
	
	this.pressed = [];
	this.listeners = [];
	
	// bind key event functionality
	var that = this;
	$(selectors).keydown(function(event) {
		that.pressed.push(event.keyCode);
		
	}).keyup(function(event) {
		if (that.pressed.indexOf(event.keyCode) != -1) {
			that.pressed.pop(that.pressed.indexOf(event.keyCode));
		}
		var fns = that.listeners[event.keyCode];
		if (fns != undefined) {
			for (var i=0; i < fns.length; i++) {
				fns[i].call(this, event);
			}
		}
		
	});
}
KeyManager.prototype = {
	is_pressed: function(key) {
		if (this.pressed.indexOf(key) != -1) return true;
		return false;
	},
	listen: function(keys, fn) {
		if (keys.length > 0) {
			for (i=0; i< keys.length; i++) {
				this.add_listener(keys[i], fn);
			}
		} else {
			this.add_listener(keys, fn);
		}
		return this;
	},
	add_listener: function(key, fn) {
		if (this.listeners[key] == undefined) this.listeners[key] = [];
		this.listeners[key].push(fn);
	}
};



var SM,
	Keys,
	Drag,
	hoverClass = 'hover';
$(document).ready(function() {
	var iframe = $('#iframe')[0];
	iframe.onload = function() {
		Keys = new KeyManager($(iframe.contentDocument).add(document));
		SM = new SelectionManager(iframe.contentDocument, 'active', Keys);
		var iframeDoc = this.contentDocument;
		$(iframeDoc).mousedown(function(evt) {
			SM.select(evt.target);
		}).mouseover(function(event) {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
			$(event.target).addClass(hoverClass);
		}).mouseout(function() {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
		});
		Keys.listen(Keys.X, function(event) {
			console.log(this);
			console.log(event);
		});
	};
	
	
});

