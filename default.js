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
		document.userAction();
		
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
	this.$doc = $(doc),
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
		this.rulesDict[rule.selector] = i;
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
			var rule = this.getRuleBySelector(matchRules[i].selectorText);
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
	getRuleBySelector: function(selector) {
		var ruleId = this.rulesDict[selector];
		return this.rules[ruleId];
	},
	getEmSize: function() {
		var el = this.$selectedElement.parent()[0];
		return document.getStyleNum('font-size', el);
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

function SearchModule(dispatch) {
	this.dispatch = dispatch;
	this.$doc = dispatch.$doc;
	this.$el = $('#searchModule');
	this.$input = $('#searchInput');
	this.template = _.template( $("#searchTemplate").html() );
	this.query;
	this.queryLength;
	this.parents = [];
	
	var that = this;
	dispatch.listen('search', function(query) {
		that.search(query);
	});
	dispatch.listen('selectElement', function(el) {
		that.render();
	});
	var Keys = dispatch.Keys;
	Keys.press(Keys.FORWARDSLASH, function(event) {
		that.$input.focus();
	});
}
SearchModule.prototype = {
	render: function() {
		this.parents = [];
		var el = this.dispatch.selectedElement;
		if (el != undefined) this.getHierarchy(el);
		var $rendered = $(this.template( {
			elements: this.parents.reverse(),
			query: this.query,
			queryLen: this.queryLength,
		} ));
		$form = $rendered.find('#searchForm');
		var that = this;
		$rendered.find('.hierarchy > li').click(function(evt) {
			var id = Number( $(this).attr('id').substr(1) );
			var el = that.parents[id].element;
			that.dispatch.call('selectElement', el);
		});
		this.$input = $rendered.find('#searchInput');
		var that = this;
		$form.submit(function(evt) {
			evt.preventDefault();
			var query = that.$input.val();
			that.dispatch.call('search', query);
		});
		this.$el.html($rendered);
		this.$input.focus();
	},
	search: function(query) {
		this.query = query;
		var $queryset = this.$doc.find(query);
		this.queryLength = $queryset.length;
		if (this.queryLength > 0) {
			this.dispatch.call('selectElement', $queryset[0]);
		}
		var rule = this.dispatch.rulesDict[query];
		if (rule != undefined) {
			this.dispatch.call('selectRule', rule);
		}
		this.render();
	},
	getHierarchy: function(el) {
		name = '';
		if (el.id != '') name += '#'+el.id;
		if (el.tagName != undefined) {
			if (el.className != '') name += '.' + el.className.replace(' ','.');
			this.parents.push({
				tagName: el.tagName,
				name:name,
				element: el,
			});
		}
		var $parent = $(el).parent();
		if ($parent.length > 0) {
			this.getHierarchy($parent[0]);
		}
	},
};

function PropertiesModule(dispatch) {
	this.dispatch = dispatch;
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
		}).end().find('ul.inlineBtns > li').click(function(evt) {
			evt.preventDefault();
			var $this = $(this),
				attr = $this.parent().attr('id'),
				activeClass = 'active';
			if ($this.hasClass(activeClass)) {
				disp.call('modifyStyle', attr, undefined);
				$this.removeClass(activeClass);
			} else {
				var val = $this.text();
				disp.call('modifyStyle', attr, val);
				$this.siblings('.'+activeClass).removeClass(activeClass);
				$this.addClass(activeClass);
			}
		});
		
		this.$el.html($rendered);
	},
};

function HandleModule(dispatch) {
	this.dispatch = dispatch;
	this.NODRAG = 0,
	this.DRAG = 1,
	this.ALTDRAG = 2,
	this.ALTSHIFTDRAG = 3;
	this.dragMode = this.NODRAG;
	
	this.doc = dispatch.doc,
	this.$el = $('#pageHolder'),
	this.$controls = $('#controls'),
	this.$box = $('#box'),
	this.$padding = $('#padding'),
	this.$doc = $(dispatch.doc),
	this.$html = this.$doc.find('html'),
	this.handles = [];
	this.updateScroll();
	var that = this;
	this.$doc.scroll(function() {
		document.userAction();
		that.updateScroll();
		that.update();
	});
	this.$coverSheet = $('#coverSheet');
	this.$grid = $('#grid');
	this.gridX = 12;
	this.gridY = 12;
	this.gridSnap = true;
	this.docOffset = this.$el.offset(),
	this.selectedHandle,
	this.snapToGrid = false
	this.mouseX = 0,
	this.mouseY = 0,
	this.zoomLevel = 1,
	this.shortcut_keys = {},
	this.css_axis = dispatch.CSS;
	
	this.$el.bind('click mousedown mouseup', function forwardEvents(evt) {
		var forward = !$(evt.target).hasClass('handle');
		if ($(evt.target).hasClass('rem')) forward = false;
		if (forward) that.forwardMouseEvent(evt);
	});
	
	function updateControls() {
		that.update();
	}
	dispatch.listen('selectElement', updateControls);
	dispatch.listen('selectRule', updateControls);
	dispatch.listen('modifyStyle', updateControls);
	dispatch.listen('modifyStyles', updateControls);
	
	dispatch.listen('selectElement', function() {
		that.$doc.find('.hover').removeClass('hover');
		that.highlightAffectedElements();
	});
	dispatch.listen('selectRule', function() {
		that.highlightAffectedElements();
	});
	
	var $controls = this.$controls;
	dispatch.listen('changeStyleMode', function(mode) {
		var modeClasses = ['layoutMode', 'decorateMode', 'typeMode'];
		$controls.removeClass(modeClasses.join(' '));
		$controls.addClass(modeClasses[disp.styleMode]);
	});
	
	// grid code
	this.renderGrid();
	var Keys = dispatch.Keys;
	Keys.down(Keys.SHIFT, function(evt) {
		that.showGrid();
		that.snapGrid();
		if (that.dragMode == that.ALTDRAG) that.setDragMode(that.ALTSHIFTDRAG);
	}
	).up(Keys.SHIFT, function(evt) {
		that.hideGrid();
		that.unsnapGrid();
		if (that.dragMode == that.ALTSHIFTDRAG) that.setDragMode(that.ALTDRAG);
	}
	).down(Keys.ALT, function(evt) {
		if (that.dragMode == that.DRAG) {
			if (Keys.isPressed(Keys.SHIFT)) that.setDragMode(that.ALTSHIFTDRAG);
			else that.setDragMode(that.ALTDRAG);
		}
	}
	).up(Keys.ALT, function(evt) {
		if (that.dragMode == that.ALTDRAG || that.dragMode == that.ALTSHIFTDRAG) {
			evt.preventDefault();
			that.setDragMode(that.DRAG);
		}
	}
	).press(Keys.UP, function(evt) {
		console.log(evt);
		if (that.selectedHandle != undefined) {
			evt.preventDefault();
			that.selectedHandle.change('y', -1);
		}
	}
	).press(Keys.DOWN, function(evt) {
		if (that.selectedHandle != undefined) {
			evt.preventDefault();
			that.selectedHandle.change('y', 1);
		}
	}
	).press(Keys.LEFT, function(evt) {
		if (that.selectedHandle != undefined) {
			evt.preventDefault();
			that.selectedHandle.change('x', -1);
		}
	}
	).press(Keys.RIGHT, function(evt) {
		if (that.selectedHandle != undefined) {
			that.selectedHandle.change('x', 1);
		}
	}
	).down(Keys.OS_LEFT, function (event) {
		that.zoom(event);
	}
	).up(Keys.OS_LEFT, function(event) {
		that.unzoom();
	}
	).press(Keys.ESCAPE, function(event) {
		that.selectedHandle.cancelDrag(event);
	});
	this.$doc.mousemove(function(evt) {
		that.mouseX = evt.pageX,
		that.mouseY = evt.pageY;
	});
	var offset = $('#iframe').offset();
	$(document).mousemove(function(evt) {
		that.mouseX = evt.pageX - offset.left,
		that.mouseY = evt.pageY - offset.top;
	});
}
HandleModule.prototype = {
	setDragMode: function(mode) {
		this.dragMode = mode;
	},
	isDragging: function() {
		return this.dragMode != this.NODRAG;
	},
	isAltDrag: function() {
		return this.dragMode == this.ALTDRAG;
	},
	isAltShiftDrag: function() {
		return this.dragMode == this.ALTSHIFTDRAG;
	},

	render: function() {
		var defs = document.CdDispatch.HandleDefs;
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
				posX: defs[i].posX,
				posY: defs[i].posY,
				modifyX: defs[i].modifyX,
				modifyY: defs[i].modifyY,
				modifyXAlt: defs[i].modifyXAlt,
				modifyYAlt: defs[i].modifyYAlt,
				modifyXAltShift: defs[i].modifyXAltShift,
				modifyYAltShift: defs[i].modifyYAltShift,
				modifyXFac: defs[i].modifyXFac,
				modifyYFac: defs[i].modifyYFac,
				cssClass: defs[i].cssClass + ' ' + defs[i].mode,
				mode: defs[i].mode,
				shortcut_key: defs[i].shortcut_key,
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
	snapGrid: function() {
		this.snapToGrid = true;
	},
	unsnapGrid: function() {
		this.snapToGrid = false;
	},
	isSnapping: function() {
		return this.snapToGrid;
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
	zoom: function(event) {
		this.zoomLevel = 2;
		var css = {
			'-webkit-transform-origin': this.mouseX +'px '+ this.mouseY +'px',
			'-webkit-transform': 'scale(2,2)'
		};
		this.$html.css(css);
		this.$grid.css(css);
		this.update();
	},
	unzoom: function() {
		this.zoomLevel = 1;
		var css = {
			'-webkit-transform': 'scale(1,1)'
		};
		this.$html.css(css);
		this.$grid.css(css);
		this.update();
	},
	// make controls align with selected element
	update: function() {
		var el = this.dispatch.selectedElement,
			$el = this.dispatch.$selectedElement,
			getStyleNum = document.getStyleNum,
			z = this.zoomLevel;
		if ($el == undefined) return;
		var offset = $el.offset(),
			w = $el.width() * z,
			h = $el.height() * z,
			t = getStyleNum('top', el) * z,
			r = getStyleNum('right', el) * z,
			b = getStyleNum('bottom', el) * z,
			l = getStyleNum('left', el) * z,
			mt = getStyleNum('marginTop', el) * z,
			mr = getStyleNum('marginRight', el) * z,
			mb = getStyleNum('marginBottom', el) * z,
			ml = getStyleNum('marginLeft', el) * z,
			pt = getStyleNum('paddingTop', el) * z,
			pr = getStyleNum('paddingRight', el) * z,
			pb = getStyleNum('paddingBottom', el) * z,
			pl = getStyleNum('paddingLeft', el) * z,
			bt = getStyleNum('borderTopWidth', el) * z,
			br = getStyleNum('borderRightWidth', el) * z,
			bb = getStyleNum('borderBottomWidth', el) * z,
			bl = getStyleNum('borderLeftWidth', el) * z;
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
		var rule = this.dispatch.getSelectedRule();
		var attrs = rule.attrs();
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
	highlightAffectedElements: function() {
		var selectClass = 'selected',
			disp = document.CdDispatch;
		this.$doc.find('.'+selectClass).removeClass(selectClass);
		var $els = this.$doc.find(disp.getSelectedRule().selector);
		$els.not(disp.selectedElement).addClass(selectClass);
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
	this.$parent = settings.parent,
	this.module = settings.module,
	this.handleCssClass = settings.handleCssClass,
	this.posX = settings.posX,
	this.posY = settings.posY,
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
	this.mode = settings.mode,
	this.shortcut_key = settings.shortcut_key,
	this.selected = false,
	this.objectStyles = {},
	this.dragClass = 'drag',
	this.$element = $('<span class="handle '+ this.cssClass +'" id="'+ this.title +'"><span class="labelWrap"><span class="label"></span>'+ this.text +'<span class="rem" title="remove property">x</span></span></span>'),
	this.$labelElement = this.$element.find('.label'),
	this.dispatch = document.CdDispatch,
	this.startDragInitVals = {},
	this.attributeRegex = /([0-9\.]+)([A-z%]+)/,
	this.initDragLayout = {};
	this.absolutePos = {};
	this.hideLabelTimeout;
	
	var that = this;
	this.$element.css(this.styles).mousedown(function(event) {
		event.preventDefault();
		that.module.selectHandle(that);
		that.startDrag(event);
	}).click(function(event) {
		event.preventDefault();
		that.click(event);
	});
	this.$element.appendTo(this.$parent);
	
	this.$body = this.module.$doc.find('html');
	this.$doc = $(document);
}
Handle.prototype = {
	startDrag: function(event) {
		this.module.setDragMode(this.module.DRAG);
		
		this.startMouseX = event.pageX;
		this.startMouseY = event.pageY;
		this.target = event.target;
		this.saveInitialProp(this.modifyX);
		this.saveInitialProp(this.modifyY);
		this.$element.addClass('drag');
		this.saveInitialLayout();
		
		var that = this;
		this.$doc.mousemove(function(event) {
			that.drag(event);
		}
		).mouseup(function() {
			that.endDrag(event);
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
		if (this.module.isDragging()) {
			var css = this.getNewProps(event.pageX, event.pageY);
			this.updateLabel();
			document.CdDispatch.call('modifyStyles', css);
		}
	},
	endDrag: function(event) {
		this.module.unlockCanvas();
		this.$doc.unbind('mousemove').unbind('mouseup');
		this.objectStyles = {};
		this.$element.removeClass('drag');
		this.module.setDragMode(this.module.NODRAG);
		this.endChange();
	},
	cancelDrag: function(event) {
		var css = {},
			styles = this.objectStyles;
		for (var prop in styles) {
			css[prop] = styles[prop].val + styles[prop].unit;
		}
		if (css[this.modifyX] == undefined) css[this.modifyX] = undefined;
		if (css[this.modifyY] == undefined) css[this.modifyY] = undefined;
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
	saveInitialLayout: function() {
		var $parent = this.$parent,
			zoom = this.module.zoomLevel,
			docOffset = $('#pageHolder').offset();
		if (zoom > 1) this.module.unzoom();	// zoom throws off computed values
		layout = $parent.offset(),
		layout.top = layout.top;
		layout.left = layout.left;
		layout.top -= docOffset.top;
		layout.left -= docOffset.left;
		layout.width = $parent.outerWidth();	// assumes box model
		layout.height = $parent.outerHeight();	// assumes box model
		this.initDragLayout = layout;
		if (zoom > 1) this.module.zoom();
	},
	change: function(dir, val) {
		if (dir == 'x') {
			var mod = this.modifyX,
				modFac = this.modifyXFac;
		} else if (dir == 'y') {
			var mod = this.modifyY,
				modFac = this.modifyYFac;
		}
		
		this.saveInitialProp(mod);
		this.saveInitialLayout();
		var val = this.getNewProp(dir, mod, val, modFac);
		var css = {};
		css[mod] = val;
		this.dispatch.call('modifyStyles', css);
		this.endChange();
	},
	endChange: function() {
		this.startDragInitVals = {};
		this.initDragLayout = {};
		if (this.hideLabelTimeout != undefined) clearTimeout(this.hideLabelTimeout);
		this.$element.addClass('showLabel');
		var that = this;
		this.hideLabelTimeout = setTimeout(function() {
			that.$element.removeClass('showLabel');
		}, 1000);
	},
	getNewProps: function(mouseX, mouseY) {
		var Keys = this.dispatch.Keys,
			css = {};
			
		if (this.modifyX != undefined) {
			var val = this.getNewProp('x', this.modifyX, mouseX-this.startMouseX, this.modifyXFac);
			css = this.getCssProps('x', css, val);
		}
		if (this.modifyY != undefined) {
			var val = this.getNewProp('y', this.modifyY, mouseY-this.startMouseY, this.modifyYFac);
			css = this.getCssProps('y', css, val);
		}
		return css;
	},
	getCssProps: function(dir, css, val) {
		if (dir == 'x') {
			var prop = this.modifyX,
				propAlt = (this.modifyXAlt == undefined) ? [this.modifyX] : this.modifyXAlt,
				propAltShift = (this.modifyXAltShift == undefined) ? [this.modifyX] : this.modifyXAltShift;
		} else if (dir == 'y') {
			var prop = this.modifyY,
				propAlt = this.modifyYAlt,
				propAltShift = this.modifyYAltShift;
		}
		if (this.module.isAltShiftDrag()) {
			for (var i=0, len=propAltShift.length; i<len; i++) {
				css[propAltShift[i]] = val;
			}
		} else if (this.module.isAltDrag()) {
			for (var i=0, len=propAlt.length; i<len; i++) {
				css[propAlt[i]] = val;
			}
		} else {
			css[prop] = val;
		}
		return css;
	},
	getNewProp: function(dir, prop, change, fac) {
		var obj = this.objectStyles[prop],
			newChange = change,
			dispatch = this.dispatch;
		if (obj == undefined) {
			obj = this.startDragInitVals[prop];
		}
		if (obj == undefined) {
			var rules = dispatch.getElementRules();
			for (var i=0, len=rules.length; i<len; i++) {
				var val = rules[i].get(prop);
				if (val != undefined) {
					var parts = this.attributeRegex.exec(val);
					obj = {
						val: Number(parts[1]),
						unit: parts[2]
					};
					break;
				}
			}
		}
		if (obj == undefined) {
			var val = document.getStyleNum(prop, dispatch.selectedElement);
			obj = { val: val, unit: 'px' };
		}
		
		if (this.module.isDragging()) {
			newChange = change / this.module.zoomLevel;
			this.startDragInitVals[prop] = obj;
			
			if (this.module.isSnapping()) {
				var offset = this.getHandleOffset(dir);
				var grid = (dir == 'x') ? this.module.gridX : this.module.gridY;
				var roundThis = (offset + newChange) / grid;
				newChange = Math.round(roundThis) * grid - offset;
			}
		} else {
			if (this.module.isSnapping()) {
				var offset = this.getHandleOffset(dir);
				var grid = (dir == 'x') ? this.module.gridX : this.module.gridY;
				var diff = offset % grid;
				if (diff > 0) {
					newChange = (change > 0) ? grid-diff : diff * -1;
				} else {
					newChange = change * grid;
				}
			}
		}
		
		if (obj.unit == 'em') {
			var emSize = dispatch.getEmSize();
			newChange = newChange / emSize;
		} else if (obj.unit == 'px') {
			newChange = Math.round(newChange);
		}
		
		var val = obj.val + newChange * fac;
		return val + obj.unit;
	},
	getHandleOffset: function(dir) {
		var pos = document.POS,
			$parent = this.$parent,
			initLayout = this.initDragLayout,
			offset = initLayout.left;
		if (dir == 'x' && this.posX == pos.RIGHT) offset += initLayout.width;
		if (dir == 'y') offset = initLayout.top;
		if (dir == 'y' && this.posY == pos.BOTTOM) offset += initLayout.height;
		
		return offset;
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
			document.CdDispatch.call('modifyStyles', props);
		}
	}
};

function CssProp(attr, values) {
	this.attr = attr,
	this.values = values;
}
document.POS = {
	TOP: 0,
	RIGHT: 1,
	BOTTOM: 2,
	LEFT: 3
}
Dispatch.prototype.MODES = {
	LAYOUT: 'layout',
	DECORATE: 'decorate',
	TYPE: 'type',
};
var modes = Dispatch.prototype.MODES;
Dispatch.prototype.HandleDefs = [
	// LAYOUT
	// width/height
	{
		title:'width/height',
		text:'WH',
		parent: 'box',
		posX: document.POS.RIGHT,
		posY: document.POS.BOTTOM,
		modifyX: 'width',
		modifyY: 'height',
		cssClass: 'bottom right size double',
		mode: modes.LAYOUT,
		shortcut_key: 'w h',
	},
	// top/left
	{
		title:'top/left',
		text:'TL',
		parent: 'box',
		posX: document.POS.LEFT,
		posY: document.POS.TOP,
		modifyX: 'left',
		modifyY: 'top',
		cssClass: 'top left position double',
		mode: modes.LAYOUT,
		shortcut_key: 't l',
	},
	// add bottom/right here
	
	// padding handles
	{
		title:'padding-left',
		parent: 'padding',
		posX: document.POS.LEFT,
		modifyX: 'padding-left',
		cssClass: 'left padding subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'pl',
	},
	{
		title:'padding-right',
		parent: 'padding',
		posX: document.POS.RIGHT,
		modifyX: 'padding-right',
		modifyXAlt: ['padding-right','padding-left'],
		modifyXAltShift: ['padding-top','padding-right','padding-bottom','padding-left'],
		modifyXFac: -1,
		cssClass: 'right padding subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'pr',
	},
	{
		title:'padding-top',
		parent: 'padding',
		posY: document.POS.TOP,
		modifyY: 'padding-top',
		modifyYAlt: ['padding-top','padding-bottom'],
		modifyYAltShift: ['padding-top','padding-right','padding-bottom','padding-left'],
		cssClass: 'top padding subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'pt',
	},
	{
		title:'padding-bottom',
		parent: 'padding',
		posY: document.POS.BOTTOM,
		modifyY: 'padding-bottom',
		modifyYFac: -1,
		cssClass: 'bottom padding subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'pb',
	},
	// margin handles
	{
		title:'margin-left',
		parent: 'controls',
		posX: document.POS.LEFT,
		modifyX: 'margin-left',
		modifyXFac: -1,
		cssClass: 'left margin subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'ml',
	},
	{
		title:'margin-right',
		parent: 'controls',
		posX: document.POS.RIGHT,
		modifyX: 'margin-right',
		cssClass: 'right margin subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'mr',
	},
	{
		title:'margin-top',
		parent: 'controls',
		posY: document.POS.TOP,
		modifyY: 'margin-top',
		modifyYFac: -1,
		cssClass: 'top margin subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'mt',
	},
	{
		title:'margin-bottom',
		parent: 'controls',
		posY: document.POS.BOTTOM,
		modifyY: 'margin-bottom',
		cssClass: 'bottom margin subhandle',
		mode: modes.LAYOUT,
		shortcut_key: 'mb',
	},
	//'z-index'
	
	// DECORATION
	{
		title:'border-left-width',
		parent: 'box',
		posX: document.POS.LEFT,
		modifyX: 'border-left-width',
		cssClass: 'left margin subhandle',
		mode: modes.DECORATE,
		shortcut_key: 'bl',
	},
	{
		title:'border-right-width',
		parent: 'box',
		posX: document.POS.RIGHT,
		modifyX: 'border-right-width',
		modifyXFac: -1,
		cssClass: 'right margin subhandle',
		mode: modes.DECORATE,
		shortcut_key: 'br',
	},
	{
		title:'border-top-width',
		parent: 'box',
		posY: document.POS.TOP,
		modifyY: 'border-top-width',
		cssClass: 'top margin subhandle',
		mode: modes.DECORATE,
		shortcut_key: 'bt',
	},
	{
		title:'border-bottom-width',
		parent: 'box',
		posY: document.POS.BOTTOM,
		modifyY: 'border-bottom-width',
		modifyYFac: -1,
		cssClass: 'bottom margin subhandle',
		mode: modes.DECORATE,
		shortcut_key: 'bb',
	},
	{
		title:'border-radius',
		text:'BR',
		parent: 'box',
		posX: document.POS.RIGHT,
		posY: document.POS.BOTTOM,
		modifyX: 'border-radius',
		modifyY: 'border-radius',
		modifyXFac: -1,
		modifyYFac: -1,
		cssClass: 'bottom right size double',
		mode: modes.DECORATE,
		shortcut_key: 'br',
	},
	//'opacity'
	
	// TYPOGRAPHY
	{
		title:'font-size',
		text:'FS',
		parent: 'box',
		posX: document.POS.LEFT,
		posY: document.POS.TOP,
		modifyY: 'font-size',
		modifyYFac: .25,
		cssClass: 'top left double',
		mode: modes.TYPE,
		shortcut_key: 'fs',
	},
	{
		title:'line-height',
		text:'LH',
		parent: 'box',
		posX: document.POS.RIGHT,
		posY: document.POS.TOP,
		modifyY: 'line-height',
		cssClass: 'top right double',
		mode: modes.TYPE,
		shortcut_key: 'lh',
	},
	{
		title:'letter-spacing',
		text:'LS',
		parent: 'box',
		posX: document.POS.RIGHT,
		posY: document.POS.BOTTOM,
		modifyX: 'letter-spacing',
		cssClass: 'bottom right double',
		mode: modes.TYPE,
		shortcut_key: 'ls',
	},
	{
		title:'word-spacing',
		text:'WS',
		parent: 'box',
		posX: document.POS.LEFT,
		posY: document.POS.BOTTOM,
		modifyX: 'word-spacing',
		cssClass: 'bottom left double',
		mode: modes.TYPE,
		shortcut_key: 'ws',
	},
	/*'text-indent',
	'text-shadow-position',
	'color'*/
	
];

Dispatch.prototype.StyleAttributes = [
	{	// LAYOUT
		handles: [
		],
		properties: [
		]
	},
	// this one needs more thought!
	{	// DECORATION
		handles: [
		],
		properties: [
			/*// BACKGROUND COLOR
			'background-color',
			
			// BACKGROUND GRADIENT
			
			// BACKGROUND IMAGE
			'background-image',
			'background-repeat',
			'background-attach',
			'background-position',
			'background-size',
			
			// BOX SHADOW
			'box-shadow-color',
			'box-shadow-h-shadow',
			'box-shadow-v-shadow',
			'box-shadow-blur',
			'box-shadow-spread',
			'box-shadow-inset',
			
			// BORDER IMAGE
			'border-style',
			'border-color',*/
		]
	},
	{	// TEXT
		handles: [
		],
		properties: [
		]
	}
];

document.sleepTimer;
document.userAction = function() {
	var $body = $(document).find('body'),
		$iframeBody = $( $('#iframe')[0].contentDocument ).find('body'),
		sleepClass = 'sleep';
	$body.add($iframeBody).removeClass(sleepClass);
	if (document.sleepTimer != undefined) clearTimeout(document.sleepTimer);
	document.sleepTimer = setTimeout(function() {
		$body.add($iframeBody).addClass(sleepClass);
	}, 3000);
};

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
		
		var propertiesPanel = new PropertiesModule(disp);
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
		
		var handleModule = new HandleModule(disp);
		handleModule.render();
		
		var searchModule = new SearchModule(disp);
		searchModule.render();
		
		disp.Keys.press(disp.Keys.GRACE_ACCENT, function(event) {
			disp.call('changeStyleMode', (disp.styleMode + 1) % 3 );
		});
		
		// do fadeout when no activity happening -- css commented due to challenges
		$(iframeDoc).add($(document).find('body')).mousemove(function() {
			document.userAction();
		});
	};
	
	
});

