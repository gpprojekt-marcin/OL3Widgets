goog.provide('ol.widget.Widget');
goog.provide('ol.widget.Class');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.events');
goog.require('ol.MapEventType');
goog.require('ol.css');
goog.require('ol.Object');

ol.css.CLASS_WIDGET = 'ol-widget';

ol.widget.FormBuilders = {
	form: function (options, opt_el) {
		return form = goog.dom.createDom(goog.dom.TagName.FORM, options, opt_el);
	},
	html: function (options, opt_el) {
		return goog.dom.createDom(goog.dom.TagName.DIV, options, opt_el);

	},
	label: function (options) {
		options.innerHTML = options.label;
		return goog.dom.createDom(goog.dom.TagName.LABEL, options);
	},

	input: function (options) {
		if (options.type == 'checkbox' || options.type == 'radio') {
			return ol.widget.FormBuilders.checkbox(options);
		} else {
			return goog.dom.createDom(goog.dom.TagName.INPUT, options);
		}

	},
	checkbox: function (options) {
		var element = goog.dom.createDom(goog.dom.TagName.INPUT, options);
		var label = ol.widget.FormBuilders.label({
			for: options.name,
			label: options.label
		});
		wrapperClassName = (options.type == 'radio') ? 'radio' : 'checkbox';
		return ol.widget.FormBuilders.html({
			class: wrapperClassName
		}, [element, label]);
	},

	button: function (options) {
		var icon = null;
		if (goog.isDef(options.iconClass)) {
			icon = ol.widget.FormBuilders.icon({
				class: options.iconClass
			})
		}
		options.class += ' btn btn-sm';
		var name = (goog.isDef(options.label)) ? goog.dom.createDom(goog.dom.TagName.SPAN, {}, options.label): null;
		return goog.dom.createDom(goog.dom.TagName.BUTTON, options, icon, name);

	},
	select: function (options) {
		if (options.multiple) {
			return ol.widget.FormBuilders.selectmulti(options);
		} else {
			return ol.widget.FormBuilders.selectsingle(options);
		}

	},
	selectmulti: function (options) {
		var opts = [];
		var values = options.values;
		goog.object.forEach(values, function (value, key) {
			var option = goog.dom.createDom(goog.dom.TagName.OPTION, {
				value: key,
				innerHTML: key,
				'data-subtext': value
			});
			opts.push(option);
		});
		return goog.dom.createDom(goog.dom.TagName.SELECT, options, opts);

	},
	selectsingle: function (options) {
		var opts = [];
		var values = options.values;
		goog.object.forEach(values, function (value, key) {
			var option = goog.dom.createDom(goog.dom.TagName.OPTION, {
				value: key,
				innerHTML: value
			});
			opts.push(option);
		});
		return goog.dom.createDom(goog.dom.TagName.SELECT, options, opts);

	},
	icon: function (options) {
		options.class += ' fa';
		return goog.dom.createDom(goog.dom.TagName.I, options);

	}
}

ol.widget.Widget = function (options) {
	goog.base(this);

	this.mainElement = goog.isDef(options.mainElement) ? options.mainElement : null;

	this.headerElement = goog.isDef(options.headerElement) ? options.headerElement : null;

	this.element = goog.dom.createDom(goog.dom.TagName.DIV, {
		class: options.className + ' ' + ol.css.CLASS_WIDGET
	}, this.headerElement, this.mainElement);

	this.target_ = goog.isDef(options.target) ? goog.dom.getElement(options.target) : null;

	this.map_ = null;

	this.set('active', true);

	this.listenerKeys = [];
};
goog.inherits(ol.widget.Widget, ol.Object);

ol.widget.Widget.prototype.disposeInternal = function () {
	goog.dom.removeNode(this.element);
	goog.base(this, 'disposeInternal');
};

ol.widget.Widget.prototype.getMap = function () {
	return this.map_;
};

ol.widget.Widget.prototype.handleMapPostrender = goog.nullFunction;

ol.widget.Widget.prototype.setMap = function (map) {
	if (!goog.isNull(this.map_)) {
		goog.dom.removeNode(this.element);
	}
	if (!goog.array.isEmpty(this.listenerKeys)) {
		goog.array.forEach(this.listenerKeys, goog.events.unlistenByKey);
		this.listenerKeys.length = 0;
	}
	this.map_ = map;
	if (!goog.isNull(this.map_)) {
		var target = !goog.isNull(this.target_) ? this.target_ : map.getOverlayContainerStopEvent();
		goog.dom.appendChild(target, this.element);
		if (this.handleMapPostrender !== goog.nullFunction) {
			this.listenerKeys.push(goog.events.listen(map, ol.MapEventType.POSTRENDER, this.handleMapPostrender, false, this));
		}
		map.render();
	}
};