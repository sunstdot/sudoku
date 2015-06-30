//this is the data module, hold the sudoku generage data

m = (function() {
	var obj = {},
		SIZE = 9;
	//数独部分算法，包括生成数独，验证数独，数独挖空，数独提示
	function newSudokuMap() {
		var sudokuMap = new Array(SIZE);
		for (var i = 0; i < SIZE; i++) {
			sudokuMap[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
		return sudokuMap;
	}


	//验证是否正确
	function isValid(row, col, n,sudokuMap) {
		row = parseInt(row, 10), col = parseInt(col, 10);
		for (var i = 0; i < SIZE; i++) {
			if (row !== i && sudokuMap[i][col] === n) {
				return false;
			}
			if (col !== i && sudokuMap[row][i] === n) {
				return false;
			}
		}
		var l_row = parseInt(row / 3, 10) * 3,
			l_col = parseInt(col / 3, 10) * 3;
		for (var i = l_row; i < l_row + 3; ++i) {
			for (var j = l_col; j < l_col + 3; ++j) {
				if (i !== row && j !== col && sudokuMap[i][j] === n) {
					return false;
				}
			}
		}
		return true;
	};
	//递归解数独
	function dfs(n, sudokuMap) {
		if (n > 80) {
			return true;
		}
		var x = parseInt(n / SIZE, 10),
			y = n % SIZE;
		if (sudokuMap[x][y] === 0) {
			for (var i = 1; i <= SIZE; i++) {
				sudokuMap[x][y] = i;
				if (isValid(x, y,i, sudokuMap) && dfs(n + 1, sudokuMap)) {
					return true;
				}
				sudokuMap[x][y] = 0;
			}
		} else {
			if (dfs(n + 1, sudokuMap)) {
				return true;
			}
		}
		return false;
	}

	//生成数独
	obj.generateSudoku = function() {
		//在一个数组中随机生成数字
		var tempArr = [1, 2, 3, 4, 5, 6, 7, 8, 9],
			num = Math.floor(SIZE * Math.random()),
			sudokuMap; //先随机生成一列

		sudokuMap = newSudokuMap();
		for (var i = 0; i < SIZE; i++) {
			// var tempNum = (langFun.rand(tempArr.length)); //使用随机函数生成随机数
			var tempNum = Math.floor(tempArr.length*Math.random())
			sudokuMap[i][num] = tempArr[tempNum];
			tempArr.splice(tempNum, 1);
		}
		dfs(0, sudokuMap);
		console.log(sudokuMap); //已经生成一个数独
		return sudokuMap;
	};
	//数独求解，练练，到时候会直接保存生成的数独
	obj.sudokuSolver = function(curSudoku) {
		dfs(0, curSudoku);

	};
	//从生成的数独中挖空,效率问题
	obj.sudokuDig = function(num, curSudoku) {
		var m, n, tempIndex, sudokuArr = [];
		while (num > 0) {
			m = Math.floor(SIZE * Math.random());
			n = Math.floor(SIZE * Math.random());
			tempIndex = m + "" + n;
			if (sudokuArr.indexOf(m + "" + n) === -1) {
				curSudoku[m][n] = 0;
				sudokuArr.push(tempIndex);
				num--;
			}
		}
	};

	obj.sudokuRemind = function(x, y, curSudoku) {
		//做一次拷贝
		var tempSudoku = langFun.clone(curSudoku);
		if(dfs(0, tempSudoku)){
			return tempSudoku[x][y];
		}
		//如果curSudoku无解，则会返回false
		return tempSudoku[x][y];
	};

	//更新数独
	obj.updateSudoku = function(x, y, n, sudokuMap) {
		sudokuMap[x][y] = n;
	};
	//验证输入的数字
	obj.verifySudoku = function(x, y,n,sudokuMap) {
		return isValid(x, y,n,sudokuMap);
	};
	return obj;
}());