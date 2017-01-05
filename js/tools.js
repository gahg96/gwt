var states = new Array();
var t;
var xmlString = '';

function Loggg() {
	this.types = {err : 'ERROR', warn : 'WARNING', inf : 'INFO'}
	this.l = function(t, m){console.log(t+"\t"+m);}
}

function State(name, previousAction, nextAction) {
	this._id = -1;
	this._name = name;
	this._previousAction = previousAction;
	this._nextAction = nextAction;
	this._fields = new Array();
}

State.prototype = {
	setId : function(id){this._id = id;},
	getId : function(){return this._id;},
	getName : function(){return this._name;},
	getPreviousAction : function(){return this._previousAction;},
	setPreviousAction : function(a){this._previousAction = a;},
	getNextAction : function(){return this._nextAction;},
	setNextAction : function(a){this._nextAction = a;},
	addField : function(k,v){this._fields.push(k+"=>"+v);},
	modifyField : function(on,nv){
		var pair;
		for(i=0; i<this._fields.length; i++) {
			pair = this._fields[i].split('=>');
			if(pair[0]==on) {
				this._fields[i] = nv;
				break;
			}
		}
	},
	removeField : function(k){
		for(i=0; i<this._fields.length; i++) {
			if(this._fields[i].split('=>')[0]==k) {
				this._fields.splice(i,1);
				break;
			}
		}
	},
	getFieldAt : function(i){return this._fields[i];},
	getFields : function(){return this._fields;},
	drawFields : function(){
		var res = '<table><thead><tr><td class="state_name">'+this.getName()+'</td><td class="remove_state"><a href="" onclick="javascript:removeState('+this.getId()+');return false;">-</a></td></tr>';
		res += '<tr><td><input type="text" onkeyup="javascript:modifyPrevAction(event, \''+this.getId()+'\')" id="prev_action_'+this.getId()+'" class="prev_action" value="'+this.getPreviousAction()+'" /><td>a</td></td>';
		//res += '<td><input type="text" onkeyup="javascript:modifyNextAction(event, \''+this.getId()+'\')" id="next_action_'+this.getId()+'" class="next_action" value="'+this.getNextAction()+'" /></td></tr></thead><tbody>';
		res += '</tr></thead><tbody>';
		var elementName = '';
		res += '<tr><td><textarea type="text" class="addnewfield" value="" id="addnewfield_'+this.getId()+'" onkeydown="javascript:addNewField(event, '+this.getId()+');"></textarea></td><td>f</td></tr>';
		for(k=0; k<this._fields.length; k++) {
			elementName = this._fields[k].split('=>')[0];
			res += '<tr><td><textarea onblur="resetAreaSize(event, \''+elementName+'\', \''+this.getId()+'\')" onfocus="autosizeArea(event, \''+elementName+'\', \''+this.getId()+'\')" id="field_'+elementName+'_'+this.getId()+'" class="field" name="'+elementName+'" onmouseenter="swapFieldBackground(\''+elementName+'\')" onmouseleave="swapFieldBackground(\''+elementName+'\')" onkeydown="javascript:modifyField(event, \''+elementName+'\', \''+this.getId()+'\');">'+this._fields[k]+'</textarea></td><td><a href="" onclick="javascript:removeField(\''+elementName+'\',\''+this.getId()+'\');return false;">-</a></td></tr>';
		}
		return res+'</tbody></table>';
	}
};

function autosizeArea(e, nm, id) {
	var res = document.getElementById('field_'+nm+'_'+id);
	if(res=='') return false;

	res.style.height = parseInt(res.scrollHeight) + 'px';
}

function resetAreaSize(e, nm, id) {
	var res = document.getElementById('field_'+nm+'_'+id);
	if(res=='') return false;

	res.style.height = '17px';
}

function addNewField(e, id) {
	var a = new Array();
	var res = document.getElementById('addnewfield_'+id);
	if(res=='') return false;

	if (e.keyCode!=13) {
		res.style.backgroundColor='rgb(255,0,0)';
		if(res.value=='')
			res.style.backgroundColor='rgb(255,255,255)';
		return false;
	}
	else e.preventDefault();

	if(id>=states.length) return false;

	res.style.backgroundColor='rgb(255,255,255)';

	var pair = res.value.split("=>");
	
	tmp = states[id];

	if(pair.length==1) {
		tmp.addField(pair[0],'');
	}
	else {
		tmp.addField(pair[0],pair[1]);
	}
	reset();
	render();

	return true;
}

function modifyField(e, nm, id) {
	var res = document.getElementById('field_'+nm+'_'+id);
	if(res=='') return false;

	if (e.keyCode!=13) {
		res.style.backgroundColor='rgb(255,0,0)';
		if(res.value=='')
			res.style.backgroundColor='rgb(255,255,255)';
		return false;
	}
	else e.preventDefault();

	res.style.backgroundColor='rgb(255,255,255)';

	states[id].modifyField(nm, res.value);

	reset();
	render();

	return true;
}

function modifyAction(e, typ, id, field) {
	var res = document.getElementById(field);
	if(res=='') return false;

	if (e.keyCode!=13) {
		res.style.backgroundColor='rgb(255,0,0)';
		if(res.value=='')
			res.style.backgroundColor='rgb(255,255,255)';
		return false;
	}
	else e.preventDefault();

	res.style.backgroundColor='rgb(255,255,255)';

	if(typ=='prev') {
		states[id].setPreviousAction(res.value);
	}

	if(typ=='next') {
		states[id].setNextAction(res.value);
	}

	reset();
	render();

	return true;
}

function modifyPrevAction(e, id) {
	var typ = 'prev';
	var field = 'prev_action_'+id;
	modifyAction(e, typ, id, field);
}

function modifyNextAction(e, id) {
	var typ = 'next';
	var field = 'next_action_'+id;
	modifyAction(e, typ, id, field);
}

function removeField(nm, id) {
	var res = document.getElementById('field_'+nm+'_'+id).value;
	states[id].removeField(nm);
	reset();
	render();
}

function addNewState() {
	var st = window.prompt("New state name: ");

	if((st==null) || (st=="")) return false;

	var s = new State(st, window.prompt("Action resulted the state: "), '');
	s.setId(states.length);
	states.push(s);
	reset();
	render();
}

function removeState(id) {
	for(m=0; m<states.length; m++) {
		if(states[m].getId()==id) {
			if(window.confirm("Removing state "+states[m].getName()+"?")==true) {
				states.splice(m, 1);
			}
			break;
		}
	}
	reset();
	render();
}

function reset() {
	t.innerHTML = '';
}

function render() {
	var render = ''
	for(m=0; m<states.length; m++) {
		render+='<div id="box'+states[m].getName()+'" class="box">'+states[m].drawFields()+'</div>';
	}
	t.innerHTML = render;
}

function swapFieldBackground(nm) {
	var elems = document.getElementsByName(nm);
	for(ii=0; ii<elems.length; ii++) {
		var elem = elems[ii];
		if(elem.style.backgroundColor=='rgb(255, 255, 0)') {
			elem.style.backgroundColor = 'rgb(255, 255, 255)';
		}
		else {
			elem.style.backgroundColor = 'rgb(255, 255, 0)';
		}
	}
}

function hello() {
	console.log("starting GWT...");
}

/**
 * http://stackoverflow.com/questions/2792951/firefox-domparser-problem
 */
function removeWhitespace(node) {
    for (var i= node.childNodes.length; i-->0;) {
        var child= node.childNodes[i];
        if (child.nodeType===3 && child.data.match(/^\s*$/))
            node.removeChild(child);
        if (child.nodeType===1)
            removeWhitespace(child);
    }
}

function parseXML() {
	var l = new Loggg();
	var docElement;

	states.length = 0;

	/*
	 * Old fashoined way:
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","test.xml",false);
	xmlhttp.send();

	xmlDoc=xmlhttp.responseXML;
	*/
	/*
	 * Sample XML file
	 * xmlString = '<?xml version="1.0" encoding="utf-8"?><gwt><state name="level0" previousaction="" nextaction="confirm"><field name="author">cn=somebody/o=dmhu</field><field name="reader">*</field></state><state name="level1" previousaction="confirm" nextaction="approve"><field name="author">cn=manager/o=dmhu</field></state><state name="level2" previousaction="approve" nextaction=""><field name="author"></field></state></gwt>';
	 */

	if (window.DOMParser) {
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(xmlString,"text/xml");
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(xmlString);
	}
	
	removeWhitespace(xmlDoc);
	docElement = xmlDoc.getElementsByTagName("state")[0];

	for(i=0; i<xmlDoc.getElementsByTagName("state").length; i++) {
		docElement = xmlDoc.getElementsByTagName("state")[i];
		if(docElement.nodeName!='#text') {
			var s = new State(docElement.attributes['name'].nodeValue, docElement.attributes['previousaction'].nodeValue, docElement.attributes['nextaction'].nodeValue);
			for(j=0; j<docElement.childNodes.length; j++) {
				key = docElement.childNodes[j].attributes['name'].nodeValue;
				if(docElement.childNodes[j].childNodes.length>0) {
					val = docElement.childNodes[j].childNodes[0].nodeValue;
				}
				else {
					val = '';
				}
				s.addField(key, val);
			}
			s.setId(i);
			states.push(s);
		}
	}
	reset();
	render();
}

function displayStringResult(str) {
	var strRendered = window.open("", "STR", "target=_blank,menubar=yes");
	strRendered.document.write(str);
}

function saveToXML() {
	var txtArea = '<textarea cols="100" rows="100">';
	var txtAreaEnd = '</textarea>';
	var xml = txtArea+'<?xml version="1.0" encoding="utf-8"?>\n<gwt>\n';
	for(i=0; i<states.length; i++) {
		var s = states[i];
		var fields = s.getFields();
		var pair;
		var key = '';
		var val = '';
		xml += '\t<state name="'+s.getName()+'" previousaction="'+s.getPreviousAction()+'" nextaction="'+s.getNextAction()+'">\n';
		for(ii=0; ii<fields.length; ii++) {
			pair = fields[ii].split('=>');

			if(pair.length==2) {
				xml += '\t\t<field name="'+pair[0]+'">'+pair[1]+'</field>\n';
			}
			else if(pair.length==1) {
				xml += '\t\t<field name="'+pair[0]+'"></field>\n';
			}
			else {;}
		}
		xml += '\t</state>\n';
	}

	xml += '</gwt>'+txtAreaEnd;

	displayStringResult(xml);
}

//http://www.html5rocks.com/en/tutorials/file/dndfiles/
function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files;

	var output = [];
	for(var i= 0, f; f=files[i]; i++) {
		var parts = f.name.split('.');
		if(parts[parts.length-1].toLowerCase()=='xml') {
			output.push(f.name);
			
			var reader = new FileReader();
	
			reader.onloadend = function(evt) {
				if(evt.target.readyState==FileReader.DONE) {
					//document.getElementById('dropped').textContent = evt.target.result;
					xmlString = evt.target.result;
					if(xmlString!='') {
						parseXML();
						document.getElementById('drop_it').innerHTML = 'Loaded: '+output.join('');
					}
				}
			};
	
			reader.readAsText(files[i]);
		}
	}
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
	document.getElementById('drop_it').style.backgroundColor='rgb(200, 200, 0)';
}

function handleDragLeave(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	document.getElementById('drop_it').style.backgroundColor='rgb(255, 255, 255)';
}

function initPage() {
	t = document.getElementById("xmlparsed");

	if(window.File && window.FileReader && window.FileList && window.Blob) {
		var dropIt = document.getElementById('drop_it');
		dropIt.addEventListener('dragenter', handleDragOver, false); //IE11 needs it
		dropIt.addEventListener('dragover', handleDragOver, false);
		dropIt.addEventListener('dragleave', handleDragLeave, false);
		dropIt.addEventListener('mouseleave', handleDragLeave, false);
		dropIt.addEventListener('drop', handleFileSelect, false);

		t.innerHTML = 'NO STATES';
	}
	else {
		t.innerHTML = 'The File API is not supported by your browser!';
	}
}

function createTabs(m) {
	var res = '';
	for(i=0;i<m;i++) {res+='\t'};
	return res;
}

function changeACLField(typ, value) {
	var res = '';
	var tab2 = createTabs(2);
	var endl = '\n';
	var values = value.split(':');

	if(value.charAt(0)=='~') return tab2+endl;

	for(var i=0; i<values.length; i++) {
		if((values[i].charAt(0)=='+') || (values[i].charAt(0)=='-') || (values[i].charAt(0)=='~')) {
			values[i] = values[i].substring(1,values[i].length);
		}
		if(values[i].charAt(0)=='@') {
			values[i] = '" & Me.Eval({'+values[i]+'}) & "';
		}
	}

	res += tab2+'Call '+typ+'("';
	if(value=='') {
		res += 'REMOVE:ALL",Me.m_doc)'+endl;
	}
	else if(value.charAt(0)=='+') {
		res += 'APPEND:'+values.join(':')+'",Me.m_doc)'+endl;
	}
	else if(value.charAt(0)=='-') {
		res += 'REMOVE:'+values.join(':')+'",Me.m_doc)'+endl;
	}
	else {
		res += 'REMOVE:ALL",Me.m_doc)'+endl;
		res +=  tab2+'Call '+typ+'("APPEND:'+values.join(':')+'",Me.m_doc)'+endl;
	}

	return res;
}

function generateLSClass() {
	var txtArea = '<textarea cols="100" rows="100">';
	var txtAreaEnd = '</textarea>';
	var endl = '\n';
	var tab = createTabs(1);
	var tab2 = createTabs(2);
	var tab3 = createTabs(3);
	var rem = '%REM';
	var endRem = '%END REM';
	var classStr = 'Class ';
	var endClassStr = 'End Class';
	var privateModif = 'Private ';
	var publicModif = 'Public ';
	var sub = 'Sub ';
	var endSub = 'End Sub';
	var exitSub = 'Exit Sub';
	var functionStr = 'Function ';
	var functionEndStr = 'End Function';
	var functionExitStr = 'Exit Function';
	var className = window.prompt('Class name: ');
	
	if((className===null) || (className=='')) return false;

	var description = window.prompt('Description: ');

	// class header doc
	var cl = txtArea+endl+'Use "Common Tools"'+endl+rem+endl+tab+'Class: '+className+endl+tab+'Description: '+description+endl+endRem+endl;

	// class name
	cl += classStr+className+endl;

	// private mebmers
	cl += tab+privateModif+'m_session As NotesSession'+endl;
	cl += tab+privateModif+'m_workspace As NotesUIWorkspace'+endl;
	cl += tab+privateModif+'m_doc As NotesDocument'+endl;
	cl += tab+privateModif+'m_tmpDoc As NotesDocument'+endl;

	// new method
	cl += tab+rem+endl+tab2+sub+'New'+endl+tab2+'Description: '+endl+tab+endRem+endl;
	cl += tab+publicModif+sub+'New'+endl+tab2+'Call Me.Init'+endl+tab+endSub+endl;

	// init method
	cl += tab+rem+endl+tab2+sub+'Init '+endl+tab2+'Description: '+endl+tab+endRem+endl;
	cl += tab+privateModif+sub+'Init'+endl;
	cl += tab2+'Set Me.m_session = New NotesSession'+endl;
	cl += tab2+'Set Me.m_workspace = New NotesUIWorkspace'+endl;
	cl += tab2+'If Not (Me.m_workspace Is Nothing) Then'+endl;
	cl += tab3+'Me.m_workspace.Currentdocument.Editmode = True'+endl;
	cl += tab3+'Set Me.m_doc = Me.m_workspace.Currentdocument.Document'+endl;
	cl += tab2+'End If'+endl;
	cl += tab+endSub+endl;

	// eval function to make easier getting the result of an Evaluate statement
	cl += tab+rem+endl+tab2+sub+'Eval '+endl+tab2+'Description: execute the Evaluate statement and return the result.'+endl+tab+endRem+endl;
	cl += tab+privateModif+functionStr+'Eval(q As String) As String'+endl;
	cl += tab2+'Dim res As Variant'+endl;
	cl += tab2+'res = Evaluate(q)'+endl;
	cl += tab2+'Eval = res(0)'+endl;
	cl += tab+functionEndStr+endl;

	// save and close avoiding the Do you want to save the document dialog
	cl += tab+rem+endl+tab2+sub+'SaveNClose '+endl+tab2+'Description: '+endl+tab+endRem+endl;
	cl += tab+privateModif+sub+' SaveNClose'+endl;
	cl += tab2+'On Error GoTo errorHandler'+endl;
	cl += tab2+'If Not (Me.m_doc Is Nothing) Then'+endl;
	cl += tab3+'Call Me.m_doc.Save(True, False)'+endl;
	cl += tab2+'End If'+endl;
	cl += tab2+'Call Me.m_workspace.CurrentDocument.Save()'+endl;
	cl += tab2+'Call Me.m_workspace.CurrentDocument.Close(True)'+endl;
	cl += 'Quit:'+endl;
	cl += tab2+exitSub+endl;
	cl += 'errorHandler:'+endl;
	cl += tab2+'\' eliminate the "Save Cancelled" dialog box'+endl;
	cl += tab2+'If (Err=4411) Then GoTo Quit'+endl;
	cl += tab2+exitSub+endl;
	cl += tab+endSub+endl;

	for(var c=0; c<states.length; c++) {
		var s = states[c];
		var fields = s.getFields();
		var pair;
		var key = '';
		var val = '';

		// methods for implementing the state changes
	 	cl += tab+rem+endl+tab2+sub+s.getPreviousAction()+' '+endl+tab2+'Description: '+s.getName()+endl+tab+endRem+endl;
		// method name is the previous action name; this previous action causes the current state of the document
		cl += tab+publicModif+sub+s.getPreviousAction()+endl;
		
		for(var b=0; b<fields.length; b++) {
			pair = fields[b].split('=>');

			var fieldName = pair[0];
			var value = '';

			if(pair.length==2) {
				value = pair[1];
			}

			// set theh author field
			if((fieldName=='Author') || (fieldName=='Reader')) {
				cl += changeACLField(fieldName, value);
			}
			else {
				// use the replaceitemvalue of the NotesDocument class to change the common field contents (text, number, date and time)
				// this is number field!
				if(value.charAt(0)=='#') {
					cl += tab2+'Call Me.m_doc.ReplaceItemValue("'+pair[0]+'",'+value.substring(1,value.length)+')'+endl;
				}
				// the value of the field should be evaluated as a formula function
				else if(value.charAt(0)=='@') {
					cl += tab2+'Call Me.m_doc.ReplaceItemValue("'+pair[0]+'",Me.Eval({'+value.substring(0,value.length)+'}))'+endl;
				}
				else {
					cl += tab2+'Call Me.m_doc.ReplaceItemValue("'+pair[0]+'","'+pair[1]+'")'+endl;
				}
			}
		}

		// save and close the document
		cl += tab2+'Me.SaveNClose'+endl;

		cl += tab+endSub+endl;
	}

	cl += endClassStr;

	cl += txtAreaEnd;

	displayStringResult(cl);
}
