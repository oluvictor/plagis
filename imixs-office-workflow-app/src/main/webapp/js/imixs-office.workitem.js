"use strict";

// workitem scripts

IMIXS.namespace("org.imixs.workflow.workitem");

var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
	"Sep", "Okt", "Nov", "Dec" ];


var documentPreview;			// active document preview 
var documentPreviewIframe;  	// active iFrame
var documentPreviewURL;			// URL for current displayed document
var isWorkitemLoading=true; 	// indicates if the workitem is still loading
var chornicleSize=1;			// default cronicle size (33%)



/**
 * Init Method for the workitem page
 * 
 *  - set history nav
 * 
 */
$(document).ready(function() {
	
	// get chronicle status from cookie
	var c_value = document.cookie;
	imixsOfficeMain.imixs_document=true; // default
	if (c_value.indexOf("imixs.office.document=")>-1) {
		// read cookie data
		imixsOfficeMain.imixs_document=c_value.indexOf("imixs.office.document=true")>-1;
	}
	imixsOfficeMain.imixs_chronicle_comments=true;
	imixsOfficeMain.imixs_chronicle_nav=JSON.parse('{ "comment" : true, "files":true, "version":true, "reference":true }'); 
	
	chornicleSize=imixsOfficeWorkitem.readCookie('imixs.office.document.chronicle');
	if (!chornicleSize || chornicleSize=="") {
		chornicleSize=1;
	}
	
	// init...
	$('.imixs-workitem-chronicle').css('transition','0.0s');
	imixsOfficeWorkitem.updateChronicleWidth();
	
	$('.document-nav').hide();
	
	
	imixsOfficeWorkitem.updateAttachmentLinks();

		
	// set the default preview frame
	documentPreviewIframe=document.getElementById('imixs_document_iframe_embedded');
	
	// autoload first pdf into preview if available.... 
	imixsOfficeWorkitem.autoPreviewPDF();
	
	isWorkitemLoading=false;
});

/*
 * This callback method is triggered by the imxs-faces.js file upload
 * component. The method updates the deep links for uploaded files
 * and loads pdf files into the preview window
 */
function onFileUploadChange() {
	
	$('.document-nav').hide();
	// cancel current preview....
	documentPreviewIframe.src="";
	//contentWindow.location.replace("");
	documentPreviewURL="";
	
	// update deep links
	imixsOfficeWorkitem.updateAttachmentLinks();
		
	// auto preview
	$(".imixsFileUpload_uploadlist_name a").each(
		function(index, element) {						
			var attachmentName=$(this).text();
			if (attachmentName.endsWith('.pdf') || attachmentName.endsWith('.PDF')) {		
				// if we have a pdf and screen is >1800 than maximize preview.
				if (window.innerWidth>=1800 ) {
					imixsOfficeWorkitem.maximizeDocumentPreview();
				}
				//$(this).click();
				imixsOfficeWorkitem.showDocument($(this).text(),$(this).attr('href'));
				return false;
			}
		});
}


// define core module
IMIXS.org.imixs.workflow.workitem = (function() {
	if (!IMIXS.org.imixs.core) {
		console.error("ERROR - missing dependency: imixs-core.js");
	}

	var imixs = IMIXS.org.imixs.core,
	
	readCookie = function(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for (var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	    }
	    return null;
	},
	
	/*
	 * This method loads the first pdf and starts a autopreview
	 */
	autoPreviewPDF = function() {
		$("[id$='dmslist'] .file-open-link").each(
			function(index, element) {
				var attachmentName=$(this).text();
				if (attachmentName.endsWith('.pdf') || attachmentName.endsWith('.PDF')) {		
					// if we have a pdf and screen is >1800 than maximize preview.
					if (window.innerWidth>=1800 ) {
						maximizeDocumentPreview();
					}
					//$(this).click();
					showDocument($(this).text(),$(this).attr('href'));
					return false;
				}
			});			
	},


	/*
	 * This helper method updates the attachment links
     * in the chronicle main view and in the dms list.
     * Attachments are opend in the preview window 
     */ 
	updateAttachmentLinks = function() {
		// update the link action for each file
		// we redirect the href into the iframe target
		$("[id$='dmslist'] .file-open-link").each(
			function(index, element) {						
				$(this).click(function(){
					var file_link=$(this).attr('href');
					//updateIframe(file_link);
					showDocument($(this).text(),file_link);
					// cancel link
				    return false;
				});
			});
			
			
		// we redirect also the href from chronicle into the iframe target
		
		// chronicle-main  attachmentlink
		$("[id$='chronicle-main'] .attachmentlink").each(
		//$(".files a.attachmentlink").each(
			function(index, element) {						
				$(this).click(function(){
					var file_link=$(this).attr('href');
					//updateIframe(file_link);
					showDocument($(this).text(),file_link);
					// cancel link
				    return false;
				});
			});
				
				
		// chronicle-main  attachmentlink
		$(".imixsFileUpload_uploadlist_name a").each(
			function(index, element) {						
				$(this).click(function(){
					var file_link=$(this).attr('href');
					//updateIframe(file_link);
					showDocument($(this).text(),file_link);
					// cancel link
				    return false;
				});
			});
				
						
				
	},
	
	
	

	/*
	 * This method clears the document preview
     * the method is called after a remove click
     */
	clearDocumentPreview = function(event) {
		
		 if (event.status === 'success') {
			
			//documentPreviewIframe.src="";
			documentPreviewIframe.contentWindow.location.replace("");
		    documentPreviewURL="";
			
			updateAttachmentLinks();

		
		
			// autoload first pdf into preview if available.... 
			autoPreviewPDF();
		
		}
	},

	/*
	 * This method hides the document preiview window
	 * and shows the history tab.
	 */
	closeDocumentPreview = function () {	
		minimizeDocumentPreview();
		// switch to chronicle
		$(".chronicle-tab-history").click();
	},

	/*
	 * The method hides the document preiview window and opens 
	 * the document in the minimized preview on the documents tab
	 */
	minimizeDocumentPreview =function () {
		$('.imixs-workitem-form .imixs-form').removeClass('split');
		$('.imixs-workitem-form .imixs-document').removeClass('split');
		$('.imixs-workitem-form .imixs-document').hide();
		$('.imixs-workitem-document-embedded').show();
	
		// set preview cookie
		document.cookie = "imixs.office.document.preview=false";
		documentPreview=$('.imixs-workitem-document-embedded');
	
		// update iframe
		//var documentPreviewURL="";
		/*if (documentPreviewIframe) {
			//currentURL=documentPreviewIframe.src;
			
			documentPreviewURL=documentPreviewIframe.contentWindow.location;
		}*/
		documentPreviewIframe=document.getElementById('imixs_document_iframe_embedded');
		//documentPreviewIframe.src=currentURL;
		documentPreviewIframe.contentWindow.location.replace(documentPreviewURL);
		
		
		if (!isWorkitemLoading) {
			$(".chronicle-tab-documents").click();
		}
	},


	
	/*
	 * The method shows the document preiview window
	 */
	maximizeDocumentPreview = function () {
		$('.imixs-workitem-form .imixs-form').addClass('split');
		$('.imixs-workitem-form .imixs-document').addClass('split');
		$('.imixs-document').show();
		$('.imixs-workitem-document-embedded').hide();
		
		// set preview cookie
		document.cookie = "imixs.office.document.preview=false";
		documentPreview=$('.imixs-document');
		
		// update iframe
		/*var documentPreviewURL="";
		if (documentPreviewIframe) {
			//currentURL=documentPreviewIframe.src;
			documentPreviewURL=documentPreviewIframe.contentWindow.location.href;
		}*/
		documentPreviewIframe=document.getElementById('imixs_document_iframe');
		//documentPreviewIframe.src=currentURL;
		documentPreviewIframe.contentWindow.location.replace(documentPreviewURL);
		
		
	},

	
	/*
	 * reduce the with of the chronicle
	 */
	expandChronicle= function () {
		if (chornicleSize<2) {
			chornicleSize++;
		}
		document.cookie = "imixs.office.document.chronicle=" + chornicleSize + "; path=/";	
		$('.imixs-workitem-chronicle').css('transition','0.3s');
		updateChronicleWidth();
	},

	/*
	 * increase the with of the chronicle
	 */
	shrinkChronicle = function () {
		if (chornicleSize>0) {
			chornicleSize--;
		}
		document.cookie = "imixs.office.document.chronicle=" + chornicleSize + "; path=/";	
		$('.imixs-workitem-chronicle').css('transition','0.3s');
		updateChronicleWidth();
	},
	
	/*
	 * updates the screen size of the chronical frame
	 */	
	updateChronicleWidth=function () {	
		
		if (chornicleSize==2) {
			$('.imixs-workitem-form').css('width','58.3333%');
			$('.imixs-workitem-chronicle').css('width','calc(41.6666% - 30px)');
			$('.imixs-slider-nav .expand').removeClass('typcn-media-play-reverse');
			$('.imixs-slider-nav .expand').addClass('typcn-media-play-reverse-outline');
			return;
		}
		if (chornicleSize==1) {
			$('.imixs-workitem-form').css('width','66.6666%');
			$('.imixs-workitem-chronicle').css('width','calc(33.3333% - 30px)');
			$('.imixs-slider-nav .expand').removeClass('typcn-media-play-reverse-outline');
			$('.imixs-slider-nav .expand').addClass('typcn-media-play-reverse');
			$('.imixs-slider-nav .shrink').removeClass('typcn-media-play-outline');
			$('.imixs-slider-nav .shrink').addClass('typcn-media-play');
			return;
		}	
		if (chornicleSize==0) {
			$('.imixs-workitem-form').css('width','75%');
			$('.imixs-workitem-chronicle').css('width','calc(25% - 30px)');
			$('.imixs-slider-nav .shrink').removeClass('typcn-media-play');
			$('.imixs-slider-nav .shrink').addClass('typcn-media-play-outline');
			return;
		}
	},


	/*
	 * A document loads the current document (link) into the documentPreviewIframe
	 * and displays the document title.
	 
	 */
	showDocument=function (title, link) {	
		if (!link || link=="") {
			return; // no url defined!
		}	
		// cut title if length >64 chars
		if (title.length>64) {
			title=title.substring(0,64)+"...";
		}
		$('.document-title',documentPreview).text(title);
		//documentPreviewIframe.src=link;
		documentPreviewURL=link;
		documentPreviewIframe.contentWindow.location.replace(documentPreviewURL);
		
		
		// update deeplink
		$('.document-deeplink').attr('href',documentPreviewURL);	
		
		// activate preview if minimized!
		if (!isWorkitemLoading && documentPreviewIframe.id==='imixs_document_iframe_embedded') {
			toggleChronicleDocuments();
		}
		
		$('.document-nav').show();
	},

	
	/*
	 * This method toggles into the chronicle documents view
	 */
	toggleChronicleHistory=function () {
		$('.chronicle-tab-history').parent().addClass('active');
		$('.chronicle-tab-documents').parent().removeClass('active');
		$('#imixs-workitem-chronicle-tab-documents').hide();
		$('#imixs-workitem-chronicle-tab-history').show();
		// set a right margin for history view only
		$('.imixs-workitem-chronicle-content').css('width','calc(100% - 30px)');
	
	},
	toggleChronicleDocuments=function () {
		$('.chronicle-tab-documents').parent().addClass('active');
		$('.chronicle-tab-history').parent().removeClass('active');
		$('#imixs-workitem-chronicle-tab-history').hide();
		$('#imixs-workitem-chronicle-tab-documents').show();
		// set a right margin for history view only
		$('.imixs-workitem-chronicle-content').css('width','calc(100% - 0px)');
	},


	printQRCode=function () {
		fenster = window
				.open(
						imixsOfficeMain.contextPath+"/pages/workitems/qrcode_print.jsf?id="+imixsOfficeMain.workitem_uid,
						"message.print",
						"width=760,height=300,status=no,scrollbars=no,resizable=yes");
		fenster.focus();
	};
	

	// public API
	return {
		readCookie : readCookie,
		printQRCode : printQRCode,
		autoPreviewPDF : autoPreviewPDF,
		expandChronicle : expandChronicle,
		shrinkChronicle : shrinkChronicle,
		updateChronicleWidth : updateChronicleWidth,
		clearDocumentPreview : clearDocumentPreview,
		updateAttachmentLinks : updateAttachmentLinks,
		showDocument : showDocument,
		toggleChronicleHistory : toggleChronicleHistory,
		toggleChronicleDocuments: toggleChronicleDocuments,
		minimizeDocumentPreview : minimizeDocumentPreview,
		maximizeDocumentPreview : maximizeDocumentPreview,
		closeDocumentPreview : closeDocumentPreview,
		onFileUploadChange : onFileUploadChange
	};

}());	
	
// Define public namespace
var imixsOfficeWorkitem = IMIXS.org.imixs.workflow.workitem;	
			
	
	