var timeSlots = [];
var EndDate;
var slotBookingStartTime;
var SlotBookingEndTime;
var SlotDuration;
var StartDate;
var OutOfOfficeTimeSlot = [];

$(document).ready(function () {
    GetOutOfOfficeDetails();
    GetAccompanyPeopleCount();
    getStoreTypes();
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month'
        },
        defaultDate: new Date(),
        editable: false,
        dayClick: function (date, jsEvent, view) {
            $('.fc-day').removeClass('fc-today');
            $('.fc-day').removeClass('selected-date');
            $(jsEvent.target).addClass('selected-date');
            var Date = date.format();
            handleNavigate(Date);
            console.log('Selected Date: ' + date.format());
        }
    });
    // $('#calendar').on('click', '.fc-day', function () {
    //     $('.fc-day').removeClass('fc-today');
    //     $('.fc-day').removeClass('selected-date');
    //     $(this).addClass('selected-date');
    //     var selectedDate = $('#calendar').fullCalendar('getDate');
    //     console.log('Selected Date: ' + selectedDate.format('YYYY-MM-DD'));
    // });
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
    });
}
function storeNameHandler() {
    var storeName = $("#storeDropdown option:selected").text();
    console.log("storeName", storeName);
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
        for (var i = 0; i < response.length; i++) {
            if (response[i].Title == storeName) {
                console.log("StoreLocation", response[i].MapLocation)
                EndDate = response[i].EndDate;
                slotBookingStartTime = response[i].SlotBookingStartTime;
                SlotBookingEndTime = response[i].SlotBookingEndTime;
                SlotDuration = response[i].SlotDuration;
                StartDate = response[i].StartDate;
                $("#startdate").text(moment(StartDate, "DD-MM-YYYY").format("MMM DD, YYYY"));
                $("#enddate").text(moment(EndDate, "DD-MM-YYYY").format("MMM DD, YYYY"));
                $("#location").attr("href", response[i].MapLocation)
            }
        }
    });


}
function handleNavigate(newDate) {
    timeSlots = [];
    var date = moment(newDate).format('YYYY-MM-DD');
    if (moment(date, "YYYY-MM-DD").isBefore(moment(), 'day')) {
        FireSwalalert("error", "You can not select past date");
        date = moment().format('YYYY-MM-DD');
    } else {
    }

    if (moment(date, "YYYY-MM-DD").isAfter(moment(EndDate, "DD-MM-YYYY"))) {
        $(".not-possible-to-choose").addClass("show");
        $("#slots").empty();
    } else {
        $(".not-possible-to-choose").removeClass("show");
        selectedDateValue = date;
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
                    key={key}
                    className='leavedays-wrapper-OutOfc closed'>
                    ${item}
                  </li>
                `);
            } else {
                $("#slots").append(`  
                <li  key=${key}
                class="leavedays-wrapper-OutOfc"
                onclick="handleTimeSlotSelection('${item}')"
                >
                 ${item}
                 </li>`)
            }
        })
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
        $("#accompanying_text").text("If you select 0,You are not permitted to have any guests with you.")
    } else {
        $("#accompanying_text").text(`If you select ${people},You are permitted to have ${people} guests with you.`)
    }
}
function handleTimeSlotSelection(value) {
    console.log(value)
}