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

function* choose(array, n) {
    if (n === 1) {
        for (const a of array) {
            yield [a];
        }
        return;
    }

    for (let i = 0; i <= array.length - n; i++) {
        for (const c of choose(array.slice(i + 1), n - 1)) {
            yield [array[i], ...c];
        }
    }
}

function printMap(map){
    let toPrint = ""

    for(let r of Array(9).keys()){
        toPrint += (r%3===0) ? "\n\n\n" : "\n"
        for(let c of Array(9).keys()){
            toPrint+= (map[r][c] instanceof Array) ? map[r][c].length : 0
            if(c%3===2) toPrint += " "
        }
    }

    return toPrint + "\n"
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

        console.log(this.numbers)

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
        for(let i of Array(81).keys()){
            document.getElementById(Math.floor(i/9) + " " + (i%9)).innerHTML = this.numbers.flat()[i]
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

    update(r, c, val){
        this.numbers[r][c] = val
        this.boxes[Math.floor(r/3)][Math.floor(c/3)].numbers[r%3][c%3] = val

        if(this.visual) document.getElementById(r + " " + c).innerHTML = val
        console.log(document.getElementById(r + " " + c).innerHTML)
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

    printBoxes(){
        for(let a of this.boxes){
            for(let b of a){
                console.log(b.numbers)
            }
        }
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

    solve(its=1){
        console.log("Round " + its)
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

        for(let m of moves){
            this.board.update(...m)
        }
        if(!this.board.validate()){
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
        poss_map = this.remove_cycles(poss_map)

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
        for(let i of Array(9).keys()){
            let row_map = map[i]
            this.loop_boxes(row_map)

            let col_map = map.map(m => m[i])
            this.loop_boxes(col_map)

            let box_map = map.flat().filter((e, index) => {
                return Math.floor(index/27) === Math.floor(i/3) && Math.floor((index%9)/3) === i%3
            })
            this.loop_boxes(box_map)
        }

        // for(let r of Array(9).keys()){
        //     for(let c of Array(9).keys()){
        //         // For each item in a row
        //         // Compare to each other item
        //         for(let c2 of Array(9).keys()){
        //             if(c === c2) continue
        //             let result = this.is_cycle([map[r][c], map[r][c2]])
        //             if(result[0]){
        //                 console.log("Row " + r + " cycle of " + [c, c2])
        //                 for(let e of Array(map[r].length).keys()){
        //                     if([c, c2].includes(e)) continue
        //                     let element = map[r][e]
        //                     if(element === "0") continue
        //                     result[1].forEach(n => element.remove(n));
        //                     if(element.length === 0){
        //                         map[r][e] = "0"
        //                     }
        //                 }
        //             }
        //             for(let c3 of Array(9).keys()){
        //                 if(c === c2 || c2 === c3 || c === c3) continue
        //                 let result = this.is_cycle([map[r][c], map[r][c2], map[r][c3]])
        //                 if(result[0]){
        //                     console.log("Row " + r + " cycle of " + [c, c2, c3])
        //                     for(let e of Array(map[r].length).keys()){
        //                         if([c, c2, c3].includes(e)) continue
        //                         let element = map[r][e]
        //                         if(element === "0") continue
        //                         result[1].forEach(n => element.remove(n));
        //                         if(element.length === 0){
        //                             map[r][e] = "0"
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // for(let c of Array(9).keys()){
        //     for(let r of Array(9).keys()){
        //         for(let r2 of Array(9).keys()){
        //             if(r === r2) continue
        //             let result = this.is_cycle([map[r][c], map[r2][c]])
        //             if(result[0]){
        //                 console.log("Column " + c + " cycle of " + [r, r2])
        //                 for(let e of Array(map.length).keys()){
        //                     if([r, r2].includes(e)) continue
        //                     let element = map[e][c]
        //                     if(element === "0") continue
        //                     result[1].forEach(n => element.remove(n))
        //                     if(element.length === 0){
        //                         map[e][c] = "0"
        //                     }
        //                 }
        //             }
        //             for(let r3 of Array(9).keys()){
        //                 if(r === r2 || r2 === r3 || r === r3) continue
        //                 let result = this.is_cycle([map[r][c], map[r2][c], map[r3][c]])
        //                 if(result[0]){
        //                     console.log("Column " + c + " cycle of " + [r, r2, r3])
        //                     for(let e of Array(map.length).keys()){
        //                         if([r, r2, r3].includes(e)) continue
        //                         let element = map[e][c]
        //                         if(element === "0") continue
        //                         result[1].forEach(n => element.remove(n))
        //                         if(element.length === 0){
        //                             map[e][c] = "0"
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // for(let box of this.board.boxes.flat()){
        //     for(let i1 of Array(9).keys()){
        //         for(let i2 of Array(9).keys()){
        //             if(i1 === i2) continue;
        //             let result = this.is_cycle([map[box.position[0]*3 + Math.floor(i1/3)][box.position[1]*3 + i1%3], map[box.position[0]*3 + Math.floor(i2/3)][box.position[1]*3 + i2%3]])
        //             if(result[0]){
        //                 console.log("Box " + box.position + " cycle of 2")
        //                 for(let e of Array(9).keys()){
        //                     if([i1, i2].includes(e)) continue
        //                     let element = map[box.position[0]*3 + Math.floor(e/3)][box.position[1]*3 + e%3]
        //                     if(element === "0") continue
        //                     result[1].forEach(n => element.remove(n))
        //                 }
        //             }
        //             for(let i3 of Array(9).keys()){
        //                 if(i1 === i2 || i2 === i3 || i1 === i3) continue
        //                 let result = this.is_cycle([map[box.position[0]*3 + Math.floor(i1/3)][box.position[1]*3 + i1%3],
        //                                                    map[box.position[0]*3 + Math.floor(i2/3)][box.position[1]*3 + i2%3],
        //                                                    map[box.position[0]*3 + Math.floor(i3/3)][box.position[1]*3 + i3%3]])
        //                 if(result[0]){
        //                     console.log("Box " + box.position + " cycle of 3")
        //                     for(let e of Array(9).keys()){
        //                         if([i1, i2, i3].includes(e)) continue
        //                         let element = map[box.position[0]*3 + Math.floor(e/3)][box.position[1]*3 + e%3]
        //                         if(element === "0") continue
        //                         result[1].forEach(n => element.remove(n))
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        return map
    }

    loop_boxes(maps){
        for(let size = 2; size <= maps.clean("1").length - 1; size++) {
            for (let combo of choose([...Array(maps.length).keys()], size)) {
                let result = []
                combo.forEach(c => result.push(maps[c]))

                let cycle = this.is_cycle(result)
                if (cycle[0]) {
                    for (let e of Array(9).keys()) {
                        let element = maps[e]
                        if (combo.toString().includes(e.toString()) || element === "0") continue
                        cycle[1].forEach(n => element.remove(n))
                    }
                }
            }
        }
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

function updateValue(e){
    let count = 0
    for(let y of Array(9).keys()){
        for(let x of Array(9).keys()){
            document.getElementById(y + " " + x).innerHTML = "-"
            document.getElementById(y + " " + x).className = "empty"
        }
    }
    for(let char of e.target.value){
        if([...Array(9).keys()].map(m => m+1).includes(parseInt(char))){
            document.getElementById(Math.floor(count/9) + " " + count%9).innerHTML = char
            document.getElementById(Math.floor(count/9) + " " + count%9).className = "defined"
        }
        else{
            document.getElementById(Math.floor(count/9) + " " + count%9).className = ""
        }
        count++
        if(count > 81){
            return
        }
    }
}

let table = document.getElementById("board")

for (let r of Array(9).keys()) {
    let row = document.createElement("tr")
    row.id = "row " + r
    table.appendChild(row)
    for (let c of Array(9).keys()) {
        let cell = document.createElement("td")
        cell.innerHTML = "-"
        cell.id = r + " " + c
        cell.className = "empty"

        row.appendChild(cell)
    }
}

document.getElementById("solve").addEventListener('click', function () {
    let board = new Board(true, document.getElementById("numbers").value)
    let solver = new Solver(board)
    console.log(solver.solve())
})


document.getElementById("numbers").addEventListener('input', updateValue);
