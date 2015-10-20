define(['./module', "plupload"], function (module) {
  'use strict';

  module.directive('micsPlUpload', [
    '$log', 'core/configuration', 'core/common/auth/Session', 'core/common/auth/AuthenticationService', "jquery", "plupload",
    function ($log, configuration, Session, AuthenticationService, $, plupload) {
      return {
        scope: {
          uploadedFiles: '=',
          multiSelection: '=',
          micsPlUpload: '=',
          automaticUpload: '=',
          name: '='
        },
        link: function (scope, element, attributes) {
          scope.uploadError = null;
          var rootId = attributes.id;
          if (scope.automaticUpload.length === 0) {
            scope.automaticUpload = true;
          }
          console.log("AU:" + scope.automaticUpload);

          /**
           * Plupload Options
           */

          var defaultOptions = {
            runtimes: 'html5,flash,html4',
            flash_swf_url: 'bower_components/plupload/Moxie.swf',
            headers: {
              Authorization: AuthenticationService.getAccessToken()
            }
          };

          // Find upload button
          var uploadButton = element.find('.upload-button');
          if (uploadButton.length === 1 && !scope.automaticUpload) {
            uploadButton.bind('click', function () {
              if (name.length === 0) {
                $log.info("Needs a name");
              } else {
                $log.info("Uploading selected files");
                uploader.start();
              }
            });
          } else if (!scope.automaticUpload) {
            throw new Error("Plupload: Automatic upload was disabled but no .upload-button was found.");
          }

          // Find and setup browse button
          var browseButton = element.find('.browse-button');
          var currentEltId = attributes.id || 'plupload-' + Math.random();
          if (browseButton.length === 1) {
            browseButton.attr("id", currentEltId + "-browse-button");
            defaultOptions.browse_button = currentEltId + "-browse-button";
          } else {
            throw new Error("Plupload : no .browse-button button found, aborting");
          }

          // Find and setup drag'n'drop target
          var dropTarget = element.find('.drop-target');
          if (dropTarget.length === 1) {
            dropTarget.attr("id", currentEltId + "-drop-target");
            defaultOptions.drop_element = currentEltId + "-drop-target";
          } else {
            $log.info("plupload : no .drop-target found, ignoring drop_element");
          }

          // Merge options and default options
          var options = angular.extend({}, defaultOptions, scope.micsPlUpload);
          console.log("Plupload options: ", options);


          /**
           * Private Methods
           */

          function handleError(uploader, err) {
            scope.uploadError = err.message;
            scope.$apply();
            $log.warn('Error :', err);
          }

          function handlePostInit(uploader, params) {
            $log.info('Post init called, params :', params);
          }

          function handleInit(uploader, params) {
            if (uploader.features.dragdrop) {
              $log.log("Drag'n'drop feature ok. RootId: ", rootId);
              $('#' + rootId + ' .upload-debug').html("");
              var target = $('#' + attributes.id + ' .drop-target');
              target.ondragover = function (event) {
                event.dataTransfer.dropEffect = "copy";
              };

              target.ondragenter = function () {
                this.className = "dragover";
              };

              target.ondragleave = function () {
                this.className = "";
              };

              target.ondrop = function () {
                this.className = "";
              };
            }
          }

          function handleFilesAdded(uploader, files) {
            scope.uploadError = null;
            $log.debug("Files Added: ", files);
            if (scope.automaticUpload) {
              uploader.start();
            }
          }

          function handleFileUploaded(uploader, file, response) {
            var responseObj = $.parseJSON(response.response);
            if (responseObj.status === "ok" && responseObj.data && scope.uploadedFiles) {
              scope.$apply(function () {
                scope.uploadedFiles.push(responseObj.data);
              });
            }
          }

          /**
           * Plupload Setup
           */

          // Instantiate the Plupload uploader.
          var uploader = new plupload.Uploader(options);

          // Initialize the plupload runtime.
          uploader.bind('Error', handleError);
          uploader.bind('Init', handleInit);
          uploader.bind('PostInit', handlePostInit);
          uploader.init();
          uploader.bind('FilesAdded', handleFilesAdded);
          uploader.bind('FileUploaded', handleFileUploaded);

          // XXX fixme
          // the layout around the upload button can change : added rows in a table, a loaded image push the content, etc.
          // I can think of a better way to keep the invisible <input type="file"> right above the upload button.
          // Just binding it on the FileUploaded event is not enough : in my use case, the new file add an image and once
          // the image is loaded it takes more space and pushes the browse button (but not the invisible input).
          // A interval is a bit overkill but it works.
          var refreshInterval = setInterval(function () {
            $log.debug("Refreshing Plupload");
            uploader.refresh();
          }, 500);

          scope.$on('$destroy', function () {
            $log.debug("Stopping Plupload refresh");
            clearInterval(refreshInterval);
            uploader.destroy();
          });
        }
      };
    }
  ]);
});
