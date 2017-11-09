var currentWord = {
	word: "", 
	availableLetters: "",
	image: ""
}

var currentGameLevel;
var music;
var isMusicPlaying = true;
var useExtraLetters = false;
var currentWordIndex = 0;

var playerWord = { 
	word: "", 
	ids: [], 
	length: function() {
		return this.word.length;
	},
	push: function(letter, id) {
		this.word += letter;
		this.ids.push(id);
	},
	pop: function() {
		var result = { letter: this.word[this.word.length-1], id: this.ids.pop() };
		this.word = this.word.substr(0, this.word.length - 1);
		return result;
	},
	reset: function() {
		this.word = "";
		this.ids = [];
	}
};

$(document).ready(function() {
	initGeneral();
	initMainMenu();
	initLevelSelectScreen();
	initCreditsScreen();
	initLevelCompleteScreen();
});

$(window).load(function() {
	setTimeout(function() {
		setTimeout(function() {
			playBackgroundMusic();
			$('#splash_box').fadeOut(500, function() {
				$('#main-menu').fadeIn(500);
			});
		}, 2500);
	}, 1000);
});


var playBackgroundMusic = function() {
	music = new Audio('music/Mining by Moonlight.mp3'); 
	music.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);
	music.play();
}

var getNextWord = function() {
	var nextWord = wordList['level' + currentGameLevel][currentWordIndex++];
	var word = nextWord.w.toUpperCase();
	var imageFile = nextWord.f;
	var availableLetters = nextWord.w.toUpperCase();
	var maximumLetters = useExtraLetters ? 9 : word.length;
	
	var letterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ';
	while(availableLetters.length < maximumLetters ) {
		var randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
		if (availableLetters.indexOf(randomLetter) == -1) {
			availableLetters += randomLetter;
		}
	}
	
	return {word:word, availableLetters:availableLetters, image:imageFile};
}

var initGeneral = function() {
	$('.button-music').bind('click', function() {
		toggleMusic();
	});
	
	$(document).on('click', '.sound-click', function(e) {
		sound('click');
	});
	
	$(document).on('click', '.ui-button-text', function(e) {
		sound('click');
	});
	
	$('.soundfx').prop('volume', '0.3')
}

var initMainMenu = function() {
	$('#tutorial').bind('click', function() {
		$('#tutorial').hide();
	});

	$('#button-start-playing').bind('click', function() {
		goToLevelSelectScreen();
	});
	
	$('#button-credits').bind('click', goToCreditsScreen);
	$('#credits-screen').bind('click', closeCreditsScreen);
}

var initLevelSelectScreen = function() {	
	$('.button-level1').bind('click', function() {
		currentGameLevel = 1;
		goToGameScreen();
	});
	
	$('.button-level2').bind('click', function() {
		currentGameLevel = 2;
		goToGameScreen();
	});
	
	$('.button-level3').bind('click', function() {
		currentGameLevel = 3;
		goToGameScreen();
	});
	
	$('.more_dificult').bind('click', function() {
		toggleExtraLetters();
	});
	
	$('#level-select-screen .button-credits-back').bind('click', closeLevelSelectScreen);
}

var initLevelCompleteScreen = function() {	
	$('#level-complete-screen .button-credits-back').bind('click', closeLevelCompleteScreen);
}

var initCreditsScreen = function() {
	$('#button-credits-back-2').bind('click', closeCreditsScreen );
}

var toggleMusic = function() {
	if (isMusicPlaying) {
		$('.button-music').removeClass('pulse');
		$('.button-music .on').hide();
		$('.button-music .off').show();
		music.pause();
	}
	else {
		$('.button-music').addClass('pulse');
		$('.button-music .on').show();
		$('.button-music .off').hide();
		music.play();
	}
	
	isMusicPlaying = !isMusicPlaying;
}

var toggleExtraLetters = function() {
	$('.more_dificult .on').toggle();
	$('.more_dificult .off').toggle();
	
	useExtraLetters = !useExtraLetters;
}

var closeLevelSelectScreen = function() {
	$('#level-select-screen').fadeOut(500, function() {
		$('#main-menu').fadeIn(500);
	});
}

var closeLevelCompleteScreen = function() {
	$('#level-complete-screen').fadeOut(500, function() {
		$('#main-menu').fadeIn(500);
	});
}

var closeCreditsScreen = function() {
	$('#credits-screen').fadeOut(500, function() {
		$('#main-menu').fadeIn(500);
	});
}

var goToCreditsScreen = function() {
	$('#main-menu').fadeOut(500, function() {
		$('#credits-screen').fadeIn(500);
	});
}

var goToLevelSelectScreen = function() {
	useExtraLetters = false;

	$('#main-menu').fadeOut(500, function() {
		$('#level-select-screen').fadeIn(500);
	});
}

var goToGameScreen = function() {
	currentWordIndex = 0;
	
	wordList['level' + currentGameLevel] = shuffleArray(wordList['level' + currentGameLevel]);

	var currentScreen = null;
	if ($('#level-select-screen').css('display') !== 'none') {
		currentScreen = $('#level-select-screen');
	}
	else {
		currentScreen = $('#level-complete-screen');
	}

	currentScreen.fadeOut(500, function() {
		$('#canvas').fadeIn(500, function() {
			initGame();
		});
	});
}

var initGame = function() {
	playerWord.reset();
	$('#submit').removeClass('pulse');
	
	if (currentWordIndex === wordList['level' + currentGameLevel].length) { 
		$('.word').remove();
		$('#image').hide();
		$('#canvas').fadeOut(500, function() {
			setWinningMessage();
			sound('win-level');
			$('#level-complete-screen').fadeIn(500);
		});
		return;
	}
	
	currentWord = getNextWord();
	
	$('.word').remove();
	$('#submit').removeClass('pulse');
	
	showNewWordImage(currentWord.image, function() {
		showLettersAndPlaceholders(currentWord.word, currentWord.availableLetters);
		
		$('#delete').bind('click', function(e) {
			deleteLetter();
		});
		
		$('#submit').bind('click', function(e) {
			submitWord();
		});
		
		$('#exit').bind('click', function(e) {
			exitGame();
		});
		
		$('#canvas').on('click', '.letter.selectable', function(e) {
			selectLetter(e.target);
		});
	});
}

var setWinningMessage = function() {
	var message = null;
	
	if (!useExtraLetters) {
		if (currentGameLevel == 1) {
			message = "Completaste todas as palavras do nível Fácil!<br>Tenta agora o nível Médio.";
		}
		else if (currentGameLevel == 2) {
			message = "Completaste todas as palavras do nível Médio!<br>Tenta agora o nível Difícil.";
		}
		else if (currentGameLevel == 3) {
			message = "Completaste todas as palavras do nível Difícil!<br>Experimenta agora o modo Mais Letras.";
		}
	}
	else {
		if (currentGameLevel == 1) {
			message = "Completaste todas as palavras do nível Fácil!<br>Tenta agora o nível Médio.";
		}
		else if (currentGameLevel == 2) {
			message = "Completaste todas as palavras do nível Médio!<br>Tenta agora o nível Difícil.";
		}
		else if (currentGameLevel == 3) {
			message = "Completaste todas as palavras do nível mais Difícil do jogo!<br>Joga outra vez.";
		}
	}
	
	$('#level-complete-screen p').html(message);
}

var exitGame = function() {
    $("#exit-dialog").dialog({
		show: 100,
		position: { my: 'center', at: 'center', of: $('#canvas')},
		draggable: false,
		resizable: false,
		height: 140,
		modal: true,
		buttons: {
			"Sim": function() {
				$( this ).dialog( "close" );
				unhookEvents();
				$('.word').remove();
				$('#image').hide();
				$('#canvas').fadeOut(500, function() {
					$('#main-menu').fadeIn(500);
				});
			},
			"Não": function() {
				$( this ).dialog( "close" );
			}
		}
    });
}

var selectLetter = function(target) {
	if (playerWord.length() === currentWord.word.length) {
		return;
	}
	
	sound('click');

	var obj = $(target);
	
	playerWord.word += obj.attr('data-letter');
	playerWord.ids.push(obj.attr('data-id'));
	obj.removeClass('selectable');
	obj.addClass('selected');

	var leftPos = getLeftPositionOfLetter(currentWord.word.length, playerWord.length() - 1);   50 - currentWord.word.length * 10 / 2 + (playerWord.length() - 1) * 10;
	obj.css('left', leftPos + '%');
	obj.css('bottom', '20%');
	
	if (currentWord.word.length === playerWord.word.length) {
		$('#submit').addClass('pulse');
	} else {
		$('#submit').removeClass('pulse');
	}
}

var deleteLetter = function() {
	if (playerWord.length === 0) {
		return;
	}
	
	var lastLetter = playerWord.pop();
	var lastLetterObj = $('.letter[data-id="' + lastLetter.id + '"]');
	
	lastLetterObj
		.css('bottom','5%')
		.css('left', lastLetterObj.attr('data-original-x-position'));
	
	lastLetterObj.addClass('selectable');
	lastLetterObj.removeClass('selected');
	
	$('#submit').removeClass('pulse');
}

var submitWord = function() {
	$('#submit').removeClass('pulse');

	if (currentWord.word === playerWord.word) {
		rightAnswer();
	}
	else {
		wrongAnswer();
	}
}

var wrongAnswer = function() {
    sound('wrong');
    $("#wrong-answer-dialog").dialog({
		show: 100,
		position: { my: 'center', at: 'center', of: $('#canvas')},
		draggable: false,
		resizable: false,
		height: 140,
		modal: true,
		buttons: {
			"Continuar a tentar": function() {
				$( this ).dialog( "close" );
			},
			"Outra palavra": function() {
				unhookEvents();
				initGame();
				$( this ).dialog( "close" );
			}
		}
    });
}

var rightAnswer = function() {	
	sound('right');
	$("#right-answer-dialog").dialog({
		show: 100,
		position: { my: 'center', at: 'center', of: $('#canvas')},
		draggable: false,
		resizable: false,
		height: 140,
		modal: true,
		buttons: {
			"Continuar": function() {
				unhookEvents();
				initGame();
				$( this ).dialog( "close" );
			}
		}
	});
}

var unhookEvents = function() {
	$('.letter').unbind('click');
	$('#exit').unbind('click');
	$('#delete').unbind('click');
	$('#submit').unbind('click');
	$('#canvas').off('click', '.letter.selectable');
}

var showNewWordImage = function(filename, callback) {
	var img = $('#image');
	
	img.fadeOut(500, function() {
		img.attr('src', 'dictionary/images/' + filename);
		img.fadeIn(500, function() {
			callback();
		});
	});
	
}

var getLeftPositionOfLetter = function(wordLength, currentLetterIndex) {
   return 50 - wordLength * 10 / 2 + (currentLetterIndex) * 10;
}

var shuffleArray = function(inputArray){
	var arr = inputArray.slice();
	for(var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
   	return arr;
};

var showLettersAndPlaceholders = function(word, availableLetters) {
	var availableLettersArray = availableLetters.split('');
	var shuffledLettersArray = shuffleArray(availableLettersArray);

	while(shuffledLettersArray.toString() === availableLettersArray.toString()) {
		shuffledLettersArray = shuffleArray(availableLettersArray);
	}
	
	var currentLettersHtml = '<div class="word">';

	currentLettersHtml += '<div class="word-placeholder">';
	
	for(i=0; i<word.length; i++) {
		currentLettersHtml += '<div class="letter-placeholder" style="left:' + getLeftPositionOfLetter(word.length, i) + '%"></div>';
	}
	
	currentLettersHtml += '</div>';	
	
	for (i=0; i<availableLetters.length; i++) {
		var letter = shuffledLettersArray.splice(0, 1);
		var xPos = getLeftPositionOfLetter(availableLetters.length, i) + "%";
		
		currentLettersHtml += '<div class="selectable-placeholder" style="left:' + xPos + '"></div>';
		
		currentLettersHtml += '<div class="letter selectable {letter}" style="left: {left}" data-id="{id}" data-letter="{letter}" data-original-x-position="{left}">{letter}</div>'
			.replace(/{letter}/g, letter)
			.replace(/{left}/g, xPos)
			.replace(/{id}/g, i);
	}
	currentLettersHtml += "</div>";
	
	$('#canvas').append(currentLettersHtml);
	$('.letter').fitText(0.15);
}

var sound = function(soundName) {
	var soundControl = document.getElementById('sound-' + soundName);
	soundControl.pause();
	soundControl.currentTime = 0;
	soundControl.play();
}