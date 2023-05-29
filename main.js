Array.prototype.clean = function (undesirable) {
    return this.filter(function (val) {
        return val !== undesirable
    })
}

Array.prototype.allIndexes = function (val) {
    let indexes = [], i;
    for(i = 0; i < this.length; i++)
        if (this[i] === val)
            indexes.push(i);
    return indexes;
}

Array.prototype.remove = function (value) {
    let index = this.indexOf(value);
    if (index > -1) {
        this.splice(index, 1);
    }
}


class Box{
    constructor(r, c){
        this.position = [r, c]

        this.numbers = [[],[],[]]
    }
}

class Board{
    constructor(visual, init){
        this.visual = visual

        this.numbers = [[], [], [], [], [], [], [], [], []]
        this.boxes = [
            [],
            [],
            []
        ]

        for (let n of this.numbers) {
            for (let i of Array(9).keys()) {
                n.push("-")
            }
        }

        if(init !== 0){
            for(let i of Array(81).keys()){
                if(init[i] === "0"){
                    continue
                }
                this.numbers[Math.floor(i/9)][i%9] = Number(init[i])
            }
        }

        for(let r of Array(3).keys()){
            for(let c of Array(3).keys()){
                this.boxes[r].push(new Box(r, c))
                for(let br of Array(3).keys()){
                    for(let bc of Array(3).keys()) {
                        let box = this.boxes[r][c]
                        box.numbers[br].push(this.numbers[box.position[0]*3 + br][box.position[1]*3 + bc])
                    }
                }
            }
        }

        if(this.visual) this.draw()
    }

    getColumn(c){
        let toReturn = []
        for(let r of this.numbers){
            toReturn.push(r[c])
        }
        return toReturn
    }

    draw(){
        let table = document.getElementById("board")

        for (let r of Array(9).keys()) {
            let row = document.createElement("tr")
            row.id = "row " + r
            table.appendChild(row)
            for (let c of Array(9).keys()) {
                let cell = document.createElement("td")
                cell.innerHTML = this.numbers[r][c]
                cell.id = r + " " + c

                if(cell.innerHTML !== "-"){
                    cell.classList.add("defined")
                }

                row.appendChild(cell)
            }
        }
    }


    toString(){
        let toReturn = "\n"

        for(let r of this.numbers){
            for(let n of r){
                toReturn += n
            }
            toReturn += "\n"
        }
        return toReturn
    }

    printBoxes(){
        for(let a of this.boxes){
            for(let b of a){
                console.log(b.numbers)
            }
        }
    }

    update(r, c, val){
        this.numbers[r][c] = val
        this.boxes[Math.floor(r/3)][Math.floor(c/3)].numbers[r%3][c%3] = val

        if(this.visual) document.getElementById(r + " " + c).innerHTML = val

        return this.validate()
    }

    validate(){
        let valid = true


        // Rows
        for(let row of this.numbers){
            if((new Set(row.clean("-"))).size !== row.clean("-").length){
                valid = false
                break;
            }
        }
        // Columns
        for(let c of Array(9).keys()){
            let a = []
            for(let row of this.numbers) {
                a.push(row[c])
            }
            if((new Set(a.clean("-"))).size !== a.clean("-").length){
                valid = false;
                break;
            }
        }
        // Boxes
        for(let brow of this.boxes){
            for(let box of brow){
                if((new Set(box.numbers.flat().clean("-"))).size !== box.numbers.flat().clean("-").length){
                    valid = false;
                    break;
                }
            }
        }
        return valid
    }
}

class Solver{
    constructor(board) {
        this.board = board;

        this.all_nums = Array.from({length: 9}, (_, i) => i + 1)

        if(!this.board.validate()){
            console.log("Invalid Board !!")
        }
    }

    solve(its=0){
        let moves = []

        //moves = moves.concat(this.check_crs())
        //moves = moves.concat(this.check_bxs())

        let map = this.find_possible()

        moves.push(...this.one_option(map))
        moves.push(...this.only_possible(map))

        let moves_compare = []
        for(let move of moves){
            let str = "" + move[0] + move[1] + move[2]
            if(moves_compare.includes(str)) moves.remove(move)
            else moves_compare.push(str)
        }

        if(moves.length === 0){
            console.log("Can't currently solve")
            return [false, its]
        }

        console.log(moves)
        for(let m of moves){
            this.board.update(...m)
        }
        if(!board.validate()){
            console.log("Invalid board generated (somehow)")
        }
        if(this.board.numbers.flat().length === this.board.numbers.flat().clean("-").length){
            console.log("solved")
            return [true, its]
        }
        return this.solve(its+1)
    }


    one_option(map){
        let moves = []
        let p_map = map.flat()
        for(let p of Array(81).keys()){
            let poss = p_map[p]
            if(poss instanceof Array && poss.length === 1){
                moves.push([Math.floor(p/9), p%9, poss[0], "Only option for square"])
            }
        }
        return moves
    }

    find_possible(){
        let poss_map = [[],[],[],[],[],[],[],[],[]]

        let numbers = this.board.numbers

        for(let r of Array(9).keys()){
            for(let c of Array(9).keys()){
                if(numbers[r][c] !== "-"){
                    poss_map[r].push("0")
                    continue
                }
                let total = [...this.all_nums]
                let row = numbers[r]
                let col = this.board.getColumn(c)
                let box_contents = this.board.boxes[Math.floor(r/3)][Math.floor(c/3)].numbers.flat()


                for(let n of row.clean("-").concat(col.clean("-").concat(box_contents.clean("-")))){
                    if(total.indexOf(n) > -1){
                        total = total.clean(n)
                    }
                }
                poss_map[r].push(total)
            }
        }
        // poss_map = this.remove_cycles(poss_map)

        return poss_map
    }

    only_possible(map){
        let moves = []

        for(let r of Array(9).keys()){
            for(let i of this.all_nums){
                let found = 0
                let loc = 10
                for(let p of Array(9).keys()){
                    let ps = map[r][p]
                    if(ps === 0) break;
                    if(ps.includes(i)){
                        found++;
                        loc = p
                    }
                    if(found > 1) break;
                }
                if(found === 1) moves.push([r, loc, i, "Only space for number in row"])

                found = 0
                loc = 10
                for(let p of Array(9).keys()){
                    let ps = map[p][r]
                    if(ps === 0) break;
                    if(ps.includes(i)){
                        found ++;
                        loc = p
                    }
                    if(found > 1) break;
                }
                if(found === 1) moves.push([loc, r, i, "Only space for number in column"])
            }
        }

        for(let box of this.board.boxes.flat()){
            for(let i of this.all_nums) {
                let found = 0
                let loc = []
                for (let p of Array(9).keys()) {
                    let ps = map[box.position[0] * 3 + Math.floor(p / 3)][box.position[1] * 3 + p % 3]

                    if(ps.includes(i)){
                        found ++;
                        loc = [Math.floor(p/3), p%3]
                    }
                    if(found > 1) break;
                }
                if(found === 1) moves.push([box.position[0]*3 + loc[0], box.position[1]*3 + loc[1], i, "Only space for number in box"])
            }
        }
        return moves;
    }

    remove_cycles(map){
        for(let r of Array(9).keys()){
            for(let c of Array(9).keys()){
                // For each item in a row
                // Compare to each other item
                for(let c2 of Array(9).keys()){
                    if(c === c2) continue
                    let result = this.is_cycle([map[r][c], map[r][c2]])
                    if(result[0]){
                        for(let e of Array(map[r].length).keys()){
                            if([c, c2].includes(e)) continue
                            let element = map[r][e]
                            if(element === "0") continue
                            result[1].forEach(n => element.remove(n));
                            if(element.length === 0){
                                map[r][e] = "0"
                            }
                        }
                    }
                    for(let c3 of Array(9).keys()){
                        if(c === c2 || c2 === c3 || c === c3) continue
                        let result = this.is_cycle([map[r][c], map[r][c2], map[r][c3]])
                        if(result[0]){
                            for(let e of Array(map[r].length).keys()){
                                if([c, c2, c3].includes(e)) continue
                                let element = map[r][e]
                                if(element === "0") continue
                                result[1].forEach(n => element.remove(n));
                                if(element.length === 0){
                                    map[r][e] = "0"
                                }
                            }
                        }
                    }
                }
            }
        }

        for(let c of Array(9).keys()){
            for(let r of Array(9).keys()){
                for(let r2 of Array(9).keys()){
                    if(r === r2) continue
                    let result = this.is_cycle([map[r][c], map[r2][c]])
                    if(result[0]){
                        console.log(c)
                        console.log(result[1])
                        for(let e of Array(map.length).keys()){
                            if([r, r2].includes(e)) continue
                            let element = map[e][c]
                            if(element === "0") continue
                            result[1].forEach(n => element.remove(n))
                            if(element.length === 0){
                                map[e][c] = "0"
                            }
                        }
                    }
                    for(let r3 of Array(9).keys()){
                        if(r === r2 || r2 === r3 || r === r3) continue
                        let result = this.is_cycle([map[r][c], map[r2][c], map[r3][c]])
                        if(result[0]){
                            for(let e of Array(map.length).keys()){
                                if([r, r2, r3].includes(e)) continue
                                let element = map[e][c]
                                if(element === "0") continue
                                result[1].forEach(n => element.remove(n))
                                if(element.length === 0){
                                    map[e][c] = "0"
                                }
                            }
                        }
                    }
                }
            }
        }

        return map
    }

    is_cycle(profiles) {
        let total = []
        for (let p of profiles) {
            if(p === "0"){
                return [false, new Set()]
            }
            total = total.concat(p)
        }
        return [(new Set(total)).size === profiles.length, new Set(total)]
    }

    //Depreciated
    check_crs(){
        let moves = []
        for(let r of Array(9).keys()){
            let nums = [...this.all_nums]
            let row = this.board.numbers[r]
            if(row.flat().clean("-").length === 8){
                for(let i of nums){
                    if(row.flat().includes(i)){
                        nums[i-1] = 10
                    }
                }
                moves.push([r, row.flat().indexOf("-"), nums.clean(10)[0]])
            }
        }
        for(let c of Array(9).keys()){
            let nums = [this.all_nums]
            let column = this.board.getColumn(c)
            if(column.flat().clean("-").length === 8){
                for(let i of nums){
                    if(column.flat().includes(i)){
                        nums[i-1] = 10
                    }
                }
                moves.push([column.flat().indexOf("-"), c, nums.clean(10)[0]])
            }
        }



        return moves
    }

    check_bxs(){
        let moves = []

        for(let box of this.board.boxes.flat()){
            let val = 0
            let nums = [...this.all_nums]
            if(box.numbers.flat().clean("-").length === 8){
                for(let i of nums){
                    if(!box.numbers.flat().includes(i)){
                        val = i
                    }
                }
                moves.push([box.position[0]*3 + Math.floor(box.numbers.flat().indexOf("-")/3), box.position[1]*3 + box.numbers.flat().indexOf("-")%3, val])
            }
        }

        return moves
    }

    box_narrowing(){
        // let rows = []
        // let cols = []
        //
        // for(let n of this.all_nums){
        //     let r = []
        //     let c = []
        //     for(let i of Array(9).keys()){
        //         if(this.board.numbers[i].includes(n)) r.push(i)
        //         if(this.board.getColumn(i).includes(n)) c.push(i)
        //     }
        //     rows.push(r)
        //     cols.push(c)
        // }
        //
        // for(let box of this.board.boxes){
        //
        // }
    }
}

// Easy:
// 2 step 500467309903810427174203000231976854857124090496308172000089260782641005010000708
// 2 step 051200090038079040290500006123600700870301054009008361400002015010860430060007920
// 7 step 403000000680000500750003090500080130000090702017005006060138940009052060030907825

// NYT
// Easy 3 moves only_possible- 040005207095127000721000090000350104017060830402010005100643000000501403370000051

let board = new Board(true, "000407050030600000070000003000000560000006020009705040050008100803100405000900000");


let solver = new Solver(board)

console.log(solver.solve())

let map = solver.find_possible()
console.log(JSON.parse(JSON.stringify(map)))
console.log(solver.remove_cycles(JSON.parse(JSON.stringify(map))))

console.log(board.validate())