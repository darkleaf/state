import Immutable from 'immutable';

export default function State(initialRootData) {
    var rootData = Immutable.fromJS(initialRootData);

    this.onChange = function(){};

    var updateRootData = function(cursorPath, cursorData) {
        var newData = rootData.setIn(cursorPath, cursorData);
        var oldData = rootData;
        rootData = newData;

        this.onChange && this.onChange(this, newData, oldData);
    }.bind(this);

    var Cursor = function(path) {
        var value = rootData.getIn(path);

        this.deref = function() {
            return value;
        };

        this.cursor = function(subPath) {
            var fullPath = path.concat(subPath);
            return new Cursor(fullPath);
        };

        this.swap = function(updater) {
            var newValue = updater(value);
            updateRootData(path, newValue);
            return new Cursor(path);
        };

        this.toSeq = function() {
            return this.deref()
                .toSeq()
                .map(function(_value, key) { return this.cursor([key]) }, this);
        };



        //TODO: delegate
        this.get = function(...args) {
            return this.deref().get(...args);
        };

        this.getIn = function(...args) {
            return this.deref().getIn(...args);
        };


        this.set = function(...args) {
            return this.swap((old) => old.set(...args));
        };

        this.setIn = function(...args) {
            return this.swap((old) => old.setIn(...args));
        };

        this.map = function(...args) {
            return this.toSeq().map(...args);
        };
    };

    this.cursor = function(path) {
        return new Cursor(path);
    }
}
