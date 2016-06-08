var App = (function () {
    function App() {
        this.output = '';
        this.input = "sp_executesql N'SELECT * FROM AdventureWorks2012.HumanResources.Employee WHERE BusinessEntityID = @level', N'@level tinyint', @level = 109;";
        this.onInputChange();
    }
    App.prototype.onInputChange = function () {
        this.reset();
        // remove the initial executsql to get to the beginning of the sql statement
        var statementStart = this.input.indexOf("'");
        var statementEnd = this.stringEnd(this.input, statementStart);
        this.statement = this.input.slice(statementStart + 1, statementEnd);
        var source = this.input.slice(statementEnd);
        var ecruos = this.reverse(source);
        for (var j = 0; j < ecruos.length; j++) {
            if (ecruos === 'N ,') {
                break;
            }
            var commaIndex = ecruos.indexOf(',');
            var quoteIndex = ecruos.indexOf("'");
            var tokenIndex = -1;
            var term = void 0;
            var assignment;
            if (quoteIndex > commaIndex) {
                term = this.reverse(ecruos.substring(0, commaIndex));
                if (term.indexOf('=')) {
                    assignment = term.split('=').map(function (t) { return t.trim(); });
                    this.params.push({
                        name: assignment[0],
                        val: assignment[1],
                        type: undefined
                    });
                }
                tokenIndex = commaIndex;
            }
            else if (commaIndex > quoteIndex) {
                if (quoteIndex === 0) {
                    quoteIndex = ecruos.indexOf("'", 1);
                }
                term = this.reverse(ecruos.substring(0, quoteIndex));
                if (term.indexOf(' ')) {
                    assignment = term.split(' ').map(function (t) { return t.trim(); });
                    console.log(assignment);
                    var param = this.params.filter(function (t) { return t.name === assignment[0]; }).pop();
                    param.type = assignment[1];
                }
                tokenIndex = quoteIndex;
            }
            console.log(ecruos);
            ecruos = ecruos.slice(tokenIndex + 1);
            console.log(ecruos);
        }
        this.output = this.params.filter(function (t) { return !!t.name; }).map(function (t) { return ("DECLARE " + t.name + " " + t.type + " = " + t.val); }).join('\n') + '\n\n\n' + this.statement;
    };
    App.prototype.stringEnd = function (str, start) {
        for (var i = start + 1; i < str.length; i++) {
            if (str[i] === "'") {
                if (str[i + 1] !== "'") {
                    return i;
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
    App.prototype.reverse = function (str) {
        var val = '';
        var len = str.length;
        while (--len > 0) {
            val += str[len];
        }
        return val;
    };
    App.prototype.reset = function () {
        this.output = '';
        this.params = new Array();
    };
    return App;
}());
angular.module('SqlParserApp', [])
    .controller('SqlParserCtrl', ['$scope', App]);
