// Load InboxSDK first. 1 for local and 2 for remote (generally, use 2.)
InboxSDK.load('2', 'sdk_jrFx1YhXsNTOpN_743395f7dc').then(function(sdk){

	// Waits for the opening of a compose window (either standalone or as part of a thread)
	sdk.Compose.registerComposeViewHandler(function(composeView){

		var numberCCD = composeView.getCcRecipients().length;    // Detect the number of recipients at initiation
		var changedCCD = false;								   	 // Boolean that changes when the number of cc'd recipients changes

		// Detect a cc recipient being added
		composeView.on('ccContactAdded', function(event) {
			numberCCD = composeView.getCcRecipients().length;
			changedCCD = true;
			console.log('cc added');
		});

		// When send is clicked but the message has yet to send
		composeView.on('presending', function(event) {

			// Pull the signature from the compose text
			var sig = findSignature(composeView.getTextContent());
			if (sig != false){
				// Do something with the signature here or below in the fxn
				console.log(sig);
			}

			//Detect the substrings below in the string of the body
			if (checkStrings(composeView.getTextContent())){

				if (numberCCD == 0){ 	 // Detect if there are no recipients cc'd
					alert("You wrote that you'd be copying someone but have none cc'd"); // Send a popup
					event.cancel(); 	 // cancel the email send
				}

				else if (changedCCD == false){ // Detect if there are >0 cc recipients but none have changed (i.e. some were already cc'd)
					alert("You wrote that you'd be copying someone but have yet to cc'd them");
					event.cancel();			   // Cancel the email send
				}

				else {							// This else loop is strictly to demonstrate code flow. It can be removed.
					console.log('Sending email with proper cc recipients');
				}
			}
		});
	});

// detect Message View initiation (i.e user goes to view an email thread). Note: MessageView is CamelCase in the handler but is titleCase messageView everywhere else
	sdk.Conversations.registerMessageViewHandler(function(messageView){
		if (messageView.isLoaded() && messageView.getViewState() == "EXPANDED"){ // i.e. the user is reading that email

			var links = findLinks(messageView.getLinksInBody(), messageView.getDateString());
			console.log('message view working');
			// console.log(messageView.isLoaded()) 				// Boolean. Value should be true
			// console.log(messageView.getViewState())		    // String. Value should be EXPANDED
			// console.log(messageView.getBodyElement());	    // HTML. Gets the actaul HTML of the response in the thread
			// console.log(messageView.getLinksInBody()); 		// List of dicts. Gets both emails and external links, incl signatures
			// console.log(messageView.getSender()) 			// Dict.
			// console.log(messageView.getRecipientsFull()) 	// Promise.
			// console.log(messageView.getDateString());        // Format of Sep 21, 2018, 12:12 AM
			// console.log(composeView.getTextContent())    	// Get string with text from email body
			// console.log(composeView.getCcRecipients())  	 	// List of Dicts with structure [{name: "", emailAddress: ""}]
			// console.log(composeView.getBccRecipients()) 		// List of Dicts with structure [{name: "", emailAddress: ""}]
			// console.log(composeView.getFromContact())   		// Dict with structure {emailAddress: "", name: ""}

		}
	});
}); // End of InboxSDK load


function checkStrings(inputString){ // from here https://stackoverflow.com/questions/5582574/how-to-check-if-a-string-contains-text-from-an-array-of-substrings-in-javascript?rq=1
	var substrings = ["copied","cc'd", "ccd", "looping"];
    length = substrings.length;
	while(length--) { 									   // Iterate throguh the substring list
		if (inputString.indexOf(substrings[length])!=-1) { // One of the substrings is in inputString
			console.log('Found copy substring');
			return true;
	   }
	}
}

/* To pull out someone's signature, we can do one of two things.
   This pulls the plain text of the body of the email, and parses for the --
   That indicates a signature beginning */
function findSignature(inputBodyString){
	if (inputBodyString.includes("--", 0)){   				   // Check for signature delimiter
		var splitString = inputBodyString.split("--");
		var outputString = splitString[splitString.length-1];  // Get the last split string

		/*  Do something with the signature string here. Examples:
		    Regex for phone numbers (use a library like https://github.com/catamphetamine/libphonenumber-js)
		    Substring match for titles (e.g. if 'director' or 'manager' in newline, etc) */

		return outputString;
	}
	return false;
}

function findLinks(inputLinksInBody, inputDateString){
	for (var i in inputLinksInBody) {
		// You can use these vars to export this data
		// Docs on sending data to an external server: https://developer.chrome.com/extensions/xhr
		var linkText = inputLinksInBody[i].text;
		var linkHref = inputLinksInBody[i].href;
		var linkInQuote = inputLinksInBody[i].isInQuotedArea;
		var linkDate = inputDateString;

		// Detect if link is to LinkedIn
		if (linkHref.toLowerCase().includes("linkedin", 0)){
			// Do something here with LinkedIn links
			console.log(linkHref);
		}
		// Detect if link is an email
		// Note: this edge case is in included in case someone emails you someone else's email (i.e. they are not on the email thread but their address is provided in the plain text)
		else if (linkHref.toLowerCase().includes("mailto:", 0)){
			// Do something here with email links
			console.log(linkHref.replace("mailto:",  "")); // Be sure to map any output with the .replace()
		}
		// Detect any other links in the signature
		// Note: isInQuoted Area means it's their signature or a part of the email that has been repeated (i.e. the bottom of a thread)
		else if (linkInQuote === true){
			// Do something here with other signature links
			console.log(linkHref);
		}
	}
}


// If you want to use the raw HTML, you're looking for:
// <div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr">Alec Barrett-Wilsdon<div>206-799-3945</div><div><a href="http://linkedin.com/in/abarrettwilsdon" target="_blank">linkedin.com/in/abarrettwilsdon</a><br></div></div></div></div>

// Also notable:
// composeView.on('destroy', function(event) {}      // when the compose view is closed



