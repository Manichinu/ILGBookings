var EventID;
var StartDate;
var EndDate;
var slotBookingStartTime;
var SlotBookingEndTime;
var slotDuration;
var timeSlots = [];
var Count = 0;
var bookings = [];
var userName;
var phoneNo;
var emailId;
var NameLength;
var NoofAttendees;
var BrandID = [];
var BrandObject;
var DateCount = 0;
var pastSlots = [];
var MapLink;
var EventName;
var Template;
var BrandImages = [];
var BookingApprovedCounts = []
var UserEventID;
var UserID;


$(document).ready(function () {
    const searchParams = new URLSearchParams(window.location.search);
    const hasEventID = searchParams.has("e_02");
    if (hasEventID) {
        EventID = searchParams.get("e_02");
        UserEventID = searchParams.get("e_02");
        // getEventsMaster();
        getRSVPEventBookingTransaction();
    } else {
    }
    $('#number').keypress(function (e) {
        var charCode = (e.which) ? e.which : event.keyCode
        if (String.fromCharCode(charCode).match(/[^0-9]/g))
            return false;
    });
    $("#name").on('keyup', function (e) {
        nameHandler(e);
    });
    $("#number").on('keyup', function (e) {
        phoneHandler(e);
    });
    $("#email").on('keyup', function (e) {
        emailHandler(e);
    });

})
function getEventsMaster() {
    getEventBookingTransaction();
    getBrandsMaster();
    var Items = {
        "url": "https://prod-10.uaecentral.logic.azure.com:443/workflows/9a6d4449d1cb45848a25b73aa1514a0b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=4xHKwpYWyjFyG16vDDdcFFcOy6RkQ_GRnQ9aqq_F75U",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        BrandID = []
        for (var i = 0; i < response.length; i++) {
            if (response[i].EventID == EventID) {
                $("#company_name").text(response[i].CompanyName);
                $("#event_name").val(response[i].EventName)
                $("#location").attr("href", response[i].Map);
                $("#venue").val(response[i].Venue)
                $("#start_month").text(moment(response[i].StartDate, "DD-MM-YYYY").format("MMM"));
                $("#start_date").text(moment(response[i].StartDate, "DD-MM-YYYY").format("DD"));
                $("#end_month").text(moment(response[i].EndDate, "DD-MM-YYYY").format("MMM"));
                $("#end_date").text(moment(response[i].EndDate, "DD-MM-YYYY").format("DD"));
                NoofAttendees = response[i].MaxNoofAttendees;
                StartDate = response[i].StartDate;
                EndDate = response[i].EndDate;
                slotBookingStartTime = response[i].SlotStartTime;
                SlotBookingEndTime = response[i].SlotEndTime;
                SlotDuration = response[i].SlotDurationTime;
                MapLink = response[i].Map;
                EventName = response[i].EventName;
                Template = response[i].Template1 == true ? "temp1" : "temp2";
                response[i].Brand.map((item) => {
                    BrandID.push(item.Id)
                })
            }
        }
        setTimeout(() => {
            BrandID.map((item) => {
                BrandImages.map((img) => {
                    if (item == img.ID) {
                        $(".brand_images").append(` <li style="height: 40px;
                        margin-bottom: 0 !important;margin-right:10px;">
                    <img src="${img.Base64Image}" style="width: 40px;height: calc(100% - 20px);" />            
                    <p style="height: 20px;
    margin-top: 10px;
    margin-bottom: 0;">${img.Title}</p>
                </li>`)
                    }
                })
            })
        }, 1000)

        BrandObject = BrandID.map(value => ({ Id: value }));
        // Parse the date strings to create Date objects
        var startDateParts = StartDate.split('-');
        var endDateParts = EndDate.split('-');
        var startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
        var endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);

        // Array to store the dates in between
        var datesInRange = [];
        DateCount = 0;
        // Iterate through the dates and add them to the array
        for (var currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            datesInRange.push(new Date(currentDate));
        }
        // Convert the dates to string format if needed
        var datesInRangeStrings = datesInRange.map((date, index) => {
            var Date = date.toLocaleDateString();
            var Month = moment(Date, "MM/DD/YYYY").format("MMM");
            var Day = moment(Date, "MM/DD/YYYY").format("DD");
            if (moment(Date, "MM/DD/YYYY").isBefore(moment(), 'day')) {
                $("#inbetween_dates").append(`<div class="date-picker f-left date-closed">
            <p class="mnth-name">${Month}</p>
            <h3 class="date-no">${Day}</h3>
        </div>`)
            } else {
                DateCount += 1;
                $("#inbetween_dates").append(`<div class="date-picker f-left dates" id="date-${DateCount}" onclick="setTimeSlots('${Date}')">
            <p class="mnth-name">${Month}</p>
            <h3 class="date-no">${Day}</h3>
        </div>`)
            }
        });
        $(".dates").on('click', function () {
            $(".date-picker").removeClass('active');
            $(this).addClass('active');
        })
        setTimeout(() => {
            $("#date-1").trigger('click');
        }, 200)

        // check EndDate is Expired or not       
        if (moment(EndDate, "DD-MM-YYYY").isBefore(moment(), 'day')) {
            setTimeout(() => {
                $("#loader-Icon").css("display", "none");
                $("#event_expired").show();
                $(".version-update").hide();
                $(".appointment-book-form").empty();
            }, 500);
        } else {
            setTimeout(() => {
                $("#loader-Icon").css("display", "none");
                $(".appointment-book-form").css("display", "");
            }, 500);
        }
    });
}
function setTimeSlots(date) {
    var CurrenttDate = moment().format("YYYY-MM-DD")
    const generatedTimeSlots = generateTimeSlotsArray(slotBookingStartTime, SlotBookingEndTime, SlotDuration, date);
    timeSlots = [];
    pastSlots = [];
    timeSlots = generatedTimeSlots;
    $("#slots").empty();
    timeSlots.map((item, key) => {
        var pastTime = item.split('to')
        var TrimValue = pastTime[1].trim()
        pastSlots.push(TrimValue)
        if (CurrenttDate == moment(date, "MM/DD/YYYY").format("YYYY-MM-DD")) {
            $("#slots").append(`  
            <li  key='${item}'
            class="leavedays-wrapper-OutOfc eve_slot"
            onclick="handleTimeSlotSelection(event,'${item}')"
            id='${CurrenttDate}-${TrimValue}'
            >
             ${item}
             </li>`)
        } else {
            $("#slots").append(`  
            <li  key='${item}'
            class="leavedays-wrapper-OutOfc eve_slot"
            onclick="handleTimeSlotSelection(event,'${item}')"
            >
             ${item}
             </li>`)
        }

    })
    // getEventBookingTransaction();
    const groupedByDateTime = BookingApprovedCounts.reduce((result, item) => {
        const key = `${item.AppointmentDate}_${item.AppointmentStartTime}_${item.AppointmentEndTime}`;
        (result[key] = result[key] || []).push(item);
        return result;
    }, {});
    // Iterate through the grouped items and log each name
    Object.values(groupedByDateTime).forEach(items => {
        var ApprovedCount = 0;
        items.map(val => {
            if (val.Status.Value == "Approved") {
                ApprovedCount += 1;
            }
        });
        if (ApprovedCount >= NoofAttendees) {
            var Date = moment(items[0].AppointmentDate, "DD-MM-YYYY").format("YYYY-MM-DD");
            var Key = `${Date} | ${items[0].AppointmentStartTime} to ${items[0].AppointmentEndTime}`
            $('li[key="' + Key + '"]').addClass('closed');
            $('li[key="' + Key + '"]').removeAttr('onclick');
        }
    });
    const currentTime = moment();
    pastSlots.map((item) => {
        const slotTime = moment(item, 'hh:mm A');
        const elementId = `${CurrenttDate}-${item}`;
        if (slotTime.isBefore(currentTime)) {
            $("li[id='" + elementId + "']").addClass('closed')
            $("li[id='" + elementId + "']").removeAttr('onclick')
        }
    })
    bookings.map((item) => {
        var Date = moment(item.selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        $(`li[key='${Date} | ${item.startTime} to ${item.endTime}']`).addClass('select');
    })
}
function generateTimeSlotsArray(startTime, endTime, slotDuration, startDate) {
    const timeSlots = [];
    var Start = moment(startDate, "MM/DD/YYYY").format("YYYY-MM-DD");
    let currentTime = new Date(`${Start}T${startTime}`);//2023-01-01
    const endTimeObj = new Date(`${Start}T${endTime}`);
    while (currentTime < endTimeObj) {
        const startTimeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        // Add fractional part of the slotDuration to minutes
        const minutesToAdd = Math.floor(slotDuration) * 60 + Math.round((slotDuration % 1) * 60);
        currentTime.setMinutes(currentTime.getMinutes() + minutesToAdd);
        const endTimeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        timeSlots.push(`${Start} | ${startTimeString} to ${endTimeString}`);
    }
    return timeSlots;
}
function handleTimeSlotSelection(event, value) {
    const clickedLiElement = event.currentTarget;
    clickedLiElement.classList.add('select');
    const timeString = event.target.textContent;
    if (timeString) {
        const timeArray = timeString.split("to");
        var parts = timeString.split('|');
        var storeStartTime = parts[1].trim();
        storeStartTime = storeStartTime.split("to");
        storeStartTime = storeStartTime[0].trim();
        const storeEndTime = timeArray[1].trim();
        var Date = timeString.split('|')
        var selectedDateValue = Date[0].trim()

        // Use a unique identifier based on the time range
        const uniqueIdentifier = `${selectedDateValue} | ${storeStartTime} to ${storeEndTime}`;

        // Check if the booking with the same time range already exists
        const isBookingExists = bookings.some(
            (booking) => booking.uniqueIdentifier === uniqueIdentifier
        );
        if (!isBookingExists) {
            Count += 1
            const bookingID = "EVE-" + moment().format("DDMMYYYYHHmmss") + Count;
            const newBooking = {
                id: bookingID,
                startTime: storeStartTime,
                endTime: storeEndTime,
                selectedDate: moment(selectedDateValue).format("DD-MM-YYYY"),
                uniqueIdentifier,
                slotTime: "" + storeStartTime + " to " + storeEndTime + ""
            };
            // Update the state with the new booking
            bookings.push(newBooking)
            $("#booked_slots").empty();
            bookings.map((item, key) => {
                $("#booked_slots").append(` <tr key=${item.id}>
                    <td>${item.selectedDate}</td>
                    <td>${item.startTime}</td>
                    <td>${item.endTime}</td>
                    <td><img src="./img/close-red.svg" class="action-close" onclick="removeHandler('${item.id}')"></td>
                </tr>`)
            })
            if (!userName || !emailId || !phoneNo || timeSlots.length === 0 || bookings.length === 0 || NameLength == false) {
                $("#submit").prop("disabled", true);
            } else {
                $("#submit").prop("disabled", false);
            }

        } else {
            // console.log('Booking already exists for this time range.');
        }
    } else {
        console.error("Invalid TimeString:", timeString);
    }

}
function removeHandler(bookingID) {
    // Find the booking with the specified ID
    const removedBooking = bookings.find((booking) => booking.id === bookingID);
    // Filter out the booking with the specified ID
    const updatedBookings = bookings.filter((booking) => booking.id !== bookingID);
    // Add the class to the corresponding li element based on the unique identifier
    if (removedBooking) {
        const liElements = document.querySelectorAll('li.leavedays-wrapper-OutOfc');
        liElements.forEach(li => {
            const liUniqueIdentifier = li.getAttribute('key');
            if (liUniqueIdentifier === removedBooking.uniqueIdentifier) {
                li.classList.remove('select');
            }
        });
    }
    // Update the state with the filtered bookings
    bookings = [];
    bookings = updatedBookings;
    $("#booked_slots").empty();
    bookings.map((item) => {
        $("#booked_slots").append(` <tr key=${item.id}>
        <td>${item.selectedDate}</td>
        <td>${item.startTime}</td>
        <td>${item.endTime}</td>
        <td><img src="./img/close-red.svg" class="action-close" onclick="removeHandler('${item.id}')"></td>
    </tr>`)
    })
    if (!userName || !emailId || !phoneNo || timeSlots.length === 0 || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }

};
function nameHandler(event) {
    const enteredName = event.target.value.trim();
    const fnameregex = /^[a-zA-Z][a-zA-Z ]*$/;
    const hasSpecialCharacter = /[!@#$%^&*;,<>'"|+]/.test(enteredName);


    if (enteredName.length < 3) {
        // Handle case when length is less than 3 or empty
        userName = enteredName,
            NameLength = false;
        $("#fname-error").show();
        $("#fname-error").text("Name should be at least 3 characters long.");
    }
    else if (hasSpecialCharacter) {
        // Handle case when a special character is present     
        userName = enteredName,
            NameLength = false;
        $("#fname-error").show();
        $("#fname-error").text("Invalid name format.");
    } else if (!enteredName.match(fnameregex)) {
        // Handle case when the name doesn't match the regex 
        userName = enteredName,
            NameLength = false;
        $("#fname-error").show();
        $("#fname-error").text("Invalid name format.");
    } else {
        // Valid name
        NameLength = true;
        userName = enteredName,
            $("#fname-error").hide();
    }

    if (!userName || !emailId || !phoneNo || timeSlots.length === 0 || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }
    if (userName == "") {
        $("#fname-error").text("This field is required");
    }
}
function phoneHandler(event) {
    const enteredPhone = event.target.value.trim();
    const phonereg = /^[+\d][\d]*$/;
    const hasAlphabets = /[a-zA-Z]/.test(enteredPhone);
    const hasSpecialCharacters = /[!@#$%^&*;,<>'"|]/.test(enteredPhone);

    if (hasAlphabets || hasSpecialCharacters) {
        // Handle case when phone has alphabets or special characters
        phoneNo = "";
        $("#phone-error").show();
        $("#phone-error").text("Phone should not contain alphabets or special characters.");
    } else if (!enteredPhone.match(phonereg)) {
        // Handle case when phone doesn't match the regex
        phoneNo = "",
            $("#phone-error").show();
        // $("#phone-error").text("Invalid phone format.");
    } else {
        // Valid phone
        phoneNo = enteredPhone,
            $("#phone-error").hide();
    }
    if (!userName || !emailId || !phoneNo || timeSlots.length === 0 || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }

}
function emailHandler(event) {
    const enteredEmail = event.target.value.trim();
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

    if (!enteredEmail.match(mailformat)) {
        // Handle case when email doesn't match the regex
        emailId = "";
        // alert("test")
        $("#email-error").show();
        $("#email-error").text("Invalid email format");
    } else {
        // Valid email
        emailId = enteredEmail;
        // Check if the entered email matches the additional format
        if (!enteredEmail.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
            emailId = "",
                this.setState({
                    // emailId: "",
                    emailError: "Invalid email format",
                });
            $("#email-error").show();
            $("#email-error").text("Invalid email format");
            return;
        }
        $("#email-error").hide();
    }
    if (enteredEmail == "") {
        $("#email-error").text("This field is required");
    }
    if (!userName || !emailId || !phoneNo || timeSlots.length === 0 || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }

}
function reqoff() {
    $("#StoreBookingURL").hide();
    location.reload();
}
async function saveEventDetails() {
    $("#pending").show();
    var savedItems = []
    try {
        const ajaxPromises = bookings.map((item, key) => {
            return new Promise((resolve, reject) => {
                var postItem = {
                    url: "https://prod-20.uaecentral.logic.azure.com:443/workflows/4a9f67689d304ae1a2af26b16b450f92/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-TAoPfI6APjpUi9mUZ2rFwKsfbAL1gbqpRDBFK5UwaE",
                    method: "POST",
                    timeout: 0,
                    cors: true,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        "Accept": "application/json; odata=nometadata",
                        "Content-Type": "application/json; odata=nometadata"
                    },
                    "data": JSON.stringify({
                        Name: userName,
                        Email: emailId,
                        Number: parseInt(phoneNo),
                        Venue: $("#venue").val(),
                        AppointmentStartTime: item.startTime,
                        AppointmentEndTime: item.endTime,
                        AppointmentDate: item.selectedDate,
                        EventID: EventID,
                        RequestFrom: "User",
                        Map: $("#location").attr('href'),
                        UserID: `UEID-${moment().format("DDMMYYYYHHmmssSSS")}-${key}`,
                        QRCodeText: generateRandomAlphaNumeric(),
                        Brand: BrandObject,
                        EventName: $("#event_name").val()
                    }),
                };

                $.ajax(postItem)
                    .done(function (response) {
                        savedItems.push(response[0])
                        console.log(savedItems)
                        if (Template == "temp1") {
                            $(".Template1").show();
                            $("#qr-code1").empty()
                            $("#txt-pdf_eventname_temp1").text("" + EventName + "");
                        } else {
                            $(".Template2").show();
                            $("#qr-code2").empty()
                            $("#txt-pdf_eventname_temp2").text("" + EventName + "");
                        }

                        $(".pdf_username").text(userName);
                        $(".pdf_usernumber").text(phoneNo);
                        $(".pdf_useremail").text(emailId);
                        $(".pdf_map").attr("href", MapLink);
                        $(".pdf_map").text(MapLink);
                        $(".qr_number").text(response[0].QRCodeText)
                        generateQrCode(response[0].ID);

                        $(".table_date").text(response[0].AppointmentDate);
                        $(".table_slot").text("" + response[0].AppointmentStartTime + " to " + response[0].AppointmentEndTime + "");
                        // $(".qr_date").text(moment(response[0].AppointmentDate, "DD-MM-YYYY").format('MMM DD, YYYY'));
                        $(".qr_date").text(moment(response[0].AppointmentDate, "DD-MM-YYYY").format('YYYY-MM-DD'));
                        const startTimeCount = new Date(`2000-01-01T${response[0].AppointmentStartTime}`);
                        const endTimeCount = new Date(`2000-01-01T${response[0].AppointmentEndTime}`);
                        // Calculate the duration in milliseconds
                        const durationInMilliseconds = endTimeCount - startTimeCount;

                        // Convert milliseconds to hours
                        const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
                        $(".slot_hour").text(durationInHours + " hour")
                        $('.qrl-img img').css({ width: "100%" });
                        $('.qrl-img img').css("cssText", "width: 100% !important;");


                        resolve(response); // Resolve the promise after successful AJAX call
                    })
                    .fail(function (error) {
                        console.error('Error in AJAX request:', error);
                        reject(error); // Reject the promise in case of an error
                    });
            });
        });

        // Wait for all promises to settle
        const responses = await Promise.all(ajaxPromises);

        responses.forEach(response => {
            // Handle each response individually if needed
        });

        // Create a new JSZip instance
        var zip = new JSZip();

        // Create an empty array to hold the PDF file contents
        var pdfContents = [];

        // Iterate over bookings to generate PDFs and add them to the zip
        if (bookings.length != 0 && bookings.length == 1) {
            var element;
            if (Template == "temp1") {
                element = document.getElementsByClassName('Template1');
            } else {
                element = document.getElementsByClassName('Template2');
            }
            // html2pdf(element);

            html2canvas(element).then(function (canvas) {
                var imgWidth = 200;
                var imgHeight = canvas.height * imgWidth / canvas.width;
                const imgData = canvas.toDataURL('image/png');
                const mynewpdf = new jsPDF('p', 'mm', 'a4');
                var position = 0;
                // Set the scale for the content
                //var scale = 1.2; // Adjust this value to zoom in or out as needed

                // mynewpdf.addImage(imgData, 'JPEG', 5, position, imgWidth * scale, imgHeight * scale);
                mynewpdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);

                // Define page dimensions (A4)
                var pageWidth = 210; // in millimeters
                var pageHeight = 297; // in millimeters

                // Define the link coordinates
                var linkCoordinates = {
                    xPercent: 0.22, // 22% from the left edge of the page
                    yPercent: 0.129, // 12.9% from the top edge of the page
                    width: 13, // Width of the link area
                    height: 3, // Height of the link area
                    url: '' + MapLink + '' // URL for the link
                };

                // Calculate the actual coordinates based on the page dimensions
                var linkX = pageWidth * linkCoordinates.xPercent;
                var linkY = pageHeight * linkCoordinates.yPercent;

                mynewpdf.setDrawColor(0);
                mynewpdf.setFillColor(255, 255, 255); // Transparent fill color

                // Add the link and text label
                mynewpdf.rect(linkX, linkY, linkCoordinates.width, linkCoordinates.height, 'F');
                mynewpdf.link(linkX, linkY, linkCoordinates.width, linkCoordinates.height, { url: linkCoordinates.url });

                // Calculate the position for the text label
                var textX = linkX + 1; // Offset the text label from the left edge of the link
                var textY = linkY + linkCoordinates.height - 1; // Offset the text label below the link

                // Set text color
                mynewpdf.setTextColor(72, 147, 193); // Set text color to white

                // Set font size and style
                mynewpdf.setFontSize(6); // Set font size to 12 points
                mynewpdf.setFont('helvetica', 'normal'); // Set font to Helvetica, normal style

                // Add the text label
                mynewpdf.text('' + MapLink + '', textX, textY); // Display 'Click Here' as the text label

                mynewpdf.save('Ticket.pdf');

                setTimeout(() => {
                    // Hide pending indicator
                    $("#pending").hide();

                    // Show StoreBookingURL
                    $("#StoreBookingURL").show();
                }, 2000);
            }).catch(function (error) {
                console.error('Error capturing element:', error);
                //$("#pending").hide();
            });


        } else {
            savedItems.forEach((item, index) => {
                if (Template == "temp1") {
                    $("#qr-code1").empty()
                } else {
                    $("#qr-code2").empty()
                }
                $(".qr_number").text(item.QRCodeText)
                generateQrCode(item.ID);

                $(".table_date").text(item.AppointmentDate);
                $(".table_slot").text("" + item.AppointmentStartTime + " to " + item.AppointmentEndTime + "");
                $(".qr_date").text(moment(item.AppointmentDate, "DD-MM-YYYY").format('YYYY-MM-DD'));
                const startTimeCount = new Date(`2000-01-01T${item.AppointmentStartTime}`);
                const endTimeCount = new Date(`2000-01-01T${item.AppointmentEndTime}`);
                // Calculate the duration in milliseconds
                const durationInMilliseconds = endTimeCount - startTimeCount;

                // Convert milliseconds to hours
                const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
                $(".slot_hour").text(durationInHours + " hour")
                var element = (Template == "temp1") ? document.getElementsByClassName('Template1') : document.getElementsByClassName('Template2');

                html2canvas(element).then(function (canvas) {
                    var imgWidth = 200;
                    var imgHeight = canvas.height * imgWidth / canvas.width;
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    var position = 0;
                    pdf.addImage(imgData, 'JPEG', 5, position, imgWidth, imgHeight);
                    var linkCoordinates = {
                        x: 50,
                        y: 34,
                        width: 13,
                        height: 3,
                        url: '' + MapLink + ''
                    };

                    pdf.setDrawColor(0);
                    pdf.setFillColor(255, 255, 255); // Transparent fill color
                    pdf.rect(linkCoordinates.x, linkCoordinates.y, linkCoordinates.width, linkCoordinates.height, 'F');
                    pdf.link(linkCoordinates.x, linkCoordinates.y, linkCoordinates.width, linkCoordinates.height, { url: linkCoordinates.url });

                    // Set text color
                    pdf.setTextColor(72, 147, 193); // Set text color to white

                    // Set font size and style
                    pdf.setFontSize(6); // Set font size to 12 points
                    pdf.setFont('helvetica', 'normal'); // Set font to Helvetica, normal style

                    // Calculate position for the text label
                    var textX = linkCoordinates.x + 1; // Offset the text label from the left edge of the link
                    var textY = linkCoordinates.y + linkCoordinates.height - 1; // Offset the text label below the link

                    // Add the text label
                    pdf.text('' + MapLink + '', textX, textY);
                    // Push the PDF content to the array
                    pdfContents.push(pdf.output());

                    // Check if all PDFs have been generated
                    if (pdfContents.length === bookings.length) {
                        // Add all PDF contents to the zip
                        pdfContents.forEach((content, i) => {
                            zip.file(`Ticket_${i + 1}.pdf`, content, { binary: true });
                        });

                        // Generate the zip file asynchronously
                        zip.generateAsync({ type: 'blob' })
                            .then(function (zipContent) {
                                // Create a Blob containing the zip file content
                                var zipBlob = new Blob([zipContent], { type: 'application/zip' });

                                // Create a URL for the Blob
                                var zipUrl = window.URL.createObjectURL(zipBlob);

                                // Create a link element and trigger the download
                                var link = document.createElement('a');
                                link.href = zipUrl;
                                link.download = 'EventTickets.zip';
                                document.body.appendChild(link);
                                link.click();

                                // Clean up
                                window.URL.revokeObjectURL(zipUrl);
                                setTimeout(() => {
                                    // Hide pending indicator
                                    $("#pending").hide();

                                    // Show StoreBookingURL
                                    $("#StoreBookingURL").show();
                                }, 2000);
                            });
                    }
                }).catch(function (error) {
                    console.error('Error capturing element:', error);
                });
            });
        }

    } catch (error) {
        console.error('Error in saveEventDetails:', error);
        $("#pending").hide();
        // Handle error as needed
    }
}
function getEventBookingTransaction() {
    var Items = {
        "url": "https://prod-20.uaecentral.logic.azure.com:443/workflows/320466af42e042029867ca345d9b99a0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Cis8LzDqIQBXoXHuqpbj_gQHeIaGkmBm2hfNLheuyV8",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        BookingApprovedCounts = []
        // Group the inventory by 'date'
        for (var i = 0; i < response.length; i++) {
            BookingApprovedCounts.push(response[i])
        }
        // console.log(BookingApprovedCounts)
        // const groupedByDateTime = response.reduce((result, item) => {
        //     const key = `${item.AppointmentDate}_${item.AppointmentStartTime}_${item.AppointmentEndTime}`;
        //     (result[key] = result[key] || []).push(item);
        //     return result;
        // }, {});
        // // Iterate through the grouped items and log each name
        // Object.values(groupedByDateTime).forEach(items => {
        //     var ApprovedCount = 0;
        //     items.map(val => {
        //         if (val.Status.Value == "Approved") {
        //             ApprovedCount += 1;
        //         }
        //     });
        //     if (ApprovedCount >= NoofAttendees) {
        //         var Date = moment(items[0].AppointmentDate, "DD-MM-YYYY").format("YYYY-MM-DD");
        //         var Key = `${Date} | ${items[0].AppointmentStartTime} to ${items[0].AppointmentEndTime}`
        //         $('li[key="' + Key + '"]').addClass('closed');
        //         $('li[key="' + Key + '"]').removeAttr('onclick');
        //     }
        // });
    });
}
function generateRandomAlphaNumeric() {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}
function getBrandsMaster() {
    var Items = {
        "url": "https://prod-13.uaecentral.logic.azure.com:443/workflows/83b95c3a23794b59906a59723e95caf5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=NqY0HvtJYRo8oJo62hhRcYcBtPowTCfcdFDPheYRX9k",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        BrandImages = []
        BrandImages = response
    });
}
function generateQrCode(id) {
    if (Template == "temp1") {
        return new QRCode("qr-code1", {
            text: "" + id + "",
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    } else {
        return new QRCode("qr-code2", {
            text: "" + id + "",
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    }
}

function getRSVPEventBookingTransaction() {
    var Items = {
        "url": "https://prod-27.uaecentral.logic.azure.com:443/workflows/4e226d08b3b34586b82694a015cfbbfd/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qc4cPkFc5jKYs59jCzWOh15XWH-KTA5_R_JquvS55dg",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
        "data": JSON.stringify({
            UserEventID: UserEventID
        }),
    };
    $.ajax(Items).done(function (response) {
        for (var i = 0; i < response.length; i++) {
            if (UserEventID == response[i].UserEventID) {
                console.log("RSVP", response[i])
                $("#form_heading").text(`RSVP for ${response[i].EventName} - ${response[i].AppointmentDate}  ${response[i].AppointmentStartTime} to ${response[i].AppointmentEndTime}`)
                UserID = response[i].ID
                if (response[i].RSVP == "Yes" && response[i].UserVisited == "Yes") {
                    $("#accepted_section").show()
                    $(".selected-img").hide()
                } else if (response[i].RSVP == "No" && response[i].UserVisited == "Yes") {
                    $("#rejected_section").show()
                    $(".selected-img").hide()
                }

                if (moment(response[i].AppointmentDate, "YYYY-MM-DD").isSameOrBefore(moment(), 'day')) {
                    $(".edit_rsvp").remove();
                    $(".popupBox__btn").prop("disabled", true);
                    $("#event_done").show()
                }
                // if (moment(response[i].AppointmentDate, "YYYY-MM-DD").isBefore(moment(), 'day')) {
                //     $("#event_done").show()
                // }
            }
        }
        setTimeout(() => {
            $("#loader-Icon").css("display", "none");
        }, 500);
    });
}
function AcceptRSVP() {
    var postItem = {
        url: "https://prod-03.uaecentral.logic.azure.com:443/workflows/5c6c1a11b43948de831d7fc4d04a89b2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7D_4LX1ku2CG8IQHIIT5KvdpwUuw247vLmNGA6lawMg",
        method: "POST",
        timeout: 0,
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Accept": "application/json; odata=nometadata",
            "Content-Type": "application/json; odata=nometadata"
        },
        "data": JSON.stringify({
            ID: UserID,
            Status: "Accept"
        }),
    };

    $.ajax(postItem)
        .done(function (response) {
            $("#accepted_section .btn_info").removeClass("active")
            $("#accepted_section").show()
            $(".selected-img").hide()
            $("#rejected_section").hide()

        })
}
function RejectRSVP() {
    var postItem = {
        url: "https://prod-03.uaecentral.logic.azure.com:443/workflows/5c6c1a11b43948de831d7fc4d04a89b2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7D_4LX1ku2CG8IQHIIT5KvdpwUuw247vLmNGA6lawMg",
        method: "POST",
        timeout: 0,
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Accept": "application/json; odata=nometadata",
            "Content-Type": "application/json; odata=nometadata"
        },
        "data": JSON.stringify({
            ID: UserID,
            Status: "Reject"
        }),
    };

    $.ajax(postItem)
        .done(function (response) {
            $("#rejected_section .btn_info").removeClass("active")
            $("#rejected_section").show()
            $(".selected-img").hide()
            $("#accepted_section").hide()

        })
}
function editAcceptedRSVP() {
    $("#accepted_section .btn_info").addClass("active")
}
function editRejectedRSVP() {
    $("#rejected_section .btn_info").addClass("active")
}