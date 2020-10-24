var viewer;

LoadOnline3DModels = function () {
	function Error(viewerElement, message) {
		var context = viewerElement.getContext('2d');
		context.font = '12px Arial';
		context.fillText(message, 0, 12);
	}

	function LoadViewer(viewerElement) {
		var urls = viewerElement.getAttribute('sourcefiles');
		if (urls === undefined || urls === null) {
			Error(viewerElement, 'Invalid source files.');
			return;
		}

		var urlList = urls.split('|');
		JSM.ConvertURLListToJsonData(urlList, {
			onError: function () {
				Error(viewerElement, 'Conversion failed.');
				return;
			},
			onReady: function (fileNames, jsonData) {
				var viewerSettings = {
					cameraEyePosition: [6.0, -5.5, 4.0],
					cameraCenterPosition: [0.0, 0.0, 0.0],
					cameraUpVector: [0.0, 0.0, 1.0]
				};

				if(!viewer) {
					viewer = new JSM.ThreeViewer();
				}

				if (!viewer.Start(viewerElement, viewerSettings)) {
					Error(viewerElement, 'Internal error.');
					return;
				}

				viewer.SetClearColor(viewerElement.getAttribute('bg-color'));
				viewer.RemoveMeshes();
				var currentMeshIndex = 0;
				var environment = {
					onStart: function (/*taskCount, meshes*/) {
						viewer.EnableDraw(false);
					},
					onProgress: function (currentTask, meshes) {
						while (currentMeshIndex < meshes.length) {
							viewer.AddMesh(meshes[currentMeshIndex]);
							currentMeshIndex = currentMeshIndex + 1;
						}
					},
					onFinish: function (meshes) {
						if (meshes.length > 0) {
							viewer.AdjustClippingPlanes(50.0);
							viewer.FitInWindow();
						}
						viewer.EnableDraw(true);
						viewer.Draw();
					}
				};

				var textureLoaded = function () {
					viewer.Draw();
					window.dispatchEvent(new Event("reloadComplete"));
				};
				JSM.ConvertJSONDataToThreeMeshes(jsonData, textureLoaded, environment);
			}
		});
	}

	var supported = JSM.IsWebGLEnabled() && JSM.IsFileApiEnabled();
	var canvas = document.getElementById('3dcanvas');
	if (supported) {
		LoadViewer(canvas);
	} else {
		Error(canvas, 'No browser support.');
	}
};
