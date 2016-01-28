/*
* Script to customize Summon UI ver 2
* Hi SerSol, this seems safe enough, if you think this script breaks anything - let us know.
* Many thanks to @daveyp, @mreidsma, and @godmarback
*/

$(document).ready(function() {
    $('head').append('<link rel="stylesheet" href="https://libraryapps.fairfield.edu/summon/js/custom.css"><link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css">');
    //fix printing on firefox & append floating help
	$('body').append('<style>@media print {.overflowHidden{overflow:auto!important;height:auto}}</style>')
	  .append('<div class="libraryh3lp floating" data-lh3-jid="fairfieldrefdesk@chat.libraryh3lp.com"><div id="close-chat"><span class="fa fa-close"></span></div><iframe src="https://us.libraryh3lp.com/chat/fairfieldrefdesk@chat.libraryh3lp.com?skin=25373" frameborder="1" style="width: 275px; height: 300px; border: 2px solid rgb(192, 192, 192);"></iframe></div>');

	  (function() {
  var chats = ['fairfieldrefdesk', 'ajcu-consortium', 'ajcu-chatstaff'];
  function chatCheck(i) {
    $.getScript('http://us.libraryh3lp.com/presence/jid/'+chats[i]+'/chat.libraryh3lp.com/js').done(function() {
      if (jabber_resources[0].show === 'unavailable') {
        if (chats.length > i) {
          i++;
          chatCheck(i);
        }
      } else if (i !== 0)  {
        $('.libraryh3lp.floating iframe').attr('src', 'https://us.libraryh3lp.com/chat/'+chats[i]+'@chat.libraryh3lp.com?skin=25389');
      }
    });
  };
  chatCheck(0);
    $('body').append('<div id="toggle-chat"><i class="fa fa-comment"></i> Ask a Librarian</div><div class="libraryh3lp floating" data-lh3-jid="fairfieldrefdesk@chat.libraryh3lp.com"><div id="close-chat"><span class="fa fa-close"></span></div><iframe src="https://us.libraryh3lp.com/chat/fairfieldrefdesk@chat.libraryh3lp.com?skin=25373" frameborder="1" style="width: 275px; height: 300px; border: 2px solid rgb(192, 192, 192);"></iframe></div>');
    $('body').on('click', 'a', function(e) {
      var href = e.currentTarget.href
      if (href.indexOf('fairfield.edu/library') !== -1 || href.indexOf('libcat.fairfield') !== -1) {
        window.onbeforeunload = function() {};
      }
    });
    $(document).ready(function(){$('form').submit(function() {
      window.onbeforeunload = function() {};
    })});
    $('#toggle-chat').click(function() {
	  if (window.navigator.userAgent.indexOf('iPad') !== -1 || window.navigator.userAgent.indexOf('iPhone') !== -1 || window.navigator.userAgent.indexOf('Android') !== -1) {
        window.open($('.libraryh3lp.floating iframe').attr('src'));
        return false;
      }
      $('.libraryh3lp').css({bottom:'-6px'});
      sessionStorage['chatOpen'] = true;
      window.onbeforeunload = function(e) {
        message = 'It looks like you are chatting, are you sure you want to leave this page?';
        e.returnValue = message;
        return message;
      };
      $('body').on('click', '#close-chat', function() {
        window.onbeforeunload = function(){};
        delete sessionStorage['chatOpen'];
        $('.libraryh3lp').css({bottom:'-400px'});
      });
    });
   if (sessionStorage['chatOpen']) {
      $('#toggle-chat').click();
    }
  })();

	//modify templates
	var mainMod = angular.module('summonApp');
	mainMod.run([ '$templateCache', '$rootScope', '$route', function (templateCache, rootScope, route) {
		var docSummary = "/assets/languageSwitcher.html";
		var v = templateCache.get(docSummary);
		v = '<span></span>';
		templateCache.put(docSummary, v);


		//fires once everything is loaded for first time
		var listenOnce = rootScope.$on('apiSuccess',
			function(scope, type) {
				if (route.current.params.tour === 'true') {
					//$.getScript('http://mlib.fairfield.edu/summonjs/summon-tour.js');
				}
				$('#results').prepend(
					'<div class="alert alert-info" style="margin-bottom:0;display:none;">Tip: You have a lot of results, try using some of the filters on the left.</div>'
				);
				//deregister listener;
				listenOnce();
			}
		);
		//add tip to use facets for more than a million results
		rootScope.$on('apiSuccess',
		  function(scope, type) {
		    if (angular.element('.metadata').scope().feed.items[0]) {
				var recordCount = angular.element('.metadata').scope().feed.items[0].recordCount;
				if (recordCount > 1000000) {
				  $('.alert.alert-info').show();
				} else {
				  $('.alert.alert-info').hide();
				}
		    }

			//move permalink
			$('.permalinkContainer a:visible').parent().each(function() {
			  var $linkContainer = $(this);
			  var html = '<button class="permalinkButton"><span style="font-size:120%">&#128279;</span><span class="offscreen">Permalink</span></button>';
			  $linkContainer.parents('.documentSummary').find('.topRight').append(html).find('.permalinkButton').click(function(e) {
				setTimeout(function() {angular.element($linkContainer.children('a')).trigger('click')},0);
			  });
			  $linkContainer.children('a').hide();
			});

			//add how to use ebook
			$('.contentType.ng-scope:contains("eBook"):not(:contains("How to Use"))').each(function() {
			  var uri = angular.element(this).scope().doc.uris[0];
			  var type = 'ebl';
			  if (uri.indexOf('ebscohost') !== -1) {
				type = 'ebscohost';
			  } else if (uri.indexOf('ebrary') !== -1) {
				type = 'ebrary';
			  }
			  var links = {
				ebl: 's-lg-content-11770477',
				ebscohost: 's-lg-content-11771631',
				ebrary: 's-lg-content-11771615'
			  }
			  $(this).append('<span class="availability" style="margin-left:15px;"><a class="availabilityLink" target="_blank" href="http://librarybestbets.fairfield.edu/tutorials/ebooks#'+ links[type]+'">How to Use This eBook</a></span>');
			});
		  }
		);
	}]);


	if (window.location.hostname.indexOf('fairfield.summon.serialssolutions.com') != -1) {
		console.log('it\'s 2.0 Live Site');
		//get Angular $Scope
		//myscope = angular.element('[ng-app=summonApp]').scope();
		//new get Angular $Scope - since it's loading async, have to delay everything a sec
		setTimeout(function() {
			myscope = angular.element('html').scope();
			watchRouteChange();
			watchFeedChange();
			miscHack();
			pageviewTrack();
		}, 1000);


	//watch for route change and do something
	function watchRouteChange( ) {
		myscope.$on('$routeChangeSuccess', function(current) {
			//console.log("routeChangeSuccess current route: %o", current);
			//TODO: need to learn how to get a route name, ok?
			// if its a detail page for citation only, remove any previous hack
			if (window.location.hash.substring(1).indexOf('FETCHMERGED-LOGICAL') != -1) {
					$('#dnlClickHere').remove();
					$('#dnlCustom856').remove();
					$('#dnlMillRequest').remove();
			}
			//if its catalog details page - add all the hacks
			if (window.location.hash.substring(1).indexOf('FETCHMERGED-fairfield_catalog') != -1) {
			//if (myscope.docDetail.visible) {
				console.log("catalog details page open");
				millBibMatch = window.location.hash.match(/fairfield_catalog_b(\d{7})/);
				console.log("Mill bib num is " + millBibMatch[1]);
				dnlItemLoc = $('strong:contains("Library Location")').next().html();
				//remove any previously added click here to view button
				if($('#dnlClickHere').size() > 0){
					$('#dnlClickHere').remove();
				}
				if (dnlItemLoc && dnlItemLoc.indexOf("Online") !== -1) {
					console.log("this item is e-resourece");
					//add click here to view button
					$('div.documentActionsContainer div.documentActions').prepend('<a id="dnlClickHere" class="primary btn ng-binding" href="https://libraryapps.fairfield.edu/summon/js/mill856link.php?bibnum=' + millBibMatch[1] + '" target="_blank" style="display: block;">Click Here to View</a>');
				}

				//console.log($('strong:contains("Library Location")').next().html());
				//remove previously added custom 856
				if($('#dnlCustom856').size() > 0){
					$('#dnlCustom856').remove();
				}
				//remove previously added request it button
				if($('#dnlMillRequest').size() > 0){
					$('#dnlMillRequest').remove();
				}
				//get 856 links from WebPac - this is JSONP
				$.getJSON(
						'https://libraryapps.fairfield.edu/summon/js/get856json.php?bibnum=' + millBibMatch[1] +'&callback=?',
						function(data){
							try{
								var Status = data.status;
								var BibInfo = data.bibinfo;
								var requestAble = data.requestable;
								//console.log(Status);
								//console.log(BibInfo);
								if(Status && Status == "hasLink") {
									$('div.fixed.fullDialog.detailPage div.detailSummary div.summary').append('<div id="dnlCustom856"><ul>' + BibInfo + '</ul></div>');
								}
								//add request it button
								if(requestAble) {
									//console.log("this item is requestable: " + data.requestable);
									$('.documentActions a:contains("Request")').remove();
									$('div.documentActionsContainer div.documentActions').prepend('<a id="dnlMillRequest" class="primary btn ng-binding" href="https://libraryapps.fairfield.edu/summon/js/millrequest.php?bibnum=' + millBibMatch[1] + '" target="_blank" style="display: block;">Request It!</a>');
								}
							} catch(err){
								console.log(err);
							}
						}
					);
			}
		});
	}

		var dnlBookEbookCount;

	//watch feed change
	function watchFeedChange( ) {
		myscope.$watchCollection('feed', function(){
			//check if book/ebook facet is selected - insert custom print books only facet
			//have to delay a tiny bit since the watch event fires a bit before facet is re-populated
			setTimeout(function (){
        var $filter = $( ".Filter a.applied:contains('Book / eBook')" );
				if ($filter.size()) {
					console.log("Book / eBook facet is selected");
					if(!$("a#dnlBookOnlyFacet").size()){
						$filter.after("<div style='display:table-row'><a id='dnlBookOnlyFacet' href='javascript:dnlSearchPrintBookOnly();' style='padding-left: 1em;font-size: 0.9em; display:table-cell;'>Print Book Only</a> <small class='count'><i>(<span ng-bind='count.count | number' class='ng-binding'>Loading...</span>)</i></small></div>");
						console.log("custom print book only facet added!");
						//lets query the API so we get the count of print book only as well, because we can
						var dnlPrintBookOnlyApiUrl = "/api/search?pn=1&ho=t&fvf%5B%5D=Library%2CReference+Online%2Ct&fvf%5B%5D=Library%2COnline%2Ct&fvf%5B%5D=SourceType%2CLibrary+Catalog%2Cf&fvf%5B%5D=ContentType%2CBook+%2F+eBook%2Cf&l=en&q=" + $('input[name=q]').val();
						$.getJSON(dnlPrintBookOnlyApiUrl,function(result){
							printBookCount = result.record_count;
							printBookCount = printBookCount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
							$filter.next().find('span').text(printBookCount);
							console.log("custom print book only count added!");
							var dnlUrl = $(location).attr('href');
							if (dnlUrl.indexOf('fvf=Library,Reference%20Online,t%7CLibrary,Online,t') != -1) {
								console.log("print book only facet applied, refol, ol excluded");
								$filter.next("span:last").text(dnlBookEbookCount);
								$( "a#dnlBookOnlyFacet" ).attr("class","value applied");
								//if user deselect book/ebook facet while printbookonly facet is applied, clear all refinements
								// to make sure the online location excludes are removed
								$filter.click(function() {
									console.log('removing all refinements');
									myscope.$apply(function() { myscope.clearRefinements(); });
									return false;
								});
							} else {
								dnlBookEbookCount = $("a.ng-binding.value.applied:contains('Book / eBook')").next("span:last").text();
							}
						 });
					}
				}
			 }, 1);
		});
	} //watch feed chage()


	function miscHack() {
		//add links and css
		var linksScope = angular.element($('.siteLinks')[1]).scope()
		linksScope.links.links.splice(2,0,{href:'http://libcat.fairfield.edu/',label:'Classic Catalog',type:'custom'})
		linksScope.$apply();

		//Track what type of content user actually click on (with GA)
		//main col
		$('body').on('click', '.availabilityLink:not(:contains("How to Use This")), [click*="openDetailPage(document)"]', function() {
			var $el = $(this).parents('li');
			var doc = angular.element($el).scope().$parent.item.document;
			var contentType = doc.content_type;
			var index = doc.index;
			_gaq.push(['_trackEvent', 'dnlCustomClick', 'clickOnMainResult', 'contentType:' + contentType, index]);
			if (contentType === 'Journal Article') {
			  var summonid = doc.id;
			  var openurl = doc.open_url;
			  _gaq.push(['_trackEvent', 'openArticle', summonid, openurl, index]);
			}
		});
		//preview pane
		$('div#previewMenu').on('click', 'div.previewOptions button.btn:first-of-type:contains("Read Online")', function() {
			var $el = $(this).parents('#preview');
			var doc = angular.element($el).scope().preview.doc.content_type;
			_gaq.push(['_trackEvent', 'dnlCustomClick', 'clickOnPreview', 'contentType:' + contentType]);
		});

		//track syndetics read more
		$('body').on('click','a[href="#show more content"]', function(e) {
			var text = $(e.currentTarget).parents('.syn_body').parent().find('.syn_title').text().trim();
			_gaq.push(['_trackEvent', 'syndetics', 'Read More', text]);
		});

		//track database clicks
		$('body').on('click','.databaseRecommendations a', function(e) {
			var text = $(e.currentTarget).text().trim();
			_gaq.push(['_trackEvent', 'recommender', 'Database', text]);
		});

		//track best bets clicks
		$('body').on('click','.bestBet a', function(e) {
			var text = $(e.currentTarget).text().trim();
			_gaq.push(['_trackEvent', 'recommender', 'Best Bet', text]);
		});
	} //miscHack()

	} else if (window.location.hostname.indexOf('fairfield.preview.summon.serialssolutions.com') != -1) {
		console.log("Preview Site");
	} //end if preview site

	//track url changes as pageviews
	function pageviewTrack() {
		myscope.$on('$locationChangeStart', function(e, next, current) {
		  _gaq.push(['_trackPageview', next.replace('http://fairfield.summon.serialssolutions.com','')]);
		});
    }

}); //end doc ready

	function dnlSearchPrintBookOnly() {
		var dnlQuery = $('input[name=q]').val();
		var dnlUrl = $(location).attr('href');
		//"toggle" the "print book only" facet
		if (dnlUrl.indexOf('Library,Reference%20Online,t%7CLibrary,Online,t') != -1) {
			var dnlPrintBookOnlyHash = "!/search?ho=t&fvf=SourceType,Library%20Catalog,f%7CContentType,Book%20%2F%20eBook,f&l=en&q=" + dnlQuery;
			//var dnlPrintBookOnlyHash = "!/search?ho=t&fvf=f%7CContentType,Book%20%2F%20eBook,f&l=en&q=" + dnlQuery;
		} else {
			var dnlPrintBookOnlyHash = "!/search?ho=t&fvf=Library,Reference%20Online,t%7CLibrary,Online,t%7CSourceType,Library%20Catalog,f%7CContentType,Book%20%2F%20eBook,f&l=en&q=" + dnlQuery;
		}
		window.location.hash = dnlPrintBookOnlyHash;
	}