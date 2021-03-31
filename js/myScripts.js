$(document).ready(function () {
    //Find Ids
    const searchField = $("#search-TextField");
    const submitBtn = $("#submit-reset");
    const checkInDate = $("#checkInDate");
    const checkOutDate = $("#checkOutDate");
    const roomsDrop = $("#rooms-DropDown");
    const maxPriceText = $("#maxPrice");
    const priceRange = $("#price-Range");
    const propertyTypeDrop = $("#Property-Type-DropDown");
    const guestRatingDrop = $("#Guest-Rating-DropDown");
    const hotelLocationDrop = $("#Hotel-Location-DropDown");
    const moreFiltersDrop = $("#More-Filters-DropDown");
    const sortByDrop = $("#Sort-By-DropDown");
    const hotelsSection = $("#listing-hotels-section");
    const hotelsAuto = $("#hotelsAuto");

    // Variables for populating Data
    var roomtypes = [];
    var hotels = [];
    var filteredhotels = [];
    var autocompleteNames = [];
    var MaxPrice;
    var PropertyTypes = [];
    var GuestRatings = [];
    var Locations = [];
    var Filters = [];

    // Variables for searching and Sorting
    var cityName;
    var price;
    var propertyType;
    var guestRating;
    var hotelLocation;
    var filters;
    var sortBy;

    $.ajax({
        type: "GET",
        url: "json/data.json",
        dataType: "json"
    }).done((data) => StartApplication(data));


    function StartApplication(data) {

        roomtypes = data[0].roomtypes.map(x => x.name);

        roomtypes.sort();

        hotels = data[1].entries;

        var HotelNames = hotels.map(x => x.hotelName);
        autocompleteNames = [...new Set(HotelNames)];
        autocompleteNames.sort();

        MaxPrice = hotels.reduce((max, hotel) => (max.price > hotel.price) ? max : hotel).price;

        var hotelTypes = hotels.map(x => x.rating);
        PropertyTypes = [...new Set(hotelTypes)];
        PropertyTypes.sort();

        var hotelRatings = hotels.map(x => x.ratings.text);
        GuestRatings = [...new Set(hotelRatings)];
        GuestRatings.sort();

        var hotelLocation = hotels.map(x => x.city);
        Locations = [...new Set(hotelLocation)];
        Locations.sort();

        var hotelFilters = hotels.map(x => x.filters);
        var combinedFilters = [];
        for (var i = 0; i < hotelFilters.length; i++) {
            for (var j = 0; j < hotelFilters[i].length; j++) {
                combinedFilters.push(hotelFilters[i][j].name);
            }
        }
        Filters = [...new Set(combinedFilters)];
        Filters.sort();

        $("#hotelsAuto").append(autocompleteNames.map(x => `<option value="${x}">`));

        roomsDrop.append(roomtypes.map(x => `<option value="${x}">${x}</option>`));

        maxPriceText.text(`max.$ ${MaxPrice}`);

        priceRange.attr("max", MaxPrice);
        priceRange.attr("step", "25");
        priceRange.val(MaxPrice);
        priceRange.on("input", function () {
            maxPriceText.text(`max.$ ${$(this).val()}`);
        });

        propertyTypeDrop.prepend("<option value=''>All</option");
        for (var i = 0; i < PropertyTypes.length; i++) {
            switch (PropertyTypes[i]) {
                case 5: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">⭐⭐⭐⭐⭐</option>`); break;
                case 4: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">⭐⭐⭐⭐</option>`); break;
                case 3: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">⭐⭐⭐</option>`); break;
                case 2: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">⭐⭐</option>`); break;
                case 1: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">⭐</option>`); break;
                default: break;
            }
        }

        guestRatingDrop.prepend("<option value=''>All</option");
        for (var guestRating of GuestRatings) {
            if (guestRating == "Okay") guestRatingDrop.append(`<option value="${guestRating}">Okay 0-2</option>`);
            if (guestRating == "Fair") guestRatingDrop.append(`<option value="${guestRating}">Fair 2-6</option>`);
            if (guestRating == "Good") guestRatingDrop.append(`<option value="${guestRating}">Good 6-7</option>`);
            if (guestRating == "Very Good") guestRatingDrop.append(`<option value="${guestRating}">Very Good 7-8.5</option>`);
            if (guestRating == "Excellent") guestRatingDrop.append(`<option value="${guestRating}">Excellent 8.5-10</option>`);
        }

        hotelLocationDrop.prepend("<option value=''>All</option");
        hotelLocationDrop.append(Locations.map(x => `<option value="${x}">${x}</option>`));

        moreFiltersDrop.prepend("<option value=''>All</option");
        moreFiltersDrop.append(Filters.map(x => `<option value="${x}">${x}</option>`));

        searchField.on('input', function () {
            cityName = $(this).val();
            Controller();
        });

        priceRange.on('input', function () {
            price = $(this).val();
            Controller();
        });

        propertyTypeDrop.on('input', function () {
            propertyType = $(this).val();
            Controller();
        });

        guestRatingDrop.on('input', function () {
            guestRating = $(this).val();
            Controller();
        });

        hotelLocationDrop.on('input', function () {
            hotelLocation = $(this).val();
            Controller();
        });

        moreFiltersDrop.on('input', function () {
            filters = $(this).val();
            Controller();
        });

        sortByDrop.on('input', function () {
            sortBy = $(this).val();
            Controller();
        });

        submitBtn.on('click', function () {
            searchField.val('');
            priceRange.val(MaxPrice);
            maxPriceText.text(`max.$ ${MaxPrice}`);
            propertyTypeDrop.val('');
            guestRatingDrop.val('');
            hotelLocationDrop.val('');
            moreFiltersDrop.val('');
            sortByDrop.val('nameAsc');
            SetEverythingRight();
        });

        function SetEverythingRight() {
            cityName = searchField.val();
            price = priceRange.val();
            propertyType = propertyTypeDrop.val();
            guestRating = guestRatingDrop.val();
            hotelLocation = hotelLocationDrop.val();
            filters = moreFiltersDrop.val();
            sortBy = sortByDrop.val();
            Controller();
        }
        
        SetEverythingRight()
        

        function Controller() {
            filteredhotels = hotels;

            if (cityName) {
                filteredhotels = filteredhotels.filter(x => x.hotelName.toUpperCase().includes(cityName.toUpperCase()));
            }

            if (price) {
                filteredhotels = filteredhotels.filter(x => x.price <= price);
            }

            if (propertyType) {
                filteredhotels = filteredhotels.filter(x => x.rating == propertyType);
            }

            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }

            if (hotelLocation) {
                filteredhotels = filteredhotels.filter(x => x.city == hotelLocation);
            }

            if (filters) {
                filteredhotels = filteredhotels.filter(x => x.filters.some(y => y.name == filters));
            }

            if (sortBy) {
                switch (sortBy) {
                    case "nameAsc": filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                    case "nameDesc": filteredhotels.sort((a, b) => a.hotelName > b.hotelName ? -1 : -1); break;
                    case "cityAsc": filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                    case "cityDesc": filteredhotels.sort((a, b) => a.city > b.city ? -1 : -1); break;
                    case "priceAsc": filteredhotels.sort((a, b) => a.price - b.price); break;
                    case "priceAsc": filteredhotels.sort((a, b) => b.price - a.price); break;
                    case "priceDesc":
                    default: break;
                }
            }

            hotelsSection.empty();
            if (filteredhotels.length > 0) { filteredhotels.forEach(ViewHotels); }
            else {

                var noMoreHotelsElement = "<br/><h1>No hotels match your criteria</h1><br/>";
                hotelsSection.append(noMoreHotelsElement);

            }
            
        }

        function ViewHotels(hotel) {
            var element = `
                      <div class="hotel-card">
                <div class="photo" style="background: url('${hotel.thumbnail}'); background-position: center;">
                    <i class="fa fa-heart"></i>
                    <span>1/30</span>
                </div>

                <div class="details">
                    <h3>${hotel.hotelName}</h3>
                    <div class="rating" style="display:inline">
                        <div>
                            ${RatingStars(hotel.rating)}
                            <i>Hotel </i>
                        </div>
                    </div>

                    <div class="location">
                        ${hotel.city}
                    </div>

                    <div class="reviews">
                        <span class="total">${hotel.ratings.no.toFixed(1)}</span>
                        <b>${hotel.ratings.text}</b>
                        <small>(1736)</small>
                    </div>

                    <div class="location-reviews">
                        ${hotel.ratings.text} location <small>(${hotel.ratings.no.toFixed(1)}/10)</small>
                    </div>
                </div>

                <div class="third-party-prices">
                    <div class="sites-and-prices">
                        <div class="highlited">
                            Hotel website
                            <strong>${(hotel.price * 1.4).toFixed(0)}</strong>
                        </div>
                        <div>
                            Agoda
                            <strong>$${(hotel.price * 1.3).toFixed(0)}</strong>
                        </div>
                        <div>
                            Travelocity
                            <strong>$${hotel.price}</strong>
                        </div>
                    </div>


                    <div class="more-deals">
                        <strong>More deals from</strong>
                        <strong>$${(hotel.price * 1.5).toFixed(0)}&or;</strong>
                    </div>
                </div>

                <div class="call-to-action">
                    <div class="price">

                        <div class="before-discount">
                            HotelPower.com
                            <strong><s> $${(hotel.price * 1.1).toFixed(0)}</s></strong>
                        </div>

                        <div class="after-discount">
                            Travelocity
                            <strong> $${hotel.price}</strong>
                            <div class="total">
                                3 nights for <strong>$${hotel.price * 3}</strong>
                            </div>

                            <div class="usp">
                                ${hotel.filters.map(x => `<span>${x.name + " "}</span>`)}
                                
                            </div>
                        </div>

                        <div class="button">
                            <a href="#">View Deal</a>
                        </div>


                    </div>
                </div>

            </div>

                         `;

            hotelsSection.append(element);
        }

        function RatingStars(rating) {
            var eles = ``;
            for (var i = 0; i < rating; i++) {
                eles += `<span class="fa fa-star"></span> `;
            }
            return eles;
        }
    }
});