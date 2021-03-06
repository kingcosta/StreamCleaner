//extract-rutube: Module to extract videos from Rutube

const log = require("./log");
const xhr = require("./xhr");

/*
	extract-rutube(): @param callback: function(videos) Called when the parsing is finished
			  @return: void
*/

module.exports = function(callback){
	let link = document.querySelector("link[rel=canonical]");
	let parser = document.createElement("a");
	parser.href = link.href;
	let videoId = /^\/?video\/(.+?)\/?$/.exec(parser.pathname)[1];
	let isPrivate = false;
	let privateKey = "";
	if(videoId.split("/")[0] == "private"){
		videoId = videoId.split("/")[1];
		isPrivate = true;
		privateKey = "&p=" + parser.search.split("p=")[1];
	}
	xhr.get(location.protocol + "//rutube.ru/api/play/options/" + encodeURIComponent(videoId) + "/?format=json" + privateKey, function(responseText){
		let videoM3Upath = JSON.parse(responseText).video_balancer.m3u8;
		xhr.get(videoM3Upath, function(responseText){
			let M3Ulines = responseText.split("\n");
			let output = [{url: null, info: "Due to Rutube limitation the video can't be extracted in only one file."},
				{url: null, info: "This is m3u files who's contain the list of segmented files, it must be read with a compatible player like VLC in network stream mode."}];
			for(l of M3Ulines){
				if(l[0] != "#" && l != ""){
					let formatDetail = /^http.*?i=[0-9]+x([0-9]+)_[0-9]+$/.exec(l)[1] + "p";
					output.push({
						url: l,
						info: formatDetail
					});
				}
			}
			log(JSON.stringify(output));
			callback(output);
		});
	});
}
