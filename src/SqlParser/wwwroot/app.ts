declare var angular: any;

interface IParam {
    name: string;
    val: string;
    type: string;
}

class App {
    public input: string;
    public output: string = '';
    constructor() {
        this.input = `sp_executesql N'SELECT * FROM AdventureWorks2012.HumanResources.Employee WHERE BusinessEntityID = @level', N'@level tinyint', @level = 109;`;
        this.onInputChange();
    }

    public params: Array<IParam>;
    public statement: string;

    public onInputChange(): void {
        this.reset();

        // remove the initial executsql to get to the beginning of the sql statement
        const statementStart = this.input.indexOf("'");
        const statementEnd = this.stringEnd(this.input, statementStart);
        this.statement = this.input.slice(statementStart + 1, statementEnd);
        const source = this.input.slice(statementEnd);
        let ecruos = this.reverse(source);
        for (let j = 0; j < ecruos.length; j++) {
            if (ecruos === 'N ,') {
                break;
            }
            const commaIndex = ecruos.indexOf(',');
            let quoteIndex = ecruos.indexOf("'");
            let tokenIndex = -1;
            let term: string;
            var assignment: string[];
            if (quoteIndex > commaIndex) {
                term = this.reverse(ecruos.substring(0, commaIndex));
                if (term.indexOf('=')) {
                    assignment = term.split('=').map(t => t.trim());
                    this.params.push({
                        name: assignment[0],
                        val: assignment[1],
                        type: undefined
                    });
                }

                tokenIndex = commaIndex;
            } else if (commaIndex > quoteIndex) {
                if (quoteIndex === 0) {
                    quoteIndex = ecruos.indexOf("'", 1);
                }
                term = this.reverse(ecruos.substring(0, quoteIndex));
                if (term.indexOf(' ')) {
                    assignment = term.split(' ').map(t => t.trim());
                    console.log(assignment);
                    const param = this.params.filter(t => t.name === assignment[0]).pop();
                    param.type = assignment[1];
                }

                tokenIndex = quoteIndex;
            }

            console.log(ecruos);
            ecruos = ecruos.slice(tokenIndex + 1);
            console.log(ecruos);
        }

        this.output = this.params.filter(t => !!t.name).map(t => `DECLARE ${t.name} ${t.type} = ${t.val}`).join('\n') + '\n\n\n' + this.statement;
    }

    private stringEnd(str: string, start: number): number {
        for (let i = start + 1; i < str.length; i++) {
            if (str[i] === "'") {
                if (str[i + 1] !== "'") {
                    return i;
                }
            }
        }

        return -1;
    }

    private unDelimit(val: string): string {
        var retval = '';
        for (let i = 0; i < val.length; i++) {
            if (val[i] === "'" && val[i + 1] === "'") {
                i = i + 1;
            }

            retval += val[i];
        }

        return retval;
    }

    private reverse(str: string): string {
        let val = '';
        let len = str.length;
        while (--len > 0) {
            val += str[len];
        }

        return val;
    }

    private reset(): void {
        this.output = '';
        this.params = new Array<IParam>();
    }
}

angular.module('SqlParserApp', [])
    .controller('SqlParserCtrl', ['$scope', App]);
