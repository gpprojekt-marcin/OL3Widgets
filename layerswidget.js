goog.provide('ol.widget.LayersSwitcher');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ol.dom.Input');
goog.require('ol.widget.Widget');

ol.widget.LayersSwitcherProperty = {
    HEADER: 'Layers',
    LI_HEADER_TAG: 'h5'

};

ol.widget.Class.LayersSwitcher = {
    LABEL: {
        element: 'label-element',
        wrapper: 'label-wrapper'
    },
    CONTROL: {
        element: 'control-element',
        wrapper: 'control-wrapper'
    }
};

ol.widget.LayersSwitcher = function (opt_options) {
    var options = goog.isDef(opt_options) ? opt_options : {};
    this.className = goog.isDef(options.className) ? options.className : 'ol-layerswitcher';
    var additionalclassName = goog.isDef(options.additionalclassName) ? options.additionalclassName : '';
    var header = goog.dom.createDom(goog.dom.TagName.H4, {}, goog.dom.createDom(goog.dom.TagName.I, {
        class: 'fa fa-bars'
    }), ol.widget.LayersSwitcherProperty.HEADER);
    var headerElement = goog.dom.createDom(goog.dom.TagName.DIV, {
        class: this.className + '-header' + ' ' + ol.css.CLASS_WIDGET + '-header'
    }, header);
    var mainElement = goog.dom.createDom(goog.dom.TagName.DIV, {
        class: this.className + '-main' + ' ' + ol.css.CLASS_WIDGET + '-main'
    });
    goog.base(this, {
        headerElement: headerElement,
        mainElement: mainElement,
        className: this.className + ' ' + additionalclassName,
        target: options.target,
        type: 'LayersSwitcher'
    });
    this.groups = goog.isDef(options.groups) ? options.groups : {};
    this.layersLength_ = 0;
};
goog.inherits(ol.widget.LayersSwitcher, ol.widget.Widget);

ol.widget.LayersSwitcher.prototype.getNames = function (frameState) {
    var namedGroups = {};
    var groups = this.groups;
    var layerStatesArray = frameState.layerStatesArray;
    this.layersLength_ = layerStatesArray.length;
    layerStatesArray.forEach(function (state) {
        var layer = state.layer;
        var layerGroup = layer.get('group');
        if (goog.isDef(groups[layerGroup])) {
            if (!goog.isDef(namedGroups[layerGroup])) {
                namedGroups[layerGroup] = {};
                namedGroups[layerGroup].name = groups[layerGroup].name;
                namedGroups[layerGroup].layers = [];
                namedGroups[layerGroup].exclusive = groups[layerGroup].exclusive;
            };
            namedGroups[layerGroup].layers.push(layer);
        }
    });
    return namedGroups;
};

ol.widget.LayersSwitcher.prototype.handleMapPostrender = function (mapEvent) {
    if (!(this.layersLength_ === mapEvent.frameState.layerStatesArray.length)) {
        this.updateElement_(mapEvent.frameState)
    } else {
        return;
    }
    //this.updateElement_(mapEvent.frameState);
};
ol.widget.LayersSwitcher.prototype.updateElement_ = function (frameState) {
    var me = this;
    var groups = this.getNames(frameState);
    var groupsElements = [];
    goog.object.forEach(groups, function (grp) {
        var group = me.createGroupElement_(grp);
        groupsElements.push(group);
    });
    var ulElement = goog.dom.createDom(goog.dom.TagName.UL, {
        class: this.className + '-layer-list'
    }, groupsElements);
    goog.dom.removeChildren(this.mainElement);
    goog.dom.append(this.mainElement, ulElement);
};
ol.widget.LayersSwitcher.prototype.createGroupElement_ = function (group) {
    var me = this;
    var layers = [];
    var liNameElement = goog.dom.createDom(ol.widget.LayersSwitcherProperty.LI_HEADER_TAG, {
        innerHTML: group.name
    });
    group.layers.forEach(function (lyr, idx) {
        //var layerElement = (group.exclusive) ? me.createExclusiveLayerElement_(lyr, group.name, idx) : me.createLayerElement_(lyr);
        var layerElement = me.createLayerElement_(lyr);
        layers.push(goog.dom.createDom(goog.dom.TagName.LI, {}, layerElement));
    });
    var ulElement = goog.dom.createDom(goog.dom.TagName.UL, {}, layers);
    var liParentElement = goog.dom.createDom(goog.dom.TagName.LI, {}, liNameElement, ulElement);
    return liParentElement;
};
ol.widget.LayersSwitcher.prototype.createLayerElement_ = function (layer) {
    var name = layer.get('title');
    var checkbox = goog.dom.createDom(goog.dom.TagName.INPUT, {
        type: 'checkbox',
        id: name,
        name: name
    });
    var label = goog.dom.createDom(goog.dom.TagName.LABEL, {
        for: name,
        innerHTML: name
    });
    var visible = new ol.dom.Input(checkbox);
    visible.bindTo('checked', layer, 'visible');
    var element = goog.dom.createDom(goog.dom.TagName.DIV, {
        class: 'checkbox'
    }, checkbox, label);
    return element;
};

/*ol.widget.LayersSwitcher.prototype.createExclusiveLayerElement_ = function (layer, groupName, idx) {
    var name = layer.get('title');
    var radio = goog.dom.createDom(goog.dom.TagName.INPUT, {
        type: 'radio',
        id: name,
        name: groupName
    });
    var label = goog.dom.createDom(goog.dom.TagName.LABEL, {
        for: name,
        innerHTML: name
    });
    radio.checked = true;
    var visible = new ol.dom.Input(radio);
    visible.bindTo('checked', layer, 'visible');
    if (idx !== 0) {
        layer.setVisible(false);
    }
    var element = goog.dom.createDom(goog.dom.TagName.DIV, {
        class: 'radio'
    }, radio, label);
    return element;
};

var allRadios = {};
[].slice.call(document.getElementsByTagName('input')).forEach(function(element, index, array) {
    if (element.type == 'radio') {
        if (!allRadios[element.name]) {
            allRadios[element.name] = [];
        }
        allRadios[element.name].push(element);
    }
})
goog.object.forEach(allRadios, function(element, index, obj) {
    var evt = new Event('change', {'bubbles': false});
    evt
    element.forEach(function(elem, idx, array) {
        goog.events.listen(elem, 'change', function(event) {
            event.stopPropagation();
            element.forEach(function(el, i, arr) {
                if (elem !== el) el.dispatchEvent(evt);
            });
        });
    });
}, this);*/