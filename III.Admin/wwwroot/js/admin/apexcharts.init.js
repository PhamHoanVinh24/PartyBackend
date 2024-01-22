/*
Template Name: Nazox -  Admin & Dashboard Template
Author: Themesdesign
Contact: themesdesign.in@gmail.com
File: Apex Chart init js
*/

//  line chart datalabel

setTimeout(function () {
    var options = {
        chart: {
            height: 380,
            type: 'line',
            zoom: {
                enabled: false
            },
            toolbar: {
                show: false
            }
        },
        colors: ["#1cbb8c", "#5664d2", "#fcb92c", "#4aa3ff", "#ff3d60"],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            width: [3, 3],
            curve: 'straight'
        },
        series: [{
            name: "Url",
            data: [26, 24, 32, 36, 33, 31, 33]
        },
        {
            name: "Time Scan",
            data: [14, 11, 16, 12, 17, 13, 12]
        },
        {
            name: "Download File",
            data: [16, 13, 18, 14, 19, 15, 14]
        },
        {
            name: "File Size",
            data: [12, 9, 14, 10, 15, 11, 10]
        },
        {
            name: "Capchar Num",
            data: [19, 16, 21, 17, 22, 18, 17]
        }
        ],
        title: {
            text: 'Crawled Url by Time',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.2
            },
            borderColor: '#f1f1f1'
        },
        markers: {
            style: 'inverted',
            size: 6
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            title: {
                text: 'Month'
            }
        },
        yaxis: {
            title: {
                text: 'Number of Urls'
            },
            min: 5,
            max: 40
        },
        legend: {
            offsetY: 5
        },
        responsive: [{
            breakpoint: 600,
            options: {
                chart: {
                    toolbar: {
                        show: false
                    }
                },
                legend: {
                    show: false
                },
            }
        }]
    }

    var chart = new ApexCharts(
        document.querySelector("#line_chart_datalabel"),
        options
    );

    chart.render();


    // pie chart

    var options = {
        chart: {
            height: 320,
            type: 'pie',
        },
        series: [44, 55, 41, 17, 15],
        labels: ["Series 1", "Series 2", "Series 3", "Series 4", "Series 5"],
        colors: ["#1cbb8c", "#5664d2", "#fcb92c", "#4aa3ff", "#ff3d60"],
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            verticalAlign: 'middle',
            floating: false,
            fontSize: '14px',
            offsetX: 0,
            offsetY: 5
        },
        responsive: [{
            breakpoint: 600,
            options: {
                chart: {
                    height: 240
                },
                legend: {
                    show: false
                },
            }
        }]

    }

    var chart = new ApexCharts(
        document.querySelector("#pie_chart"),
        options
    );

    chart.render();
}, 5000);