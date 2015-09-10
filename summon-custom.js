/*
* Script to customize Summon UI ver 2
* Hi SerSol, this seems safe enough, if you think this script breaks anything - let us know.
* Many thanks to @daveyp, @mreidsma, and @godmarback
*/

$(document).ready(function() {
    $('head').append('<link rel="stylesheet" href="http://mlib.fairfield.edu/summonjs/custom.css">');
    //fix printing on firefox
	$('body').append('<style>@media print {.overflowHidden{overflow:auto!important;height:auto}}</style>');
	
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
			  var html = '<button class="permalinkButton hidden-phone hidden-tablet"><span style="font-size:120%">&#128279;</span><span class="offscreen">Permalink</span></button>';
			  $linkContainer.parents('.documentSummary').find('.topRight').append(html).find('.permalinkButton').click(function(e) {
				setTimeout(function() {angular.element($linkContainer.children('a')).trigger('click')},0);
			  });
			  $linkContainer.children('a').hide();
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
					$('div.documentActionsContainer div.documentActions').prepend('<a id="dnlClickHere" class="primary btn ng-binding" href="http://library2.fairfield.edu/mill856link.php?bibnum=' + millBibMatch[1] + '" target="_blank" style="display: block;">Click Here to View</a>');
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
						'http://library2.fairfield.edu/summonjs/get856json.php?bibnum=' + millBibMatch[1] +'&callback=?',
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
									$('div.documentActionsContainer div.documentActions').prepend('<a id="dnlMillRequest" class="primary btn ng-binding" href="http://library2.fairfield.edu/millrequest.php?bibnum=' + millBibMatch[1] + '" target="_blank" style="display: block;">Request It!</a>');										
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
			//console.log('Scope.feed changed! - loading finished. cant believe the API is not down today!')
			//check if book/ebook facet is selected - insert custom print books only facet
			//have to delay a tiny bit since the watch event fires a bit before facet is re-populated
			setTimeout(function (){
				if ($( "a.ng-binding.value.applied:contains('Book / eBook')" ).size()) {
					console.log("Book / eBook facet is selected");
					if(!$("a#dnlBookOnlyFacet").size()){
						$( "a.ng-binding.value.applied:contains('Book / eBook')" ).next().after("<div style='display:table-row'><a id='dnlBookOnlyFacet' href='javascript:dnlSearchPrintBookOnly();' style='padding-left: 4em;font-size: 0.9em; display:table-cell;'>Print Book Only</a><span id='dnlPrintBookOnlyCount' class='col count ng-binding' ng-hide='count.negated'>Loading...</span></div>");														 
						console.log("custom print book only facet added!");
						//lets query the API so we get the count of print book only as well, because we can						
						var dnlPrintBookOnlyApiUrl = "/api/search?pn=1&ho=t&fvf%5B%5D=Library%2CReference+Online%2Ct&fvf%5B%5D=Library%2COnline%2Ct&fvf%5B%5D=SourceType%2CLibrary+Catalog%2Cf&fvf%5B%5D=ContentType%2CBook+%2F+eBook%2Cf&l=en&q=" + $('input[name=q]').val();
						//console.log(dnlPrintBookOnlyApiUrl);
						$.getJSON(dnlPrintBookOnlyApiUrl,function(result){
							printBookCount = result.record_count;
							printBookCount = printBookCount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
							//$( "a.ng-binding.value.applied:contains('Book / eBook')" ).next().after("<div style='display:table-row'><a id='dnlBookOnlyFacet' href='javascript:dnlSearchPrintBookOnly();' style='padding-left: 4em;font-size: 0.9em; display:table-cell;'>Print Book Only</a><span class='col count ng-binding' ng-hide='count.negated'>" + printBookCount +"</span></div>");														 
							$( "a.ng-binding.value.applied:contains('Book / eBook')" ).next().next().find('span').text(printBookCount);
							console.log("custom print book only count added!");
							var dnlUrl = $(location).attr('href');
							if (dnlUrl.indexOf('fvf=Library,Reference%20Online,t%7CLibrary,Online,t') != -1) {
								console.log("print book only facet applied, refol, ol excluded");
								//console.log(dnlBookEbookCount);
								$("a.ng-binding.value.applied:contains('Book / eBook')").next("span:last").text(dnlBookEbookCount);
								$( "a#dnlBookOnlyFacet" ).attr("class","value applied");
								//if user deselect book/ebook facet while printbookonly facet is applied, clear all refinements
								// to make sure the online location excludes are removed
								$( "a.ng-binding.value.applied:contains('Book / eBook')" ).click(function() {
									console.log('removing all refinements');
									myscope.$apply(function() { myscope.clearRefinements(); });
									return false;
								});
							} else {
								dnlBookEbookCount = $("a.ng-binding.value.applied:contains('Book / eBook')").next("span:last").text();
								//console.log(dnlBookEbookCount);
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
		$('body').on('click', '.availabilityLink, [click*="openDetailPage(document)"]', function() {
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
		$('body').on('mousedown','a[href="#show more content"]', function(e) {
			var text = $(e.currentTarget).parents('.syn_body').parent().find('.syn_title').text().trim();
			_gaq.push(['_trackEvent', 'syndetics', 'Read More', text]);
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