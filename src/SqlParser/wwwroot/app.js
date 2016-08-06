var App = (function () {
    function App() {
        this.output = '';
        this.styles = {};
        this.updateColor();
        this.onInputChange();
    }
    App.prototype.onBackgroundColorChange = function () {
        window.localStorage.setItem('backgroundColor', this.backgroundColor);
        this.updateColor();
    };
    App.prototype.onFontColorChange = function () {
        window.localStorage.setItem('fontColor', this.fontColor);
        this.updateColor();
    };
    App.prototype.updateColor = function () {
        var bgc = window.localStorage.getItem('backgroundColor');
        ;
        if (bgc) {
            if (this.backgroundColor !== bgc) {
                this.backgroundColor = bgc;
            }
            this.styles['background-color'] = bgc;
        }
        var fc = window.localStorage.getItem('fontColor');
        ;
        if (fc) {
            if (this.fontColor !== fc) {
                this.fontColor = fc;
            }
            this.styles['color'] = fc;
        }
    };
    App.prototype.onInputChange = function () {
        var _this = this;
        this.reset();
        var getString = function (input) {
            var startIndex = input.indexOf("'");
            var endIndex = _this.getStringEndIndex(input, startIndex);
            var parsedString = input.slice(startIndex + 1, endIndex);
            return {
                theString: _this.unDelimit(parsedString),
                remainder: input.slice(endIndex + 1)
            };
        };
        // remove the initial executsql to get to the beginning of the sql statement
        var nextString = getString(this.input);
        this.statement = nextString.theString;
        nextString = getString(nextString.remainder);
        var declarations = nextString.theString.split(',');
        this.params = declarations.map(function (d) {
            var pieces = d.trim().split(' ');
            return {
                name: pieces[0],
                type: pieces[1],
                val: undefined
            };
        });
        this.params.forEach(function (p) {
            var varStartIndex = nextString.remainder.indexOf(p.name);
            var equalsIndex = nextString.remainder.indexOf('=', varStartIndex);
            var remainder = nextString.remainder.slice(equalsIndex + 1).trim();
            if (remainder.indexOf("N'") === 0) {
                p.val = "'" + getString(remainder.slice(remainder.indexOf("N'"))).theString + "'";
            }
            else {
                var end = remainder.indexOf(',');
                if (end > 0) {
                    p.val = remainder.slice(0, end);
                }
                else {
                    p.val = remainder;
                }
            }
        });
        console.log(nextString.remainder);
        var vals = nextString.remainder;
        for (var j = 0; j < vals.length; j++) {
        }
        this.output = this.params.filter(function (t) { return !!t.name; }).map(function (t) { return ("DECLARE " + t.name + " " + t.type + " = " + t.val + ";"); }).join('\n') + '\n\n\n' + this.statement;
    };
    App.prototype.getStringEndIndex = function (str, start) {
        for (var i = start + 1; i < str.length; i++) {
            if (str[i] === "'") {
                if (str[++i] !== "'") {
                    return i - 1;
                }
            }
        }
        return -1;
    };
    App.prototype.unDelimit = function (val) {
        var retval = '';
        for (var i = 0; i < val.length; i++) {
            if (val[i] === "'" && val[i + 1] === "'") {
                i = i + 1;
            }
            retval += val[i];
        }
        return retval;
    };
    App.prototype.reset = function () {
        this.input = this.input || '';
        this.output = '';
        this.params = new Array();
    };
    return App;
}());
angular.module('SqlParserApp', [])
    .controller('SqlParserCtrl', ['$scope', App]);
