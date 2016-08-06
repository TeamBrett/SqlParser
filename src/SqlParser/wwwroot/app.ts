declare var angular: any;
declare var window: any;

interface IParam {
    name: string;
    val: any;
    type: string;
}

class App {
    public input: string;
    public output: string = '';
    constructor() {
        this.updateColor();
        this.onInputChange();
    }

    public params: Array<IParam>;
    public statement: string;

    public backgroundColor: string;
    public fontColor: string;
    public styles: any = {};

    public onBackgroundColorChange() : void {
        window.localStorage.setItem('backgroundColor', this.backgroundColor);
        this.updateColor();
    }

    public onFontColorChange(): void {
        window.localStorage.setItem('fontColor', this.fontColor);
        this.updateColor();
    }

    public updateColor() {
        const bgc = window.localStorage.getItem('backgroundColor');;
        if (bgc) {
            if (this.backgroundColor !== bgc) {
                this.backgroundColor = bgc;
            }

            this.styles['background-color'] = bgc;
        }

        const fc = window.localStorage.getItem('fontColor');;
        if (fc) {
            if (this.fontColor !== fc) {
                this.fontColor = fc;
            }

            this.styles['color'] = fc;
        }
    }

    public onInputChange(): void {
        this.reset();

        const getString = (input: string): { theString: string, remainder: string } => {
            const startIndex = input.indexOf("'");
            const endIndex = this.getStringEndIndex(input, startIndex);
            const parsedString = input.slice(startIndex + 1, endIndex);
            return {
                theString: this.unDelimit(parsedString),
                remainder: input.slice(endIndex + 1)
            }
        }

        // remove the initial executsql to get to the beginning of the sql statement
        let nextString = getString(this.input);
        this.statement = nextString.theString;

        nextString = getString(nextString.remainder);

        let declarations = nextString.theString.split(',');

        this.params = declarations.map(d => {
            const pieces = d.trim().split(' ');
            return {
                name: pieces[0],
                type: pieces[1],
                val: undefined
            } as IParam;
        });

        this.params.forEach(p => {
            const varStartIndex = nextString.remainder.indexOf(p.name);
            const equalsIndex = nextString.remainder.indexOf('=', varStartIndex);
            const remainder = nextString.remainder.slice(equalsIndex + 1).trim();
            if (remainder.indexOf(`N'`) === 0) {
                p.val = `'${getString(remainder.slice(remainder.indexOf(`N'`))).theString}'`;
            } else {
                const end = remainder.indexOf(',');
                if (end > 0) {
                    p.val = remainder.slice(0, end);
                } else {
                    p.val = remainder;
                }
            }
        });

        console.log(nextString.remainder);
        let vals = nextString.remainder;
        for (let j = 0; j < vals.length; j++) {
            
        }

        this.output = this.params.filter(t => !!t.name).map(t => `DECLARE ${t.name} ${t.type} = ${t.val};`).join('\n') + '\n\n\n' + this.statement;
    }

    private getStringEndIndex(str: string, start: number): number {
        for (let i = start + 1; i < str.length; i++) {
            if (str[i] === "'") {
                if (str[++i] !== "'") {
                    return i - 1;
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

    private reset(): void {
        this.input = this.input || '';
        this.output = '';
        this.params = new Array<IParam>();
    }
}

angular.module('SqlParserApp', [])
    .controller('SqlParserCtrl', ['$scope', App]);
