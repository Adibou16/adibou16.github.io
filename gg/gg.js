var guess = 0;
var computer = (Math.random() * 100);
var computer = Math.round(computer)
var remaining = 10;

window.onload = function(){
    var input1 = document.querySelector("#ipbox");
    var output1 = document.querySelector("#output");

    var btn = document.querySelector("#submit");

    btn.addEventListener("click", onMouseClick);

    function onMouseClick() {
        remaining = remaining - 1;
        guess = parseInt(input1.value);


        if (guess > computer) {
            output1.innerHTML = "My number is lower, you have " + remaining + " chances remaining.";
            if (remaining < 1) {
                gameEnd();
            }
        } else if (guess < computer) {
            output1.innerHTML = "My number is higher , you have " + remaining + " chances remaining.";
            if (remaining < 1) {
                gameEnd();
            }
        } else if (guess == computer)
            output1.innerHTML = "Good job, my number was " + computer;


        function gameEnd() {
            output1.innerHTML = "You lost, my number was " + computer;
        }
    }
}