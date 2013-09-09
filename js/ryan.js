(function(){
  // class
  RUsite = function(){};

  RUsite.prototype = {
    // index 0 is pause for first letter
    timingArray: [500, 600, 100, 100, 100, 100, 100],
    typingspeed: 50,
    // find elements in DOM
    // similar to jQuery $ function
    find: function(tag, element) {
      var re = new RegExp('(#|\\.)', 'g')
        , tags = tag.match(re)
        , objArray = []
        , i
        , element = typeof element === 'undefined' ? document : element
        , returnEl = function(type, string){
          var html
            , j
            , els = [];

          switch (type){
            case '#':
              return element.getElementById(string);
              break;
            case '.':
              if(element.getElementsByClassName){
                return element.getElementsByClassName(string);
              } else {
                html = element.getElementsByTagName('body')[0].children;
                for (j=0; j<html.length; j++) {
                  if (html[j].className.indexOf(string) > -1) {
                    els.push(html[j]);
                  }
                }
                return els;
              }
              break;
            default:
              return element.getElementsByTagName(string).length === 1 ? element.getElementsByTagName(string)[0] : element.getElementsByTagName(string);
              break;
          }
        };

      if(tags){
        for(i=0; i<tags.length; i++){
          objArray.push(returnEl(tags[i], tag.replace(tags[i], '')));
        }
        return objArray.length === 1 ? objArray[0] : objArray;
      } else {
        return returnEl('', tag);
      }
    },
    // put it all in order
    sequencer: function(sequence){
      var i = 0
        , self = this
        , run = function(){
          self.timingArray = sequence[i].timingArray;
          self.prepText(sequence[i].element).animateLetters(sequence[i].element);
          i += 1;
        }
      // run the first
      run();

      window.addEventListener('RU:stringAnimated', function(){
        if(sequence[i]){
          run();
        }
      });
      return;
    },
    // takes text string and wraps letters in spans
    prepText: function(container){
      // get text
      var textContainer = this.find(container)
        , text = textContainer.innerText
        , i
        , span
        , index
        , word
        , newWord = true
        , event = new Event('RU:textReady')
        , makeWord = function(span){
            // if we are at a space, send to text container
            if(span.innerText === ' ' || i === text.length -1){
              textContainer.appendChild(word);
              textContainer.appendChild(span);
              newWord = true;
              return;
            }

            if(newWord){
              word = document.createElement('span');
              word.className = 'word'
              newWord = false;
            }

            word.appendChild(span);
        };

      // split each letter
      text = text.split('');
      // clear container
      textContainer.innerHTML = '';
      // wrap letters in spans
      for(i=0; i<text.length; i++){
        span = text[i] === ' ' ? document.createTextNode(' ') : document.createElement('span');
        span.innerText = text[i];

        makeWord(span);
      }
      // dispatch RU:textReady event
      window.dispatchEvent(event);
      return this;
    },
    // animate letters
    animateLetters: function(container){
      // hide letters
      var textContainer = this.find(container)
        , spans = this.find('span', textContainer)
        , words = this.find('.word', textContainer)
        , i = 0
        , endWord = new Event('RU:wordAnimated')
        , endWords = new Event('RU:stringAnimated')
        , animate = function(word){
            var j = 0
              , letters = word.children
              , interval = window.setInterval(function(){
                  letters[j].removeAttribute('style');
                  j += 1;
                  if(j === letters.length){
                    window.clearInterval(interval);
                    window.dispatchEvent(endWord);
                  }
                }, RUsite.prototype.typingspeed);
            word.removeAttribute('style');
          }
        , showWords = function(){
          window.setTimeout(function(){
            animate(words[i]);
          }, RUsite.prototype.timingArray[i]);
        };

      // hide letters
      this.hide(spans);
      // show first word
      showWords();
      // listen for animated word.
      // show next word
      window.addEventListener('RU:wordAnimated', function(){
        i += 1;
        if(words[i]){
          showWords();
        } else {
          window.dispatchEvent(endWords);
        }
      });
      return this;
    },
    hide: function(elements) {
      for(var i=0; i<elements.length; i++){
        elements[i].setAttribute('style', 'display:none;');
      }
    }
    // slower at word boundaries
  };

  return new RUsite;
  // end function
})();