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
	this.listeners = {
		'press': {},
		'down': {},
		'up': {},
	};
	
	// bind key event functionality
	var that = this;
	$(selectors).keydown(function(event) {
		var fns = that.listeners['down'][event.keyCode];
		if (fns != undefined) {
			for (var i=0; i < fns.length; i++) {
				fns[i].call(this, event);
			}
		}
		if (that.pressed.indexOf(event.keyCode) == -1) {
			that.pressed.push(event.keyCode);
		}
		
	}).keyup(function(event) {
		if (that.pressed.indexOf(event.keyCode) != -1) {
			that.pressed.pop(that.pressed.indexOf(event.keyCode));
		}
		var fns = that.listeners['press'][event.keyCode];
		if (fns != undefined) {
			for (var i=0; i < fns.length; i++) {
				fns[i].call(this, event);
			}
		}
		var fns = that.listeners['up'][event.keyCode];
		if (fns != undefined) {
			for (var i=0; i < fns.length; i++) {
				fns[i].call(this, event);
			}
		}
		
	});
}
KeyManager.prototype = {
	isPressed: function(key) {
		if (this.pressed.indexOf(key) != -1) return true;
		return false;
	},
	press: function(keys, fn) {
		this.listen('press', keys, fn);
		return this;
	},
	down: function(keys, fn) {
		this.listen('down', keys, fn);
		return this;
	},
	up: function(keys, fn) {
		this.listen('up', keys, fn);
		return this;
	},
	listen: function(action, keys, fn) {
		if (keys.length > 0) {
			for (var i=0, len=keys.length; i<len; i++) {
				this.addListener(action, keys[i], fn);
			}
		} else {
			this.addListener(action, keys, fn);
		}
		return this;
	},
	addListener: function(action, key, fn) {
		if (this.listeners[action][key] == undefined) this.listeners[action][key] = [];
		this.listeners[action][key].push(fn);
	}
};

// style modes
LAYOUT = 0, DECORATION = 1, TEXT = 2;

function Dispatch(doc) {
	this.doc = doc,
	this.domrules = doc.styleSheets[0].rules,
	this.rules = [],
	this.listeners = {
		'modifyStyle': [],
		'modifyStyles': [],
		'modifyRule': [],
		'selectRule': [],
		'selectElement': [],
		'changeStyleMode': [],
		'search': [],
	},
	this.styleMode = LAYOUT, // LAYOUT = 0, DECORATION = 1, TEXT = 2
	this.selectedRule,
	this.selectedElement,
	this.$selectedElement,
	this.rulesDict = {};
	
	// INITIATE MODELS
	for (var i=0, len=this.domrules.length, rule; i<len; i++) {
		rule = new Rule(this.domrules[i], this, i);
		this.rules.push(rule);
		this.rulesDict[rule.selector] = rule;
	}
	
	// SETUP MODEL EVENT LISTENERS
	this.listen('modifyStyle', function(attr, val) {
		this.rules[this.selectedRule].set(attr, val);
	});
	this.listen('modifyStyles', function(styles) {
		var rule = this.rules[this.selectedRule];
		for (var attr in styles) {
			rule.set(attr, styles[attr]);
		}
	});
	this.listen('selectRule', function(ruleId) {
		this.selectRule(ruleId);
	});
	this.listen('selectElement', function(el) {
		this.selectedElement = el;
		this.$selectedElement = $(el);
	});
	this.listen('changeStyleMode', function(mode) {
		this.styleMode = mode;
	});
}
Dispatch.prototype = {
	listen: function(event, fn) {
		this.listeners[event].push(fn);
	},
	call: function(event) {
		var listeners = this.listeners[event],
			args = Array.prototype.slice.call(arguments);
		args.shift();
		for (var i=0, len=listeners.length; i<len; i++) {
			listeners[i].apply(this, args);
		}
	},
	//	this method gets the browser's list of matched rules
	//	and returns corresponding internal rules
	//	it also selects a rule if the selected rule
	//	doesn't apply to the selected element
	getElementRules: function() {
		var el = this.selectedElement;
		var matchRules = el.ownerDocument.defaultView.getMatchedCSSRules(el, '');
		var rules = [];
		var hasSelected = false;
		for (var i=0, len=matchRules.length; i<len; i++) {
			var rule = this.rulesDict[matchRules[i].selectorText];
			rules.push(rule);
			if (rule.id == this.selectedRule) hasSelected = true;
		}
		if (!hasSelected) this.selectRule(rules[rules.length-1].id);
		return rules;
	},
	selectRule: function(ruleId) {
		if (this.selectedRule != undefined) {
			this.rules[this.selectedRule].deactivate();
		}
		this.selectedRule = ruleId;
		this.rules[ruleId].activate();
	},
	getSelectedRule: function() {
		return this.rules[this.selectedRule];
	},
};

function Rule(rule, manager, i) {
	this.rule = rule;
	this.selector = rule.selectorText;
	this.style = rule.style;
	this.id = i;
	this.active = false;
	this.activeClass = 'inactive';
	
	var sheetParts = rule.parentStyleSheet.href.split('/');
	this.sheet = sheetParts[sheetParts.length-1];
}
Rule.prototype = {
	set: function(attr, val) {
		if (val == undefined) this.style.removeProperty(attr);
		else this.style.setProperty(attr, val);
	},
	get: function(attr) {
		return this.style.getPropertyValue(attr);
	},
	remove: function(attr) {
		this.style.removeProperty(attr);
	},
	activate: function() {
		this.active = true;
		this.activeClass = 'active';
	},
	deactivate: function() {
		this.active = false;
		this.activeClass = 'inactive';
	},
	hasAttr: function(attr) {
		return this.style.getPropertyValue(attr) != null;
	},
	attrs: function() {
		var attrs = [],
			style = this.style;
		for (var i=0, len=this.style.length; i<len; i++) {
			attrs.push(style[i]);
		}
		return attrs;
	},
};

function PropertiesModule() {
	this.$el = $('#propertiesModule');
	this.template = _.template( $("#propertiesTemplate").html() );
}
PropertiesModule.prototype = {
	render: function() {
		var disp = document.CdDispatch,
			allRules = disp.rules,
			rules = disp.getElementRules();
			
		var $rendered = $(this.template( {
			rules: rules,
			styles: allRules[disp.selectedRule].style,
			curMode: disp.styleMode,
			properties: disp.StyleAttributes[disp.styleMode].properties,
		} ));
		
		$rendered.find('.selectors > li').click(function() {
			var id = Number( $(this).attr('id').replace('rule','') );
			disp.call('selectRule', id);
		}).end().find('#modes a').click(function(evt) {
			evt.preventDefault();
			var mode = Number( $(this).attr('id').replace('mode','') );
			disp.call('changeStyleMode', mode);
		}).end().find('select.prop').change(function() {
			var attr = $(this).attr('name'),
				val = $(this).val();
			disp.call('modifyStyle', attr, val);
		});
		
		this.$el.html($rendered);
	},
};

function HandleModule(doc) {
	var disp = document.CdDispatch;
	this.doc = doc,
	this.$el = $('#pageHolder'),
	this.$controls = $('#controls'),
	this.$box = $('#box'),
	this.$padding = $('#padding'),
	this.$doc = $(disp.doc),
	this.handles = [];
	this.updateScroll();
	var that = this;
	this.$doc.scroll(function() { that.updateScroll(); });
	this.$coverSheet = $('#coverSheet');
	this.$grid = $('#grid');
	this.gridX = 12;
	this.gridY = 12;
	this.gridSnap = true;
	this.docOffset = this.$el.offset(),
	this.selectedHandle;
	
	this.$el.bind('click mousedown mouseup', function forwardEvents(evt) {
		var isHandle = $(evt.target).hasClass('handle');
		if (!isHandle) that.forwardMouseEvent(evt);
	});
	
	function updateControls() {
		that.update();
	}
	disp.listen('selectElement', updateControls);
	disp.listen('selectRule', updateControls);
	disp.listen('modifyStyle', updateControls);
	disp.listen('modifyStyles', updateControls);
	
	var $controls = this.$controls;
	disp.listen('changeStyleMode', function(mode) {
		var modeClasses = ['layoutMode', 'decorateMode', 'textMode'];
		$controls.removeClass(modeClasses.join(' '));
		$controls.addClass(modeClasses[disp.styleMode]);
	});
	
	// grid code
	this.renderGrid();
	disp.Keys.down(disp.Keys.SHIFT, function(evt) {
		that.showGrid();
	}).up(disp.Keys.SHIFT, function(evt) {
		that.hideGrid();
	});
}
HandleModule.prototype = {
	render: function() {
		this.addHandles('layout', document.CdDispatch.StyleAttributes[0].handles);
		this.addHandles('decorate', document.CdDispatch.StyleAttributes[1].handles);
		this.addHandles('text', document.CdDispatch.StyleAttributes[2].handles);
	},
	addHandles: function(name, defs) {
		var containers = {
			'controls': this.$controls,
			'box': this.$box,
			'padding': this.$padding,
			},
			that = this;
		for (var i=0, len=defs.length; i<len; i++) {
			var handle = new Handle({
				title: defs[i].title,
				module: that,
				text: defs[i].text,
				parent: containers[defs[i].parent],
				modifyX: defs[i].modifyX,
				modifyY: defs[i].modifyY,
				modifyXAlt: defs[i].modifyXAlt,
				modifyYAlt: defs[i].modifyYAlt,
				modifyXAltShift: defs[i].modifyXAltShift,
				modifyYAltShift: defs[i].modifyYAltShift,
				modifyXFac: defs[i].modifyXFac,
				modifyYFac: defs[i].modifyYFac,
				cssClass: defs[i].cssClass + ' ' + name,
			});
			this.handles.push(handle);
		}
	},
	renderGrid: function() {
		var w = this.$el.width(),
			h = this.$el.height(),
			x = this.gridX,
			y = this.gridY,
			gridH = '',
			gridV = '';
		for (var i=0, len=Math.round(w/x/2); i<len; i++) {
			gridH += '<div style="left:'+(x*2*i)+'px; width:'+x+'px" class="gridH"></div>';
		}
		this.$grid.append(gridH);
		
		for (var i=0, len=Math.round(h/y/2); i<len; i++) {
			gridV += '<div style="top:'+(y*2*i)+'px; height:'+y+'px" class="gridV"></div>';
		}
		this.$grid.append(gridV);
	},
	forwardMouseEvent: function(event) {
		this.$controls.hide();
		
		var mouseX = event.pageX - this.docOffset.left,
			mouseY = event.pageY - this.docOffset.top;
		var docElement = this.doc.elementFromPoint(mouseX, mouseY);
		$(docElement).trigger(event.type);
		
		this.$controls.show();
	},
	showGrid: function() {
		this.$grid.fadeIn('fast');
	},
	hideGrid: function() {
		this.$grid.fadeOut('fast');
	},
	lockCanvas: function() {
		this.$coverSheet.show();
	},
	unlockCanvas: function() {
		this.$coverSheet.hide();
	},
	updateScroll: function() {
		this.scrollTop = this.$doc.scrollTop();
		this.scrollLeft = this.$doc.scrollLeft();
	},
	// make controls align with selected element
	update: function() {
		var el = document.CdDispatch.selectedElement,
			$el = document.CdDispatch.$selectedElement,
			getStyleNum = document.getStyleNum;
		var offset = $el.offset(),
			w = $el.width(),
			h = $el.height(),
			t = getStyleNum('top', el),
			r = getStyleNum('right', el),
			b = getStyleNum('bottom', el),
			l = getStyleNum('left', el),
			mt = getStyleNum('marginTop', el),
			mr = getStyleNum('marginRight', el),
			mb = getStyleNum('marginBottom', el),
			ml = getStyleNum('marginLeft', el),
			pt = getStyleNum('paddingTop', el),
			pr = getStyleNum('paddingRight', el),
			pb = getStyleNum('paddingBottom', el),
			pl = getStyleNum('paddingLeft', el),
			bt = getStyleNum('borderTopWidth', el),
			br = getStyleNum('borderRightWidth', el),
			bb = getStyleNum('borderBottomWidth', el),
			bl = getStyleNum('borderLeftWidth', el);
		this.$controls.css({
			'top': offset.top-mt+(mt>0 ? 0 : 1)-this.scrollTop+'px',
			'left': offset.left-ml+(ml>0 ? 0 : 1)-this.scrollLeft+'px',
			'width': w+pl+pr+bl+br+ml+mr-2+'px',
			'height': h+pt+pb+bt+bb+mt+mb-2+'px',
			'border-top-width': mt>0 ? '1px' : '0',
			'border-right-width': mr>0 ? '1px' : '0',
			'border-bottom-width': mb>0 ? '1px' : '0',
			'border-left-width': ml>0 ? '1px' : '0'
		});
		this.$box.css({
			'top': mt-1+'px',
			'left': ml-1+'px',
			'right': mr-1+'px',
			'bottom': mb-1+'px'
		});
		this.$padding.css({
			'top': bt+pt-1+'px',
			'left': bl+pl-1+'px',
			'right': br+pr-1+'px',
			'bottom': bb+pb-1+'px',
			'border-top-width': pt>0 ? '1px' : '0',
			'border-right-width': pr>0 ? '1px' : '0',
			'border-bottom-width': pb>0 ? '1px' : '0',
			'border-left-width': pl>0 ? '1px' : '0'
		});
		var attrs = document.CdDispatch.getSelectedRule().attrs();
		this.$controls.find('.handle.defined').removeClass('defined');
		for (var i=0, len=attrs.length; i<len; i++) {
			this.$controls.find('#'+attrs[i]).addClass('defined');
		}
		var handles = this.handles;
		for (var i=0, len=handles.length; i<len; i++) {
			handles[i].update();
		}
	},
	selectHandle: function(handle) {
		if (this.selectedHandle != undefined) {
			this.selectedHandle.deselect();
		}
		handle.select();
		this.selectedHandle = handle;
	},
};

document.getStyleNum = function(name, el) {
	var value = el.ownerDocument.defaultView.getComputedStyle(el,null)[name] || el.style[name] || undefined;
	if (value == undefined) value = 0;
	else value = Number(value.replace('px',''));
	if (isNaN(value)) value = 0;
	return value;
}


function Handle(settings) {
	this.title = settings.title,
	this.parent = settings.parent,
	this.module = settings.module,
	this.handleCssClass = settings.handleCssClass,
	this.modifyX = settings.modifyX,
	this.modifyY = settings.modifyY,
	this.modifyXAlt = settings.modifyXAlt,
	this.modifyYAlt = settings.modifyYAlt,
	this.modifyXAltShift = settings.modifyXAltShift,
	this.modifyYAltShift = settings.modifyYAltShift,
	this.modifyXFac = (settings.modifyXFac != undefined) ? settings.modifyXFac : 1,
	this.modifyYFac = (settings.modifyYFac != undefined) ? settings.modifyYFac : 1,
	this.styles = (settings.handleStyles != undefined) ? settings.handleStyles : {},
	this.cssClass = settings.cssClass,
	this.text = (settings.text != undefined) ? settings.text : '',
	this.selected = false,
	this.objectStyles = {},
	this.dragClass = 'drag',
	this.$element = $('<span class="handle '+ this.cssClass +'" id="'+ this.title +'"><span class="labelWrap"><span class="label"></span>'+ this.text +'<span class="rem" title="remove property">x</span></span></span>'),
	this.$labelElement = this.$element.find('.label'),
	this.dispatch = document.CdDispatch,
	this.startDragInitVals = {},
	this.attributeRegex = /([0-9\.]+)([A-z%]+)/;
	
	var that = this;
	this.$element.css(this.styles).mousedown(function(event) {
		that.module.selectHandle(that);
		that.startDrag(event);
		return false;
	}).click(function(event) {
		that.click(event);
		return false;
	});
	this.$element.appendTo(this.parent);
	
	this.$body = $(document.CdDispatch.doc).find('html');
	this.$doc = $(document);
}
Handle.prototype = {
	startDrag: function(event) {
		this.isDragging = true;
		this.startMouseX = event.pageX;
		this.startMouseY = event.pageY;
		this.target = event.target;
		this.saveInitialProp(this.modifyX);
		this.saveInitialProp(this.modifyY);
		this.$element.addClass('drag');
		
		var that = this;
		this.$doc.mousemove(function(event) { that.drag(event); })
				 .mouseup(function() { that.endDrag(event); });
		
		var Keys = document.CdDispatch.Keys;
		Keys.press(Keys.ESCAPE, function(event) {
			that.cancelDrag(event);
		});
		this.module.lockCanvas();
	},
	select: function() {
		this.selected = true;
		this.$element.addClass('selected');
	},
	deselect: function() {
		this.selected = false;
		this.$element.removeClass('selected');
	},
	drag: function(event) {
		if (this.isDragging) {
			var css = this.getNewProps(event.pageX, event.pageY);
			this.updateLabel();
			document.CdDispatch.call('modifyStyles', css);
		}
	},
	endDrag: function(event) {
		this.module.unlockCanvas();
		this.isDragging = false;
		this.$body.unbind('mousemove').unbind('mouseup');
		this.objectStyles = {};
		this.startDragInitVals = {};
		this.$element.removeClass('drag');
	},
	cancelDrag: function(event) {
		var css = {},
			styles = this.objectStyles;
		for (var prop in styles) {
			css[prop] = styles[prop].val + styles[prop].unit;
		}
		document.CdDispatch.call('modifyStyles', css);
		this.endDrag();
	},
	saveInitialProp: function(prop) {
		var attr = this.dispatch.getSelectedRule().get(prop);
		if (prop != undefined && attr != null) {
			var parts = this.attributeRegex.exec(attr);
			this.objectStyles[prop] = {
				val: Number(parts[1]),
				unit: parts[2]
			};
		}
	},
	getNewProps: function(mouseX, mouseY) {
		var Keys = this.dispatch.Keys,
			modifyX = this.modifyX,
			modifyY = this.modifyY,
			modifyXAlt = this.modifyXAlt,
			modifyYAlt = this.modifyYAlt,
			modifyXAltShift = this.modifyXAltShift,
			modifyYAltShift = this.modifyYAltShift;
		var css = {};
		if (modifyX != undefined) {
			var val = this.getNewProp(modifyX, this.startMouseX - mouseX, this.modifyXFac);
			if (modifyXAltShift != undefined && Keys.isPressed(Keys.ALT) && Keys.isPressed(Keys.SHIFT)) {
				for (var i=0, len=modifyXAltShift.length; i<len; i++) {
					css[modifyXAltShift[i]] = val;
				}
			} else if (modifyXAlt != undefined && Keys.isPressed(Keys.ALT)) {
				for (var i=0, len=modifyXAlt.length; i<len; i++) {
					css[modifyXAlt[i]] = val;
				}
			} else {
				css[modifyX] = val;
			}
		}
		if (modifyY != undefined) {
			var val = this.getNewProp(modifyY, this.startMouseY - mouseY, this.modifyYFac);
			if (modifyYAltShift != undefined && Keys.isPressed(Keys.ALT) && Keys.isPressed(Keys.SHIFT)) {
				for (var i=0, len=modifyYAltShift.length; i<len; i++) {
					css[modifyYAltShift[i]] = val;
				}
			} else if (modifyYAlt != undefined && Keys.isPressed(Keys.ALT)) {
				for (var i=0, len=modifyYAlt.length; i<len; i++) {
					css[modifyYAlt[i]] = val;
				}
			} else {
				css[modifyY] = val;
			}
			//css[this.modifyY] = this.getNewProp(modifyY, this.startMouseY - mouseY, this.modifyYFac);
		}
		return css;
	},
	getNewProp: function(prop, change, fac) {
		var obj = this.objectStyles[prop];
		if (obj == undefined) {
			obj = this.startDragInitVals[prop];
		}
		if (obj == undefined) {
			var rules = this.dispatch.getElementRules();
			for (var i=0, len=rules.length; i<len; i++) {
				var val = rules[i].get(prop);
				if (val != undefined) {
					var parts = this.attributeRegex.exec(val);
					obj = {
						val: Number(parts[1]),
						unit: parts[2]
					};
					break;
				} else {
					obj = { val: 0, unit: 'px' };
				}
			}
			this.startDragInitVals[prop] = obj;
		}
		var val = obj.val - change * fac;
		return val + obj.unit;
	},
	update: function() {
		this.updateLabel();
	},
	updateLabel: function() {
		var rule = this.dispatch.getSelectedRule();
		var str = '',
			propX = this.modifyX,
			propY = this.modifyY;
		var valX = rule.get(propX),
			valY = rule.get(propY);
		if (propX == undefined && propY == undefined) {
			str = '<span class="property">'+ this.title +'</span><span class="value">not set</span>';
		} else {
			if (propX != undefined) {
				if (valX == null) valX = 'not set';
				str += '<span class="property">'+ propX +'</span><span class="value">'+ valX +'</span>';
			}
			if (propY != undefined) {
				if (valY == null) valY = 'not set';
				str += '<span class="property">'+ propY +'</span><span class="value">'+ valY +'</span>';
			}
		}
		this.$labelElement.html(str);
	},
	click: function(event) {
		if ($(event.target).hasClass('rem')) {
			var props = {};
			if (this.modifyX != undefined) props[this.modifyX] = undefined;
			if (this.modifyY != undefined) props[this.modifyY] = undefined;
			console.log(props);
			document.CdDispatch.call('modifyStyles', props);
		}
	}
};

function CssProp(attr, values) {
	this.attr = attr,
	this.values = values;
}

Dispatch.prototype.StyleAttributes = [
	{	// LAYOUT
		handles: [
			// width/height
			{
				title:'width/height',
				text:'WH',
				parent: 'box',
				modifyX: 'width',
				modifyY: 'height',
				cssClass: 'bottom right size double',
			},
			// top/left
			{
				title:'top/left',
				text:'TL',
				parent: 'box',
				modifyX: 'left',
				modifyY: 'top',
				cssClass: 'top left position double',
			},
			// add bottom/right here
			
			// padding handles
			{
				title:'padding-left',
				parent: 'padding',
				modifyX: 'padding-left',
				cssClass: 'left padding subhandle',
			},
			{
				title:'padding-right',
				parent: 'padding',
				modifyX: 'padding-right',
				modifyXAlt: ['padding-right','padding-left'],
				modifyXAltShift: ['padding-top','padding-right','padding-bottom','padding-left'],
				modifyXFac: -1,
				cssClass: 'right padding subhandle',
			},
			{
				title:'padding-top',
				parent: 'padding',
				modifyY: 'padding-top',
				modifyYAlt: ['padding-top','padding-bottom'],
				modifyYAltShift: ['padding-top','padding-right','padding-bottom','padding-left'],
				cssClass: 'top padding subhandle',
			},
			{
				title:'padding-bottom',
				parent: 'padding',
				modifyY: 'padding-bottom',
				modifyYFac: -1,
				cssClass: 'bottom padding subhandle',
			},
			// margin handles
			{
				title:'margin-left',
				parent: 'controls',
				modifyX: 'margin-left',
				modifyXFac: -1,
				cssClass: 'left margin subhandle',
			},
			{
				title:'margin-right',
				parent: 'controls',
				modifyX: 'margin-right',
				cssClass: 'right margin subhandle',
			},
			{
				title:'margin-top',
				parent: 'controls',
				modifyY: 'margin-top',
				modifyYFac: -1,
				cssClass: 'top margin subhandle',
			},
			{
				title:'margin-bottom',
				parent: 'controls',
				modifyY: 'margin-bottom',
				cssClass: 'bottom margin subhandle',
			},
			//'z-index'
		],
		properties: [
			new CssProp('display', [
				'none',
				'inline',
				'inline-block',
				'block',
				'table',
				'table-cell'
			]),
			new CssProp('position', [
				'static',
				'relative',
				'absolute',
				'fixed'
			]),
			new CssProp('float', [
				'left',
				'right',
				'none'
			]),
			new CssProp('clear', [
				'left',
				'right',
				'both',
				'none'
			]),
			new CssProp('visibility', [
				'visible',
				'hidden',
				'collapse'
			]),
			new CssProp('overflow', [
				'visible',
				'hidden',
				'scroll',
				'auto'
			]),
			
		]
	},
	// this one needs more thought!
	{	// DECORATION
		handles: [
			{
				title:'border-left-width',
				parent: 'box',
				modifyX: 'border-left-width',
				cssClass: 'left margin subhandle',
			},
			{
				title:'border-right-width',
				parent: 'box',
				modifyX: 'border-right-width',
				modifyXFac: -1,
				cssClass: 'right margin subhandle',
			},
			{
				title:'border-top-width',
				parent: 'box',
				modifyY: 'border-top-width',
				cssClass: 'top margin subhandle',
			},
			{
				title:'border-bottom-width',
				parent: 'box',
				modifyY: 'border-bottom-width',
				modifyYFac: -1,
				cssClass: 'bottom margin subhandle',
			},
			{
				title:'border-radius',
				text:'BR',
				parent: 'box',
				modifyX: 'border-radius',
				modifyY: 'border-radius',
				modifyXFac: -1,
				modifyYFac: -1,
				cssClass: 'bottom right size double',
			},
			//'border-width',
			//'border-radius',
			//'background-image-position',
			//'box-shadow-offset',
			//'opacity'
		],
		properties: [
			'background-image',
			'background-image-repeat',
			'background-image-attach',
			'background-color',
			'background-repeat',
			'border-style',
			'border-color',
			'box-shadow-color'
		]
	},
	{	// TEXT
		handles: [
			{
				title:'font-size',
				text:'FS',
				parent: 'box',
				modifyY: 'font-size',
				modifyYFac: .25,
				cssClass: 'top left text double',
			},
			{
				title:'line-height',
				text:'LH',
				parent: 'box',
				modifyY: 'line-height',
				cssClass: 'top right text double',
			},
			{
				title:'letter-spacing',
				text:'LS',
				parent: 'box',
				modifyX: 'letter-spacing',
				cssClass: 'bottom right text double',
			},
			{
				title:'word-spacing',
				text:'WS',
				parent: 'box',
				modifyX: 'word-spacing',
				cssClass: 'bottom left text double',
			},
			/*'font-size',
			'line-height',
			'word-spacing',
			'letter-spacing',
			'text-indent',
			'text-shadow',
			'color'*/
		],
		properties: [
			new CssProp('font-family', [
				'Helvetica, Arial, sans-serif',
				'Georgia, Times, serif'
			]),
			new CssProp('font-weight', [
				'normal',
				'bold'
			]),
			new CssProp('font-style', [
				'normal',
				'italic'
			]),
			new CssProp('text-decoration', [
				'none',
				'underline',
				'line-through',
				'overline'
			]),
			new CssProp('font-variant', [
				'normal',
				'small-caps'
			]),
			new CssProp('text-transform', [
				'normal',
				'capitalize',
				'uppercase',
				'lowercase'
			]),
			new CssProp('whitespace', [
				'normal',
				'pre',
				'nowrap'
			]),
		]
	}
];

document.CdDispatch;
var SM,
	Keys,
	Drag,
	hoverClass = 'hover';
$(document).ready(function() {
	var iframe = $('#iframe')[0];
	var $messageHolder = $('#message');
	iframe.onload = function() {
		var disp = new Dispatch(iframe.contentDocument);
		document.CdDispatch = disp;
		
		disp.Keys = new KeyManager($(iframe.contentDocument).add(document));
		
		var propertiesPanel = new PropertiesModule();
		function renderPropertiesPanel(arg) {
			propertiesPanel.render();
		}
		disp.listen('selectElement', renderPropertiesPanel);
		disp.listen('selectRule', renderPropertiesPanel);
		disp.listen('changeStyleMode', renderPropertiesPanel);
		
		var sleeping = false,
			timer,
			$body = $(document).find('body'),
			iframeDoc = this.contentDocument;
		$(iframeDoc).mousedown(function(evt) {
			document.CdDispatch.call('selectElement', evt.target);
		}).mouseover(function(event) {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
			$(event.target).addClass(hoverClass);
		}).mouseout(function() {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
		});
		
		$(document).mouseover(function() {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
		});
		
		var handleModule = new HandleModule(iframeDoc);
		handleModule.render();
		
		disp.Keys.press(disp.Keys.GRACE_ACCENT, function(event) {
			disp.call('changeStyleMode', (disp.styleMode + 1) % 3 );
		});
		
		// do fadeout when no activity happening -- css commented due to challenges
		$(iframeDoc).mousemove(function() {
			if (!sleeping) {
				timer = setTimeout(function() {
					$body.addClass('sleep');
					sleeping = true;
				}, 5000);
			} else {
				$body.removeClass('sleep');
				sleeping = false;
			}
		});
	};
	
	
});

