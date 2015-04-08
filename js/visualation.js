var ndx;
var all;

var monthByBarChart;
var dayOfWeekChart;
var hourByBarChart;
var agePieChart;
var carTypePieChart;
var accidentTypePieChart;
var carTypePieChart;
var roadCategoryPieChart;

var monthDayDim;
var weekDayDim;
var hourDim;
var ageDim;
var lngDim;
var latDim;
var carTypeDim;
var accidentTypeDim;
var carTypeDim;
var roadCategoryDim;

var monthGroup;
var weekDayGroup;
var hourGroup;
var ageGroup;
var carTypeGroup;
var accidentTypeGroup;
var roadCategoryGroup;

var colorWeek = "#d6616b";
var monthArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
var weekDayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var hourArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21",
    "22", "23"
];

d3.json("https://dl.dropboxusercontent.com/u/26467764/TrafficAcciden/data/accident102.json", function(err, json) { //./data/accident102.json
    var width = 350,
        height = 200;
    var accidentData = [];

    json.filter(function(d) {
        d.lat = +d.lat;
        d.lng = +d.lng;
        d.age = +d.age;
        d.date = new Date(d.time);
        accidentData.push(d);
        return true;
    });
    ndx = crossfilter(json);
    all = ndx.groupAll();
    updateAccidentMap(accidentData);

    //定義barchart or piechart
    monthByBarChart = dc.barChart("#month_barChart");
    dayOfWeekChart = dc.rowChart("#weekday_barChart");
    hourByBarChart = dc.barChart("#hour_barChart");



    //分類
    monthDayDim = ndx.dimension(function(d) {
        return monthArray[d.date.getMonth()];
    });
    hourDim = ndx.dimension(function(d) {
        return hourArray[d.date.getHours()];
    });

    //計算
    monthGroup = monthDayDim.group().reduceCount();

    var dayOfWeek = ndx.dimension(function(d) {
        var day = d.date.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();
    hourGroup = hourDim.group().reduceCount();


    //chart的樣態
    monthByBarChart.width(width).height(height).margins({
        top: 20,
        left: 40,
        right: 10,
        bottom: 20
    }).dimension(monthDayDim).group(monthGroup).x(d3.scale.ordinal().domain(d3.range(1, 13))).xUnits(
        dc.units.ordinal).elasticY(true).colors(colorWeek).on("filtered", function(c, f) {
        updateGraph(c, f);
    }).yAxis().ticks(6);

    dayOfWeekChart.width(width)
        .height(height)
        .margins({
            top: 20,
            left: 10,
            right: 10,
            bottom: 20
        })
        .dimension(dayOfWeek)
        .group(dayOfWeekGroup)
        .colors(d3.scale.category10())
        .label(function(d) {
            return d.key.split(".")[1];
        })
        .title(function(d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(6);

    hourByBarChart.width(width).height(height).margins({
        top: 20,
        left: 40,
        right: 10,
        bottom: 20
    }).dimension(hourDim).group(hourGroup).x(d3.scale.linear().domain([0, 24])).elasticY(true).colors(
        colorWeek).on("filtered", function(c, f) {
        updateGraph(c, f);
    }).yAxis().ticks(3);

    //////////////////////////////////////////////////////////
    ///年齡
    ///
    //////////////////////////////////////////////////////////
    agePieChart = dc.pieChart("#agePieChart");
    ageDim = ndx.dimension(function(d) {
        if (d.age < 18) {
            d.age = "under 18";
        } else if (d.age >= 18 && d.age < 20) {
            d.age = "18~19歲";
        } else if (d.age >= 20 && d.age < 30) {
            d.age = "20~29歲";
        } else if (d.age >= 30 && d.age < 40) {
            d.age = "30~39歲";
        } else if (d.age >= 40 && d.age < 50) {
            d.age = "40~49歲";
        } else if (d.age >= 50 && d.age < 60) {
            d.age = "50~59歲";
        } else if (d.age >= 60) {
            d.age = "60歲以上";
        }
        return d.age;
    });
    ageGroup = ageDim.group().reduceCount();
    agePieChart
        .width(width)
        .height(height)
        .radius(100)
        .innerRadius(20)
        .slicesCap(7)
        .dimension(ageDim)
        .group(ageGroup)
        .legend(dc.legend())
        .label(function(d) {
            if (agePieChart.hasFilter() && !agePieChart.hasFilter(d.key)) {
                return "0%";
            }
            return Math.floor(d.value / all.value() * 100) + "%";
        })
        .colors(d3.scale.category10()).on("filtered", function(c, f) {
            updateGraph(c, f);
        });;

    //////////////////////////////////////////////////////////
    ///當事者區分(第一當事人)
    ///
    //////////////////////////////////////////////////////////
    carTypePieChart = dc.pieChart("#carTypePieChart");
    carTypeDim = ndx.dimension(function(d) {
        switch (d.carType.substring(0, 1)) {
            case "A":
                if (d.carType === "A11" || d.carType === "A12") {
                    d.type = "大客車";
                } else if (d.carType === "A21" || d.carType === "A22") {
                    d.type = "全連結車";
                } else if (d.carType === "A31" || d.carType === "A32") {
                    d.type = "半連結車";
                } else if (d.carType === "A41" || d.carType === "A42") {
                    d.type = "曳引車";
                } else {
                    d.type = "大客車";
                }
                break;
            case "B":
                if (d.carType === "B11" || d.carType === "B12") {
                    d.type = "小貨車";
                } else {
                    d.type = "小客車";
                }
                break;
            case "H":
                d.type = "人";
                break;
            case "C":
                d.type = "機車";
                break;
            case "D":
                d.type = "軍車";
                break;
            case "E":
                d.type = "特種車";
                break;
            case "F":
                d.type = "慢車";
                break;
            case "G":
                d.type = "其他車";
                break;
            default:
                d.type = "無";
                break;
        }
        return d.type;
    });
    carTypeGroup = carTypeDim.group().reduceCount();
    carTypePieChart
        .width(width)
        .height(height)
        .radius(100)
        .innerRadius(20)
        .slicesCap(13)
        .dimension(carTypeDim)
        .group(carTypeGroup)
        .legend(dc.legend())
        .label(function(d) {
            if (carTypePieChart.hasFilter() && !carTypePieChart.hasFilter(d.key)) {
                return "0%";
            }
            return Math.floor(d.value / all.value() * 100) + "%";
        })
        .colors(d3.scale.category10()).on("filtered", function(c, f) {
            updateGraph(c, f);
        });;

    //////////////////////////////////////////////////////////
    ///道路類別
    ///
    //////////////////////////////////////////////////////////
    roadCategoryPieChart = dc.pieChart("#roadCategoryPieChart");
    roadCategoryDim = ndx.dimension(function(d) {
        switch (d.roadCategory) {
            case "1":
                d.category = "國道";
                break;
            case "2":
                d.category = "省道";
                break;
            case "3":
                d.category = "縣道";
                break;
            case "4":
                d.category = "鄉道";
                break;
            case "5":
                d.category = "市區道路";
                break;
            case "6":
                d.category = "村里道路";
                break;
            case "7":
                d.category = "專用道路";
                break;
            default:
                d.category = "其他";
                break;
        }
        return d.category;
    });
    roadCategoryGroup = roadCategoryDim.group().reduceCount();
    roadCategoryPieChart
        .width(width)
        .height(height)
        .radius(100)
        .innerRadius(20)
        .slicesCap(8)
        .dimension(roadCategoryDim)
        .group(roadCategoryGroup)
        .legend(dc.legend())
        .label(function(d) {
            if (roadCategoryPieChart.hasFilter() && !roadCategoryPieChart.hasFilter(d.key)) {
                return "0%";
            }
            return Math.floor(d.value / all.value() * 100) + "%";
        })
        .colors(d3.scale.category10()).on("filtered", function(c, f) {
            updateGraph(c, f);
        });;

    //////////////////////////////////////////////////////////
    ///飲酒情形
    ///
    //////////////////////////////////////////////////////////
    drunkPieChart = dc.pieChart("#drunkPieChart");
    drunkDim = ndx.dimension(function(d) {
        if (d.drunk === "1" || d.drunk === "2") {
            d.drive = "飲酒";
        } else if (d.drunk === "9" || d.drunk === "10" || d.drunk === "11") {
            d.drive = "不明";
        } else {
            d.drive = "未飲酒";
        }
        return d.drive;
    });
    drunkGroup = drunkDim.group().reduceCount();
    drunkPieChart
        .width(width)
        .height(height)
        .radius(100)
        .innerRadius(20)
        .slicesCap(3)
        .dimension(drunkDim)
        .group(drunkGroup)
        .legend(dc.legend())
        .label(function(d) {
            if (drunkPieChart.hasFilter() && !drunkPieChart.hasFilter(d.key)) {
                return "0%";
            }
            return Math.floor(d.value / all.value() * 100) + "%";
        })
        .colors(d3.scale.category10()).on("filtered", function(c, f) {
            updateGraph(c, f);
        });;

    //////////////////////////////////////////////////////////
    lngDim = ndx.dimension(function(d) {
        return d.lng;
    });

    latDim = ndx.dimension(function(d) {
        return d.lat;
    });

    dc.renderAll();

    //事件更新
    function updateGraph(c, f) {
        d3.selectAll(".m").style("display", "none");
        d3.selectAll(".m").data(monthDayDim.top(Infinity)).style("display", "inline");
        updateAccidentMap(monthDayDim.top(Infinity));
    };
})
