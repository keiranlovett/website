$(function () {
	'use strict';
	
	/*This code ensures that a web page is refreshed when it is restored from the browser's back/forward cache (known as the bfcache)*/
	/*window.onpageshow = function(event) {if (event.persisted) {window.location.reload() }};*/

	/* Set full height in blocks */
	var width = $(window).width();
	var height = $(window).height();
	//$('.section.started').css({'height': height-60});
	
	
	function initPreloader() {
	    // Check if preloader exists
	    const preloader = $('.preloader');
	    const body = $('body');

	    if (preloader.length > 0) {
	      $(".preloader .pre-inner").fadeOut(800, function () {
	        // Ensure body gets "loaded" class
	        preloader.fadeOut(500, function () {
	          body.addClass('loaded');
	        });
	      });
	    } else {
	      // If no preloader, directly mark body as loaded
	      body.addClass('loaded');
	    }
	  }

	function initTyped() {
		// Initialize Typed.js for subtitle
		const subtitle = $('.typed-subtitle');
		if (subtitle.length > 0) {
		subtitle.typed({
			stringsElement: $('.typing-subtitle'),
			chars: "▓▒░█▌▐▀▄■□▪▫▖▗▘▙▚▛▜▝▞▟",
			loop: true,
			showCursor: false
		});
	}

  }

  function handleHashScroll() {
    // Smooth scroll for URL hash
    const urlHash = location.hash;
    const sectionElem = $(urlHash);

    if (urlHash.indexOf('#section-') === 0 && sectionElem.length) {
      $('body, html').animate(
        { scrollTop: sectionElem.offset().top - 70 },
        400
      );
    }
  }

    // Fallback to ensure "loaded" is applied after max 5s
  setTimeout(() => $('body').addClass('loaded'), 500);

  // Wait for window load
  $(window).on('load', function () {
    initPreloader();
    handleHashScroll();
  });
	
    initTyped();


	/*Fade-out animation between load pages*/
	$('header .top-menu, .typed-bread').on('click', 'a', function(){
		var link = $(this).attr('href');
		if(link.indexOf('#section-') == 0){
			if(!$('body').hasClass('home')){
				location.href = '/'+link;
			}

			$('body, html').animate({scrollTop: $(link).offset().top - 110}, 400);
			if($('header').hasClass('active')){
				$('.menu-btn').trigger('click');
			}
		} else {
			$('body').removeClass('loaded');
			setTimeout(function() {
				location.href = "" + link;
			}, 500);
		}
		return false;
	});
	
	/*Menu mobile*/
	$('header').on('click', '.menu-btn', function(){
		if($('header').hasClass('active')){
			$('header').removeClass('active');
			$('body').addClass('loaded');
		} else {
			$('header').addClass('active');
			$('body').removeClass('loaded');
		}
		
		return false;
	});
	
	/* Hide mouse button on scroll */
	$(window).scroll(function(){
		if ($(this).scrollTop() >= 1 /*$('#blue_bor').offset().top*/) {
			$('.mouse_btn').fadeOut();
		}
		else {
			$('.mouse_btn').fadeIn();
		}
	});
	
	/* On click mouse button, page scroll down */
	$('.section').on('click', '.mouse_btn', function(){
		$('body,html').animate({
			scrollTop: height - 150
		}, 800);
	});
	
	$('body').on({
		mouseenter: function () {
			$(this).addClass('glitch-effect-white');
		},
		mouseleave: function () {
			$(this).removeClass('glitch-effect-white');
			$('.top-menu ul li.active a.btn').addClass('glitch-effect-white');
		}
	}, 'a.btn, .btn');
	
	/* Initialize masonry items */
	var $container_clients = $('.section.clients .box-items');
	$container_clients.imagesLoaded(function() {
		$container_clients.isotope({
			itemSelector: '.box-item'
		});
	});

	/* Initialize masonry items */
	var $container_blog = $('.section.blog .box-items');
	$container_blog.imagesLoaded(function() {
		$container_blog.isotope({
			itemSelector: '.box-item'
		});
	});
	
	/*
		Initialize portfolio items
	*/
	var $container = $('.section.works .box-items');
	$container.imagesLoaded(function() {
		$container.isotope({
			itemSelector: '.box-item'
		});
	});

	/*
		Filter items on button click
	*/
	$('.filters').on( 'click', '.btn-group', function() {
		var filterValue = $(this).find('input').val();
		$container.isotope({ filter: filterValue });
		$('.filters .btn-group label').removeClass('glitch-effect');
		$(this).find('label').addClass('glitch-effect');
	});
	
	/*
		Gallery popup
	*/
	if(/\.(?:jpg|jpeg|gif|png)$/i.test($('.gallery-item:first a').attr('href'))){
		$('.gallery-item a').magnificPopup({
			gallery: {
				enabled: true
			},
			type: 'image',
			closeBtnInside: false,
			mainClass: 'mfp-fade'
		});
	}

	/*
		Media popup
	*/
	$('.has-popup-media').magnificPopup({
		type: 'inline',
		overflowY: 'auto',
		closeBtnInside: true,
		mainClass: 'mfp-fade'
	});

	/*
		Image popup
	*/
	$('.has-popup-image').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		mainClass: 'mfp-fade',
		image: {
			verticalFit: true
		}
	});
	
	/*
		Video popup
	*/
	$('.has-popup-video').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		iframe: {
            patterns: {
                youtube_short: {
                  index: 'youtu.be/',
                  id: 'youtu.be/',
                  src: 'https://www.youtube.com/embed/%id%?autoplay=1'
                }
            }
        },
		removalDelay: 160,
		preloader: false,
		fixedContentPos: false,
		mainClass: 'mfp-fade',
		callbacks: {
			markupParse: function(template, values, item) {
				template.find('iframe').attr('allow', 'autoplay');
			}
		}
	});
	
	/*
		Gallery popup
	*/
	$('.has-popup-gallery').on('click', function() {
        var gallery = $(this).attr('href');
    
        $(gallery).magnificPopup({
            delegate: 'a',
            type:'image',
            closeOnContentClick: false,
            mainClass: 'mfp-fade',
            removalDelay: 160,
            fixedContentPos: false,
            gallery: {
                enabled: true
            }
        }).magnificPopup('open');

        return false;
    });
	
	/* Resize function */
	$(window).resize(function() {
		var width = $(window).width();
		var height = $(window).height();
		
		//$('.section.started').css({'height': height-60});

		/* Dotted Skills Line On Resize Window */
		var skills_dotted = $('.skills-list.dotted .progress');
		var skills_dotted_w = skills_dotted.width();
		if(skills_dotted.length){
			skills_dotted.find('.percentage .da').css({'width':skills_dotted_w+1});
		}
	});
	
	if(width < 840) {
		//$('.section.started').css({'height': height-30});
	}

	/*
		Dotted Skills Line
	*/

	function skills(){
		var skills_dotted = $('.skills.dotted .progress');
		var skills_dotted_w = skills_dotted.width();
		if(skills_dotted.length){
			skills_dotted.append('<span class="dg"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span>');
			skills_dotted.find('.percentage').append('<span class="da"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span>');
			skills_dotted.find('.percentage .da').css({'width':skills_dotted_w});
		}
	}
	setTimeout(skills, 1000);

	/*
		Circle Skills Line
	*/

	var skills_circles = $('.skills.circles .progress');
	if(skills_circles.length){
		skills_circles.append('<div class="slice"><div class="bar"></div><div class="fill"></div></div>');
	}

	/*
		Social Share
	*/
	$('.social-share').rrssb({
		title: $('.social-share').data('title'),
		url: $('.social-share').data('url'),
	});
	
	/*
		Widget Title
	*/
	$('.widget-title').wrapInner('<span class="widget-title-span"></span>');

	/*
		Search
	*/
	var sjs = SimpleJekyllSearch({
	  searchInput: document.getElementById('search-input'),
	  resultsContainer: document.getElementById('results-container'),
	  json: '/search.json'
	});

});