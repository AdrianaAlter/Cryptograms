document.addEventListener("DOMContentLoaded", function(e){
  abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var main = document.getElementById("main");
  var controls = document.getElementById("controls");
  var game = document.getElementById("game");
  var blanks = document.getElementById("blanks");
  var words = document.getElementsByClassName("word");
  var letters = document.getElementsByClassName("letter");
  var alphabet = document.getElementById("alphabet");
  var cats = [];
  var code;
  encoded = "";
  quoteSplit = "";

  var setAlphabet = function(){
    _.each(abc, function(letter){
      var letterLi = document.createElement("li");
      letterLi.innerHTML = letter;
      alphabet.appendChild(letterLi);
    });
  };
  var setCode = function(){
    var shuffled = _.shuffle(_.shuffle(_.shuffle(_.shuffle(abc))));
    code = _.object(_.zip(abc, shuffled));
  };

  var getCats = function(){
    $.ajax({
      url: "https://quotes.rest/quote/categories.json",
      headers: {
        'X-TheySaidSo-Api-Secret': 'i6_O1D7c5ELRg6RLg1DTIweF'
      },
      success: function(response) {
        cats = response.contents.categories;
      }
    });
  };
  var getQuote = function(){
    var cat = _.sample(cats);
    $.ajax({
      url: "https://quotes.rest/quote/search.json?category=" + cat,
      headers: {
        'X-TheySaidSo-Api-Secret': 'i6_O1D7c5ELRg6RLg1DTIweF'
      },
      success: function(response) {
        if (response.contents.quote !== null){
          var quote = response.contents.quote + "    --" + response.contents.author;
          encode(quote);
        }
        else {
          getQuote();
        }
      }
    });
  };

  var encode = function(quote){
    quoteSplit = quote.toUpperCase().split(" ");
    _.each(quoteSplit, function(word){
      makeWord(word);
    });
    game.appendChild(blanks);
  };
  var makeWord = function(word){
    var newWord = document.createElement("ul");
      newWord.className = "word group";
      _.each(word.split(""), function(char){
        makeBlank(char, newWord);
      });
      blanks.appendChild(newWord);
  };
  var makeBlank = function(char, newWord){
    var newBlank = document.createElement("li");
    var newInput = document.createElement("input");
    var newLabel = document.createElement("h3");
    newBlank.className = "letter group";
    newBlank.appendChild(newInput);
    if (abc.includes(char)){
      encoded += code[char];
      newInput.addEventListener("keyup", useInput);
      newLabel.innerHTML = code[char];
    }
    else {
      encoded += char;
      newLabel.innerHTML = char;
      newInput.value = char;
      newInput.readOnly = true;
    }
    newBlank.appendChild(newLabel);
    newWord.appendChild(newBlank);
  };

  var useInput = function(e){
    var self = this;
    var inputChar = this.value.toUpperCase();
    var labels = Array.prototype.slice.call(document.getElementsByTagName('h3'));
    var indices = [];
    _.each(labels, function(label){
      if (label.innerHTML == self.parentElement.children[1].innerHTML){
        indices.push(labels.indexOf(label));
      }
    });
    if (indices.length > 0){
      _.each(indices, function(i){
        letters[i].children[0].value = inputChar;
      });
      game.appendChild(blanks);
      jump(this);
    }
    checkAlphabet();
  };
  var checkAlphabet = function(){
    var currentlyUsed = assembleInput();
    _.each(alphabet.children, function(letter){
      if (currentlyUsed.split("").includes(letter.innerHTML)){
        crossOff(letter);
      }
      else {
        uncross(letter);
      }
    });
  };
  var crossOff = function(letter) {
    letter.className = "crossed-off";
  };
  var uncross = function(letter) {
    letter.className = "";
  };
  var jump = function(inputBox){
    var inputBoxes = Array.prototype.slice.call(document.getElementsByTagName('input'));
    var i = inputBoxes.indexOf(inputBox);
    for (var j = 1; j < inputBoxes.length - i; j++){
      if (inputBoxes[i + j] && inputBoxes[i + j].value === ""){
        inputBoxes[i + j].focus();
        return;
      }
    }
  };

  var checkWon = function(){
    var inputString = assembleInput();
    if (quoteSplit.join(" ") == inputString){
      won();
    }
    else {
      clean();
    }
  };
  var assembleInput = function(){
    var result = [];
    _.each(words, function(word){
      var newString = "";
      _.each(word.children, function(letter){
        newString += letter.children[0].value;
      });
      result.push(newString);
    });
    return result.join(" ");
  };
  var won = function(){
    document.getElementById("won").style.display = "block";
  };
  var clean = function(){
    var inputBoxes = Array.prototype.slice.call( document.getElementsByTagName('input'));
    _.each(inputBoxes, function(inputBox){
      var i = inputBoxes.indexOf(inputBox);
      if (quoteSplit.join("").split("")[i] != inputBox.value){
        uncross(inputBox.value);
        inputBox.value = "";
      }
    });
  };

  var reset = function(){
    document.getElementById("won").style.display = "none";
    blanks.innerHTML = "";
    _.each(alphabet.children, function(letter){
      letter.className = "";
    });
    setCode();
  };

  setAlphabet();
  setCode();
  getCats();
  document.getElementsByTagName("button")[0].addEventListener("click", function(){
    reset();
    getQuote();
  });
  document.getElementsByTagName("button")[1].addEventListener("click", checkWon);

});
