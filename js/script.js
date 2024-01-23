var timeSlots = [];
var EndDate;
var slotBookingStartTime;
var SlotBookingEndTime;
var SlotDuration;
var StartDate;
var OutOfOfficeTimeSlot = [];
var noOfAccompanyingPeople;
var bookings = [];
var storeName = "null";
var storeID;
var selectedDateValue;
var appointmentDate;
var userName;
var phoneNo;
var emailId;
var Count = 0;
var NameLength;
var clickedMonth;


$(document).ready(function () {
    GetOutOfOfficeDetails();
    GetAccompanyPeopleCount();
    getStoreTypes();
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
    $("#storeDropdown").on('change', function (e) {
        if ($("#storeDropdown").val() != "null") {
            $("#store-error").hide();
        } else {
            $("#no_slot").show();
            $("#store-error").show();
            $("#map_location").hide();
            storeName = "null";
            EndDate = "";
            slotBookingStartTime = "";
            SlotBookingEndTime = "";
            SlotDuration = "";
            StartDate = "";
        }
        if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
            $("#submit").prop("disabled", true);
        } else {
            $("#submit").prop("disabled", false);
        }
    });
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month'
        },
        defaultDate: new Date(),
        editable: false,
        dayClick: function (date, jsEvent, view) {
            var Date = date.format();
            selectedDateValue = Date;
            clickedMonth = moment(Date, "YYYY-MM-DD").format("MMMM YYYY");
            if (moment(Date, "YYYY-MM-DD").isBefore(moment(), 'day')) {
                return;
            } else {
                $("#select_date").text(Date)
                handleNavigate(Date);
                console.log('Selected Date: ' + date.format());
                $(".fc-center h2").text(clickedMonth);
                console.log("Month", clickedMonth)
            }
        }
    });
    var buttonText = $('.fc-today-button').text();
    // Capitalize the first letter
    var capitalizedText = buttonText.charAt(0).toUpperCase() + buttonText.slice(1);
    $('.fc-today-button').text(capitalizedText);

    $(".fc-next-button").on('click', function () {
        var currentMonth = moment().format("MMMM YYYY");
        if ($(".fc-center h2").text() == currentMonth) {
            $(".fc-prev-button").hide();
        } else {
            $(".fc-prev-button").show();
        }
    })
    $(".fc-prev-button").on('click', function () {
        var currentMonth = moment().format("MMMM YYYY");
        if ($(".fc-center h2").text() == currentMonth) {
            $(".fc-prev-button").hide();
        } else {
            $(".fc-prev-button").show();
        }
    })
    $(".fc-today-button").on('click', function () {
        var currentMonth = moment().format("MMMM YYYY");
        if ($(".fc-center h2").text() == currentMonth) {
            $(".fc-prev-button").hide();
        } else {
            $(".fc-prev-button").show();
        }
    })
})
function getStoreTypes() {
    var Items = {
        "url": "https://prod-05.uaecentral.logic.azure.com:443/workflows/a1467bc6aab849cc9e7dd579cebe7cef/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hlf5tdLLX8uqGkHDScioK6Vh5vkAvJzEkNCUNZ6JgaM",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        console.log("StoreTypes", response)
        for (var i = 0; i < response.length; i++) {
            $("#storeDropdown").append(`<option key=${response[i].StoreId} value=${response[i].Title} data-storeid=${response[i].StoreId}>${response[i].Title}</option>`)
        }
        if (response.length == 0) {
            $(".default_value").text("No Store Available")
        }
        setTimeout(() => {
            $("#loader-Icon").css("display", "none");
            $(".appointment-book-form").css("display", "");
        }, 500);
    });
}
function storeNameHandler() {
    storeName = $("#storeDropdown option:selected").text();
    console.log("storeName", storeName);
    $("#slots").empty();
    var Items = {
        "url": "https://prod-05.uaecentral.logic.azure.com:443/workflows/a1467bc6aab849cc9e7dd579cebe7cef/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hlf5tdLLX8uqGkHDScioK6Vh5vkAvJzEkNCUNZ6JgaM",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        var CurrentDate = moment().format('YYYY-MM-DD');
        for (var i = 0; i < response.length; i++) {
            if (response[i].Title == storeName) {
                console.log("StoreLocation", response[i].MapLocation)
                EndDate = response[i].EndDate;
                slotBookingStartTime = response[i].SlotBookingStartTime;
                SlotBookingEndTime = response[i].SlotBookingEndTime;
                SlotDuration = response[i].SlotDuration;
                StartDate = response[i].StartDate;
                storeID = response[i].StoreId;
                $("#startdate").text(moment(StartDate, "DD-MM-YYYY").format("MMM DD, YYYY"));
                $("#enddate").text(moment(EndDate, "DD-MM-YYYY").format("MMM DD, YYYY"));
                $("#location").attr("href", response[i].MapLocation)
                $("#map_location").show();
                handleNavigate(CurrentDate);
                $('td').removeClass('fc-today');
                $('td').removeClass('selected-date');
                setTimeout(() => {
                    $('td[data-date="' + CurrentDate + '"]').addClass('selected-date');
                }, 100)
            }
        }
    });


}
function handleNavigate(newDate) {
    timeSlots = [];
    var date = moment(newDate).format('YYYY-MM-DD');
    if (moment(date, "YYYY-MM-DD").isBefore(moment(), 'day')) {
        $("#slots").empty();
        $("#accompanying_people").hide();
        FireSwalalert("error", "You cannot select past dates!");
        date = moment().format('YYYY-MM-DD');
        $("#no_slot").show();
        return;
    } else {
        $("#accompanying_people").show();
        $("#no_slot").hide();
        $('td').removeClass('fc-today');
        $('td').removeClass('selected-date');
        setTimeout(() => {
            $('td[data-date="' + selectedDateValue + '"]').addClass('selected-date');
            // $(jsEvent.target).addClass('selected-date');
        }, 100)
    }

    if (moment(date, "YYYY-MM-DD").isAfter(moment(EndDate, "DD-MM-YYYY"))) {
        $("#accompanying_people").hide()
        $("#slot_times").hide()
        $(".not-possible-to-choose").addClass("show");
        $("#slots").empty();
        $("#no_slot").show();
    } else {
        $("#no_slot").hide();
        $("#accompanying_people").show()
        $("#slot_times").show()
        $(".not-possible-to-choose").removeClass("show");
        selectedDateValue = date;
        appointmentDate = selectedDateValue;
        const generatedTimeSlots = generateTimeSlotsArray(slotBookingStartTime, SlotBookingEndTime, SlotDuration, selectedDateValue);
        console.log("Timeslots array : " + generatedTimeSlots);
        timeSlots = [];
        timeSlots = generatedTimeSlots;
        $("#slots").empty();
        timeSlots.map((item, key) => {
            const timeSlotsWithoutSpaces = OutOfOfficeTimeSlot.map(slot => slot.replace(/\s+/g, ''));
            const normalizedItem = item.replace(/\s+/g, '')
            const isDisabled = timeSlotsWithoutSpaces.indexOf(normalizedItem) !== -1;
            if (isDisabled) {
                $("#slots").append(`
                  <li title='Slot not available'
                    key='${item}'
                    class='leavedays-wrapper-OutOfc closed'>
                    ${item}
                  </li>
                `);
            } else {
                $("#slots").append(`  
                <li  key='${item}'
                class="leavedays-wrapper-OutOfc"
                onclick="handleTimeSlotSelection(event,'${item}')"
                >
                 ${item}
                 </li>`)
            }
        })
    }

    if ($("#storeDropdown").val() == "null") {
        FireSwalalert("warning", "Please select a store and then booking slot date");
        $("#no_slot").show();
    } else {
        $("#no_slot").hide();
    }
    bookings.map((item) => {
        $("li[key='" + item.timeRange + "']").addClass('select');
    })

    if (timeSlots.length == 0) {
        $("#no_slot").show();
    } else {
        $("#no_slot").hide();
    }
}
function generateTimeSlotsArray(startTime, endTime, slotDuration, date) {
    const timeSlots = [];
    let currentTime = new Date(`${date}T${startTime}`);//2023-01-01
    const endTimeObj = new Date(`${date}T${endTime}`);
    while (currentTime < endTimeObj) {
        const startTimeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Add fractional part of the slotDuration to minutes
        const minutesToAdd = Math.floor(slotDuration) * 60 + Math.round((slotDuration % 1) * 60);
        currentTime.setMinutes(currentTime.getMinutes() + minutesToAdd);
        const endTimeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeSlots.push(`${date} | ${startTimeString} to ${endTimeString}`);
    }
    console.log("timeSlots", timeSlots);
    return timeSlots;
}
function FireSwalalert(firetype, swaltext) {
    swal({
        text: '' + swaltext + '',
        closeOnClickOutside: false,
        closeOnEsc: false,
        icon: '' + firetype + ''
    });
}
function GetOutOfOfficeDetails() {
    var Items = {
        "url": "https://prod-06.uaecentral.logic.azure.com:443/workflows/f644d4cd82aa4490b544fbdbb3a7474f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GroTENQr3Sa0MHZ87kc-bupuxtABAqTmEekmYZrlW-g",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        console.log("StoreTypes", response)
        OutOfOfficeTimeSlot = [];
        for (var i = 0; i < response.length; i++) {
            OutOfOfficeTimeSlot.push(`${response[i].SelectedDate} | ${response[i].SlotStartTime} to ${response[i].SlotEndTime}`)
        }
        console.log("OutOfOfficeTimeSlot", OutOfOfficeTimeSlot);
    });
}
function GetAccompanyPeopleCount() {
    var Items = {
        "url": "https://prod-11.uaecentral.logic.azure.com:443/workflows/f7e76de48b144f9da697a58293dbd506/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DasRToq4yeOtDT8PzjELBxUxsIDz6T9ToDkPKwjgfwg",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json;odata=verbose",
            "Access-Control-Allow-Origin": "*"
        },
    };
    $.ajax(Items).done(function (response) {
        for (var i = 0; i < parseInt(response[0].Title) + 1; i++) {
            $("#people_select").append(`<li className='acc-people-selector' onclick="handleAccompanyingPeople('${i}')">
            ${i}
          </li>`)
        }
        $("#people_select li").on('click', function () {
            $("#people_select li").removeClass("select");
            $(this).addClass("select");
        });
    });
}
function handleAccompanyingPeople(people) {
    if (people == 0) {
        noOfAccompanyingPeople = people;
        $("#accompanying_text").text("If you select 0,You are not permitted to have any guests with you.")
    } else if (people == 1) {
        noOfAccompanyingPeople = people;
        $("#accompanying_text").text(`If you select ${people},You are permitted to have ${people} guest with you.`)
    }
    else {
        noOfAccompanyingPeople = people;
        $("#accompanying_text").text(`If you select ${people},You are permitted to have ${people} guests with you.`)
    }
}
function handleTimeSlotSelection(event, value) {
    if (noOfAccompanyingPeople !== undefined) {
        const clickedLiElement = event.currentTarget;
        clickedLiElement.classList.add('select');
        const timeString = event.target.textContent;
        console.log("timeString", timeString);
        if (timeString) {
            const timeArray = timeString.split("to");
            console.log("timeString2", timeString);
            const storeStartTime = timeArray[0].trim();
            const storeEndTime = timeArray[1].trim();
            var Start = storeStartTime.split("|");
            // var startTime = Start[1].substring(0, 6);
            // var endTime = storeEndTime.substring(0, 6);
            var startTime = Start[1];
            startTime = convertTo24HourFormat(startTime);
            var endTime = convertTo24HourFormat(storeEndTime);
            console.log("Result:", startTime, endTime);

            // Use a unique identifier based on the time range
            const uniqueIdentifier = `${storeStartTime} to ${storeEndTime}`;

            // Check if the booking with the same time range already exists
            const isBookingExists = bookings.some(
                (booking) => booking.uniqueIdentifier === uniqueIdentifier
            );
            if (!isBookingExists) {
                Count += 1
                const bookingID = "BKNG-" + moment().format("DDMMYYYYHHmmss") + Count;
                const newBooking = {
                    id: bookingID,
                    storeName,
                    storeID,
                    accompanyingPeople: noOfAccompanyingPeople,
                    selectedDate: moment(selectedDateValue).format("DD-MM-YYYY"),
                    timeRange: `${storeStartTime} to ${storeEndTime}`,
                    uniqueIdentifier,
                    startTime,
                    endTime
                };
                console.log("newBooking", newBooking);
                // Update the state with the new booking
                bookings.push(newBooking)
                console.log("this.booking", bookings);
                $("#booked_slots").empty();
                bookings.map((item, key) => {
                    $("#booked_slots").append(` <tr key=${item.id}>
                    <td>${item.storeName}</td>
                    <td>${item.accompanyingPeople}</td>
                    <td>${item.selectedDate}</td>
                    <td>${item.timeRange}</td>
                    <td><img src="./img/close-red.svg" class="action-close" onclick="removeHandler('${item.id}')"></td>
                </tr>`)
                })
                if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
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
    } else {
        FireSwalalert("error", "Please select the No of Accompanying People Field  !");
    }
}
function convertTo24HourFormat(timeString) {
    // Parse the input time string into a Date object
    const parsedDate = new Date("2000-01-01 " + timeString);

    // Extract hours and minutes
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    // Format hours and minutes as "HH:mm"
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return formattedTime;
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
                    <td>${item.storeName}</td>
                    <td>${item.accompanyingPeople}</td>
                    <td>${item.selectedDate}</td>
                    <td>${item.timeRange}</td>
                    <td><img src="./img/close-red.svg" class="action-close" onclick="removeHandler('${item.id}')"></td>
                </tr>`)
    })
    console.log("this.bookingRemove", bookings);
    if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }

};
function saveStoreDetailsForm() {
    if (formValidation()) {
        if (!userName || !emailId || !phoneNo || !storeName || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0) {
            FireSwalalert("warning", "Please select atleast one slot!");
        } else {
            try {
                bookings.map((item, key) => {
                    var strTimerange = item.timeRange;
                    var times = strTimerange.split("to");
                    var postItem = {
                        url: "https://prod-12.uaecentral.logic.azure.com:443/workflows/9d18b3d41e50421b9e33f932cda8a1cb/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=q-8WdB1KrgXrdUsIeOePAXdrzuCPr0wRktw1EKy6O7I",
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
                            StoreName: item.storeName,
                            AppointmentStartTime: item.startTime,
                            AppointmentEndTime: item.endTime,
                            AppointmentDate: moment(item.selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
                            NoOfAccompanyingPeople: parseInt(item.accompanyingPeople),
                            BookingId: item.id,
                            StoreID: storeID,
                            RequestFrom: "User",
                            Map: $("#location").attr("href")
                        }),
                    };

                    $.ajax(postItem).done(function (response) {
                    });
                });
                $("#StoreBookingURL").show();
            } catch (error) {
                console.error(error);
                FireSwalalert("error", "An error occurred while saving.");
            }
        }
    }
}
function reqoff() {
    $("#StoreBookingURL").hide();
    location.reload();
}
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

    if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
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
    if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
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
    if (!userName || !emailId || !phoneNo || storeName == "null" || timeSlots.length === 0 || !appointmentDate || noOfAccompanyingPeople == null || bookings.length === 0 || NameLength == false) {
        $("#submit").prop("disabled", true);
    } else {
        $("#submit").prop("disabled", false);
    }

}
function formValidation() {
    var FormStatus = true;
    var Name = $("#name").val();
    var Number = $("#number").val();
    var Email = $("#email").val();
    var Store = $("#storeDropdown").val();
    if (Name == "") {
        FormStatus = false;
        $("#fname-error").show();
    } else {
        $("#fname-error").hide();
    }
    if (Number == "") {
        FormStatus = false;
        $("#phone-error").show();
    } else {
        $("#phone-error").hide();
    }
    if (Email == "") {
        FormStatus = false;
        $("#email-error").show();
    } else {
        $("#email-error").hide();
    }
    if (Store == "null") {
        FormStatus = false;
        $("#store-error").show();
    } else {
        $("#store-error").hide();
    }
    return FormStatus;
}