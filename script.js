var toggle_button = document.querySelector(".toggle");
var circle = document.querySelector(".btn");
var bg = document.querySelector("body");
var screen = document.querySelector(".screen");
var box = document.querySelector(".boxes");
var btn = document.querySelectorAll("button");

var flag = 0;


/* ----------------------------- Toggle Mode Script Start ----------------------- */

toggle_button.addEventListener("click",function(){
    
    if(flag==0){
        bg.style.backgroundColor = "#000";
        circle.style.translate = "28px";
        circle.style.backgroundColor = "#fff";
        toggle_button.style.border = "2px solid #fff";
        circle.style.transition = "all ease 0.2s";
        screen.style.border = "5px solid #fff";
        screen.style.boxShadow = "0px 0px 10px blue";
        for(let i=0; i<btn.length; i++){
            btn[i].style.color = "#fff";
            btn[i].style.border = "1px solid #fff";
        }
        

        flag = 1;
    }
    else{
        bg.style.backgroundColor = "#fff";
        circle.style.translate = "0px";
        toggle_button.style.border = "2px solid #000";
        circle.style.backgroundColor = "#000";
        toggle_button.style.border = "2px solid #000";
        circle.style.transition = "all ease 0.2s";
        screen.style.border = "5px solid #000";
        screen.style.boxShadow = "0px 0px 10px #740072";
        for(let i=0; i<btn.length; i++){
            btn[i].style.color = "#000";
            btn[i].style.border = "1px solid #000";
        }

        flag = 0;
    }
    
});

/* ----------------------------- Toggle Mode Script End ----------------------- */


/* --------------------- Login for screen color changing ------------------------ */

var batton = document.getElementsByName("batan");
for(let i=0; i<batton.length; i++){
    batton[i].onclick = function(){
        screen.style.backgroundColor = batton[i].value;
    }
}