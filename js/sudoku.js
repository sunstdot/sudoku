var option, OPTIONS = ["lowlevel", "midlevel", "highlevel", "aboutAuthor"],
	optionCfg = {
		"lowlevel": "初级",
		"midlevel": "中级",
		"highlevel": "高级",
		"aboutAuther": "作者"
	},
	levelCfg = {
		"lowlevel": "40",
		"midlevel": "50",
		"highlevel": "60"
	},
	globalSudoku,
	timer,
	selectedMode;

//数独部分算法，包括数独生成，数独挖空，数独求解，数独单个提示
var sudokuAlg = (function () {
	var SIZE = 9, sudokuMap = new Array(SIZE);

	for (var i = 0; i < SIZE; i++) {
		sudokuMap[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);

	}
	
	//检测数值是否正确
	function isValid(x, y, n, sudokuMap) {
		//		var row = parseInt(pos / SIZE,10), col = pos % SIZE;
		var row = parseInt(x, 10), col = parseInt(y, 10);
		for (var t = 0; t < SIZE; t++) {
			if (row !== t && sudokuMap[t][col] === n) {
				return false;
			}
			if (col !== t && sudokuMap[row][t] === n) {
				return false;
			}
		}
		var l_row = parseInt(row / 3, 10) * 3, l_col = parseInt(col / 3, 10) * 3;
		for (var m = l_row; m < l_row + 3; ++m) {
			for (var p = l_col; p < l_col + 3; ++p) {
				if (m !== row && p !== col && sudokuMap[m][p] === n) {
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
		var x = parseInt(n / SIZE, 10), y = n % SIZE;
		if (sudokuMap[x][y] === 0) {
			for (var i = 1; i <= SIZE; i++) {
				sudokuMap[x][y] = i;
				if (isValid(x, y, i, sudokuMap) && dfs(n + 1, sudokuMap)) {
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
	return {
		generateSudoku: function () {
			var tempArr = [1, 2, 3, 4, 5, 6, 7, 8, 9], num = Math.floor(SIZE * Math.random());
			for (var i = 0; i < SIZE; i++) {
				var tempNum = Math.floor(tempArr.length * Math.random());
				sudokuMap[i][num] = tempArr[tempNum];
				tempArr.splice(tempNum, 1);
			};
			dfs(0, sudokuMap);
			console.log(sudokuMap);//已经生成一个数独
			return sudokuMap;
		},
		//数独求解，练练，到时候会直接保存生成的数独
		sudokuSolver: function (tempSudoku) {
			dfs(0, tempSudoku);
		},
		//数独挖空,随机,num表示挖的孔数目
		sudokuDig: function (num, tempSudoku) {
			var m, n, temp, sudokuArr = [];
			while (num > 0) {
				m = Math.floor(SIZE * Math.random());
				n = Math.floor(SIZE * Math.random());
				temp = m + "" + n;
				if (sudokuArr.indexOf(m + "" + n) === -1) {
					tempSudoku[m][n] = 0;
					sudokuArr.push(temp);
					num--;
				}
			}
		},
		//提示的框的位置
		sudokuRemind: function (x, y, tempSudoku) {
			dfs(0, tempSudoku);
			return tempSudoku[x][y];
		},
		//更新数独
		updateSudoku: function (x, y, n, sudokuMap) {
			sudokuMap[x][y] = n;
		},
		//验证输入的数字
		verifySudoku: function (x, y, n, sudokuMap) {
			return isValid(x, y, n, sudokuMap);
		},
	};
} ());

//=============================目录部分begin=======================================
//使用方式,生成list然后模拟一次点击操作
function domFactory() {
	var list = {}, hidden = true,add = 30,delay = 70,
		domsIn = function () {
			var key;
			for (key in list) {
				if (list.hasOwnProperty(key)) {
					list[key].classList.remove("out");
					list[key].style.left = "-150px";
					list[key].classList.add("into");
				}
			}
			hidden = false;
			timer.start();
		},
		domsOut = function () {
			for (key in list) {
				if (list.hasOwnProperty(key)) {
					list[key].classList.remove("into");
					list[key].style.left = "0px";
					list[key].classList.add("out");
				}
			}
			hidden = true;
			timer.close();
		};
		
		timer = langFun.createTimer(domsOut,5000); //创建一个定时器,5s后隐藏dom元素
		
	OPTIONS.forEach(function (name) {
		var dom_main = document.createElement("div");
		dom_main.innerHtml = optionCfg[name];
		dom_main.helper = {};
		dom_main.helper.selected = function () {
			dom_main.style.backgroundColor = "lightgreen";
		};
		dom_main.helper.unselected = function () {
			dom_main.style.backgroundColor = "lightgray";
		};
		dom_main.classList.add("choice");
		dom_main.classList.add("unselect");
		dom_main.classList.add("out");
		
		
		dom_main.onmouseover = function(){
			timer.restart();	
		};
		delay += add;
		dom_main.stle.webkitAnimationDelay = delay+"ms";
		
		//为dom添加点击事件
		dom_main.onclick = function(e){
			var dom;
			if(e !== undefined){
				e.cancelBubble = true;
			}
			if(selectedMode !== name){
				if(selectedMode !== undefined){
					list[selectedMode].helper.unselected();
				}
				dom_main.helper.selected();
				dom = dom_main.cloneNode(true);
				
				//unselected();
				dom.mouseDown = function(event){
					event.cancelBubble = true;
					if(hidden){
						domsIn();
					}else{
						domsOut();
					}
				};
				
				dom.addEventListener("mousedown",dom.mouseDown,false);
				selectedMode = name;
				//广播改变目录显示
			}else{
				domsOut();
			}
			
			dom_main.addEventListener("mousedown",dom_main.onclick,false);
			dom_main.helper.unselected();
			list[name] = dom_main;
			//todo 将dom_main添加到文档流中	
		};
	});
	return list;
};



//=============================目录部分begin=======================================
//生成弹出模态框,整理事件触发生成
function generateModelBox(e) {
	$("#testModal").empty();
	$("#testModal").append($("<div id=modalBox></div>"));

	for (var i = 1; i <= 9; i++) {
		var $cellDom = $("<div class='modalCell'>" + i + "</div>");
		$("#modalBox").append($cellDom);
	}
	//使用模态框确定事件绑定的唯一性
	$("#modalBox").bind("click", function (event) {
		var row = parseInt(e.target.attributes[1].value, 10);
		var col = parseInt(e.target.attributes[2].value, 10);
		var n = parseInt(event.target.innerText, 10);
		if (sudokuAlg.verifySudoku(row, col, n, globalSudoku)) {
			e.target.innerText = n;
			sudokuAlg.updateSudoku(row, col, parseInt(event.target.innerText, 10), globalSudoku);
			$("#modalBox").unbind();
			document.getElementById("testModal").style.display = "none";
		} else {
			alert("the num" + n + "is invalid");
		}
	});
	document.getElementById("testModal").style.display = "block";
};


//根据数组生成table
function generateUI() {
	//todo 数独界面生成
	var tableDom = document.createElement("table");
	tableDom.setAttribute("class", "mainTable");
	var i, j;
	for (i = 0; i < globalSudoku.length; ++i) {
		var trDom = document.createElement("tr");
		for (j = 0; j < globalSudoku[i].length; ++j) {
			var tdDom = document.createElement("td");
			var divDom = document.createElement("div");
			divDom.setAttribute("class", "cell");
			//设置单元格所在的位置属性
			divDom.setAttribute("row", i);
			divDom.setAttribute("col", j);
			divDom.innerText = globalSudoku[i][j];

			if (globalSudoku[i][j] === 0) {
				divDom.classList.add("gridBord");
				divDom.addEventListener("click", generateModelBox, false);
			} else {
				divDom.classList.add("gridNormal");
			}

			tdDom.appendChild(divDom);
			trDom.appendChild(tdDom);
		}
		tableDom.appendChild(trDom);
	}
	document.getElementById("sudokuWrapper").appendChild(tableDom);
}



(function initUI() {
	option = document.getElementById("option");
	globalSudoku = sudokuAlg.generateSudoku();
	sudokuAlg.sudokuDig(levelCfg["lowlevel"], globalSudoku);
	console.log(globalSudoku);
	generateUI();
} ());