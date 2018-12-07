//2.初始化地图
function mineSweepingMap(r,c,num,record){
    let map = [];//用于生成地图 直接使用[] 创建数组
    // let record = new Map()//键值对 用于记录雷的位置   map重复的key会覆盖上一个value 所以我还是用一个数组存吧
    //把record放入initGame中 因为最后触发雷 爆炸会用到

    //创建二维数组
    for(let i=0;i<2;i++){
        record[i] = [];
    }
    //1.空地图
    //创建一个二维数组
    for(let i=0;i<r;i++){
        map[i] = []; //r行
        for(let j=0;j<c;j++){
            map[i][j] = 0; //c列
        }
    }
    //2.随机 埋雷
    //tip：使用递归来解决 重复放置的问题
    function putMine(i){
        //随机生成x y
        //方法说明：Math.random 随机生成介于0到1的数字  Math.floor 向下取整
        let x = Math.floor(Math.random()*r);
        let y = Math.floor(Math.random()*c);
        if (9 != map[x][y]) {
            map[x][y] = 9;
            record[0][i] = x;
            record[1][i] = y;
        } else {
            putMine(i);
        }
    }

    //开始埋雷
    for(let i=0;i<num;i++){
        putMine(i);
    }
    //3.每一个雷的周围都加1 已经是雷的除外

    //遍历record 读出雷的位置  每一个雷的周围都加1
    /*tip:想实现某一个功能 首先要想引起变化的原因是什么
        这里我是想计算每一个格子周围雷的数量
        正是因为有雷 所以格子上的数字才会改变 那么就可以直接从雷这边入手
        将雷周围的格子加上1
    */
    for(let k=0;k<num;k++){

        let x = record[0][k];
        let y = record[1][k];
        for(let i=x-1;i<=x+1;i++){
            if(i>=0&&i<r) {
                for (let j = y - 1; j <= y + 1; j++) {

                    if (j>=0&&j<c&&9 != map[i][j]) {
                        //window.alert(i+" "+j);
                        map[i][j]++;
                        //window.alert(map[i][j]);
                    }
                }
            }
        }
    }
    return map;
}

//3.将雷写入页面
function writeHTML(map){
    //获取gameBox
    let game = document.querySelector('.game')
    for(let i=0;i<map.length;i++){
        //data- 自定义数据类型 ul的class 有多个类用空格隔开
        game.innerHTML +=  `<ul class="row x-${i}" data-x="${i}"></ul>`;
    }
    let ul = document.querySelectorAll('.row');
    for(let i=0;i<ul.length;i++) {
        for (let j=0;j<map[0].length;j++){
            let m = map[i][j];//读取map中的每一个格子
            if(m==0){
                m = ''
            }
            ul[i].innerHTML += `<li class="col y-${j} num-${m}" data-y="${j}">
                                    <span>${m}</span>
                                    <img src="flag.svg" class="img-flag hide">
                                </li>`;
        }
    }
    //显示雷的数量
    document.querySelector('.residue').innerHTML = num;
    document.querySelector('.flag').innerHTML = flag;
}

//4.初始化游戏
let stop;
function initGame(row,col,num){
    let record = [];
    let map = mineSweepingMap(row,col,num,record);
    //写入新地图前 先将之前写的innerHTML代码清空
    //tip:地图是由innerHTML代码生成的 所以得先清空
    let game = document.querySelector('.game');
    game.innerHTML = ' ';
    writeHTML(map);
    show(map,record);

    //初始化时间  并每隔1s刷新一次时间
    let tick = document.querySelector('.tick')
    let t = 1;
    tick.innerHTML = `0`;
    clearInterval(stop);
    //！ 使用setInterval 每隔一段时间 触发一次事件  返回值赋给clearInterval可以控制该触发事件停止
    stop = setInterval(function showTime(){
        tick.innerHTML = `${t++}`;
    },1000);

}



//5.点击方块 显示数字或雷
function show(map,record){
    let square = document.querySelectorAll('.col');
    for(let i=0;i<square.length;i++){
        square[i].addEventListener('mousedown',function(event) {//！ 使用mousedown 而不是 click 这样才能判断是哪个鼠标键按下了

            //event target属性 返回触发事件的目标节点
            let li = event.target;//获取到li标签  或者是点击触发的是span
            if (li.nodeName == 'SPAN') { //如果触发的是span 就取它的父节点
                li = li.parentNode;
            }else if(li.nodeName == 'IMG'){//! 如果点击了图片  触发的是旗帜
                li = li.parentNode;
            }

            let span = li.children[0];//获取的是第二个子节点 ！使用children 而不是childnodes
            let img = li.children[1];
            let imgClass = img.classList;
            if (event.button == '0'&&imgClass.contains('hide')) {//并且图片没有展开
                let number = span.innerHTML;

                if (number == '') {
                    //自动扩散白色区域
                    spread(li);
                } else if (number != '9') {
                    li.style.background = 'white';
                    span.style.opacity = '1';
                } else {
                    //如果点击炸弹 则游戏结束 显示所有的雷
                    for (let j = 0; j < record[0].length; j++) {
                        //拿到雷的li
                        let li = document.querySelector(`.x-${record[0][j]}`).children[record[1][j]];//此时的对应的li标签
                        let img = li.children[1];
                        if(img.classList.contains('hide')){
                            li.style.background = 'red';
                            img.src = 'mine.svg';
                            img.style.display = 'inline';//图片可见
                        }else{
                            li.style.background = 'yellow';
                            img.src = 'ok.svg';
                        }
                    }
                    window.alert('可惜可惜,下次吃鸡');
                    clearInterval(stop);//停止时间
                }
            }else if(event.button=='2'){//并且 span的透明度为0
                let x = parseInt(String(li.parentElement.classList).split(' ')[1].substring(2));
                let y = parseInt(String(li.classList).split(' ')[1].substring(2));//最终强制类型转换为int
                if(imgClass.contains('hide')&&li.style.background!='white'&&flag>0) {
                    imgClass.remove('hide')
                    //如果插对了则雷的数量 减一
                    flag--;
                    if(map[x][y]==9) num--;
                    if(num==0){
                        window.alert('大吉大利，今晚吃鸡');
                        //document.querySelector('.block').classList.add('blocked');
                    }
                }else if(!imgClass.contains('hide')){
                    flag++;
                    imgClass.add('hide');
                    if(map[x][y]==9) num++;
                }
                document.querySelector('.residue').innerHTML = num;
                document.querySelector('.flag').innerHTML = flag;
            }
        })
    }

    //扩散白色区域
    function spread(li){
        li.style.background = 'white';

        //获取当前白色区域所在map中的位置
        let x = parseInt(String(li.parentElement.classList).split(' ')[1].substring(2));
        let y = parseInt(String(li.classList).split(' ')[1].substring(2));//最终强制类型转换为int
        around(x,y);

        //判断周围八个
        function around(x,y){
            for(let i = x-1;i<=x+1;i++){
                if(i>=0&&i<row){
                    for(let j = y-1;j<=y+1;j++){
                        if(j>=0&&j<col){
                            let li = document.querySelector(`.x-${i}`).children[j];//此时的对应的li标签
                            let span = li.children[0];
                            let img = li.children[1];
                            if(li.style.background!='white'){// ! 这里一定要加一个判断是否为white 否则会一直循环下去
                                li.style.background = 'white';
                                if(!img.classList.contains('hide')){ //自动扩展时，如果此时插上了旗帜 则把旗帜去掉
                                    li.children[1].classList.add('hide');
                                    flag++;
                                    document.querySelector('.flag').innerHTML = flag;//旗帜刷新
                                }
                                if(map[i][j]==''){
                                    around(i,j);
                                }else{//  ! 如果此时是数字的话 需要将透明度调为1
                                    span.style.opacity = '1';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


/*1. 给游戏等级按钮绑定事件*/
function Btn(){
    //获取等级按钮   通过CSS 类选择器获取
    let level = document.querySelectorAll('.choice-level');
    //为按钮添加点击事件
    for(let i=0;i<level.length;i++){
        level[i].addEventListener('click', function (event) {
            //获取level 通过level对数组进行设置 雷的个数
            /*属性说明：event对象 target属性
             返回事件的目标节点  event.target 得到触发事件的元素
            */
            let level = event.target.innerHTML;
            //window.alert(level)
            switch (level) {
                case '初级':
                    row = 9;
                    col = 9;
                    num = 10;
                    break;
                case '中级':
                    row = 16;
                    col = 16;
                    num = 40;
                    break;
                case '高级':
                    row = 16;
                    col = 30;
                    num = 99;
                    break;
            }
            flag = num;
            //初始化地图
           // window.alert(row,col,num);
            initGame(row,col,num);
        })
    }
    let restart = document.querySelector('.restart');
    restart.addEventListener('click',function(){
        initGame(row,col,num);
    })
}
Btn();

//去掉浏览器默认右击事件
window.onload = function(){
    document.oncontextmenu= function(e){
        e.preventDefault();
    }
}


//进入页面就自动生成初级难度的扫雷
let row = 9;
let col = 9;
let num = 10;
let flag = 10;
initGame(row,col,num);