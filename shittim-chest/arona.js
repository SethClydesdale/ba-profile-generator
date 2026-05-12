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
      
      // story slider mode + per-volume progress levels (0-3)
      storySliderMode : false,
      p1_v1_level : 0,
      p1_v2_level : 0,
      p1_v3_level : 0,
      p1_vf_level : 0,
      p1_v4_level : 0,
      p1_v5_level : 0,
      p1_v6_level : 0,
      p1_vex_level : 0,
      p2_v0_level : 0,
      p2_vex_level : 0,
      
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
    
    
    // updates the profile with new data
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
        
        case 'storySliderMode' :
          var section = document.getElementById('story-completed-section'),
              tmpl = document.getElementById('template'),
              sdVols = ['p1_v1', 'p1_v2', 'p1_v3', 'p1_vf', 'p1_v4', 'p1_v5', 'p1_v6', 'p1_vex', 'p2_v0', 'p2_vex'];
          
          if (caller.checked) {
            if (!/slider-mode/.test(section.className)) section.className += ' slider-mode';
            if (!/story-slider-mode/.test(tmpl.className)) tmpl.className += ' story-slider-mode';
            
            // disable vol checkboxes and reflect slider progress
            for (var j = 0; j < sdVols.length; j++) {
              var cf = document.getElementById('info-' + sdVols[j]),
                  lv = Arona.profile[sdVols[j] + '_level'] || 0,
                  le = document.getElementById('label-' + sdVols[j]),
                  bn = document.getElementById('ba-' + sdVols[j]),
                  sdv = Arona.storyData[sdVols[j]];
              if (cf) { cf.disabled = true; cf.checked = lv > 0; }
              if (le) le.textContent = Arona.storyLevelText(sdVols[j], lv);
              if (bn && sdv) {
                if (lv === sdv.maxChapters) {
                  if (!/ complete-max/.test(bn.className)) bn.className += ' complete-max';
                } else {
                  bn.className = bn.className.replace(' complete-max', '');
                }
              }
            }
            
            Arona.drawStoryRadar();
          } else {
            section.className = section.className.replace(' slider-mode', '');
            tmpl.className = tmpl.className.replace(' story-slider-mode', '');
            
            // re-enable vol checkboxes and restore boolean state, clear labels
            for (var j = 0; j < sdVols.length; j++) {
              var cf = document.getElementById('info-' + sdVols[j]),
                  le = document.getElementById('label-' + sdVols[j]),
                  bn = document.getElementById('ba-' + sdVols[j]);
              if (cf) { cf.disabled = false; cf.checked = Arona.profile[sdVols[j]]; }
              if (le) le.textContent = '';
              if (bn) bn.className = bn.className.replace(' complete-max', '');
            }
          }
          
          Arona.profile.storySliderMode = caller.checked;
          break;
        
        case 'storyLevel' :
          var id = caller.id.replace('info-', ''),
              volKey = id.replace('_level', ''),
              lvNum = parseInt(caller.value, 10);
          
          Arona.profile[id] = lvNum;
          
          // keep boolean in sync so old instances still render rects correctly
          Arona.profile[volKey] = lvNum > 0;
          var boolNode = document.getElementById('ba-' + volKey);
          if (boolNode) {
            if (Arona.profile[volKey]) {
              if (!/ complete/.test(boolNode.className)) boolNode.className += ' complete';
            } else {
              boolNode.className = boolNode.className.replace(' complete', '');
            }
            var sd = Arona.storyData[volKey];
            if (sd && lvNum === sd.maxChapters) {
              if (!/ complete-max/.test(boolNode.className)) boolNode.className += ' complete-max';
            } else {
              boolNode.className = boolNode.className.replace(' complete-max', '');
            }
          }
          
          // sync checkbox: disabled (controlled by slider), checked when any progress
          var volCheck = document.getElementById('info-' + volKey);
          if (volCheck) volCheck.checked = lvNum > 0;
          
          // update chapter label
          var levelLabel = document.getElementById('label-' + volKey);
          if (levelLabel) levelLabel.textContent = Arona.storyLevelText(volKey, lvNum);
          
          if (Arona.profile.storySliderMode) {
            Arona.drawStoryRadar();
          }
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
        
        // backward compat: old profiles have no slider data — derive levels from booleans
        if (!('storySliderMode' in Arona.profile)) {
          Arona.profile.storySliderMode = false;
          var storyVols = ['p1_v1', 'p1_v2', 'p1_v3', 'p1_vf', 'p1_v4', 'p1_v5', 'p1_v6', 'p1_vex', 'p2_v0', 'p2_vex'];
          for (var k = 0; k < storyVols.length; k++) {
            Arona.profile[storyVols[k] + '_level'] = Arona.profile[storyVols[k]] ? Arona.storyData[storyVols[k]].maxChapters : 0;
          }
        }
        
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
              /Color/.test(i) ? '#333333' :
              /level/.test(i) ? '0' : '';
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
    
    
    // chapter metadata for each story volume
    storyData : {
      p1_v1 : {
        label: 'V1', displayLabel: 'Vol. 1', maxChapters: 3,
        title: 'Foreclosure Task Force',
        chapters: ['Strange Days for the Task Force', 'Things Lost and Others Held On To', 'Traces of a Dream']
      },
      p1_v2 : {
        label: 'V2', displayLabel: 'Vol. 2', maxChapters: 2,
        title: 'Clockwork Flower Pavane',
        chapters: ['Retromania', 'The Romance of Friendship, Courage, and Light']
      },
      p1_v3 : {
        label: 'V3', displayLabel: 'Vol. 3', maxChapters: 4,
        title: 'Eden Treaty',
        chapters: ['Make-up Work Club, Here We Go!', 'Paradise Paradox', 'Our Stories', 'Kyrie of the Forgotten Gods']
      },
      p1_vf : {
        label: 'VF', displayLabel: 'Vol. F', maxChapters: 4,
        title: 'Where All Miracles Begin',
        chapters: ['Operation Recapture Schale', "Operational Plan: Nisir's Summit", 'The Ark of Atrahasis Conquest', 'Phrenapates Showdown']
      },
      p1_v4 : {
        label: 'V4', displayLabel: 'Vol. 4', maxChapters: 2,
        title: 'Rabbit of Caerbannog',
        chapters: ['RABBIT Squad, Begin Operation!', 'We Were RABBITs!']
      },
      p1_v5 : {
        label: 'V5', displayLabel: 'Vol. 5', maxChapters: 2,
        title: 'Hyakkaryouran',
        chapters: ['Like the Flower That Wishes to Bloom', "To You, Who's Trying to Bloom Alone"]
      },
      p1_v6 : {
        label: 'V6', displayLabel: 'Vol. 6', maxChapters: 3,
        title: 'Oratorio of Days Gone By',
        chapters: ['Sights Beyond the Boundary', 'Saying Goodbye to Yesterday', 'Ecclesia for the Future Left Behind']
      },
      p1_vex : {
        label: 'VEx', displayLabel: 'Vol. EX', maxChapters: 2,
        title: 'Decagrammaton',
        chapters: ['Snake of Wisdom', 'Flaming Sword']
      },
      p2_v0 : {
        label: 'P2 V0', displayLabel: 'Part 2 Vol. 0', maxChapters: 1,
        title: 'General Student Council',
        chapters: ['Chapter 1']
      },
      p2_vex : {
        label: 'P2 VEx', displayLabel: 'Part 2 Vol. EX', maxChapters: 1,
        title: 'Volume EX',
        chapters: ['Chapter 1']
      }
    },
    
    
    // returns the display string for a slider at a given level (empty string for 0)
    storyLevelText : function (volKey, level) {
      if (!level) return '';
      var sd = Arona.storyData[volKey];
      return sd.displayLabel + ' [' + sd.title + ': Chapter ' + level + ' \u2014 ' + sd.chapters[level - 1] + ']';
    },
    
    
    // draws a radar chart on the #ba-story-radar canvas using current slider levels
    // each axis is normalised to [0, maxChapters] so all volumes reach the outer ring at 100%
    drawStoryRadar : function () {
      var canvas = document.getElementById('ba-story-radar');
      if (!canvas) return;
      
      var sd     = Arona.storyData,
          ctx    = canvas.getContext('2d'),
          w      = canvas.width,
          h      = canvas.height,
          cx     = w / 2,
          cy     = h / 2,
          maxR   = Math.min(cx, cy) - 50,
          keys   = ['p1_v1','p1_v2','p1_v3','p1_vf','p1_v4','p1_v5','p1_v6','p1_vex','p2_v0','p2_vex'],
          n      = keys.length,
          rings  = 3,
          i, angle, x, y, r, norm;
      
      ctx.clearRect(0, 0, w, h);
      
      // grid rings (drawn at 1/3, 2/3, 3/3 of maxR)
      for (var ring = 1; ring <= rings; ring++) {
        r = (ring / rings) * maxR;
        ctx.beginPath();
        for (i = 0; i < n; i++) {
          angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          x = cx + r * Math.cos(angle);
          y = cy + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(2,64,119,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (ring === rings) {
          ctx.fillStyle = 'rgba(18,138,250,0.05)';
          ctx.fill();
        }
      }
      
      // axes
      for (i = 0; i < n; i++) {
        angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
        ctx.strokeStyle = 'rgba(2,64,119,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // data polygon — normalise each value to [0,1] using its own maxChapters
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        norm  = (Arona.profile[keys[i] + '_level'] || 0) / sd[keys[i]].maxChapters;
        r     = norm * maxR;
        x     = cx + r * Math.cos(angle);
        y     = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle   = 'rgba(18,138,250,0.35)';
      ctx.fill();
      ctx.strokeStyle = '#024077';
      ctx.lineWidth   = 2;
      ctx.stroke();
      
      // data point dots — pink when volume is fully completed
      for (i = 0; i < n; i++) {
        var lvl   = Arona.profile[keys[i] + '_level'] || 0;
        var isMax = lvl >= sd[keys[i]].maxChapters;
        angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        norm  = lvl / sd[keys[i]].maxChapters;
        r     = norm * maxR;
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), isMax ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle   = isMax ? '#E8559A' : '#024077';
        ctx.strokeStyle = isMax ? '#C0407A' : 'transparent';
        ctx.lineWidth   = isMax ? 2 : 0;
        ctx.fill();
        if (isMax) ctx.stroke();
      }
      
      // labels
      ctx.font         = 'bold 16px Cuprum, CuprumWeb, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      for (i = 0; i < n; i++) {
        angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        x = cx + (maxR + 35) * Math.cos(angle);
        y = cy + (maxR + 35) * Math.sin(angle);
        ctx.fillStyle = 'rgba(2,64,119,0.9)';
        ctx.fillText(sd[keys[i]].label, x, y);
      }
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