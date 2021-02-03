define([
    "dojo/_base/declare",
    "icm/action/Action",
    "dojo/dom-style",
    "dijit/form/Button",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "icm/util/Coordination",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/FilteringSelect",
    "dojo/data/ItemFileWriteStore",
    "dojox/form/Uploader",
    "dojox/form/uploader/FileList",
    "dojo/aspect",
    "icmcustom/js/FileSaver",
    "dojo/dom-attr",
    "dojo/request/xhr",
    "dojo/domReady!"
], function(declare, Action, domStyle, Button, declare, lang, Coordination, BaseDialog, FilteringSelect, ItemFileWriteStore, Uploader, FileList, aspect, FileSaver, domAttr, xhr) {

    return declare("icmcustom.action.ICMSearchExportAction", [Action], {
        solution: null,

        isEnabled: function() {

            var Solution = this.getActionContext("Solution");
            if (Solution === null || Solution.length == 0) {
                return false;
            } else {
                this.solution = Solution[0];
                return true;
            }
        },
        execute: function() {
        	const xlsx = require('xlsx');
        	var targetOS = this.propertiesValue.targetOS;
        	var jsonString=JSON.stringify(this.propertiesValue.displayNames);
        	var jsonObj=JSON.parse(jsonString);
        	var displayNames = JSON.parse(jsonObj);
        	var keys = Object.keys(displayNames);
        	var values = Object.values(displayNames);
            var ceQuery = this.propertiesValue.searchQuery;
            this._repositoryId = targetOS;
            var repository = ecm.model.desktop.getRepositoryByName(targetOS);

            this._ceQuery = ceQuery;
            var resultsDisplay = ecm.model.SearchTemplate.superclass.resultsDisplay;
            resultsDisplay = [];
            var sortBy = "";
            var sortAsc = true;
            var json = '{' + resultsDisplay + '}';
            this._searchQuery = new ecm.model.SearchQuery();
            var json = JSON.parse(json);
            this._searchQuery.repository = repository;
            this._searchQuery.resultsDisplay = json;
            this._searchQuery.pageSize = 0;
            this._searchQuery.query = ceQuery;
            this._searchQuery.search(lang.hitch(this, function(results) {
            	if (results.items.length > 0) {
            		searchResults = results.items;
                    var fileName = "Search_Results_Export";
                    fileName = fileName + ".xlsx";
                    var sr = [];
                    for(var i=0;i<searchResults.length;i++){
                    	var caseData = JSON.stringify(searchResults[i].attributes);
                    	var jsonData = JSON.parse(caseData);
                    	if("DateLastModified" in jsonData){
                    		delete jsonData['DateLastModified'];
                    	}
                    	for(var l=0;l<keys.length;l++){
                    	var val = jsonData[keys[l]];
                    	jsonData[values[l]] = val;
                    	delete jsonData[keys[l]];
                    	}
                        sr.push(jsonData);
                    }
                    var wb = xlsx.utils.book_new();
                    wb.SheetNames.push("Search Results");
                    var ws = xlsx.utils.json_to_sheet(sr);
                    wb.Sheets["Search Results"] = ws;
                    var wbout = xlsx.write(wb, {
                        bookType: 'xlsx',
                        type: 'binary'
                    });
                    function s2ab(s) {

                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
                        return buf;

                    }
                    var blob = new Blob([s2ab(wbout)], {
                        type: "application/octet-stream"
                    });
                    saveAs(blob, fileName);
                }
            }), sortBy, sortAsc, null, function(error) {

                console.log(error);
            });
        }

    });
});