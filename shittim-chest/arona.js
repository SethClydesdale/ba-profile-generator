(function (window, document) {
  'use strict';
  
  // Global used for telling if the site is being used offline with MS Edge (pre-chromium).
  // Helps prevent "unspecified errors" caused by checking for the existence of localStorage support offline.
  window.offlineEdge = window.location.protocol == 'file:' && /Edge/.test(navigator.userAgent);
  
  // Global used for checking localStorage support (ex: storageOK && localStorage.myStorageItem)
  // prevents long winded conditions everytime we want to use storage
  window.storageOK = navigator.cookieEnabled && !offlineEdge && window.localStorage ? true : false;
  
  // locates and returns our current page path
  window.getPaths = function () {
    var path = window.location.pathname;

    if (/\/contact\//.test(path)) {
      return '../';

    } else {
      return '';
    }
  };
  
  // use for determining if Arona is asleep
  var hour = new Date().getHours();
  
  // Arona (or Plana when she's sleeping) helps handle our profile generation!
  window.Arona = {
    // tells us if Arona is asleep
    // if she's asleep, then Plana comes out to play
    asleep : (hour >= 18 || hour < 6),
    
    // initial functions for page load
    kidou : function () {
      // automatically set language based on the url query (?lang=ja||en)
      var select = document.getElementById('info-lang');
      
      if (/lang=(?:en|ja)/.test(window.location.search.toLowerCase()) && select) {
        select.value = /ja/.test(window.location.search.toLowerCase()) ? 'ja' : 'en';
        select.dispatchEvent(new Event('change'));
      }
      
      // # OFFLINE LINK MODIFICATIONS #
      // appends index.html to links if this project is hosted on the local file system
      if (window.location.protocol == 'file:') {
        for (var a = document.getElementsByTagName('A'), i = 0, j = a.length; i < j; i++) {
          if (!/http/.test(a[i].href)) {
            if (/\/$/.test(a[i].href)) {
              a[i].href += 'index.html';
            } else if (/\/#.*?$/.test(a[i].href)) {
              a[i].href = a[i].href.replace(/(#.*?)$/, 'index.html$1');
            } else if (/\/\?.*?$/.test(a[i].href)) {
              a[i].href = a[i].href.replace(/(\?.*?)$/, 'index.html$1');
            }
          }
        }
      }
      
      // create custom input elements
      for (var input = document.querySelectorAll('input[type="checkbox"], input[type="radio"]'), i = 0, j = input.length, type; i < j; i++) {
        input[i].className += ' input_hidden';
        input[i].insertAdjacentHTML('afterend', '<span tabindex="0" class="pseudo_' + input[i].type + '" onclick="this.previousSibling.click(); return false;" onkeypress="event.key == \'Enter\' && this.previousSibling.click(); return false;"/>');
      }
      
      // set text for options based on the selected language
      Arona.parseOptions();
    },
    
    // parses options text
    parseOptions : function () {
      // options
      for (var a = document.querySelectorAll('option[data-en]'), i = 0, j = a.length; i < j; i++) {
        a[i].innerText = a[i].dataset[Arona.profile.lang];
      }
      
      // opt group labels
      for (var a = document.querySelectorAll('optgroup[data-en]'), i = 0, j = a.length; i < j; i++) {
        a[i].label = a[i].dataset[Arona.profile.lang];
      }
    },
    
    
    // profile data used for restoring state and saving locally to keep a backup
    profile : {
      // template background image
      lang : 'en',
      avatar : 'arona',
      avatarCustom : '',
      background : 'arona-room',
      backgroundCustom : '',
      
      gender : 'null',
      
      // display name
      name : '',
      nameColor : '#333333',
      
      // twitter id
      handle : '',
      handleColor : '#333333',
      
      // part 1
      p1_v1 : false,
      p1_v2 : false,
      p1_v3 : false,
      p1_vf : false,
      p1_v4 : false,
      p1_v5 : false,
      p1_v6 : false,
      p1_vex : false,
      
      // part 2
      p2_v0 : false,
      p2_vex : false,
      
      // favorites
      favstory : '',
      favstoryColor : '#333333',
      favchar : '',
      favcharColor : '#333333',
      favschool : '',
      favschoolColor : '#333333',
      favlobby : '',
      favlobbyColor : '#333333',
      
      // about me
      about : '',
      aboutColor : '#333333',
      
      // display settings
      prevMode : 'full'
    },
    
    // cached data
    cache : {},
    
    
    // updates the kiseki profile with new data
    updateProfile : function (caller, type) {
      switch (type) {
        case 'lang' :
          // update main language class for switching texts
          document.body.className = document.body.className.replace(/(?:en|ja)-lang/, caller.value + '-lang');
          
          // update object settings
          Arona.profile.lang = caller.value;
          
          // update select texts
          Arona.parseOptions();
          break;
          
        // changes preview mode
        case 'prevMode' :
          var preview = document.getElementById('preview-box');
          if (preview) {
            preview.className = 'prev-' + caller.value;
            Arona.profile.prevMode = caller.value;
          }
          break;
          
        // changes avatar
        case 'avatar' :
          // set avatar
          var ava = document.getElementById('ba-avatar'),
              prev = document.getElementById('avatar-prev'),
              img = 'url(' + (caller.value == 'custom' ? Arona.profile.avatarCustom : 'shittim-chest/template/avatar/' + caller.value + '.webp') + ')';
          
          ava.style.backgroundImage = img; 
          Arona.profile.avatar = caller.value;
          
          // shows background preview
          if (prev) {
            prev.style.backgroundImage = img;
          }
          break;
          
        case 'avatarCustom' :
          // save avatar
          Arona.profile.avatarCustom = URL.createObjectURL(caller.files[0]);
          
          // set avatar to "custom" and apply the custom avatar
          field = document.getElementById('info-avatar');
          field.value = 'custom';
          field.dispatchEvent(new Event('change'));
          
          // let user know upload was successful
          Arona.avatarOK();

          // clears input so file can be loaded again
          document.getElementById('info-avatarCustom').value = '';
          break;
          
        case 'background' :
          var tmp = document.getElementById('template'),
              prev = document.getElementById('bg-prev'),
              img = 'url(' + (caller.value == 'custom' ? Arona.profile.backgroundCustom : 'shittim-chest/template/bg/' + caller.value + '.webp') + ')';
          
          tmp.style.backgroundImage = img;
          Arona.profile.background = caller.value;
          
          // shows background preview
          if (prev) {
            prev.style.backgroundImage = img;
          }
          
          // add custom class for BG if using a custom image
          if (caller.value == 'custom' && !/customBG/.test(tmp.className)) {
            tmp.className += ' customBG';
            
          } else if (caller.value != 'custom' && /customBG/.test(tmp.className)) {
            tmp.className = tmp.className.replace('customBG', '');
          }
          break;
          
        case 'backgroundCustom' :
          // save background
          Arona.profile.backgroundCustom = URL.createObjectURL(caller.files[0]);
          
          // set background to "custom" and apply the custom background
          field = document.getElementById('info-background');
          field.value = 'custom';
          field.dispatchEvent(new Event('change'));
          
          // let user know upload was successful
          Arona.backgroundOK();

          // clears input so file can be loaded again
          document.getElementById('info-backgroundCustom').value = '';
          break;
          
        case 'gender' :
          var tmp = document.getElementById('template');
          tmp.className = tmp.className.replace(/(?:null|male|female|other)-gender/, caller.value + '-gender');
          Arona.profile.gender = caller.value;
          break;
          
        case 'text' :
          var id = caller.id.replace('info-', '');
          document.getElementById('ba-' + id).innerText = caller.value;
          Arona.profile[id] = caller.value;
          break;
          
        case 'fontColor' :
          var id = caller.id.replace('info-', '');
          document.getElementById('ba-' + id.replace('Color', '')).style.color = caller.value;
          Arona.profile[id] = caller.value;
          break;
          
        case 'checkbox' :
          var id = caller.id.replace('info-', ''),
              field = document.getElementById('ba-' + id);
          
          if (caller.checked) {
            field.className += ' complete';
            
          } else {
            field.className = field.className.replace(' complete', '');
          }
          
          Arona.profile[id] = caller.checked;
          break;
          
        default:
          break;
      }
      
      // save profile to localStorage so progress is not lost
      Arona.saveProfile();
    },
    
    
    // saves profile to localStorage so it can be restored
    saveProfile : function () {
      if (storageOK) {
        localStorage.BAProfile = JSON.stringify(Arona.profile);
      }
    },
    
    
    // restores the profile saved in localStorage
    restoreProfile : function (uploaded) {
      if ((storageOK && localStorage.BAProfile) || uploaded) {
        if (!uploaded) Arona.profile = JSON.parse(localStorage.BAProfile);
        
        for (var i in Arona.profile) {
          var field = document.getElementById('info-' + i);
          
          if (!/avatarCustom|backgroundCustom/.test(i)) { // exclusions
            if (field) {
              // handles checkbox values
              if (field.tagName == 'INPUT' && field.type == 'checkbox') {
                var node = document.getElementById('ba-' + i);
                if (node) node.className = node.className.replace(' complete', ''); // remove "complete" class to prevent duplication

                field.checked = Arona.profile[i];
                field.dispatchEvent(new Event('change'));

              } else {
                field.value = Arona.profile[i];
                // lazily trigger bound events to update the template automatically so we don't have to do it here
                field.dispatchEvent(new Event(field.tagName == 'SELECT' ? 'change' : 'input'));
              }

            } else {
              // log deprecated values
              console.error(field, i, Arona.profile[i]);
              
              // purge deprecated values
              delete Arona.profile[i];
            }
          }
        }
      }
    },
    
    
    // clears all fields
    resetProfile : function () {
      if (confirm(Arona.profile.lang == 'en' ? 'All fields will be reset. Do you want to continue?' : 'すべての情報をリセットします。よろしいですか？')) {
        for (var i in Arona.profile) {
          var field = document.getElementById('info-' + i);
          if (field.type == 'checkbox') {
            field.checked = false;
            
          } else if (i != 'lang') {
            field.value = 
              i == 'avatar' ? 'arona' :
              i == 'background' ? 'arona-room' :
              i == 'gender' ? 'null' :
              i == 'prevMode' ? 'full' :
              /Color/.test(i) ? '#333333' : '';
          }
          
          // lazily update profile object + storage
          field.dispatchEvent(new Event((field.tagName == 'SELECT' || field.type == 'checkbox') ? 'change' : 'input'));
        }
        
        // remove avatar
        var ava = document.getElementById('ba-avatar');
        ava.style.backgroundImage = '';
      }
    },
    
    
    // generates the profile image using html2canvas
    // (does not work locally unless browser is running with cors disabled. Chrome flag for that: --disable-web-security --user-data-dir=c:\my\data)
    generateProfile : function () {
      // restore preview to normal size, otherwise the image won't be generated properly
      var preview = document.getElementById('preview-box'), full = false;
      if (preview && /prev-full/.test(preview.className)) {
        preview.className = '';
        full = true;
      }
      
      // generate profile
      html2canvas(document.getElementById('template')).then(function(canvas) {
        var link = document.createElement('A');
        link.href = canvas.toDataURL();
        link.download = 'blue-archive-profile.png';
        link.click();
      });
      
      // restore user preview preference
      if (full) {
        preview.className = 'prev-full';
      }
    },
    
    
    // saves the profile locally to a JSON file, so the user can backup their profile in case they want to edit it later
    downloadProfile : function () {
      var link = document.createElement('A');
      link.href = 'data:,' + encodeURIComponent(JSON.stringify(Arona.profile, '', '  ').replace(/\n/g, '\r\n'));
      link.download = 'blue-archive-profile.json';
      link.click();
    },
    
    
    // uploads a locally saved profile
    uploadProfile : function (input, dropped) {
      var file = dropped ? input : input.files[0],
          reader = new FileReader();
      
      reader.onload = function (e) {
        Arona.profile = JSON.parse(e.target.result);
        Arona.restoreProfile(true);
        
        // clears input so file can be loaded again
        document.getElementById('fileLoader').value = '';
      };
      
      reader.readAsText(file, 'UTF-8');
    },
    
    
    // handle uploading profile files that are dropped on inputs
    dropFile : function (e) {
      Arona.uploadProfile(e.dataTransfer.files[0], true);
      e.preventDefault();
    },
    
    
    // prompt to let the user know their avatar was uploaded successfully
    avatarOK : function () {
      if (Arona.avatarPrompt) {
        clearTimeout(Arona.avatarPrompt);
      }
      
      // show prompt
      document.getElementById('avatarOK').style.display = '';
      
      // hide prompt after a few seconds
      Arona.avatarPrompt = setTimeout(function() {
        document.getElementById('avatarOK').style.display = 'none';
        delete Arona.avatarPrompt;
      }, 3000);
    },
    
    // prompt to let the user know their background was uploaded successfully
    backgroundOK : function () {
      if (Arona.backgroundPrompt) {
        clearTimeout(Arona.backgroundPrompt);
      }
      
      // show prompt
      document.getElementById('backgroundOK').style.display = '';
      
      // hide prompt after a few seconds
      Arona.backgroundPrompt = setTimeout(function() {
        document.getElementById('backgroundOK').style.display = 'none';
        delete Arona.backgroundPrompt;
      }, 3000);
    },
    
    
    // audio files for bgm/sfx
    bgm : {
      alert : new Audio(getPaths() + 'shittim-chest/audio/alert.mp3'),
      gan : new Audio(getPaths() + 'shittim-chest/audio/gan.mp3'),
      success : new Audio(getPaths() + 'shittim-chest/audio/success.mp3'),
      usagiFlap : new Audio(getPaths() + 'shittim-chest/audio/Usagi%20Flap.mp3')
    },
    
    // plays the BGM file
    playBGM : function (file) {
      Arona.bgm[file].load();
      Arona.bgm[file].play();
    },
    
    
    // audio files for chatter
    audio : {
      headpat_arona : new Audio(getPaths() + 'shittim-chest/audio/arona/headpat.ogg'),
      headpat_plana : new Audio(getPaths() + 'shittim-chest/audio/plana/headpat.ogg'),
      aris : new Audio(getPaths() + 'shittim-chest/audio/gdd/aris.ogg'),
      momoi : new Audio(getPaths() + 'shittim-chest/audio/gdd/momoi.ogg'),
      midori : new Audio(getPaths() + 'shittim-chest/audio/gdd/midori.ogg'),
      yuzu : new Audio(getPaths() + 'shittim-chest/audio/gdd/yuzu.ogg')
    },
    
    // plays the audio files above
    // file == the object key (Arona.play('headpat_arona'))
    play : function (file, callback) {
      // stop any audio currently playing
      for (var k in Arona.audio) {
        if (!Arona.audio[k].paused) {
          Arona.audio[k].pause();
        }
      }
      
      // play the specified audio file
      Arona.audio[file].load();
      Arona.audio[file].play();
      
      // execute callback function when audio finishes playing
      if (callback) {
        Arona.audio[file].onended =  function () {
          callback();
          delete this.onended;
        }
      }
    },
    
    // changes Arona/Plana's expression
    expression : function (id) {
      Arona.body.src = getPaths() + 'shittim-chest/images/' + (Arona.asleep ? 'plana' : 'arona') + '/' + id + '.webp';
    },
    
    
    /* EASTER EGGS BELOW */
    // headpat Arona/Plana and plays audio
    headpat : function () {
      if (window.revertDefault) {
        clearTimeout(window.revertDefault);
        delete window.revertDefault;
      }
      
      // determine character sprite to apply
      var char = Arona.asleep ? 'plana' : 'arona';
      Arona.container.className = ''; // reset class so jump animation plays
      
      // play jump animation after slight delay
      setTimeout(function () {
        Arona.container.className = 'jump';
        Arona.expression(2);
        Arona.play('headpat_' + char);
        
        // revert to default expression
        window.revertDefault = setTimeout(function () {
          Arona.expression(1);
        }, 3000);
      }, 100);
    },
    
    // headpat Aris and play music
    headpatAris : function () {
      var aris = document.getElementById('aris');
      
      // change aris' image
      aris.src = getPaths() + 'shittim-chest/images/aris-yay.png';
      
      // change aris' dialogue
      document.getElementById('message-1').style.display = 'none';
      document.getElementById('message-2').style.display = '';
      
      // hide the old headpat click box
      document.getElementById('aris-headpat').style.display = 'none';
      
      // make aris say thank you, then make her dance to usagi flap
      Arona.playBGM('success');
      Arona.play('aris')
      
      setTimeout(function () {
        aris.src = getPaths() + 'shittim-chest/images/arisu.gif';
        aris.style.cursor = 'pointer';
        aris.title = document.querySelector('.ja-lang') ? '音楽を止めたい場合は、アリスをクリックしてください！' : 'Click Aris to pause the music!';
      
        // pause/play the music when aris is clicked
        aris.onclick = function () {
          if (Arona.bgm.usagiFlap.paused) {
            aris.src = getPaths() + 'shittim-chest/images/arisu.gif';
            Arona.bgm.usagiFlap.play();

          } else {
            aris.src = getPaths() + 'shittim-chest/images/arisu.png';
            Arona.bgm.usagiFlap.pause();
          }
        };
      
        // play music for Aris to dance to
        Arona.bgm.usagiFlap.loop = true;
        Arona.bgm.usagiFlap.load();
        Arona.bgm.usagiFlap.play();
      }, 3000);
    },
    
    
    // unbox yuzu
    unbox : function () {
      var box = document.getElementById('yuzu-box'),
          yuzu = document.getElementById('yuzu');
      
      if (!/unboxed/.test(box.className)) {
        box.className = 'unboxed';
        Arona.playBGM('alert');
      }
    
      // make yuzu shake
      yuzu.className = '';
      setTimeout(function () {
        yuzu.className = 'shake';
      }, 100);
      
      // make yuzu speak
      Arona.play('yuzu');
    },
    
    // make momoi rage
    kuyashi : function () {
      var momoi = document.getElementById('momoi');
      
      // clear old animation timeout
      if (Arona.momoiRage) {
        clearTimeout(Arona.momoiRage);
        delete Arona.momoiRage;
      }
      
      // set classes for momoi's raging animations
      momoi.className = '';
      Arona.momoiRage = setTimeout(function () {
        momoi.className = 'rage1';
        
        Arona.momoiRage = setTimeout(function () {
          momoi.className = 'rage2';
        }, 1500);
      }, 100);
      
      // play momoi's signature "kuyashi"
      Arona.playBGM('gan');
      Arona.play('momoi');
    },
    
    
    // make midori celebrate her victory
    kachimashita : function () {
      var midori = document.getElementById('midori');
      
      // make midori jump
      midori.className = '';
      setTimeout(function () {
        midori.className = 'jump';
      });
      
      // play midori's audio
      Arona.playBGM('success');
      Arona.play('midori');
    }
  };
  
}(window, document));