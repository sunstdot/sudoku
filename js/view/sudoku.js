var OPTIONS = ["lowlevel", "midlevel", "highlevel", "aboutAuther"],
	optionCfg = {
		"lowlevel": "初级",
		"midlevel": "中级",
		"highlevel": "高级",
		"aboutAuther": "作者"
	},
	levelCfg = {
		"lowlevel": "30",
		"midlevel": "50",
		"highlevel": "60"
	},
	globalSudoku,
	timer,
	SIZE = 9,
	domList,optionDom = document.getElementById("option"),selectedMode,selectDom;

//=============================目录部分begin=======================================
var select = function(dom){
	if(selectDom){
		optionDom.removeChild(selectDom);
	}
	dom.className = "";
	dom.style.cssText = "";
	dom.classList.add("choice");
	dom.classList.add("selected");
	
	while(optionDom.firstChild){
		optionDom.removeChild(optionDom.firstChild);
	}
	optionDom.appendChild(dom);
	selectDom = dom;
};	

//生成list然后模拟一次点击操作，工厂模式，对OPTINOS中的每个元素进入工厂创建相应dom
function domFactory() {
	var list = {}, hidden = true,add = 30,delay = 70,
		domsIn = function () {
			var key;
			optionDom.style.height = '150px';
			for (key in list) {
				if (list.hasOwnProperty(key)) {
					optionDom.appendChild(list[key]);
					list[key].classList.remove("out");
					list[key].style.left = "-150px";
					list[key].classList.add("into");
				}
			}
			hidden = false;
			timer.start();
		},
		domsOut = function () {
			var key;
			optionDom.style.height = '30px';
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
		console.log(optionCfg[name]);
		dom_main.innerHTML = optionCfg[name];
		dom_main.helper = {};
		dom_main.helper.selected = function () {
			dom_main.style.backgroundColor = "lightgreen";
		};
		dom_main.helper.unselected = function () {
			dom_main.style.backgroundColor = "lightgray";
		};
		dom_main.classList.add("choice");
		dom_main.classList.add("unselected");
		dom_main.classList.add("out");
		
		
		dom_main.onmouseover = function(){
			timer.restart();	
		};
		delay += add;
		dom_main.style.webkitAnimationDelay = delay+"ms";
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
				select(dom);
				if(name !== "aboutAuther"){
					generateData(name);
				}
			}else{
				domsOut();
			}		
		};
		dom_main.addEventListener("mousedown",dom_main.onclick,false);
		dom_main.helper.unselected();
		//todo 将dom_main添加到文档流中
		list[name] = dom_main;
		optionDom.appendChild(dom_main);
	});
	return list;
};

//var initMode = function(){
//	mode.style.height = '30px';
//	domList[]
//}

//=============================方法绑定begin=======================================
function domBindEvent(){
	
};
//=============================方法绑定end=======================================

//=============================目录部分begin=======================================
function changeMode(type){
	optionDom.style.height = '30px';
	domList[type].onclick();	
};
//生成弹出模态框,整理事件触发生成
function generateModelBox(e) {

	//todo  检测能否打开
	var row = parseInt(e.target.getAttribute("row"),10),
		col = parseInt(e.target.getAttribute("col"),10);

	var propNum = m.sudokuRemind(row,col,globalSudoku);
	if(!propNum){
		alert("can't find proper num");
		return;
	}
	$("#testModal").empty();
	$("#testModal").append($("<div id=modalBox></div>"));

	for (var i = 1; i <= 9; i++) {
		var $cellDom = $("<div class='modalCell'>" + i + "</div>");
		$("#modalBox").append($cellDom);
	}
	//使用模态框确定事件绑定的唯一性
	$("#modalBox").bind("click", function (event) {
		var chooseNum = parseInt(event.target.innerText, 10);
		if (m.verifySudoku(row, col,chooseNum,globalSudoku)) {
			e.target.innerText = chooseNum;
			m.updateSudoku(row, col, parseInt(event.target.innerText, 10), globalSudoku);
			
			//todo 判断row和col是否等于SIZE,如果相等弹出完成数独的提示框
			
			$("#modalBox").unbind();
			document.getElementById("testModal").style.display = "none";
		} else {
			alert("the num" + chooseNum + "is invalid");
		}
	});
	document.getElementById("testModal").style.display = "block";
};


//根据数组生成table
function generateUI(sudokuData) {
	//todo 数独界面生成
	var tableDom = document.createElement("table");
	var sudokuDom = document.getElementById("sudokuWrapper");
	//在生成sudoku前要清空sudokudom
	while(sudokuDom.firstChild){
		sudokuDom.removeChild(sudokuDom.firstChild);
	}
	tableDom.setAttribute("class", "mainTable");
	var i, j;
	for (i = 0; i < sudokuData.length; ++i) {
		var trDom = document.createElement("tr");
		for (j = 0; j < sudokuData[i].length; ++j) {
			var tdDom = document.createElement("td");
			var divDom = document.createElement("div");
			divDom.setAttribute("class", "cell");
			//设置单元格所在的位置属性
			divDom.setAttribute("row", i);
			divDom.setAttribute("col", j);
			divDom.innerText = sudokuData[i][j];

			if (sudokuData[i][j] === 0) {
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
	sudokuDom.appendChild(tableDom);
};

function generateData(type){
	//生成数独，globalSudoku作为一个全局变量的形式出现
	globalSudoku = m.generateSudoku();
	//对生成的数独进行挖坑
	m.sudokuDig(levelCfg[type], globalSudoku);
	//根据数据进行生成UI
	generateUI(globalSudoku);
};


//界面初始化方法
(function initUI() {
	var defaultType = 'lowlevel';
	generateData(defaultType);
	domList = domFactory();
	//方法绑定
	domBindEvent();

//	setTimeout(initMode,10);
	changeMode("lowlevel");
}());