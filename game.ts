enum GameState {
    NotSet,
    Win,
    Lose,
    Play
}

class Drawer {
    canvas: any;
    ctx: any = null;
    map: Map;
    cellWidth: number;
    cellheight: number;
    gameState: GameState = GameState.NotSet;

    constructor(canvas: any, ctx: any) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.map = new Map(10, 10, 15);
        this.cellWidth = this.canvas.width / 10;
        this.cellheight = this.canvas.height / 10;
    }

    paint() {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = "20px Arial";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const imgTile = document.getElementById("tile");
        const imgFlag = document.getElementById("flag");
        const imgMine = document.getElementById("mine");
        for(let i = 0; i < this.map.Rows; i++) {
            for(let j = 0; j < this.map.Cols; j++) {
                let cell = this.map.GetCell(j, i);
                this.ctx.fillStyle = "#C2C2C2";
                this.ctx.drawImage(imgTile, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                if(cell.Marked) {
                    this.ctx.drawImage(imgFlag, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                }
                if(cell.Opened) {
                    this.ctx.fillRect(j * this.cellWidth + 4, i * this.cellheight + 4, this.cellWidth-8, this.cellheight - 8);
                    if(cell.HaveMine) {
                        this.ctx.drawImage(imgMine, j * this.cellWidth, i * this.cellheight, this.cellWidth, this.cellheight);
                    }
                }

                let str = (cell.Opened && !cell.HaveMine && cell.Counter > 0) ? cell.Counter : "";
                this.ctx.fillStyle = cell.getColor();
                this.ctx.fillText(
                    str, 
                    j * this.cellWidth + this.cellWidth / 4, 
                    i * this.cellheight + 30);
            }
        }
    }

    click(x: number, y: number, actionFlag: boolean) {
        let mousex = Math.floor((x - this.canvas.offsetLeft) / this.cellWidth);
        let mousey = Math.floor((y - this.canvas.offsetTop) / this.cellheight);
        if(!this.inRange(mousex, mousey)) {
            return;
        }
        if(actionFlag) {
            this.gameState = this.map.Open(mousex, mousey);
        } else {
            this.map.Mark(mousex, mousey);
        }
        
        switch (this.gameState)
        {
            case GameState.Win:
                console.log('win');
                break;
            case GameState.Lose:
                console.log('lose');
                break;
            case GameState.Play:
                console.log('play');
                break;
        }
        this.paint();
    }

    inRange(mousex: number, mousey: number): boolean {
        return mousex >= 0 
            && mousex < this.map.Rows
            && mousey >= 0 
            && mousey < this.map.Cols;
    }
}

class Cell {
    HaveMine: boolean = false;
    Opened: boolean = false;
    Marked: boolean = false;
    Counter: number = 0;
    getColor(): string {
        switch(this.Counter) {
            case 1: return "#0000FF";
            case 2: return "#008000";
            case 3: return "#FF0000";
            case 4: return "#191970";
            case 5: return "#800000";
            case 6: return "#008080";
            case 7: return "#0F0F0F";
            case 8: return "#000000";
        }
        return "";
    }
}

class Map {
    matrix: Cell[][] = [];
    Rows: number;
    Cols: number;
    Mines: number;
    OpenedCells: number = 0;

    constructor(cols: number, rows: number, mines: number) {
        this.Cols = cols;
        this.Rows = rows;
        this.Mines = mines;
        this.initMap();
    }

    initMap(): void {
        for (let i = 0; i < this.Rows; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < this.Cols; j++) {
                this.matrix[i][j] = new Cell();
            }
        }
        this.AddMines();
    }

    AddMines(): void {
        let x, y, cont = 0;
        while (cont < this.Mines) {
            x = Math.floor(Math.random() * this.Cols);
            y = Math.floor(Math.random() * this.Rows);
            if (this.matrix[y][x].HaveMine) { 
                continue;
            }
            this.matrix[y][x].HaveMine = true;
            this.matrix[y][x].Counter++;
            this.CountMines(x - 1, y - 1); this.CountMines(x, y - 1); this.CountMines(x + 1, y - 1);
            this.CountMines(x - 1, y); this.CountMines(x + 1, y);
            this.CountMines(x - 1, y + 1); this.CountMines(x, y + 1); this.CountMines(x + 1, y + 1);
            cont++;
        }
    }

    CountMines(x: number, y: number): void {
        if (x < 0 || x >= this.Cols || y < 0 || y >= this.Rows) {
            return;
        }
        this.matrix[y][x].Counter++;
    }

    GetCell(x: number, y: number) : Cell {
        return this.matrix[y][x];
    }

    Open(x: number, y: number): GameState {
        if (this.matrix[y][x].HaveMine && !this.matrix[y][x].Marked) {
            this.matrix[y][x].Opened = true;
            this.OpenedCells++;
            return GameState.Lose;
        }
        this.OpenCell(x, y);
        if (this.OpenedCells == this.Cols * this.Rows - this.Mines) {
            return GameState.Win;
        }
        return GameState.Play;
    }

    Mark(x: number, y: number) {
        if(this.matrix[y][x].Opened) {
            return;
        }
        this.matrix[y][x].Marked = !this.matrix[y][x].Marked;
    }

    private OpenCell(x: number, y: number): void {
        if (x < 0 || x >= this.Cols || y < 0 || y >= this.Rows || this.matrix[y][x].Opened) {
            return;
        }
        else {
            if (!this.matrix[y][x].HaveMine && !this.matrix[y][x].Marked) {
                this.matrix[y][x].Opened = true;
                this.OpenedCells++;
                if (this.matrix[y][x].Counter == 0) {
                    this.OpenCell(x - 1, y - 1); this.OpenCell(x, y - 1); this.OpenCell(x + 1, y - 1);
                    this.OpenCell(x - 1, y); this.OpenCell(x + 1, y);
                    this.OpenCell(x - 1, y + 1); this.OpenCell(x, y + 1); this.OpenCell(x + 1, y + 1);
                }
            }
        }
    }
}

function Buscaminas() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let drawer = new Drawer(canvas, ctx);
    canvas.addEventListener('contextmenu', (evt) => evt.preventDefault() , false);
    document.addEventListener('mousedown', (evt) => {
        evt.preventDefault();
        drawer.click(evt.pageX, evt.pageY, evt.button == 0);
    }, false);
    drawer.paint();
}

window.addEventListener('load', Buscaminas, false);