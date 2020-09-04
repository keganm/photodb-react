import {gapi,loadAuth2} from 'gapi-script';

var API_KEY = 'AIzaSyDQveRgo09FZ9wxoxLe1sAnLr0kdLqAZSo';

// Query object
var DriveInterface = (function () {

	var CLIENT_ID = '850914212287-hoqmgr4095ausildipfbiug57clt8vp5.apps.googleusercontent.com';

	var DISCOVERY_DOCS = ['https://content.googleapis.com/discovery/v1/apis/drive/v3/rest', 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];

	var SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://mail.google.com/ https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send';

	var accesstoken = '';

	var undoHistory = {};
	var undoIndex = -1;
	var processedlist;


	var resolvedTimer;
	var resolvedDelay = 2000;

	var latestQuery = '';


	var defaultFieldList = [
		'id',
		'driveId',/*teamDriveId*/
		'name',
		'mimeType',
		'imageMediaMetadata',
		'videoMediaMetadata',
		'parents',
		'description',
		'properties',
		'contentHints',
		'hasThumbnail',
		'thumbnailLink',
		'thumbnailVersion',
		'webContentLink',
		'webViewLink',
		'capabilities'
	];

	var kActions = {
		DELETE: 'Deleting',
		MOVE: 'Moving'
	}

	var fieldrequestlist = '';

	function gapiinit() {
		defaultFieldList.forEach(option => {
			fieldrequestlist += option + ',';
		});
		fieldrequestlist = fieldrequestlist.slice(0, -1);
		gapi.load('client:auth2', initClient);
	}


	function initClient() {
		gapi.client.init({
			discoveryDocs: DISCOVERY_DOCS,
			clientId: CLIENT_ID,
			scope: SCOPES
		}).then(function () {
			let authinst = gapi.auth2.getAuthInstance();

			authinst.isSignedIn.listen(updateSigninStatus);

			let got = authinst.isSignedIn.get();
			if (got)

				updateSigninStatus(got);
			else
				gapi.auth2.getAuthInstance().signIn();
		});
	}

	function ForceSignIn() {
		gapi.auth2.getAuthInstance().signIn();
	}

	function ForceSignOut() {
		gapi.auth2.getAuthInstance().signOut();
		document.location.reload();
	}

	function updateSigninStatus(isSignedIn) {
		console.log('updateSigninStatus: ' + isSignedIn);
		if (isSignedIn) {
			Main.execute();
		}
	}

	function authenticate() {
		if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
			loadClient();
			return;
		}
		return gapi.auth2.getAuthInstance()
			.signIn({
				scope: "https://www.googleapis.com/auth/drive"
			})
			.then(function () {
					console.log("Sign-in successful");
					loadClient();
				},
				function (err) {
					console.error("Error signing in", err);
				});
	}

	function loadClient() {
		return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
			.then(function () {
					console.log("GAPI client loaded for API");

					var imagediv = document.getElementById('image-div');
					imagediv.innerHTML = '';

					Main.execute();
				},
				function (err) {
					console.error("Error loading GAPI client for API", err);
				});
	}

	function getFolderChildren(photoFolderID) {
		var args = {
			"pageSize": "1000",
			"corpora": "teamDrive",
			"includeItemsFromAllDrives": "true",
			"supportsAllDrives": "true",
			"driveId": photoFolderID,
			"fields": "nextPageToken, files(id,name,parents)",
			"q": "mimeType = 'application/vnd.google-apps.folder'"
		};
		return args;
	}

	function getFolderContents(photoFolderID, parent) {
		var args = {
			"pageSize": "1000",
			"corpora": "teamDrive",
			"includeItemsFromAllDrives": "true",
			"supportsAllDrives": "true",
			"driveId": photoFolderID,
			"fields": "nextPageToken, files(id,name,parents,mimeType)",
			"q": "'" + parent + "' in parents"
		};
		return args;
	}

	function defaultArgs(photoFolderID) {
		var args = {
			"q": '',
			"pageSize": "25",
			'fields': "nextPageToken, files(" + fieldrequestlist + ")",
			"corpora": "teamDrive",
			"includeItemsFromAllDrives": "true",
			"supportsAllDrives": "true",
			"driveId": photoFolderID,
		};
		return args;
	}

	function parentArgs(parent, photoFolderID) {
		var args = {
			"fileId": parent,
			"corpora": "teamDrive",
			"includeItemsFromAllDrives": "true",
			"supportsAllDrives": "true",
			"driveId": photoFolderID,
			"fields": "parents,name"
		};
		return args;
	}

	function MakeQuery(args, parser, method, callback, options, bypassHistory) {
		if (!bypassHistory) {
			undoIndex++;
			var marker = {
				'args': args,
				'parser': parser,
				'method': method,
				'callback': callback,
				'options': options
			};
			undoHistory['state' + undoIndex] = marker;
			window.history.pushState({
				state: 'state' + undoIndex
			}, "state" + undoIndex, window.location.pathname);

		}
		latestQuery = args;

		return gapi.client.drive.files.list(args)
			.then(function (response) {
					//console.log("Response", response);
					//console.log("args",args);
					if (latestQuery != args) {
						console.log('Outdated Query', args);
						return;
					}
					//results.concat(response.result.files);
					parser(response.result.files, method, response.result.nextPageToken);
					if (response.result.nextPageToken != null && response.result.nextPageToken.length >= 0) {
						if (options.parent) {
							if (options.search) {
								callback(options.search, options.parent, response.result.nextPageToken);
							}
							callback(options.parent, response.result.nextPageToken);
						} else
							callback(response.result.nextPageToken);
					} else {}
				},
				function (err) {
					console.error("Execute error", err);
				});
	}

	function GoBackQuery() {
		console.log("Maybe trace this way");

		Main.clearContainer();


		var currentState = window.history.state;

		if (currentState) {
			console.log(currentState);

			var newQuery = undoHistory[currentState.state];
			if (newQuery) {
				Main.clearContainer();
				newQuery.args.pageToken = null;
				MakeQuery(newQuery.args, newQuery.parser, newQuery.method, newQuery.callback, newQuery.options, true);
			}
		}

		return;
	}

	function CreateFolder(_name, _parent, _callback) {
		return new Promise((resolve, reject) => {
			var p = (_parent != null && _parent != '') ? _parent : Main.CurrentFolder();
			var meta = {
				'name': _name,
				'mimeType': 'application/vnd.google-apps.folder',
				"parents": [p]
			};
			gapi.client.drive.files.create({
				"supportsTeamDrives": "true",
				resource: meta,
			}).then((response) => {
				setTimeout(() => {
					console.log("Response", response);
					if (_callback != null)
						_callback();
					resolve({
						'name': response.result.name,
						'id': response.result.id
					});
				}, 1000);
			}, (err) => {
				reject();
			});

		});
	}

	var processedCount = 0;

	function DeleteFiles(_ids) {
		processedlist = [];
		ResetResolvedTimer(kActions.DELETE);
		Utilities.SetWorking(true);
		processedCount = _ids.length;
		for (var i = 0; i < _ids.length; i++) {
			Utilities.SetMessage('Deleting: ' + i);
			DeleteFile(_ids[i]);
		}
	}

	function DeleteFile(_id) {
		ResetResolvedTimer(kActions.DELETE);
		return gapi.client.drive.files.get({
			"fileId": _id,
			"supportsTeamDrives": "true"
		}).then((response) => {
			gapi.client.drive.files.delete({
				"fileId": _id,
				"supportsTeamDrives": "true"
			}).then((response) => {
				console.log(response);
				stepProcessing(_id, kActions.DELETE);
			}, (err) => {
				if (err.body.includes("User Rate Limit Exceeded")) {
					console.log("userRateLimitExceeded");
					setTimeout(() => {
						DeleteFile(_id);
					}, 5000);
				} else {
					console.log(err);
					stepProcessing(_id, kActions.DELETE);
				}
			});
		}, (err) => {
			console.log(err);
			if (err.status < 500)
				setTimeout(() => {
					DeleteFile(_id);
				}, 2500 + Math.trunc(Math.random() * 2500));
			else
				stepProcessing(_id, kActions.DELETE);
		});
	}




	function moveToFiles(_newParent, _ids) {
		processedlist = [];
		ResetResolvedTimer(kActions.MOVE);
		Utilities.SetWorking(true);
		processedCount = _ids.length;

		for (var i = 0; i < _ids.length; i++) {
			Utilities.SetMessage(kActions.MOVE + i);
			moveToFile(_newParent, _ids[i]);
		}


	}

	function moveToFile(newparentId, targetId) {
		return gapi.client.drive.files.get({
			"fileId": targetId,
			"supportsTeamDrives": true,
			"fields": "parents"
		}).then((response) => {
			console.log(response.result.parents[0]);
			let previousParents = response.result.parents[0];

			gapi.client.drive.files.update({
				'fileId': targetId,
				'addParents': newparentId,
				'removeParents': response.result.parents.toString(),
				"supportsTeamDrives": true,
			}).then((response) => {
				console.log(response);
				stepProcessing(targetId, kActions.MOVE);
			}, (err) => {
				if (err.body.includes("User Rate Limit Exceeded")) {
					setTimeout(() => {
						moveToFile(newparentId, targetId);
					}, 5000);
				} else {
					console.log(err);
					stepProcessing(targetId, kActions.MOVE);
				}
			});
		}, (err) => {
			if (err.status < 500)
				setTimeout(() => {
					moveToFile(newparentId, targetId);
				}, 2500 + Math.trunc(Math.random() * 2500));
			else {
				console.log(err);
				stepProcessing(targetId, kActions.MOVE);
			}
		});
	}

	function stepProcessing(_id, action) {
		if (_id)
			processedlist.push(_id);

		Utilities.SetMessage(action + ' ' + processedlist.length);
		if (processedlist.length + 1 >= processedCount) {
			Utilities.SetWorking(false);
			Main.RefreshCurrent();
		}
		/*
		resolvedTimer = setTimeout(()=>{
			
			Utilities.SetWorking(false);
			Main.RefreshCurrent();
		},resolvedDelay);
		*/
	}

	function RenameFile(_name, _id) {
		return gapi.client.drive.files.update({
			'fileId': _id,
			"supportsTeamDrives": "true",
			'resource': {
				'name': _name
			}
		}).then((response) => {
			Main.RefreshCurrent();
			console.log(response);
		});
	}

	function CreateUploadFile(fileMetaData, media) {
        gapi.client.drive.files.create()
		gapi.client.drive.files.create({
				resource: fileMetaData,
				media: media,
				fields: 'id'
			}).then((resp)=>{console.log(resp)},
			function (err, file) {
				if (err) {
					console.log(err);
				} else {
					console.log('File ID', file.CLIENT_ID);
				}
			})
	}

	var ToDeleteList;

	function DeleteFolder(_id) {
		ResetResolvedTimer(kActions.DELETE);
		ToDeleteList = [];
		processedlist = [];
		ProcessFolder(_id);
	}

	function ProcessFolder(_id, _pageToken) {
		var request = getFolderContents(Main.PhotoFolderID(), _id);
		if (_pageToken != null)
			request.pageToken = _pageToken;
		gapi.client.drive.files.list(request)
			.then((response) => {
				ResetResolvedTimer(kActions.DELETE);
				console.log(response);
				if (!ToDeleteList.includes(_id)) {
					ToDeleteList.push(_id);
					DeleteFile(_id);
				}
				ProcessDeletion(response.result);
				if (response.result.nextPageToken) {
					ProcessFolder(_id, response.result.nextPageToken);
				}

			}, (err) => {
				if (err.body.includes("User Rate Limit Exceeded")) {
					setTimeout(() => {
						console.log("userRateLimitExceeded");
						ProcessFolder(_id, _pageToken);
					}, 2000);
				}
			});
	}

	function GotoTargetParent(id) {
		var targetid;
		var targetname;
		return gapi.client.drive.files.get({
				"fileId": id,
				"supportsTeamDrives": true,
				"fields": "parents"
			})
			.then((response) => {
				targetid = response.result.parents[0];
				if (targetid == Main.CurrentFolder())
					return;
				return gapi.client.drive.files.get({
						"fileId": response.result.parents[0],
						"supportsTeamDrives": true,
						"fields": "name"
					})
					.then((response) => {
						Main.SendTo(response.result.name, targetid);
					}, (err) => {
						if (err.status < 500)
							setTimeout(GotoTargetParent(id), 2500 + Math.trunc(Math.random() * 2500));
					})
			}, (err) => {
				if (err.status < 500)
					setTimeout(GotoTargetParent(id), 2500 + Math.trunc(Math.random() * 2500));

			})
	}

	function ProcessDeletion(results) {
		var files = results.files;

		for (var i = 0; i < files.length; i++) {
			if (files[i].mimeType == 'application/vnd.google-apps.folder') {
				ProcessFolder(files[i].id);
			} else {
				ToDeleteList.push(files[i].id);
				DeleteFile(files[i].id);
			}
		}
	}


	function ResetResolvedTimer(action) {
		clearTimeout(resolvedTimer);

		Utilities.SetWorking(true);
		var msg = '';
		if (processedlist)
			msg = processedlist.length;
		Utilities.SetMessage(action + ' ' + msg)
	}

	function onStartedDownload(id) {
		console.log(`Started downloading: ${id}`);
	}

	function onFailed(error) {
		console.log(`Download failed: ${error}`);
	}

	function DownloadFile(webContentLink, name, id, type) {

		//TODO revisit this


		/*
		var args = defaultArgs;
		return gapi.client.drive.files.export(
		{	
			"fileId":id,
			"mimeType":type	
		}).then(function (response) {
			console.log("Name: " + name + " --- " + response);
		});*/
		var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

		webContentLink = webContentLink.replace("export=download", "alt=media");
		webContentLink += "&access_token=" + encodeURIComponent(accessToken);
		//webContentLink = "https://cors-anywhere.herokuapp.com/" + webContentLink;

		//saveAs(webContentLink,name);
		chrome.downloads.download(webContentLink);
		/*		var downloading = browser.downloads.download({
					url : webContentLink,
					saveAs : true,
				});
				downloading.then(onStartedDownload,onFailed);
		*/
	}

	function UpdateTarget(fileId,params,callback){
		var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

		$.ajax({
			url: 'https://www.googleapis.com/drive/v3/files/'+fileId+'?supportsAllDrives=true&alt=json&key='+API_KEY,
			data:JSON.stringify(params),
			type:'PATCH',
			contentType:'application/json',
			headers:{
				"Authorization":'Bearer '+accessToken,
				Accept: "application/json",         
				"Content-Type": "application/json"
			},
			success:(res)=>{
				
				console.log(res);
				if(callback)
				callback(res,fileId,params);

			},
			error:(res)=>{
				let errors = res.responseJSON.error.errors;
				for(let i = 0; i < errors.length;i++)
					if(errors[i].reason == "userRateLimitExceeded")
						setTimeout(() => {
							UpdateTarget(UpdateTarget(fileId,params,callback));
						}, Math.random()*8000 + 2000);
				console.log(res);
			}
		});
		return;

		var xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.onreadystatechange = ()=>{
			if(xhr.readyState != XMLHttpRequest.DONE){
				return;
			}
			if(callback)
				callback(xhr.response);
		}
		xhr.open('PATCH','https://www.googleapis.com/drive/v3/files/'+fileId);
		xhr.setRequestHeader('Authorization','Bearer '+accessToken);
		xhr.send(JSON.stringify(params));
	}

	return {
		gapiinit: gapiinit,
		authenticate: authenticate,
		loadClient: loadClient,
		getFolderChildren: getFolderChildren,
		defaultArgs: defaultArgs,
		parentArgs: parentArgs,
		MakeQuery: MakeQuery,
		GoBackQuery: GoBackQuery,
		CreateFolder: CreateFolder,
		DeleteFiles: DeleteFiles,
		DeleteFolder: DeleteFolder,
		DeleteFile: DeleteFile,
		MoveToFiles: moveToFiles,
		RenameFile: RenameFile,
		CreateUploadFile: CreateUploadFile,
		ForceSignIn: ForceSignIn,
		ForceSignOut: ForceSignOut,
		DownloadFile: DownloadFile,
		GotoTargetParent: GotoTargetParent,
		UpdateTarget: UpdateTarget,
	}
})();