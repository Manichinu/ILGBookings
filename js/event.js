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



$(document).ready(function () {
    const searchParams = new URLSearchParams(window.location.search);
    const hasEventID = searchParams.has("e_02");
    if (hasEventID) {
        EventID = searchParams.get("e_02");
        console.log(EventID);
        getEventsMaster();
    } else {
        console.log(EventID);
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
        console.log("Events", response)
        for (var i = 0; i < response.length; i++) {
            if (response[i].EventID == EventID) {
                $("#company_name").text(response[i].CompanyName);
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
            }
        }
        // Parse the date strings to create Date objects
        var startDateParts = StartDate.split('-');
        var endDateParts = EndDate.split('-');
        var startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
        var endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);

        // Array to store the dates in between
        var datesInRange = [];

        // Iterate through the dates and add them to the array
        for (var currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            datesInRange.push(new Date(currentDate));
        }
        // Convert the dates to string format if needed
        var datesInRangeStrings = datesInRange.map((date, index) => {
            var Date = date.toLocaleDateString();
            var Month = moment(Date, "MM/DD/YYYY").format("MMM");
            var Day = moment(Date, "MM/DD/YYYY").format("DD");
            $("#inbetween_dates").append(`<div class="date-picker f-left" id="date-${index}" onclick="setTimeSlots('${Date}')">
            <p class="mnth-name">${Month}</p>
            <h3 class="date-no">${Day}</h3>
        </div>`)
        });
        $(".date-picker").on('click', function () {
            $(".date-picker").removeClass('active');
            $(this).addClass('active');
        })
        $("#date-0").trigger('click');
        console.log("Dates in Between:", datesInRangeStrings);

        // check EndDate is Expired or not       
        if (moment(EndDate, "DD-MM-YYYY").isBefore(moment(), 'day')) {
            console.log("Expired")
            setTimeout(() => {
                $("#loader-Icon").css("display", "none");
                $("#event_expired").show();
                $(".version-update").hide();
                $(".appointment-book-form").empty();
            }, 500);
        } else {
            console.log("Not Expired")
            setTimeout(() => {
                $("#loader-Icon").css("display", "none");
                $(".appointment-book-form").css("display", "");
            }, 500);
        }
    });
}
function setTimeSlots(date) {
    const generatedTimeSlots = generateTimeSlotsArray(slotBookingStartTime, SlotBookingEndTime, SlotDuration, date);
    console.log("Timeslots array : " + generatedTimeSlots);
    timeSlots = [];
    timeSlots = generatedTimeSlots;
    $("#slots").empty();
    timeSlots.map((item, key) => {
        $("#slots").append(`  
            <li  key='${item}'
            class="leavedays-wrapper-OutOfc eve_slot"
            onclick="handleTimeSlotSelection(event,'${item}')"
            >
             ${item}
             </li>`)
    })
    getEventBookingTransaction();
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
    console.log("timeSlots", timeSlots);
    return timeSlots;
}
function handleTimeSlotSelection(event, value) {
    const clickedLiElement = event.currentTarget;
    clickedLiElement.classList.add('select');
    const timeString = event.target.textContent;
    console.log("timeString", timeString);
    if (timeString) {
        const timeArray = timeString.split("to");
        console.log("timeString2", timeArray);
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
            };
            console.log("newBooking", newBooking);
            // Update the state with the new booking
            bookings.push(newBooking)
            console.log("this.booking", bookings);
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
            console.log('Booking already exists for this time range.');
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
    console.log("this.bookingRemove", bookings);

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
function saveEventDetails() {
    try {
        bookings.map((item, key) => {
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
                    EventID: item.id,
                    RequestFrom: "User",
                    Map: $("#location").attr('href')
                }),
            };

            $.ajax(postItem).done(function (response) {
            });
        });
        $("#StoreBookingURL").show();
    } catch (error) {
        console.error(error);
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
        // Group the inventory by 'date'
        const groupedByDateTime = response.reduce((result, item) => {
            const key = `${item.AppointmentDate}_${item.AppointmentStartTime}_${item.AppointmentEndTime}`;
            (result[key] = result[key] || []).push(item);
            return result;
        }, {});
        console.log("Groups", groupedByDateTime)
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
    });
}