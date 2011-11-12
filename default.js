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
			this.selection.status(css);
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

// style modes
LAYOUT = 0, DECORATION = 1, TEXT = 2;

function Dispatch(doc) {
	this.doc = doc,
	this.domrules = doc.styleSheets[0].rules,
	this.rules = [],
	this.listeners = {
		'modifyStyle': [],
		'modifyRule': [],
		'selectRule': [],
		'selectElement': [],
		'changeStyleMode': [],
		'search': [],
	},
	this.styleMode = LAYOUT, // LAYOUT = 0, DECORATION = 1, TEXT = 2
	this.selectedRule = 0,
	this.selectedElement;
	this.rulesDict = {};
	
	// INITIATE MODELS
	for (var i=0, len=this.domrules.length, rule; i<len; i++) {
		rule = new Rule(this.domrules[i], this, i);
		this.rules.push(rule);
		this.rulesDict[rule.selector] = rule;
	}
	
	// SETUP MODEL EVENT LISTENERS
	this.listen('modifyStyle', function(rule, attr, val) {
		this.rules[rule].set(attr, val);
	});
	this.listen('selectRule', function(ruleId) {
		this.selectRule(ruleId);
	});
	this.listen('selectElement', function(el) {
		console.log('element selected');
		this.selectedElement = el;
	});
	this.listen('changeStyleMode', function(mode) {
		console.log('change style mode');
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
		if (!hasSelected) this.selectRule(rule.id);
		return rules;
	},
	selectRule: function(ruleId) {
		this.rules[this.selectedRule].deactivate();
		this.selectedRule = ruleId;
		this.rules[ruleId].activate();
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
		this.style.setProperty(attr, val);
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
	}
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
			disp.call('modifyStyle', disp.selectedRule, attr, val);
		});
		
		this.$el.html($rendered);
	},
};

function HandleModule() {
	this.$el = $('#pageHolder'),
	this.$controls,
	this.$box,
	this.$padding;
}
HandleModule.prototype = {
	render: function() {
		console.log('render handles');
		this.$controls = $('#controls').appendTo(this.$el);
		this.$box = $('#box');
		this.$padding = $('#padding');
	},
	// make controls align with selected element
	update: function() {
		console.log('update handles');
		var $doc = $(document.CdDispatch.doc);
		var scrollTop = $doc.scrollTop();
		var scrollLeft = $doc.scrollLeft();
		var el = document.CdDispatch.selectedElement;
		var $el = $(el);
		var offset = $el.offset(),
			w = $el.width(),
			h = $el.height(),
			t = this.getStyleNum('top', el),
			r = this.getStyleNum('right', el),
			b = this.getStyleNum('bottom', el),
			l = this.getStyleNum('left', el),
			mt = this.getStyleNum('marginTop', el),
			mr = this.getStyleNum('marginRight', el),
			mb = this.getStyleNum('marginBottom', el),
			ml = this.getStyleNum('marginLeft', el),
			pt = this.getStyleNum('paddingTop', el),
			pr = this.getStyleNum('paddingRight', el),
			pb = this.getStyleNum('paddingBottom', el),
			pl = this.getStyleNum('paddingLeft', el),
			bt = this.getStyleNum('borderWidthTop', el),
			br = this.getStyleNum('borderWidthRight', el),
			bb = this.getStyleNum('borderWidthBottom', el),
			bl = this.getStyleNum('borderWidthLeft', el);
		this.$controls.css({
			'top': offset.top-bt-mt+(mt>0 ? 0 : 1)-scrollTop+'px',
			'left': offset.left-bl-ml+(ml>0 ? 0 : 1)-scrollLeft+'px',
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
	},
	getStyle: function(name, el) {
		return el.ownerDocument.defaultView.getComputedStyle(el,null)[name] || el.style[name] || undefined;
	},
	getStyleNum: function(name, el) {
		var value = this.getStyle(name, el);
		if (value == undefined) value = 0;
		else value = Number(value.replace('px',''));
		return value;
	}
};


function SelectionView(manager, element) {
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
SelectionView.prototype = {
    status: function(attrs) {
        this.manager.status(attrs);
    },
	remove: function() {
		this.$controls.remove();
		$(this.element).removeClass(this.manager.selectedClass);
	},
	showRules: function() {
		var rules = this.element.ownerDocument.defaultView.getMatchedCSSRules(this.element, '');
		var SM = new SelectorManager(rules);
		SM.select(rules.length-1);
	},
	getStyle: function(name) {
		var el = this.element;
		return getStyle(name, el);
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
			cssClass: 'bottom right size double',
			text:'WH'
		});
		var moveHandle = new Handle({
			selection: this,
			parent: this.$box,
			object: this.element,
			modifyX: { 'left':1 },
			modifyY: { 'top':1 },
			cssClass: 'top left position double',
			text:'TL'
		});
		// padding handles
		var paddingHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-top':1, 'padding-bottom':1 },
			modifyX: { 'padding-right':-1, 'padding-left':-1 },
			cssClass: 'top right padding',
			text: 'P'
		});
		var padLeftHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyX: { 'padding-left':1 },
			cssClass: 'left padding subhandle',
		});
		var padRightHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyX: { 'padding-right':-1 },
			cssClass: 'right padding subhandle',
		});
		var padTopHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-top':1 },
			cssClass: 'top padding subhandle',
		});
		var padBottomHandle = new Handle({
			selection: this,
			parent: this.$padding,
			object: this.element,
			modifyY: { 'padding-bottom':-1 },
			cssClass: 'bottom padding subhandle',
		});
		// margin handles
		var marginHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyY: { 'margin-top':.5, 'margin-bottom':.5 },
			modifyX: { 'margin-right':.5, 'margin-left':.5 },
			cssClass: 'bottom right margin',
			text: 'M'
		});
		var marginLeftHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyX: { 'margin-left':-1 },
			cssClass: 'left margin subhandle',
		});
		var marginRightHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyX: { 'margin-right':1 },
			cssClass: 'right margin subhandle',
		});
		var marginTopHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyY: { 'margin-top':-1 },
			cssClass: 'top margin subhandle',
		});
		var marginBottomHandle = new Handle({
			selection: this,
			parent: this.$controls,
			object: this.element,
			modifyY: { 'margin-bottom':1 },
			cssClass: 'bottom margin subhandle',
		});
		
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
}

function CssProp(attr, values) {
	this.attr = attr,
	this.values = values;
}

Dispatch.prototype.StyleAttributes = [
	{	// LAYOUT
		handles: [
			'padding',
			'margin',
			'top',
			'right',
			'bottom',
			'left',
			'width',
			'height',
			'z-index'
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
			'border-width',
			'border-radius',
			'background-image-position',
			'box-shadow-offset',
			'opacity'
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
			'font-size',
			'line-height',
			'word-spacing',
			'letter-spacing',
			'text-indent',
			'text-shadow',
			'color'
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
		document.CdDispatch = new Dispatch(iframe.contentDocument);
		
		Keys = new KeyManager($(iframe.contentDocument).add(document));
		Keys.listen(Keys.CTRL, function(event) {
			console.log(this);
			console.log(event);
		});
		
		var propertiesPanel = new PropertiesModule();
		function renderPropertiesPanel(arg) {
			propertiesPanel.render();
		}
		document.CdDispatch.listen('selectElement', renderPropertiesPanel);
		document.CdDispatch.listen('selectRule', renderPropertiesPanel);
		document.CdDispatch.listen('changeStyleMode', renderPropertiesPanel);
		
		var handleModule = new HandleModule();
		handleModule.render();
		function updateHandleModule(arg) {
			handleModule.update();
		}
		document.CdDispatch.listen('selectElement', updateHandleModule);
		document.CdDispatch.listen('changeStyleMode', updateHandleModule);
		document.CdDispatch.listen('modifyStyle', updateHandleModule);
		
		var iframeDoc = this.contentDocument;
		$(iframeDoc).mousedown(function(evt) {
			document.CdDispatch.call('selectElement', evt.target);
		}).mouseover(function(event) {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
			$(event.target).addClass(hoverClass);
		}).mouseout(function() {
			$('.'+hoverClass, iframeDoc).removeClass(hoverClass);
		}).scroll(updateHandleModule);
	};
	
	
});

