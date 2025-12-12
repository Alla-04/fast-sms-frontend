// TAB HANDLING //
// Switch between the QR, Email, and SMS tabs
function showTab(tab) {
    // Clear input fields and messages from all other tabs so only the active tab keeps its data
    clearInputsExcept(tab);

    // Hide all three panels so the screen is cleared
    document.getElementById("panel-qr").classList.add("hidden");
    document.getElementById("panel-email").classList.add("hidden");
    document.getElementById("panel-sms").classList.add("hidden");

    // Remove the active highlight from all tabs
    document.getElementById("tab-qr").classList.remove("active");
    document.getElementById("tab-email").classList.remove("active");
    document.getElementById("tab-sms").classList.remove("active");

    // Show only the panel that matches the tab the user clicked
    document.getElementById(`panel-${tab}`).classList.remove("hidden");
    document.getElementById(`tab-${tab}`).classList.add("active");
}

// When the page loads, automatically open the QR tab first
showTab("qr");


// TAB CLEANUP //
// Clears input fields and messages from tabs that are NOT currently active
// This prevents old text from remaining when the user switches between tabs
function clearInputsExcept(activeTab) {

    // If the user is leaving the QR tab, reset everything related to QR generation
    if (activeTab !== "qr") {
        document.getElementById("qrCodeURL").value = ""; // Clear the URL input
        qrCodeImage.style.display = "none";              // Hide the QR image
        qrCodeImageBox.style.display = "none";           // Hide the QR container
        qrSuccessMessage.innerHTML = "";                 // Remove success message
        qrCodeError.innerHTML = "";                      // Remove error message
        downloadButton.style.display = "none";           // Hide download button
    }

    // If the user switches away from Email, clear both Basic and Advanced form data
    if (activeTab !== "email") {
        document.getElementById("emailRecipientsBasic").value = "";   // Clear basic recipients
        document.getElementById("emailSubjectBasic").value = "";      // Clear basic subject
        document.getElementById("emailSurveyBasic").value = "";       // Clear survey link
        document.getElementById("emailRecipientsAdv").value = "";     // Clear advanced recipients
        document.getElementById("emailSubjectAdv").value = "";        // Clear advanced subject
        document.getElementById("emailBodyAdv").value = "";           // Clear email body
        document.getElementById("messageBoxBasic").innerHTML = "";    // Clear basic status message
        document.getElementById("messageBoxAdvanced").innerHTML = ""; // Clear advanced status message
    }

    // If the user leaves the SMS tab, clear phone numbers, message, and status
    if (activeTab !== "sms") {
        document.getElementById("smsPhones").value = "";         // Clear phone numbers input
        document.getElementById("smsMessage").value = "";        // Clear SMS message text
        document.getElementById("smsMessageBox").innerHTML = ""; // Clear SMS status message
    }
}


// QR CODE GENERATION //
// These variables connect JavaScript to the QR code elements on the page 
let qrCodeImageBox = document.getElementById("qrCodeImageBox");
let qrCodeImage = document.getElementById("qrCodeImage");
let qrCodeURL = document.getElementById("qrCodeURL");
let downloadButton = document.getElementById("downloadButton");
let qrCodeError = document.getElementById("qrCodeError");
let qrSuccessMessage = document.getElementById("qrSuccessMessage");

// Function to Generate QR Code
function generateQRCode() {

    if (qrCodeURL.value.trim().length > 0) {

        // Clear previous error
        qrCodeError.innerText = "";

        // Generate QR
        qrCodeImage.src =
            "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(qrCodeURL.value);

        // Show QR Image
        qrCodeImage.style.display = "block";
        qrCodeImageBox.style.display = "flex";

        // Show download button
        downloadButton.style.display = "block";

        // Clear input
        qrCodeURL.value = "";

        // SHOW SUCCESS MESSAGE
        qrSuccessMessage.innerText = "QR Code generated successfully!";
        qrSuccessMessage.style.display = "block";

    } else {
        // Bowser handles errors via "required"
        return;
    }
}

// Function to Download QR Code
function downloadQRCode() {

    // If QR code does not exist yet
    if (!qrCodeImage.src || qrCodeImage.style.display === "none") {
        // Show error message instead of alert
        qrCodeError.innerHTML = "<p style='color:red;'>Please generate a QR code before downloading.</p>";
        return;
    }

    // Fetch the QR code image file
    fetch(qrCodeImage.src)
        .then(response => response.blob()) // Convert image to a file-like blob
        .then(blob => {
            // Create a temporary download link
            const url = URL.createObjectURL(blob);

            // Create hidden <a> tag to auto-trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = "qr_code.png";  // Name of file when downloaded

            // Add link to page and click it
            document.body.appendChild(a);
            a.click();

            // Remove link after downloading
            a.remove();

            // Free memory from the temporary file link
            URL.revokeObjectURL(url);
        })
        // If downloading fails, show an error message
        .catch(() => {
            qrCodeError.innerHTML = "<p style='color:red;'>Unable to download the QR code. Please try again.</p>";
        });
}


// EMAIL DISTRIBUTION //
// Switch between the Basic Email form and Advanced Email form
function showEmailForm(type) {
    // Hide both email forms
    document.getElementById("basicEmailForm").classList.add("hidden");
    document.getElementById("advancedEmailForm").classList.add("hidden");

    // Remove the active style from both subtabs
    document.getElementById("subtab-email-basic").classList.remove("sub-active");
    document.getElementById("subtab-email-advanced").classList.remove("sub-active");

    // Show the form the user selected (basic or advanced)
    document.getElementById(type === "basic" ? "basicEmailForm" : "advancedEmailForm").classList.remove("hidden");
    document.getElementById(`subtab-email-${type}`).classList.add("sub-active");

    // Clear both error messages to avoid duplicates
    document.getElementById("messageBoxBasic").innerHTML = "";
    document.getElementById("messageBoxAdvanced").innerHTML = "";
}

// Set Basic as the default form when the page loads
showEmailForm("basic");

// Initialize EmailJS
emailjs.init({ publicKey: "t52rDOCv2BwEZA36o" });

// EMAIL DISTRIBUTION - BASIC FORM
// This function sends the survey email to one or multiple recipients using EmailJS
function sendEmailBasic() {
    // Get the list of recipient emails and split by comma, trim spaces, remove empty items
    let recipients = document.getElementById("emailRecipientsBasic").value
    .split(",")
    .map(r => r.trim())
    .filter(r => r !== "");  

    // Get the user input from the form fields
    const subject = document.getElementById("emailSubjectBasic").value.trim();
    const survey = document.getElementById("emailSurveyBasic").value.trim();
    const box = document.getElementById("messageBoxBasic");

    // Show message while sending emails
    box.innerHTML = "<p style='color:#0A2540;'>Sending emails...</p>";

    // Counters to track how many emails succeeded or failed
    let success = 0;
    let fail = 0;

    // Loop through each recipient email
    recipients.forEach(rec => {
        const email = rec.trim();
        if (!email) return;

        // Send the email using EmailJS with your service + template
        emailjs.send("service_uqg41sp", "template_tq7ho68", {
            subject: subject,
            email: email,
            survey: survey
        })
        // If the email is sent successfully, update success counter
        .then(() => {
            success++;
            updateBasicStatus();
        })
        // If sending fails, update fail counter
        .catch(() => {
            fail++;
            updateBasicStatus();
        });
    });

    // Function to update the status message after each send
    function updateBasicStatus() {
        const total = success + fail; // Total processed emails
        // Only update when all emails have been attempted
        if (total === recipients.length) {
            // If no failures occurred
            if (fail === 0) {
                box.innerHTML = `<p style='color:green;'> All emails sent successfully! (${success}/${total})</p>`;
            // If some emails failed
            } else {
                box.innerHTML = `<p style='color:orange;'> ${success}/${total} sent, ${fail} failed</p>`;
            }
        }
    }

    // Clear the input fields after sending
    document.getElementById("emailRecipientsBasic").value = "";
    document.getElementById("emailSubjectBasic").value = "";
    document.getElementById("emailSurveyBasic").value = "";
    document.getElementById("messageBoxAdvanced").innerHTML = "";
}


// EMAIL DISTRIBUTION - ADVANCED FORM
// This function sends customized emails where the user can write their own message body,
// and the overall sending process works the same way as the basic email form
function sendEmailAdvanced() {
    let recipients = document.getElementById("emailRecipientsAdv").value
    .split(",")
    .map(r => r.trim())
    .filter(r => r !== "");   
    
    const subject2 = document.getElementById("emailSubjectAdv").value.trim();
    const body = document.getElementById("emailBodyAdv").value.trim();
    const box = document.getElementById("messageBoxAdvanced");

    box.innerHTML = "<p style='color:#0A2540;'>Sending emails...</p>";

    let success = 0;
    let fail = 0;

    recipients.forEach(rec => {
        const email2 = rec.trim();
        if (!email2) return;

        emailjs.send("service_uqg41sp", "template_56gxkbu", {
            subject2: subject2,
            body: body,
            email2: email2
        })
        .then(() => {
            success++;
            updateAdvStatus();
        })
        .catch(() => {
            fail++;
            updateAdvStatus();
        });
    });

    function updateAdvStatus() {
        const total = success + fail;
        if (total === recipients.length) {
            if (fail === 0) {
                box.innerHTML = `<p style='color:green;'> All emails sent successfully! (${success}/${total})</p>`;
            } else {
                box.innerHTML = `<p style='color:orange;'> ${success}/${total} sent, ${fail} failed</p>`;
            }
        }
    }

    document.getElementById("emailRecipientsAdv").value = "";
    document.getElementById("emailSubjectAdv").value = "";
    document.getElementById("emailBodyAdv").value = "";
    document.getElementById("messageBoxBasic").innerHTML = "";
}


// Extracts all email addresses from an uploaded CSV/Excel file
function extractEmails(file, id) {
    const reader = new FileReader(); // Create a FileReader to read the contents of the uploaded file

    reader.onload = function(e) {
        // Convert the file into an Excel workbook that JavaScript can read
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        // Convert the first sheet of the workbook into simple row data
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        // Store all valid emails found in the file
        const validEmails = [];

        // Loop through every cell in every row to find email addresses
        rows.forEach(row => row.forEach(cell => {
            // If the cell is text and contains an @ symbol, treat it as an email
            if (typeof cell === "string" && cell.includes("@")) {
                validEmails.push(cell.trim());
            }
        }));

        // Insert all found emails into the target input box, separated by commas
        document.getElementById(id).value = validEmails.join(", ");
    };

    // Start reading the uploaded file so the onload function can process it
    reader.readAsArrayBuffer(file);
}


// SMS DISTRIBUTION //
// This function sends SMS messages by forwarding the phone numbers + message to the backend server
function sendSMS() {
    // Get the phone numbers, split them by comma, remove spaces, and remove empty entries
    const phones = document.getElementById("smsPhones").value
        .split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const message = document.getElementById("smsMessage").value.trim(); // Get the message the user typed
    const box = document.getElementById("smsMessageBox"); // Box where we show status messages to the user

    // Let the user know that sending has started
    box.innerHTML = "<p style='color:#0A2540;'>Sending...</p>";

    // Counters for total success and failure results
    let success = 0;
    let fail = 0;

    // Loop through each number so we can track each individual message result
    phones.forEach(num => {
        // Send one SMS per phone number using backend API
        fetch("https://fast-sms-backend.onrender.com/twilio-send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneList: [num], message })
        })
        .then(res => res.json()) // Convert backend response into usable JavaScript object
        .then(data => { // Check the result sent back from the backend

            // Backend success then increase success counter
            if (data.success) success++;
            // Backend failure then increase fail counter
            else fail++;

            // Update UI each time one message attempt finishes
            updateSMSStatus();
        })
        .catch(() => {
            // If the request itself fails (no connection, server crash, etc.)
            fail++;
            updateSMSStatus();
        });
    });

    
    // Function to update the final results once ALL SMS attempts are complete
    function updateSMSStatus() {
        const total = success + fail; // How many messages have finished processing

        // Only show final output after every phone number has been attempted
        if (total === phones.length) {

            // Case 1: No failures then print success
            if (fail === 0) {
                box.innerHTML = `<p style='color:green;'>All SMS sent successfully! (${success}/${total})</p>`;
            // Case 2: Some failures happened show number of failed
            } else {
                box.innerHTML = `<p style='color:orange;'>${success}/${total} sent, ${fail} failed</p>`;
            }
        }
    }
}


// Extracts phone numbers from an uploaded CSV/Excel file
function extractPhones(file, id) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        const validPhones = [];

        rows.forEach(row => row.forEach(cell => {
            // Convert numbers to strings in case Excel parsed them as numeric values
            if (typeof cell === "number") cell = cell.toString();

            // If the cell is a string and matches a phone number pattern with an optional + sign followed by at least 8 digits
            if (typeof cell === "string" && cell.match(/^\+?[0-9]{8,}$/)) {
                validPhones.push(cell.trim());
            }
        }));

        document.getElementById(id).value = validPhones.join(", ");
    };

    reader.readAsArrayBuffer(file);

}
