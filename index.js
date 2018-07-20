void async function() {
    // Configuration Stuff
    var config = {
        email: "Your email address goes here",
        password: "Your password goes here",
        courseUrl: "https://app.pluralsight.com/library/courses/best-practices-angular/table-of-contents",
        // Sleep time is used to wait between downloads. May be useful for preventing throttling
        sleepTime: 10000
    };

    // Require stuff
    var Nightmare = require('nightmare');
    var sleep = require('system-sleep');
    var https = require('https');
    var fs = require("fs");

    // Nightmare setup
    var nightmare = Nightmare({ show: false });

    // Use nightmare to login and save a list of all the videos in the course
    var course;
    console.log("Logging in...");
    await nightmare
        .goto("https://app.pluralsight.com/id/")
        .insert("#Username", config.email)
        .insert("#Password", config.password)
        .click("button")
        .wait(2000)
        .goto(config.courseUrl)
        .wait(5000)
        .evaluate(function() {
            var courseVideos = [];
            document.querySelectorAll(".table-of-contents__clip-list-item a").forEach((course) => {
                courseVideos.push({
                    name: course.text.replace("?", "").replace("/", "").replace("|", "").replace("\\", "").replace("*", "").replace("<", "").replace(">", "").replace(":", ""),
                    url: course.href,
                    src: "" // We need to load each url to get the src
                });
            });
            return {
                videos: courseVideos.filter((c) => c.url),
                title: document.title.replace(" | Pluralsight", "").replace("?", "").replace("/", "").replace("|", "").replace("\\", "").replace("*", "").replace("<", "").replace(">", "").replace(":", "")
            }
        })
        .then(function(result) {
            course = result;
        });
    // Make sure we found course videos
    var numberOfVideos = course.videos.length;
    if (!numberOfVideos) {
        console.error("Failed to find videos. Check your login credentials and make sure the course exists.");
        process.exit(1);
    }
    console.log("Found " + course.title + " on Pluralsight. Number of videos: " + course.videos.length.toString() + ".");
    // Create needed folders
    console.log("Creating videos folder.");
    if (!fs.existsSync("videos/")) {
        fs.mkdirSync("videos/");
    }
    console.log("Creating course folder: " + course.title + ".");
    if (!fs.existsSync("videos/" + course.title)) {
        fs.mkdirSync("videos/" + course.title);
    }
    // Loop through the course videos and download them
    console.log("Looking for video sources and downloading.");
    for (var i = 0; i < course.videos.length; i++) {
        // Variable setup
        var number = i + 1;
        // Find the video source
        console.log("Looking for video source for: " + course.videos[i].name + ".");
        await nightmare
            .goto(course.videos[i].url)
            .wait("video")
            .wait(2000)
            .evaluate(function() {
                return document.querySelector("video").src
            })
            .then(function (result) {
                course.videos[i].src = result
            });
        console.log("Found video source for: " + course.videos[i].name + ".");
        // Make sure the video doesn't already exist
        if (fs.existsSync("videos/" + course.title + "/" + number + ". " + course.videos[i].name.replace("/", "") + ".mp4")) {
            console.log("Skipping download of course video: " + course.videos[i].name + " since it already exists.");
        }
        else {
            // Save the file
            console.log("Saving course video: " + course.videos[i].name + ".");
            var file = fs.createWriteStream("videos/" + course.title + "/" + number + ". " + course.videos[i].name.replace("/", "") + ".mp4");
            var done = false;
            var request = https.get(course.videos[i].src,(response) => {
                response.pipe(file);
                done = true;
            });
            while (!done) {
                sleep(1000);
            }
        }
        sleep(config.sleepTime);
    }
    // Done downloading
    console.log("Course downloaded.");
    process.exit(0);
} ();
