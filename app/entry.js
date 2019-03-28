'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

//表示中のページのURL
const url = location.href;

//経過時間
var count;

//残り時間
var countRemain;

//再生中かどうかを確認するためのフラグ変数
var playing;

//内容と表示時間を格納する配列
var contents;
var times;

//何個目のメモなのかを保存する変数
var n;

//ページ読み込み時に一回だけ実行
function setup(){
  count = 0;
  playing = true;
  contents = new Array();
  times = new Array();
  n = 0;
  $("#play").click(() => {
    playing = true;
  });
  $("#stop").click(() => {
    playing = false;
  });

  $.ajax({
    type: 'POST',
    url: url,
    dataType: 'json',
    success: function(json) {
      for(var item of json){
        contents.push(item.content);
        times.push(item.time);
      }
    }
  });
}

function clock(){
  if(playing == true){
    count++;
  }
  countRemain = times[n] - count;

  if(countRemain == 0){
    n++;
    count = 0;
  }

  if(n == contents.length){
    n = 0;
  }

  $("#time-area").text(countRemain);
  $("#content-area").text(contents[n]);
}

function start(){
  console.log('start');
  playing = true;
}

function stop(){
  console.log('stop');
  playing = false;
}

setup();
setInterval(clock, 1000);