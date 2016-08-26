/**
 * This app runs the ChainChat messaging client, an IBM Blockchain-powered high-security,
 * decentralized instant-messenger.
 * 
 * This is the client side js program
 * 
 * Contributors:
 *  - Alexandre Pauwels
 *  - Jack Sartore
 *  - Siddarth Ramesh
 * 
 * Last updated: 07/13/2016
 */
var socket = io();
var name;


$(document).ready(function () {


	$('#send').click(function () {
		if ($('#chatinput').val().trim() != '' && $('#chatinput').val().length <= 500) {  ///Fix for empty messages maybe
			socket.emit('message', $('#chatinput').val());
			$('#chatinput').val('');
		}
		return false;
	});

	$('#chatinput').keypress(function (e) {
		if (e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			$('#send').trigger("click");
		}
	});


	$(".menu").hide();
	$(".hamburger").click(function () {
		$(".menu").animate({ height: 'toggle', width: 'toggle' }, 'fast');
	});

	$(".menu_item").click(changeRoom);
	$(document).click(function (event) {
		if (!$(event.target).is('.menu') && !$(event.target).is('.hamburger')) {
			$('.menu').fadeOut('fast');
		}
	});

	$('.new_room').click(changeRoom);//Roomlist click

	$(".nameList").click(newDM); //Namelist click
});

//When a user connects to the server
socket.on('connect', function (socket2) {
	socket
		.on('authenticated', function () {
			console.log("Authorized");
		})
		.on('unauthorized', function (error, callback) {
			console.log("User not authorized")
		})
		.emit('authenticate', { token: token });
});

socket.on('updateRoom', function (user) {
	$('.rname').remove();
	var roomName = $('<span>', { class: 'rname' }).css('font-size', '12px');
	jsonUser = JSON.parse(user);
	var room = jsonUser.room
	roomName.text(room);
	$('#room').append(roomName);


});

//Updates the list of Rooms on the server
socket.on('channelListUpdate', function (room, old) {
	var list = JSON.parse(room);
	if (old != null) {
		oldID = '#' + old;
		$(oldID).remove();
	}
	for (var i in list) {
		var id = '#' + i;
		if (!$(id).length) {
			var listEntry = $('<span>', { class: 'menu_item', id: i });
			listEntry.text(i);
			$('#roomlist').append(listEntry);
			$(listEntry).click(changeRoom);
		}
	}
});

//Make the user list in th sidebar
socket.on('userlist', function (users) {
	$('.list').remove();
	var jpeople = JSON.parse(users);
	var list = $('<p>', { class: 'list' });
	var nline = '';

	//Goes through all people in the list
	// If user is underined (someone left browser up and didn't log in) they will not show up
	for (var i in jpeople) {
		nline = jpeople[i].username + '';
		var pelem = $('<p>');
		var newspan = $('<span>', { class: 'initial', id: 'names', href: '#' }).css('background-color', jpeople[i].color);
		newspan.text(nline[0].toLocaleLowerCase());
		var newspan2 = $('<a>', { class: 'namelist', href: '#' });
		if (nline != 'undefined') {

			newspan2.text(nline);
			pelem.append(newspan);
			pelem.append(newspan2);
			var id = '/#' + socket.id;
			console.log(id);
			console.log(jpeople[i].id);

			//This is for you, puts current user at the top of the list
			if (jpeople[i].id == id) {
				var hr = $('<hr>', { width: "90%", noshade: "", size: "5", color: "#0088cc" });
				pelem.append(hr);
				list.prepend(pelem);
			} else {
				list.append(pelem);
			}
			console.log('fired');
			$(pelem).click(newDM);
		}
	}
	console.log(jpeople);
	$('#sidebar').append(list);
});

//Simple text message from server
socket.on('usermsg', function (msg) {
	$('#chatview').append($('<p>', { class: "welcome" }).text(msg));
	updateScroll();
});

//Plays sound when message is sent
socket.on('blop', function (data) {
	console.log('playing sound');
	var b = document.getElementById('blop');
	b.play();
});

//When a message is recieved by the client
//msg is actually a JSON object containing the user info
//Including message, time, name, color
socket.on('message', function (msg) {
	var usr = JSON.parse(msg);
	var newpelem = $('<p>', { class: "para" })
	if (usr.dm) {
		//If there is a direct message
		newpelem.css('color', '#cc00cc');
		console.log(usr.id);
		console.log(socket.id);
		newpelem.text(usr.msg);
		var localId = '/#' + socket.id
		if (localId != usr.id) {
			//Automatically type @user to respond if chat box is empty
			if ($('#chatinput').val() == '') {
				var dmTo = '@' + usr.username + ' ';

				$('#chatinput').val(dmTo);
			}
		}
	} else {
		//If no direct message
		newpelem.css('color', 'black');
		if (usr.gif) {
			console.log(usr.image_url);
			var stylecss = 'vertical-align: top; padding-left: 5px; padding-bottom: 5px;';
			var gif = $('<img>', { src: usr.image_url, style: stylecss, width: '320', });
			newpelem.text(usr.msg);
			newpelem.prepend(gif);


		} else {
			//If someone uses a direct gif URL or mp4, or there is no gif/image
			if (usr.msg.indexOf('.mp4') > -1) { //Video
				var vid = $('<video>', { src: usr.msg, width: '320', autoplay: true, loop: true });
				newpelem.append(vid);
			} else if (usr.msg.indexOf('.gif') > -1 || usr.msg.indexOf('.jpg') > -1) { //Gif/JPG
				var img = $('<img>', { src: usr.msg, width: '320' });
				newpelem.append(img);
			} else { //regular text message
				newpelem.text(usr.msg);
			}
		}
	}

	//Puts message into HTML and into the chat view
	var initial = $('<span>', { class: "initial" }).css('background-color', usr.color);
	initial.text(usr.username[0].toLowerCase());

	newpelem.prepend(initial);
	var d = new Date().toLocaleTimeString();
	var timelem = $('<span>', { class: "time" });
	if (usr.onChain == 1) {
		console.log('msg is on blockchain');
		var chainelem = $('<span>', { class: 'onChain' }).css('background-color', 'rgba(0, 102, 153, 0.8)');
		chainelem.text('B');
		timelem.append(chainelem);
	} else if (usr.onChain == 2) {
		console.log('msg is not on blockchain')
		var chainelem = $('<span>', { class: 'onChain' }).css('background-color', '#ff0000');
		chainelem.text('B');
		timelem.append(chainelem);
	}

	timelem.text(d.toString());
	newpelem.append(timelem);
	newpelem.append(chainelem);
	$('#chatview').append(newpelem);
	updateScroll();
});

//Changes the room name in the user list
function changeRoom() {
	var elemID = null;
	if (this.id == '+') {
		elemID = prompt("Enter new room name:", "Name...").trim();
		if (elemID == '+') {
			elemID = null;
		} else if (elemID.length > 8) {
			elemID = null;
			alert('Room name too long');
		} else if (elemID.indexOf(' ') >= 0) {
			elemID = null;
			alert('Room name must not contain spaces');
		}
	} else {
		elemID = this.id;
	}
	console.log(this.id);
	if (elemID != null) {
		$('#sidebarTitle').text(elemID);
		socket.emit('requestRoomChange', elemID);
		$(".menu").hide();
	}
}

//Automatically types the users name for a direct message
function newDM() {
	var dm = '@' + $(this).find('.namelist').html() + ' ';
	console.log('hello', dm);
	$('#chatinput').val(dm);
	$('#chatinput').focus();

}

//Automatically Scrolls the chat box as messages are received
function updateScroll() {
	var elem = $('#chatview');
	elem.scrollTop(elem.prop("scrollHeight"));
}
