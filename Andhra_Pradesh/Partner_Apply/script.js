
// ============================================
// INDIA360 - STATE PARTNER APPLICATION
// Andhra Pradesh | Supabase + Cashfree Payment Integration
// ============================================


// 1. SUPABASE CONFIGURATION

const SUPABASE_URL =
    "https://dzxcqyyqfctramvodgmk.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_RD2eXsCjfGwhTSyKmIrUPw_y_prpU-c";


if (!window.supabase || !window.supabase.createClient) {
    throw new Error(
        "Supabase library not found. Add the Supabase CDN script before script.js."
    );
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// 2. COPYRIGHT YEAR

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// 3. ANDHRA PRADESH DISTRICTS

const districts = [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Ananthapuramu",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B.R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Markapuram",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Polavaram",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa"
];

const districtSelect = document.getElementById("district");

if (districtSelect && districtSelect.options.length <= 1) {

    districts.forEach(district => {

        const option = document.createElement("option");

        option.value = district;
        option.textContent = district;

        districtSelect.appendChild(option);

    });

}


// 4. CONDITIONAL OTHER FIELDS

function setupOtherOption(checkboxId, boxId, inputId) {

    const checkbox = document.getElementById(checkboxId);
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);

    if (!checkbox || !box || !input) return;

    function updateOtherField() {

        const selected = checkbox.checked;

        box.classList.toggle("visible", selected);

        input.required = selected;

        if (!selected) {
            input.value = "";
        }

    }

    checkbox.addEventListener("change", updateOtherField);

    updateOtherField();

}


setupOtherOption(
    "languageOther",
    "languageOtherBox",
    "otherLanguages"
);

setupOtherOption(
    "technologyOther",
    "technologyOtherBox",
    "otherTechnologies"
);

setupOtherOption(
    "interestOther",
    "interestOtherBox",
    "otherInterests"
);


// 5. DATE OF BIRTH VALIDATION

const dobInput = document.getElementById("dob");

if (dobInput) {

    dobInput.max = new Date().toISOString().split("T")[0];

}


// 6. LIVE GPS LOCATION

const getLocationBtn = document.getElementById("getLocation");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const accuracyInput = document.getElementById("accuracy");

const locationMessage =
    document.getElementById("locationMessage");


function setLocationMessage(message, className) {

    if (!locationMessage) return;

    locationMessage.textContent = message;
    locationMessage.className = className;

}


if (getLocationBtn) {

    getLocationBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {

            setLocationMessage(
                "Your browser does not support GPS location.",
                "error"
            );

            return;

        }


        if (!window.isSecureContext) {

            setLocationMessage(
                "Location access requires HTTPS or localhost.",
                "error"
            );

            return;

        }


        setLocationMessage(
            "Fetching your current location...",
            ""
        );

        getLocationBtn.disabled = true;
        getLocationBtn.textContent = "Locating...";


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const acc = position.coords.accuracy;

                latitudeInput.value = lat.toFixed(7);
                longitudeInput.value = lng.toFixed(7);

                if (accuracyInput) {

                    accuracyInput.value =
                        Math.round(acc) + " metres accuracy";

                }

                setLocationMessage(
                    "Location captured successfully.",
                    "success"
                );

                getLocationBtn.textContent =
                    "Refresh My Location";

                getLocationBtn.disabled = false;

            },


            function (error) {

                const messages = {

                    1: "Location permission denied. Please allow location access.",

                    2: "Unable to determine your location. Try again.",

                    3: "Location request timed out. Please try again."

                };

                setLocationMessage(
                    messages[error.code] ||
                    "Unable to fetch location.",
                    "error"
                );

                getLocationBtn.textContent = "Try Again";

                getLocationBtn.disabled = false;

            },


            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }

        );

    });

}


// 7. SELF-CONSENT LETTER DOWNLOAD

// If your HTML uses the Google Drive link,
// this section will automatically be skipped.

const downloadConsentButton =
    document.getElementById("downloadConsent");


if (downloadConsentButton) {

    downloadConsentButton.addEventListener("click", function () {

        const letter = `SELF-CONSENT LETTER

To,
The India360 Team

Subject: Consent for State Partner Application

I, _______________________________________,
resident of _______________________________________,

hereby voluntarily apply to become a State Partner
for Andhra Pradesh under the India360 initiative.

I confirm that:

1. The information and documents submitted by me are accurate to the best of my knowledge.

2. I voluntarily express my interest in contributing to the development and representation of Andhra Pradesh through India360.

3. I understand that submitting this application does not guarantee selection or appointment.

4. I agree to follow the applicable guidelines, responsibilities and policies communicated by India360.

5. I consent to being contacted by the India360 team regarding my application.

6. I understand that my application information and documents will be used for application review and related communication, subject to the applicable privacy policy.

Applicant Name: ______________________________

District: ____________________________________

Email: _______________________________________

Mobile Number: _______________________________

Date: _______________________________________

Place: _______________________________________

Signature: ___________________________________
`;


        const blob = new Blob(
            [letter],
            { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");

        downloadLink.href = url;

        downloadLink.download =
            "India360_State_Partner_Self_Consent_Letter.txt";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        downloadLink.remove();

        URL.revokeObjectURL(url);

    });

}


// 8. FORM ELEMENTS

const partnerForm =
    document.getElementById("partnerForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.getElementById("submitBtn");


// 9. MESSAGE FUNCTION

function showMessage(message, type) {

    if (!formMessage) return;

    formMessage.textContent = message;

    formMessage.className = type || "";

    formMessage.style.color =
        type === "success" ? "#16803c" :
        type === "error" ? "#b42318" :
        "#b56a00";

    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// 10. FORM HELPER FUNCTIONS

function getCheckedValues(fieldName) {

    return Array.from(

        document.querySelectorAll(
            `input[name="${fieldName}"]:checked`
        )

    ).map(element => element.value);

}


function getFieldValue(name) {

    const element =
        partnerForm.elements.namedItem(name);

    return element
        ? String(element.value || "").trim()
        : "";

}


function getOptionalElementValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function isChecked(name) {

    const element =
        partnerForm.elements.namedItem(name);

    return Boolean(element && element.checked);

}


function parseAccuracy() {

    if (!accuracyInput || !accuracyInput.value) {
        return null;
    }

    const match =
        accuracyInput.value.match(/[\d.]+/);

    return match ? Number(match[0]) : null;

}


function isValidDriveLink(value) {

    try {

        const url = new URL(value);

        return (
            url.protocol === "https:" &&
            ["drive.google.com", "docs.google.com"]
                .includes(url.hostname)
        );

    } catch {

        return false;

    }

}



// 11. VERIFY CASHFREE PAYMENT WHEN THE CHECKOUT REDIRECTS BACK.
async function verifyReturnedPayment() {
    const params = new URLSearchParams(window.location.search);
    const isReturn = params.get("payment_return") === "1";
    const orderId = params.get("order_id");
    if (!isReturn || !orderId) return;

    const statusBox = document.getElementById("paymentStatus");
    if (statusBox) {
        statusBox.textContent = "Verifying your payment securely. Please wait…";
        statusBox.className = "payment-status pending";
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke(
            "india360-application-payment",
            { body: { action: "verify-payment", order_id: orderId } }
        );
        if (error) throw new Error(error.message || "Payment verification failed.");

        if (data && data.payment_status === "PAID") {
            if (statusBox) {
                statusBox.textContent =
                    "Payment successful. Your Andhra Pradesh State Partner application has been received. Keep your order ID: " + orderId;
                statusBox.className = "payment-status success";
            }
            showMessage("Your application has been submitted successfully after payment verification.", "success");
            if (partnerForm) partnerForm.reset();
        } else {
            const status = (data && data.payment_status) || "PENDING";
            if (statusBox) {
                statusBox.textContent =
                    "Payment status: " + status + ". If money was deducted, do not pay again immediately. Contact India360 with order ID: " + orderId;
                statusBox.className = "payment-status pending";
            }
        }
    } catch (error) {
        console.error("INDIA360 PAYMENT VERIFICATION ERROR:", error);
        if (statusBox) {
            statusBox.textContent =
                "We could not verify the payment right now. Please contact India360 and share order ID: " + orderId;
            statusBox.className = "payment-status error";
        }
    } finally {
        params.delete("payment_return");
        // Keep order_id visible in the address only during verification; clean both after response.
        params.delete("order_id");
        const cleanUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}
verifyReturnedPayment();

// 12. FORM SUBMISSION AND CASHFREE CHECKOUT

if (partnerForm) {

    partnerForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();


            if (formMessage) {

                formMessage.textContent = "";
                formMessage.className = "";

            }


            // HTML FORM VALIDATION

            if (!partnerForm.reportValidity()) {
                return;
            }


            // COLLECT CHECKBOX VALUES

            const languages =
                getCheckedValues("languages");

            const technologies =
                getCheckedValues("technologies");

            const interests =
                getCheckedValues("interests");

            const documents =
                getCheckedValues("documents");


            // VALIDATE LANGUAGES

            if (languages.length === 0) {

                showMessage(
                    "Please select at least one language you know.",
                    "error"
                );

                return;

            }


            // VALIDATE TECHNOLOGIES

            if (technologies.length === 0) {

                showMessage(
                    "Please select at least one technology or skill.",
                    "error"
                );

                return;

            }


            // VALIDATE INTERESTS

            if (interests.length === 0) {

                showMessage(
                    "Please select at least one area of interest.",
                    "error"
                );

                return;

            }


            // VALIDATE GPS

            if (
                !latitudeInput?.value ||
                !longitudeInput?.value
            ) {

                showMessage(
                    "Please capture your current GPS location.",
                    "error"
                );

                getLocationBtn?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;

            }


            // VALIDATE GOOGLE DRIVE LINK

            const driveLink =
                getFieldValue("driveLink");

            if (!isValidDriveLink(driveLink)) {

                showMessage(
                    "Please provide a valid Google Drive folder link.",
                    "error"
                );

                document.getElementById("driveLink")?.focus();

                return;

            }


            // VALIDATE SUPABASE CONFIGURATION

            if (
                SUPABASE_URL.includes("YOUR_SUPABASE") ||
                SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")
            ) {

                showMessage(
                    "Supabase configuration is missing.",
                    "error"
                );

                return;

            }


            // PREPARE DATABASE RECORD

            const applicationData = {

                // PERSONAL INFORMATION

                full_name:
                    getFieldValue("fullName"),

                date_of_birth:
                    getFieldValue("dob"),

                gender:
                    getFieldValue("gender"),

                other_gender:
                    getOptionalElementValue("otherGender") || null,

                email:
                    getFieldValue("email"),

                mobile:
                    getFieldValue("mobile"),

                whatsapp:
                    getFieldValue("whatsapp"),


                // LOCATION DETAILS

                state:
                    getFieldValue("state") || "Andhra Pradesh",

                district:
                    getFieldValue("district"),

                city:
                    getFieldValue("city"),

                pincode:
                    getFieldValue("pincode"),

                full_address:
                    getFieldValue("address"),

                latitude:
                    Number(latitudeInput.value),

                longitude:
                    Number(longitudeInput.value),

                location_accuracy:
                    parseAccuracy(),


                // EDUCATION AND PROFESSION

                education:
                    getFieldValue("education"),

                other_education:
                    getOptionalElementValue("otherEducation") || null,

                occupation:
                    getFieldValue("occupation"),

                other_occupation:
                    getOptionalElementValue("otherOccupation") || null,

                institution:
                    getFieldValue("institution") || null,


                // LANGUAGES

                languages: languages,

                other_languages:
                    getOptionalElementValue("otherLanguages") || null,


                // TECHNOLOGIES

                technologies: technologies,

                other_technologies:
                    getOptionalElementValue("otherTechnologies") || null,


                // CONTRIBUTION

                experience:
                    getFieldValue("experience") || null,

                interests: interests,

                other_interests:
                    getOptionalElementValue("otherInterests") || null,

                motivation:
                    getFieldValue("motivation"),

                contribution:
                    getFieldValue("contribution"),


                // ONLINE PROFILES

                linkedin:
                    getFieldValue("linkedin") || null,

                github:
                    getFieldValue("github") || null,

                portfolio:
                    getFieldValue("portfolio") || null,

                social_profile:
                    getFieldValue("social") || null,


                // DOCUMENT SUBMISSION

                drive_link: driveLink,

                documents: documents,

                video_uploaded:
                    isChecked("videoUploaded"),


                // DECLARATIONS

                accuracy_declaration:
                    isChecked("accuracy"),

                terms_accepted:
                    isChecked("terms"),

                contact_consent:
                    isChecked("consent")

            };


            // DISABLE SUBMIT BUTTON

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }


            // CREATE A PAYMENT ORDER THROUGH THE SECURE EDGE FUNCTION.
            // The application is stored server-side and is not inserted from the browser.
            try {

                const { data, error } = await supabaseClient.functions.invoke(
                    "india360-application-payment",
                    {
                        body: {
                            action: "create-order",
                            application: applicationData
                        }
                    }
                );

                if (error) {
                    let detail = error.message || "Unable to create payment order.";
                    try {
                        const response = error.context;
                        if (response && typeof response.json === "function") {
                            const body = await response.json();
                            detail = body.error || body.message || detail;
                        }
                    } catch (_) {}
                    throw new Error(detail);
                }

                if (!data || !data.payment_session_id || !data.order_id) {
                    throw new Error(
                        (data && data.error) || "Payment session was not returned by the server."
                    );
                }

                if (typeof window.Cashfree !== "function") {
                    throw new Error("Cashfree Checkout SDK did not load. Please refresh and try again.");
                }

                const cashfree = window.Cashfree({ mode: "production" });

                showMessage("Opening secure Cashfree checkout…", "info");

                await cashfree.checkout({
                    paymentSessionId: data.payment_session_id,
                    redirectTarget: "_self"
                });

            } catch (error) {

                console.error("INDIA360 PAYMENT ORDER ERROR:", error);

                showMessage(
                    "Unable to start payment: " +
                    (error.message || "Unknown error") +
                    ". Your application has not been confirmed.",
                    "error"
                );

            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Pay ₹1 and Submit Application →";
                }

            }
        }

    );

}
